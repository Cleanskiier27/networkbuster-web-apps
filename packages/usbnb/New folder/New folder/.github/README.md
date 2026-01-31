# GitHub Actions Workflows

## push-datacentra.yml

This workflow automates the process of pushing the DATACENTRA branch to origin with upstream tracking.

### Trigger Methods

1. **Automatic**: Triggers on any push to `copilot/push-datacentra-upstream` branch
2. **Manual**: Can be manually triggered via GitHub Actions UI (workflow_dispatch)

### What It Does

1. Checks out the repository with full history
2. Configures Git with github-actions[bot] identity
3. Checks if DATACENTRA branch exists locally
4. Creates DATACENTRA branch if it doesn't exist
5. Syncs DATACENTRA with the triggering branch
6. Executes `git push -u origin DATACENTRA`
7. Verifies the push was successful

### Permissions

The workflow requires `contents: write` permission to push to the repository.

### Manual Trigger

To manually trigger this workflow:
1. Go to the GitHub repository
2. Click on "Actions" tab
3. Select "Push DATACENTRA Branch" workflow
4. Click "Run workflow" button
5. Select the branch to run from
6. Click "Run workflow"

### Automated Trigger

The workflow automatically runs when changes are pushed to the `copilot/push-datacentra-upstream` branch, ensuring the DATACENTRA branch stays synchronized.
