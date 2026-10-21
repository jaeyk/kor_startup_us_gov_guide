#!/usr/bin/env bash
# Build the site and serve the production build locally.
# Starts at the given port (default 8443) and moves up to the next free one.
# Usage: ./preview_site.sh [port]
set -euo pipefail
cd "$(dirname "$0")"

if command -v pnpm >/dev/null 2>&1; then
  PNPM=(pnpm)
else
  PNPM=(npx -y pnpm@10.34.3)
fi

PORT="${1:-8443}"
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
  echo "Port must be a number (got '$PORT'). Usage: ./preview_site.sh [port]" >&2
  exit 1
fi

while lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  echo "Port $PORT is in use; trying $((PORT + 1))."
  PORT=$((PORT + 1))
done

"${PNPM[@]}" install --frozen-lockfile
"${PNPM[@]}" build

echo "Previewing at http://localhost:${PORT}/"
PORT="$PORT" FIGMA_DEV_SERVER_HOST=localhost "${PNPM[@]}" preview --strictPort --open
