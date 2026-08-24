#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/deploy/legacy-disabled.sh"
disable_legacy_deployment "this path bypasses the Production runtime boundary."
