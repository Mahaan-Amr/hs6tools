#!/usr/bin/env bash
set -euo pipefail

app_root="${1:-/var/www/hs6tools}"
active_env="${2:-/etc/hs6tools/production.env}"

if [[ ! -d "$app_root" ]]; then
  echo "Application directory does not exist: $app_root" >&2
  exit 2
fi

echo "Environment-file inventory (metadata only; values are never read)"
echo -e "path\tmode\towner\tgroup"

if [[ -e "$active_env" ]]; then
  stat --printf='%n\t%a\t%U\t%G\n' "$active_env"
fi

find "$app_root" -xdev \
  \( -path "$app_root/.git" -o -path "$app_root/node_modules" -o -path "$app_root/.next" \) -prune -o \
  -type f \
  \( -name '.env' -o -name '.env.*' -o -name '*.env' -o -name '*.env.*' \
     -o -iname '*env*.bak' -o -iname '*env*.old' -o -iname '*env*.save' \) \
  -printf '%p\t%m\t%u\t%g\n'
