#!/usr/bin/env bash
# Check that the site builds, then commit and push to main.
# GitHub Actions deploys the pushed commit to GitHub Pages.
# Usage: ./update_site.sh ["commit message"]
set -euo pipefail
cd "$(dirname "$0")"

if command -v pnpm >/dev/null 2>&1; then
  PNPM=(pnpm)
else
  PNPM=(npx -y pnpm@10.34.3)
fi

MESSAGE="${1:-Update site $(date '+%Y-%m-%d %H:%M')}"

branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" != "main" ]; then
  echo "On branch '$branch'; switch to main to deploy." >&2
  exit 1
fi

"${PNPM[@]}" install --frozen-lockfile
"${PNPM[@]}" build

git add -A
if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "$MESSAGE"
fi

git push origin main

repo="$(git remote get-url origin | sed -E 's#.*github.com[:/]([^/]+)/([^/.]+)(\.git)?$#\1/\2#')"
echo "Pushed. Deployment progress: https://github.com/${repo}/actions"
echo "Site: https://${repo%%/*}.github.io/${repo#*/}/"
