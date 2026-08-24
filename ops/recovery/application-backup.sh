#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"
load_recovery_config

require_passphrase_file
require_backup_postgres_service
require_nonempty BACKUP_ROOT
require_nonempty UPLOADS_DIR
require_nonempty RUNTIME_CONFIG_FILE
require_nonempty RELEASE_ID
[[ "$RELEASE_ID" =~ ^[A-Za-z0-9._-]+$ ]] || recovery_die "RELEASE_ID contains unsafe characters"

[ -d "$UPLOADS_DIR" ] || recovery_die "uploads directory is missing"
[ -f "$RUNTIME_CONFIG_FILE" ] || recovery_die "runtime configuration file is missing"

require_command pg_dump
require_command tar
require_command gpg
require_command sha256sum
require_command find

RETENTION_DAYS="${RETENTION_DAYS:-35}"
[[ "$RETENTION_DAYS" =~ ^[1-9][0-9]*$ ]] || recovery_die "RETENTION_DAYS must be a positive integer"

mkdir -p "$BACKUP_ROOT"
timestamp="$(date -u +'%Y%m%dT%H%M%SZ')"
backup_name="hs6tools-application-${timestamp}"
work_dir="$(mktemp -d "${BACKUP_ROOT}/.tmp-${backup_name}-XXXXXX")"
encrypted_archive="${BACKUP_ROOT}/${backup_name}.tar.gz.gpg"

cleanup() {
  rm -rf -- "$work_dir"
}
trap cleanup EXIT

on_error() {
  local status=$?
  recovery_log "backup_failed release=${RELEASE_ID}"
  notify_backup_result failed application || true
  exit "$status"
}
trap on_error ERR

recovery_log "backup_started kind=application release=${RELEASE_ID}"
PGSERVICE="$BACKUP_PG_SERVICE" PGSERVICEFILE="$PGSERVICEFILE" PGPASSFILE="$PGPASSFILE" \
  pg_dump --format=custom --file="${work_dir}/database.dump"
tar -C "$(dirname "$UPLOADS_DIR")" -czf "${work_dir}/uploads.tar.gz" "$(basename "$UPLOADS_DIR")"
install -m 600 "$RUNTIME_CONFIG_FILE" "${work_dir}/runtime.env"

cat > "${work_dir}/manifest.txt" <<EOF
format_version=1
created_at=${timestamp}
release_id=${RELEASE_ID}
database_format=postgresql_custom
uploads_archive=uploads.tar.gz
runtime_configuration=runtime.env
retention_days=${RETENTION_DAYS}
EOF

tar -C "$work_dir" -czf - database.dump uploads.tar.gz runtime.env manifest.txt | \
  encrypt_and_verify_backup_stream "$encrypted_archive"

find "$BACKUP_ROOT" -maxdepth 1 -type f \
  \( -name 'hs6tools-application-*.tar.gz.gpg' -o -name 'hs6tools-application-*.tar.gz.gpg.sha256' \) \
  -mtime "+${RETENTION_DAYS}" -delete

trap - ERR
recovery_log "backup_succeeded kind=application release=${RELEASE_ID} artifact=$(basename "$encrypted_archive")"
notify_backup_result succeeded application
