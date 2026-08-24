#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$repo_root"

for script in deploy/production/bin/*.sh; do
  bash -n "$script"
done

node --test tests/production-hardening.test.mjs

if command -v nginx >/dev/null 2>&1; then
  echo "Run 'sudo nginx -t' after staging the nginx files; repository validation passed."
fi
