#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"
load_recovery_config

refuse_production_restore
require_passphrase_file
require_safe_audit_value RECOVERY_OPERATOR
require_safe_audit_value RECOVERY_ACCESS_TICKET
require_nonempty RECOVERY_DATABASE_NAME
require_nonempty RECOVERY_ADMIN_DATABASE_URL
require_nonempty RECOVERY_CONTROL_DATABASE_URL
require_nonempty RECOVERY_INSTANCE_ID
require_nonempty TARGET_DATABASE_URL
require_nonempty RECOVERY_AUDIT_LOG
require_nonempty RECOVERY_EVIDENCE_DIR
require_nonempty RECOVERY_SMOKE_URL
require_nonempty RECOVERY_SMOKE_TOKEN_FILE
require_nonempty RECOVERY_APP_START_COMMAND
require_nonempty RECOVERY_INCIDENT_EPOCH
require_nonempty RECOVERY_UPLOADS_DIR
[ "${EXTERNAL_EFFECTS_DISABLED:-}" = "true" ] || recovery_die "EXTERNAL_EFFECTS_DISABLED=true is required"

validate_restore_database_name "$RECOVERY_DATABASE_NAME"
[[ "$RECOVERY_INCIDENT_EPOCH" =~ ^[0-9]{10}$ ]] || recovery_die "RECOVERY_INCIDENT_EPOCH must be a Unix epoch"
[ -f "$RECOVERY_SMOKE_TOKEN_FILE" ] && [ -s "$RECOVERY_SMOKE_TOKEN_FILE" ] || \
  recovery_die "recovery smoke token file is missing or empty"
[ -x "$RECOVERY_APP_START_COMMAND" ] || recovery_die "RECOVERY_APP_START_COMMAND must be an executable path"
case "$TARGET_DATABASE_URL" in
  *prod*) recovery_die "refusing a Production database target" ;;
esac

[ "$#" -eq 1 ] || recovery_die "usage: restore-and-validate.sh ENCRYPTED_APPLICATION_BACKUP"
encrypted_archive="$1"
checksum_file="${encrypted_archive}.sha256"
[ -f "$encrypted_archive" ] || recovery_die "encrypted backup is missing"
[ -f "$checksum_file" ] || recovery_die "backup checksum is missing"

for secret_name in SMSIR_API_KEY KAVENEGAR_API_KEY KAVENEGAR_API_TOKEN ZARINPAL_MERCHANT_ID SMTP_PASS; do
  [ -z "${!secret_name:-}" ] || recovery_die "external provider credential must be absent: ${secret_name}"
done

for command_name in gpg sha256sum tar psql pg_restore curl mktemp find xargs sort diff date tr sed node; do
  require_command "$command_name"
done
verify_isolated_postgres_control

workflow_started_epoch="$(date +%s)"
[ "$RECOVERY_INCIDENT_EPOCH" -le "$workflow_started_epoch" ] || recovery_die "incident time cannot be in the future"
[ $((workflow_started_epoch - RECOVERY_INCIDENT_EPOCH)) -le 3600 ] || \
  recovery_die "logical-failure RTO was already exceeded before restore started"

mkdir -p "$RECOVERY_EVIDENCE_DIR"
[ ! -e "$RECOVERY_UPLOADS_DIR" ] || recovery_die "RECOVERY_UPLOADS_DIR must not already exist"
case "$RECOVERY_UPLOADS_DIR" in
  /var/lib/hs6tools-recovery/*) ;;
  *) recovery_die "RECOVERY_UPLOADS_DIR must be under /var/lib/hs6tools-recovery" ;;
esac
work_dir="$(mktemp -d)"
masking_complete=0
database_restored=0

drop_isolated_database() {
  psql "$RECOVERY_ADMIN_DATABASE_URL" --set=ON_ERROR_STOP=1 \
    --set="restore_db=${RECOVERY_DATABASE_NAME}" <<'SQL'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = :'restore_db' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS :"restore_db";
SQL
}

cleanup() {
  local status=$?
  rm -rf -- "$work_dir"
  if [ "$status" -ne 0 ] && [ -e "$RECOVERY_UPLOADS_DIR" ]; then
    rm -rf --one-file-system -- "$RECOVERY_UPLOADS_DIR" || \
      recovery_log "CRITICAL: upload quarantine deletion failed"
  fi
  if [ "$status" -ne 0 ] && [ "$database_restored" -eq 1 ] && [ "$masking_complete" -ne 1 ]; then
    recovery_log "restore_failed; deleting temporary unmasked database"
    drop_isolated_database || recovery_log "CRITICAL: automatic unmasked database deletion failed"
    append_audit_event "unmasked_restore_auto_delete_after_failure" || true
  fi
  exit "$status"
}
trap cleanup EXIT

append_audit_event "unmasked_restore_access_opened"
recovery_log "restore_started database=${RECOVERY_DATABASE_NAME} operator=${RECOVERY_OPERATOR}"

(
  cd "$(dirname "$encrypted_archive")" || recovery_die "cannot enter backup directory"
  sha256sum --check --status "$(basename "$checksum_file")"
)
gpg --batch --quiet --decrypt --passphrase-file "$BACKUP_PASSPHRASE_FILE" \
  "$encrypted_archive" | tar -C "$work_dir" -xzf -

for required_file in database.dump uploads.tar.gz runtime.env manifest.txt; do
  [ -f "${work_dir}/${required_file}" ] || recovery_die "backup content is incomplete: ${required_file}"
done

target_name="$(psql "$TARGET_DATABASE_URL" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
  --command='SELECT current_database()')"
[ "$target_name" = "$RECOVERY_DATABASE_NAME" ] || recovery_die "TARGET_DATABASE_URL does not select RECOVERY_DATABASE_NAME"
existing_tables="$(psql "$TARGET_DATABASE_URL" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
  --command="SELECT count(*) FROM pg_tables WHERE schemaname = 'public'")"
[ "$existing_tables" = "0" ] || recovery_die "isolated restore database must be empty"

database_restored=1
pg_restore --exit-on-error --no-owner --no-privileges --dbname="$TARGET_DATABASE_URL" "${work_dir}/database.dump"

psql "$TARGET_DATABASE_URL" --set=ON_ERROR_STOP=1 --file="$SCRIPT_DIR/validate-restored-database.sql"
find "$SCRIPT_DIR/../../prisma/migrations" -mindepth 2 -maxdepth 2 -name migration.sql \
  -printf '%h\n' | xargs -n1 basename | sort > "${RECOVERY_EVIDENCE_DIR}/migrations-expected.txt"
psql "$TARGET_DATABASE_URL" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
  --command='SELECT migration_name FROM public._prisma_migrations WHERE rolled_back_at IS NULL ORDER BY migration_name' \
  > "${RECOVERY_EVIDENCE_DIR}/migrations-restored.txt"
diff -u "${RECOVERY_EVIDENCE_DIR}/migrations-expected.txt" \
  "${RECOVERY_EVIDENCE_DIR}/migrations-restored.txt" \
  > "${RECOVERY_EVIDENCE_DIR}/migration-comparison.txt"
psql "$TARGET_DATABASE_URL" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
  --file="$SCRIPT_DIR/row-counts.sql" > "${RECOVERY_EVIDENCE_DIR}/row-counts-before-mask.txt"
psql "$TARGET_DATABASE_URL" --set=ON_ERROR_STOP=1 --file="$SCRIPT_DIR/mask-production-data.sql"

mkdir -p "$RECOVERY_UPLOADS_DIR"
tar -C "$RECOVERY_UPLOADS_DIR" --strip-components=1 -xzf "${work_dir}/uploads.tar.gz"
find "$RECOVERY_UPLOADS_DIR" -type f -printf '%P\n' | sort \
  > "${RECOVERY_EVIDENCE_DIR}/restored-upload-files.txt"
chmod -R go-rwx "$RECOVERY_UPLOADS_DIR"

psql "$TARGET_DATABASE_URL" --set=ON_ERROR_STOP=1 --file="$SCRIPT_DIR/validate-masked-data.sql"
psql "$TARGET_DATABASE_URL" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
  --file="$SCRIPT_DIR/row-counts.sql" > "${RECOVERY_EVIDENCE_DIR}/row-counts-after-mask.txt"
diff -u "${RECOVERY_EVIDENCE_DIR}/row-counts-before-mask.txt" \
  "${RECOVERY_EVIDENCE_DIR}/row-counts-after-mask.txt" \
  > "${RECOVERY_EVIDENCE_DIR}/row-count-comparison.txt"
masking_complete=1
append_audit_event "masking_complete"

smoke_token="$(tr -d '\r\n' < "$RECOVERY_SMOKE_TOKEN_FILE")"
[[ "$smoke_token" =~ ^[A-Za-z0-9._-]{32,}$ ]] || recovery_die "recovery smoke token is invalid"
DATABASE_URL="$TARGET_DATABASE_URL" \
EXTERNAL_EFFECTS_DISABLED=true \
RECOVERY_EXPECTED_DATABASE="$RECOVERY_DATABASE_NAME" \
RECOVERY_SMOKE_TOKEN="$smoke_token" \
  "$RECOVERY_APP_START_COMMAND"

smoke_response="$(
  printf 'header = "X-Recovery-Smoke-Token: %s"\n' "$smoke_token" | \
    curl --config - --fail --silent --show-error --max-time 15 "$RECOVERY_SMOKE_URL"
)"
if ! printf '%s' "$smoke_response" | RECOVERY_EXPECTED_DATABASE="$RECOVERY_DATABASE_NAME" node -e '
  let body = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => { body += chunk; });
  process.stdin.on("end", () => {
    const result = JSON.parse(body);
    if (
      result.success !== true ||
      result.externalEffectsDisabled !== true ||
      result.database !== process.env.RECOVERY_EXPECTED_DATABASE
    ) process.exit(1);
  });
'; then
  recovery_die "application smoke did not verify the restored database and disabled external effects"
fi

finished_epoch="$(date +%s)"
rto_seconds=$((finished_epoch - RECOVERY_INCIDENT_EPOCH))
[ "$rto_seconds" -le 3600 ] || recovery_die "logical-failure RTO exceeded sixty minutes"
finished_at="$(date -u -d "@${finished_epoch}" +'%Y-%m-%dT%H:%M:%SZ')"
incident_at="$(date -u -d "@${RECOVERY_INCIDENT_EPOCH}" +'%Y-%m-%dT%H:%M:%SZ')"
release_id="$(sed -n 's/^release_id=//p' "${work_dir}/manifest.txt")"
cat > "${RECOVERY_EVIDENCE_DIR}/restore-report.txt" <<EOF
status=passed
finished_at=${finished_at}
incident_declared_at=${incident_at}
workflow_started_epoch=${workflow_started_epoch}
rto_seconds=${rto_seconds}
rto_objective_seconds=3600
rto=passed
operator=${RECOVERY_OPERATOR}
access_ticket=${RECOVERY_ACCESS_TICKET}
database=${RECOVERY_DATABASE_NAME}
release_id=${release_id}
checksum=verified
schema=verified
migration_history=verified
row_counts=preserved
masking=verified
external_effects=disabled
uploaded_assets=restored_to_private_quarantine
application_smoke=passed
EOF
append_audit_event "restore_validation_passed_masked_access_opened"
recovery_log "restore_validation_succeeded database=${RECOVERY_DATABASE_NAME} release=${release_id}"
