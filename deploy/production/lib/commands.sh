#!/usr/bin/env bash

validate_execution_mode() {
  if [[ "$mode" != "--dry-run" && "$mode" != "--apply" ]]; then
    echo "Usage: $0 [--dry-run|--apply]" >&2
    exit 2
  fi

  if [[ "$mode" == "--apply" && "${EUID}" -ne 0 ]]; then
    echo "--apply must run as root after the documented approval gate" >&2
    exit 1
  fi
}

run() {
  if [[ "$mode" == "--apply" ]]; then
    "$@"
  else
    printf 'DRY RUN:'
    printf ' %q' "$@"
    printf '\n'
  fi
}

run_optional() {
  if [[ "$mode" == "--apply" ]]; then
    "$@" || true
  else
    run "$@"
  fi
}
