#!/usr/bin/env bash
set -euo pipefail

public_url="${1:-https://hs6tools.com}"
direct_url="${2:-http://hs6tools.com:3000}"

if [[ "$public_url" != https://* ]]; then
  echo "Public endpoint must use https://" >&2
  exit 2
fi

echo "Checking public TLS endpoint: $public_url"
curl --fail --silent --show-error --location --max-time 15 --output /dev/null "$public_url"

echo "Checking that direct runtime endpoint is blocked: $direct_url"
if curl --silent --show-error --max-time 5 --output /dev/null "$direct_url"; then
  echo "FAIL: direct runtime endpoint is reachable" >&2
  exit 1
fi

echo "PASS: public TLS works and direct runtime access fails"
