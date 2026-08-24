#!/usr/bin/env bash
set -euo pipefail

mode="${1:---dry-run}"
production_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$production_root/lib/commands.sh"

validate_execution_mode

run ufw default deny incoming
run ufw default allow outgoing
run ufw limit OpenSSH
run ufw allow 'Nginx Full'
run_optional ufw --force delete deny 3000/tcp
run_optional ufw --force delete allow 3000/tcp
run_optional ufw --force delete allow 3000
run ufw insert 1 deny 3000/tcp
run ufw status numbered

echo "Firewall policy prepared. Enabling UFW remains a separate approved release step."
