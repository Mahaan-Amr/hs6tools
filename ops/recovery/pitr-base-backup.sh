#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"
load_recovery_config

require_passphrase_file
require_backup_postgres_service
require_nonempty PITR_BASE_BACKUP_DIR
require_nonempty RELEASE_ID
[[ "$RELEASE_ID" =~ ^[A-Za-z0-9._-]+$ ]] || recovery_die "RELEASE_ID contains unsafe characters"
for command_name in pg_basebackup tar gpg sha256sum find; do
  require_command "$command_name"
done

PITR_RETENTION_DAYS="${PITR_RETENTION_DAYS:-35}"
[[ "$PITR_RETENTION_DAYS" =~ ^[1-9][0-9]*$ ]] || recovery_die "PITR_RETENTION_DAYS must be a positive integer"
mkdir -p "$PITR_BASE_BACKUP_DIR"

timestamp="$(date -u +'%Y%m%dT%H%M%SZ')"
backup_name="hs6tools-pitr-base-${timestamp}"
work_dir="$(mktemp -d "${PITR_BASE_BACKUP_DIR}/.tmp-${backup_name}-XXXXXX")"
encrypted_archive="${PITR_BASE_BACKUP_DIR}/${backup_name}.tar.gpg"
trap 'rm -rf -- "$work_dir"' EXIT

on_error() {
  local status=$?
  recovery_log "backup_failed kind=pitr_base release=${RELEASE_ID}"
  notify_backup_result failed pitr_base || true
  exit "$status"
}
trap on_error ERR

recovery_log "backup_started kind=pitr_base release=${RELEASE_ID}"
PGSERVICE="$BACKUP_PG_SERVICE" PGSERVICEFILE="$PGSERVICEFILE" PGPASSFILE="$PGPASSFILE" \
  pg_basebackup --pgdata="${work_dir}/base" \
  --format=plain --checkpoint=fast --wal-method=stream --progress
cat > "${work_dir}/manifest.txt" <<EOF
format_version=1
created_at=${timestamp}
release_id=${RELEASE_ID}
backup_kind=postgresql_pitr_base
retention_days=${PITR_RETENTION_DAYS}
EOF

tar -C "$work_dir" -cf - base manifest.txt | \
  encrypt_and_verify_backup_stream "$encrypted_archive"

find "$PITR_BASE_BACKUP_DIR" -maxdepth 1 -type f \
  \( -name 'hs6tools-pitr-base-*.tar.gpg' -o -name 'hs6tools-pitr-base-*.tar.gpg.sha256' \) \
  -mtime "+${PITR_RETENTION_DAYS}" -delete
if [ -n "${WAL_ARCHIVE_DIR:-}" ] && [ -d "$WAL_ARCHIVE_DIR" ]; then
  find "$WAL_ARCHIVE_DIR" -maxdepth 1 -type f \
    \( -name '*.gpg' -o -name '*.gpg.sha256' \) \
    -mtime "+${PITR_RETENTION_DAYS}" -delete
fi

trap - ERR
recovery_log "backup_succeeded kind=pitr_base release=${RELEASE_ID} artifact=$(basename "$encrypted_archive")"
notify_backup_result succeeded pitr_base
