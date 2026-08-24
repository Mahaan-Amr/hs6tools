#!/usr/bin/env bash

disable_legacy_deployment() {
  echo "LEGACY DEPLOYMENT DISABLED: $1" >&2
  echo "Follow docs/PRODUCTION_HARDENING_RUNBOOK.md and use a separately approved release." >&2
  exit 1
}
