#!/usr/bin/env bash

# HS6Tools server auto-update script.
# Run from the project root on the server:
#   cd /var/www/hs6tools
#   bash auto-update-server.sh
#
# If the server cannot resolve GitHub directly, first keep your reverse tunnel open
# from Windows, then run:
#   bash auto-update-server.sh --proxy http://127.0.0.1:2081
# or:
#   UPDATE_PROXY=http://127.0.0.1:2081 bash auto-update-server.sh

set -Eeuo pipefail

APP_NAME="${APP_NAME:-hs6tools}"
BRANCH="${BRANCH:-master}"
REMOTE="${REMOTE:-origin}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/fa/contact}"
PROXY_URL="${UPDATE_PROXY:-}"
SKIP_MIGRATIONS="${SKIP_MIGRATIONS:-false}"

usage() {
  cat <<EOF
Usage: bash auto-update-server.sh [options]

Options:
  --proxy URL          Use HTTP/HTTPS proxy for git/npm/curl, e.g. http://127.0.0.1:2081
  --branch NAME       Git branch to pull. Default: master
  --remote NAME       Git remote to pull. Default: origin
  --app NAME          PM2 app name. Default: hs6tools
  --health-url URL    Health check URL. Default: http://127.0.0.1:3000/fa/contact
  --skip-migrations   Skip npx prisma migrate deploy
  -h, --help          Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --proxy)
      PROXY_URL="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --remote)
      REMOTE="${2:-}"
      shift 2
      ;;
    --app)
      APP_NAME="${2:-}"
      shift 2
      ;;
    --health-url)
      HEALTH_URL="${2:-}"
      shift 2
      ;;
    --skip-migrations)
      SKIP_MIGRATIONS="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

log() {
  printf '\n[%s] %s\n' "$(date +'%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
  printf '\n[ERROR] %s\n' "$*" >&2
  exit 1
}

run() {
  printf '+ %s\n' "$*"
  "$@"
}

configure_proxy() {
  if [[ -z "$PROXY_URL" ]]; then
    return 0
  fi

  log "Using proxy: $PROXY_URL"
  export http_proxy="$PROXY_URL"
  export https_proxy="$PROXY_URL"
  export HTTP_PROXY="$PROXY_URL"
  export HTTPS_PROXY="$PROXY_URL"
}

check_project_root() {
  [[ -f package.json ]] || fail "package.json not found. Run this from /var/www/hs6tools."
  [[ -d .git ]] || fail ".git not found. Run this from the git checkout."
}

check_tools() {
  command -v git >/dev/null || fail "git is not installed."
  command -v node >/dev/null || fail "node is not installed."
  command -v npm >/dev/null || fail "npm is not installed."
  command -v pm2 >/dev/null || fail "pm2 is not installed."
}

check_network() {
  log "Checking network access to GitHub"
  if curl -fsSI --max-time 20 https://github.com >/dev/null; then
    log "GitHub is reachable"
    return 0
  fi

  cat >&2 <<EOF

Cannot reach https://github.com from this server.

If you are using your Windows proxy tunnel, keep this command open on Windows:
  ssh -N -R 127.0.0.1:2081:127.0.0.1:2081 root@91.234.52.46

Then run this on the server:
  bash auto-update-server.sh --proxy http://127.0.0.1:2081

EOF
  exit 1
}

backup_current_state() {
  log "Saving current git revision"
  git rev-parse --short HEAD > .last-good-revision 2>/dev/null || true

  if [[ -f .env ]]; then
    local backup=".env.backup-$(date +'%Y%m%d-%H%M%S')"
    run cp .env "$backup"
    log "Backed up .env to $backup"
  fi
}

sync_env() {
  if [[ -f .env.production ]]; then
    run cp .env.production .env
    log "Synced .env from .env.production"
  elif [[ -f .env ]]; then
    log ".env.production not found; keeping existing .env"
  else
    fail "No .env.production or .env found."
  fi
}

update_code() {
  log "Fetching latest code"
  run git fetch "$REMOTE" "$BRANCH"

  log "Checking for local modifications"
  if ! git diff --quiet || ! git diff --cached --quiet; then
    fail "Local tracked files have modifications. Commit/stash them before updating."
  fi

  log "Updating to $REMOTE/$BRANCH"
  run git checkout "$BRANCH"
  run git pull --ff-only "$REMOTE" "$BRANCH"
}

install_dependencies() {
  log "Installing dependencies"
  if [[ -f package-lock.json ]]; then
    run npm ci
  else
    run npm install
  fi
}

database_steps() {
  log "Generating Prisma client"
  run npx prisma generate

  if [[ "$SKIP_MIGRATIONS" == "true" ]]; then
    log "Skipping database migrations"
    return 0
  fi

  log "Applying database migrations"
  run npx prisma migrate deploy
}

build_app() {
  log "Building application"
  run npm run build
}

restart_app() {
  log "Restarting PM2 app: $APP_NAME"

  if [[ -f ecosystem.config.js ]]; then
    if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
      run pm2 restart "$APP_NAME" --update-env
    else
      run pm2 start ecosystem.config.js --env production
    fi
  else
    run pm2 restart "$APP_NAME" --update-env
  fi

  run pm2 save
}

health_check() {
  log "Waiting for app to respond"
  sleep 5

  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$HEALTH_URL" || true)"
  if [[ "$code" =~ ^(200|301|302|307|308)$ ]]; then
    log "Health check passed: $HEALTH_URL returned HTTP $code"
  else
    pm2 status "$APP_NAME" || true
    pm2 logs "$APP_NAME" --lines 40 --nostream || true
    fail "Health check failed: $HEALTH_URL returned HTTP ${code:-000}"
  fi
}

diagnose_payment_network() {
  log "Checking ZarinPal API reachability"
  if curl -fsSI --max-time 20 https://api.zarinpal.com >/dev/null; then
    log "ZarinPal API is reachable"
  else
    cat <<EOF

WARNING: The app updated, but this server still cannot reach api.zarinpal.com.
Payment redirects may still fail until DNS/VPN/proxy/firewall is fixed.

Useful checks:
  getent hosts api.zarinpal.com
  curl -Iv https://api.zarinpal.com
  pm2 logs $APP_NAME --lines 100

EOF
  fi
}

main() {
  log "Starting HS6Tools auto update"
  check_project_root
  configure_proxy
  check_tools
  check_network
  backup_current_state
  sync_env
  update_code
  install_dependencies
  database_steps
  build_app
  restart_app
  health_check
  diagnose_payment_network

  log "Update complete"
  run git log -1 --oneline
  run pm2 status "$APP_NAME"
}

main "$@"
