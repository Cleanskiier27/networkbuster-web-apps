#!/usr/bin/env bash
set -euo pipefail

REPO_NAME=${1:-network-boost-contrib}
OWNER=${2:-cleanskiier27}
DESCRIPTION="Network Boost tools and docs (contribution)"
TAG=${3:-v0.1.0}

# Ensure we're in the contrib directory (must contain scripts/)
if [ ! -f "scripts/network-boost.sh" ]; then
  echo "This script must be run from the root of the contribution directory (contains scripts/)."
  exit 1
fi

# Remove LICENSE if present to avoid replicating upstream project's license
if [ -f LICENSE ]; then
  echo "Found LICENSE; moving to LICENSE.skip to avoid replicating in the new repo."
  mv LICENSE LICENSE.skip
fi

# Initialize git if needed
if [ ! -d .git ]; then
  git init
  git branch -M main || true
fi

# Use recommended local commit identity if available, otherwise leave as-is
git add .
if git status --porcelain | grep -q .; then
  git commit -m "Initial commit: Network Boost contribution" || true
else
  echo "No changes to commit."
fi

# Create repo via gh CLI if available
if command -v gh >/dev/null 2>&1; then
  echo "Creating GitHub repo ${OWNER}/${REPO_NAME} (public) via gh..."
  gh repo create "${OWNER}/${REPO_NAME}" --public --description "${DESCRIPTION}" --source=. --remote=origin --push --confirm || true
else
  echo "gh CLI not found. To create the repo manually, run:" 
  echo "  gh repo create ${OWNER}/${REPO_NAME} --public --description \"${DESCRIPTION}\" --source=. --remote=origin --push"
  echo "Or add remote and push manually:" 
  echo "  git remote add origin git@github.com:${OWNER}/${REPO_NAME}.git"
  echo "  git push -u origin main"
fi

# Create initial tag and push
git tag -a "$TAG" -m "Initial release $TAG" || true
if git rev-parse --verify origin/$TAG >/dev/null 2>&1; then
  echo "Tag $TAG already exists on origin."
else
  git push origin "$TAG" || true
fi

# Create release via gh if available
if command -v gh >/dev/null 2>&1; then
  gh release create "$TAG" --title "Initial release $TAG" --notes "Initial release of Network Boost contribution" || true
else
  echo "gh CLI not found; tag $TAG created locally and pushed. Create a release via the GitHub UI or install gh to automate this."
fi

echo "Done. Repo: https://github.com/${OWNER}/${REPO_NAME}"
echo "Note: No LICENSE file was included per instructions. If you want to include a license, add one and push a follow-up commit."