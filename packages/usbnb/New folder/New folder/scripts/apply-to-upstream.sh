#!/usr/bin/env bash
# scripts/apply-to-upstream.sh
# Usage: ./scripts/apply-to-upstream.sh --upstream https://github.com/Cleanskiier27/Final --fork git@github.com:<your-username>/Final.git
# The script clones upstream, creates a branch, copies the contribution files from this workspace (contrib/Cleanskiier27-final), commits, pushes to your fork, and optionally opens a PR using `gh`.

set -euo pipefail
WORKDIR=$(pwd)
CONTRIB_DIR="$WORKDIR/contrib/Cleanskiier27-final"

UPSTREAM_URL="https://github.com/Cleanskiier27/Final.git"
FORK_REMOTE=""
BRANCH="feature/network-boost"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --upstream) UPSTREAM_URL="$2"; shift 2 ;;
    --fork) FORK_REMOTE="$2"; shift 2 ;;
    --branch) BRANCH="$2"; shift 2 ;;
    -h|--help) echo "Usage: $0 [--upstream <url>] [--fork <your-fork-ssh-or-https>] [--branch <branch-name>]"; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [ ! -d "$CONTRIB_DIR" ]; then
  echo "Contribution directory not found: $CONTRIB_DIR"; exit 1
fi

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT
cd "$TEMP_DIR"

echo "Cloning upstream: $UPSTREAM_URL"
if ! git clone "$UPSTREAM_URL" repo; then
  echo "Failed to clone upstream repo. Ensure you have access and URL is correct."; exit 1
fi
cd repo

# Create branch
git checkout -b "$BRANCH"

# Copy files
echo "Copying contribution files into repo..."
rsync -av --exclude='.git' "$CONTRIB_DIR/" .

# Add, commit
git add .
if git diff --staged --quiet; then
  echo "No changes to commit. The contribution may already be present upstream."; exit 0
fi

git commit -m "Add Network Boost cross-platform utilities: scripts, docs, and PR notes"

if [ -z "$FORK_REMOTE" ]; then
  echo "No fork remote provided. Please create a fork of $UPSTREAM_URL and provide its URL with --fork to push the branch."
  echo "If you have the GitHub CLI installed you can run: gh repo fork $UPSTREAM_URL --remote=true --clone=false"
  echo "After adding your fork as a remote, run: git push <your-fork-remote> $BRANCH"
  echo "This script stops here. Your local branch is available in $TEMP_DIR/repo. You can push it manually.";
  exit 0
fi

# Add fork remote and push
git remote add fork "$FORK_REMOTE"
git push fork "$BRANCH" --set-upstream

# Create PR via gh if available
if command -v gh >/dev/null 2>&1; then
  echo "Creating PR using gh..."
  gh pr create --fill --base main --head "$(git remote get-url fork | sed -n 's#.*:\(.*\)\.git#\1#p'):$BRANCH" 
  echo "PR created.";
else
  echo "Pushed branch to fork: $FORK_REMOTE/$BRANCH"
  echo "Install GitHub CLI (gh) to open a PR automatically, or open a PR from your fork in the web UI."
fi

echo "Done. Temporary repo path: $TEMP_DIR/repo (will be removed on exit)."
