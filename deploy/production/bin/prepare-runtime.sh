#!/usr/bin/env bash
set -euo pipefail

mode="${1:---dry-run}"
production_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$production_root/lib/commands.sh"

validate_execution_mode

if ! id -u hs6tools >/dev/null 2>&1; then
  run useradd --system --home-dir /var/lib/hs6tools --create-home --shell /usr/sbin/nologin hs6tools
fi
if ! id -u hs6deploy >/dev/null 2>&1; then
  run useradd --system --user-group --home-dir /var/lib/hs6deploy --create-home --shell /usr/sbin/nologin hs6deploy
fi
run install -d -o hs6tools -g hs6tools -m 0750 /var/lib/hs6tools
run chown -R hs6deploy:hs6deploy /var/www/hs6tools
run chmod -R u=rwX,g=,o= /var/www/hs6tools
run chown hs6deploy:hs6tools /var/www/hs6tools
run chmod 0750 /var/www/hs6tools
run chown hs6deploy:hs6tools /var/www/hs6tools/scripts
run chmod 0710 /var/www/hs6tools/scripts
run chown -R hs6deploy:hs6tools /var/www/hs6tools/node_modules /var/www/hs6tools/.next /var/www/hs6tools/public
run chmod -R u=rwX,g=rX,o= /var/www/hs6tools/node_modules /var/www/hs6tools/.next /var/www/hs6tools/public
run chown hs6deploy:hs6tools /var/www/hs6tools/package.json /var/www/hs6tools/next.config.ts /var/www/hs6tools/scripts/redact-production-log.mjs
run chmod 0640 /var/www/hs6tools/package.json /var/www/hs6tools/next.config.ts /var/www/hs6tools/scripts/redact-production-log.mjs
run chown -R hs6tools:hs6tools /var/www/hs6tools/public/uploads /var/www/hs6tools/.next/cache
run chmod -R u=rwX,g=,o= /var/www/hs6tools/public/uploads /var/www/hs6tools/.next/cache
run install -d -o hs6tools -g hs6tools -m 0750 /var/log/hs6tools
run install -d -o root -g hs6tools -m 0750 /etc/hs6tools
run "$production_root/bin/harden-env-files.sh" --apply /var/www/hs6tools

echo "hs6deploy owns the checkout; hs6tools can read only runtime artifacts and write runtime data."
echo "Install production.env separately as root:hs6tools mode 0640; never print it."
