#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"
load_recovery_config

refuse_production_restore
require_safe_audit_value RECOVERY_OPERATOR
require_safe_audit_value RECOVERY_ACCESS_TICKET
require_nonempty RECOVERY_DATABASE_NAME
require_nonempty RECOVERY_ADMIN_DATABASE_URL
require_nonempty RECOVERY_CONTROL_DATABASE_URL
require_nonempty RECOVERY_INSTANCE_ID
require_nonempty RECOVERY_AUDIT_LOG
require_nonempty RECOVERY_DELETE_CONFIRMATION
require_nonempty RECOVERY_UPLOADS_DIR
validate_restore_database_name "$RECOVERY_DATABASE_NAME"

case "$RECOVERY_UPLOADS_DIR" in
  /var/lib/hs6tools-recovery/*) ;;
  *) recovery_die "RECOVERY_UPLOADS_DIR must be under /var/lib/hs6tools-recovery" ;;
esac

expected_confirmation="DELETE ${RECOVERY_DATABASE_NAME}"
[ "$RECOVERY_DELETE_CONFIRMATION" = "$expected_confirmation" ] || \
  recovery_die "RECOVERY_DELETE_CONFIRMATION must equal: ${expected_confirmation}"
require_command psql
verify_isolated_postgres_control

append_audit_event "isolated_restore_delete_started"
psql "$RECOVERY_ADMIN_DATABASE_URL" --set=ON_ERROR_STOP=1 \
  --set="restore_db=${RECOVERY_DATABASE_NAME}" <<'SQL'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = :'restore_db' AND pid <> pg_backend_pid();
DROP DATABASE :"restore_db";
SQL
if [ -e "$RECOVERY_UPLOADS_DIR" ]; then
  rm -rf --one-file-system -- "$RECOVERY_UPLOADS_DIR"
fi
append_audit_event "isolated_restore_deleted"
recovery_log "isolated restore deleted database=${RECOVERY_DATABASE_NAME} operator=${RECOVERY_OPERATOR}"
