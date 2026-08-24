#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

recovery_log() {
  printf '%s recovery[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$$" "$*" >&2
}

recovery_die() {
  recovery_log "ERROR: $*"
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || recovery_die "required command is unavailable: $1"
}

require_nonempty() {
  local name="$1"
  [ -n "${!name:-}" ] || recovery_die "required setting is missing: ${name}"
}

require_safe_audit_value() {
  local name="$1"
  require_nonempty "$name"
  [[ "${!name}" =~ ^[A-Za-z0-9._:@/-]+$ ]] || recovery_die "${name} contains unsafe audit characters"
}

require_passphrase_file() {
  require_nonempty BACKUP_PASSPHRASE_FILE
  require_mode_0600_or_0400_file "$BACKUP_PASSPHRASE_FILE" "backup passphrase file"
}

require_mode_0600_or_0400_file() {
  local path="$1"
  local description="$2"
  [ -f "$path" ] && [ -r "$path" ] && [ -s "$path" ] || recovery_die "${description} is missing, empty, or unreadable"
  local permissions
  permissions="$(stat -c '%a' "$path" 2>/dev/null || true)"
  case "$permissions" in
    400|600|"") ;;
    *) recovery_die "${description} permissions must be 0400 or 0600" ;;
  esac
}

require_backup_postgres_service() {
  require_nonempty BACKUP_PG_SERVICE
  require_nonempty PGSERVICEFILE
  require_nonempty PGPASSFILE
  [[ "$BACKUP_PG_SERVICE" =~ ^[A-Za-z0-9._-]+$ ]] || recovery_die "BACKUP_PG_SERVICE contains unsafe characters"
  require_mode_0600_or_0400_file "$PGSERVICEFILE" "PostgreSQL service file"
  require_mode_0600_or_0400_file "$PGPASSFILE" "PostgreSQL password file"
}

refuse_production_restore() {
  case "${RECOVERY_ENVIRONMENT:-}" in
    staging|recovery) ;;
    production|prod) recovery_die "refusing restore or deletion in Production" ;;
    *) recovery_die "RECOVERY_ENVIRONMENT must be staging or recovery" ;;
  esac
}

verify_isolated_postgres_control() {
  require_nonempty RECOVERY_CONTROL_DATABASE_URL
  require_nonempty RECOVERY_INSTANCE_ID

  local control_record
  control_record="$(psql "$RECOVERY_CONTROL_DATABASE_URL" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
    --command="SELECT environment || '|' || instance_id FROM public.hs6tools_recovery_control WHERE allow_restore AND allow_delete")" || \
    recovery_die "isolated PostgreSQL control record is unavailable"
  [ "$control_record" = "${RECOVERY_ENVIRONMENT}|${RECOVERY_INSTANCE_ID}" ] || \
    recovery_die "PostgreSQL control record does not authorize this recovery instance"

  local control_system_identifier
  local admin_system_identifier
  control_system_identifier="$(psql "$RECOVERY_CONTROL_DATABASE_URL" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
    --command='SELECT system_identifier FROM pg_control_system()')"
  admin_system_identifier="$(psql "$RECOVERY_ADMIN_DATABASE_URL" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
    --command='SELECT system_identifier FROM pg_control_system()')"
  [ -n "$control_system_identifier" ] && [ "$control_system_identifier" = "$admin_system_identifier" ] || \
    recovery_die "recovery control and admin URLs do not select the same PostgreSQL cluster"

  if [ -n "${TARGET_DATABASE_URL:-}" ]; then
    local target_system_identifier
    target_system_identifier="$(psql "$TARGET_DATABASE_URL" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
      --command='SELECT system_identifier FROM pg_control_system()')"
    [ "$control_system_identifier" = "$target_system_identifier" ] || \
      recovery_die "target URL is not on the authorized isolated PostgreSQL cluster"
  fi
}

validate_restore_database_name() {
  local database_name="$1"
  [[ "$database_name" =~ ^hs6tools_restore_[a-z0-9_]+$ ]] || \
    recovery_die "isolated database name must match hs6tools_restore_[a-z0-9_]+"
}

append_audit_event() {
  local event="$1"
  require_nonempty RECOVERY_AUDIT_LOG
  mkdir -p "$(dirname "$RECOVERY_AUDIT_LOG")"
  printf '%s operator=%s ticket=%s database=%s event=%s\n' \
    "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
    "${RECOVERY_OPERATOR:-unset}" \
    "${RECOVERY_ACCESS_TICKET:-unset}" \
    "${RECOVERY_DATABASE_NAME:-unset}" \
    "$event" >> "$RECOVERY_AUDIT_LOG"
}

load_recovery_config() {
  if [ -n "${RECOVERY_CONFIG_FILE:-}" ]; then
    [ -f "$RECOVERY_CONFIG_FILE" ] || recovery_die "recovery config file is missing"
    # shellcheck disable=SC1090
    source "$RECOVERY_CONFIG_FILE"
  fi
}

encrypt_and_verify_backup_stream() {
  local destination="$1"
  local backup_directory
  backup_directory="$(dirname "$destination")"
  local partial="${destination}.partial"
  local checksum_file="${destination}.sha256"

  if ! gpg --batch --yes --quiet --symmetric --cipher-algo AES256 \
    --passphrase-file "$BACKUP_PASSPHRASE_FILE" --output "$partial"; then
    rm -f -- "$partial"
    return 1
  fi
  if ! mv "$partial" "$destination"; then
    rm -f -- "$partial"
    return 1
  fi
  if ! (
    cd "$backup_directory" || recovery_die "cannot enter backup directory"
    sha256sum "$(basename "$destination")" > "$(basename "$checksum_file")"
    sha256sum --check --status "$(basename "$checksum_file")"
  ); then
    rm -f -- "$destination" "$checksum_file"
    return 1
  fi
  if ! gpg --batch --quiet --decrypt --passphrase-file "$BACKUP_PASSPHRASE_FILE" \
    "$destination" >/dev/null; then
    rm -f -- "$destination" "$checksum_file"
    return 1
  fi
}

notify_backup_result() {
  local event="$1"
  local backup_kind="$2"
  if [ -n "${BACKUP_ALERT_COMMAND:-}" ]; then
    BACKUP_EVENT="$event" BACKUP_KIND="$backup_kind" "$BACKUP_ALERT_COMMAND"
  fi
}
