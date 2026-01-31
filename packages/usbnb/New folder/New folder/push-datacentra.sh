#!/bin/bash
# Script to push DATACENTRA branch to origin with upstream tracking
# This script should be executed with appropriate GitHub credentials

set -e

echo "=== DATACENTRA Branch Push Script ==="
echo "Repository: NetworkBuster/networkbuster.net"
echo "Branch: DATACENTRA"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Check if DATACENTRA branch exists
if ! git rev-parse --verify DATACENTRA > /dev/null 2>&1; then
    echo "Error: DATACENTRA branch does not exist"
    exit 1
fi

# Show current branch status
echo "Current branch status:"
git branch -vv | grep DATACENTRA

echo ""
echo "Executing: git push -u origin DATACENTRA"
echo ""

# Push the DATACENTRA branch to origin with upstream tracking
git push -u origin DATACENTRA

echo ""
echo "✓ Successfully pushed DATACENTRA branch to origin with upstream tracking"
