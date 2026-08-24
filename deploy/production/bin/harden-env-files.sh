#!/usr/bin/env bash
set -euo pipefail

mode="--dry-run"
app_root="/var/www/hs6tools"
active_env="/etc/hs6tools/production.env"
production_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$production_root/lib/commands.sh"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run|--apply)
      mode="$1"
      shift
      ;;
    --active)
      active_env="${2:?--active requires a path}"
      shift 2
      ;;
    *)
      app_root="$1"
      shift
      ;;
  esac
done

if [[ ! -d "$app_root" ]]; then
  echo "Application directory does not exist: $app_root" >&2
  exit 2
fi

validate_execution_mode

while IFS= read -r -d '' env_file; do
  run chown root:root "$env_file"
  run chmod 0600 "$env_file"
done < <(
  find "$app_root" -xdev \
    \( -path "$app_root/.git" -o -path "$app_root/node_modules" -o -path "$app_root/.next" \) -prune -o \
    -type f \
    \( -name '.env' -o -name '.env.*' -o -name '*.env' -o -name '*.env.*' \
       -o -iname '*env*.bak' -o -iname '*env*.old' -o -iname '*env*.save' \) \
    -print0
)

if [[ -e "$active_env" ]]; then
  run chown root:hs6tools "$active_env"
  run chmod 0640 "$active_env"
else
  echo "Active environment file is not present yet: $active_env"
fi

echo "Environment-file permissions prepared without reading file contents."
