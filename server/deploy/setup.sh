#!/usr/bin/env bash
# One-shot deploy for the DrivePlay media proxy on a fresh Ubuntu/Debian VPS
# (e.g. Hostinger VPS). Idempotent — safe to re-run after a git pull.
#
#   curl/clone the repo, then:   sudo bash server/deploy/setup.sh
#
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-8787}"
CORS_ORIGINS="${CORS_ORIGINS:-https://driveplay.app}"

echo "==> App directory: $APP_DIR"

# 1. Node.js 20 (NodeSource) if missing or too old
if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 18 ]; then
  echo "==> Installing Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "==> Node $(node -v)"

# 2. Dependencies
echo "==> Installing dependencies"
cd "$APP_DIR"
npm install --omit=dev --no-audit --no-fund

# 3. .env (created once; edit afterwards as needed)
if [ ! -f "$APP_DIR/.env" ]; then
  echo "==> Writing .env"
  cat > "$APP_DIR/.env" <<EOF
PORT=$PORT
CORS_ORIGINS=$CORS_ORIGINS
YOUTUBE_ENABLED=true
PLAYLIST_CACHE_SECONDS=2
EOF
fi

# 4. pm2 process manager
if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing pm2"
  npm install -g pm2
fi

echo "==> Starting service with pm2"
pm2 delete driveplay-media-proxy >/dev/null 2>&1 || true
pm2 start "$APP_DIR/src/index.js" --name driveplay-media-proxy --update-env
pm2 save
pm2 startup systemd -u "${SUDO_USER:-root}" --hp "$(eval echo ~"${SUDO_USER:-root}")" | tail -1 | bash || true

echo "==> Done. Health check:"
sleep 1
curl -fsS "http://localhost:$PORT/health" && echo

cat <<'NEXT'

Next steps:
  1. Point a subdomain (e.g. api.driveplay.app) at this VPS (DNS A record -> VPS IP).
  2. Put nginx + HTTPS in front:  see server/deploy/nginx-media.conf
  3. In the app, set the API base:
       localStorage.setItem('mediaApiBase','https://api.driveplay.app'); location.reload();
NEXT
