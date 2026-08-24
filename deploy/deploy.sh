#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/legacy-disabled.sh"
disable_legacy_deployment "remote root deployment is prohibited."
