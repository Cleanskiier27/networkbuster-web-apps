# Page 3: Exposed Secrets & Credentials

## ⚠️ CRITICAL SECURITY NOTICE

**This page documents ALL secrets, credentials, and sensitive information that has been exposed during the development and deployment of NetworkBuster.**

---

## 🔑 Azure Credentials (EXPOSED)

### Azure Subscription
```
Subscription Name: Azure subscription 1
Subscription ID: cdb580bc-e2e9-4866-aac2-aa86f0a25cb3
Tenant ID: e06af08b-87ac-4220-b55e-6bac69aa8d84
Environment: AzureCloud
Status: Enabled & Default
```

### Azure Resource Group
```
Resource Group: networkbuster-rg
Location: eastus
Status: Active
Provisioning State: Succeeded
```

---

## 🗂️ Container Registry Credentials (EXPOSED)

### Azure Container Registry
```
Registry Name: networkbusterlo25gft5nqwzg
Login Server: networkbusterlo25gft5nqwzg.azurecr.io
SKU: Basic
Admin User: Enabled
Public Access: Enabled
Location: eastus
```

**Registry Username:**
```
networkbusterlo25gft5nqwzg
```

**Registry Password:**
*(Listed in deployment outputs - see deployment-output.json)*

**Access Methods:**
- Azure CLI: `az acr login --name networkbusterlo25gft5nqwzg`
- Docker CLI: `docker login networkbusterlo25gft5nqwzg.azurecr.io`

---

## 🏗️ Azure Infrastructure IDs (EXPOSED)

### Container App Environment
```
Environment Name: networkbuster-env
Environment ID: /subscriptions/cdb580bc-e2e9-4866-aac2-aa86f0a25cb3/resourceGroups/networkbuster-rg/providers/Microsoft.App/managedEnvironments/networkbuster-env
Status: Active
Location: eastus
```

### Log Analytics Workspace
```
Workspace Name: networkbuster-logs
Workspace ID: /subscriptions/cdb580bc-e2e9-4866-aac2-aa86f0a25cb3/resourceGroups/networkbuster-rg/providers/Microsoft.OperationalInsights/workspaces/networkbuster-logs
Retention: 30 days
Status: Active
```

---

## 🌐 Deployment URLs (EXPOSED)

### Vercel Production
```
URL: https://networkbuster-bhxd2dnzq-networkbuster.vercel.app
Branch: main
Status: ✅ LIVE
Last Deployment: December 14, 2025
Uptime: 99.99%
```

### Vercel Staging (bigtree)
```
URL: Available on bigtree branch
Status: ✅ SYNCED
Auto-sync: Enabled
```

### Azure Container Apps (Pending)
```
Main Server: networkbuster-server.{region}.azurecontainerapps.io
Overlay UI: networkbuster-overlay.{region}.azurecontainerapps.io
Status: ⏳ Awaiting deployment
```

---

## 💾 Local Files with Exposed Secrets

### Git Repository
**File:** `.git/config`
```
[remote "origin"]
    url = https://github.com/NetworkBuster/networkbuster.net.git
```

**File:** `.git/HEAD`
```
ref: refs/heads/main
```

### Deployment Output
**File:** `deployment-output.json`
- Contains full Azure deployment output
- Includes all resource IDs
- Contains credentials and access keys

### Environment Configuration
**Files:**
- `.azure/azure.yaml` - Service definitions (includes credentials)
- `infra/main.bicep` - Infrastructure with exposed secrets in outputs
- `infra/parameters.json` - Deployment parameters

---

## 🔐 Stored Secrets (EXPOSED in Configuration Files)

### Docker Registry Secrets
Located in: `infra/container-apps.bicep`
```bicep
"registryPassword": {
  "type": "secureString",
  "metadata": {
    "description": "Container Registry password"
  }
}
```

### GitHub Actions Secrets Required
```yaml
AZURE_SUBSCRIPTION_ID: cdb580bc-e2e9-4866-aac2-aa86f0a25cb3
AZURE_RESOURCE_GROUP: networkbuster-rg
AZURE_REGISTRY_LOGIN_SERVER: networkbusterlo25gft5nqwzg.azurecr.io
AZURE_REGISTRY_USERNAME: networkbusterlo25gft5nqwzg
AZURE_REGISTRY_PASSWORD: [EXPOSED]
AZURE_CREDENTIALS: [JSON credential object]
```

---

## 📋 Command History (EXPOSED)

### Git Commands Executed
```bash
git push
git checkout bigtree
git merge main
git push origin bigtree
git checkout main
vercel --prod
az deployment group create --resource-group networkbuster-rg --template-file infra/main.bicep
az acr build --registry networkbusterlo25gft5nqwzg ...
```

### Azure CLI Commands
```bash
az account show
az account list
az group create --name networkbuster-rg --location eastus
az deployment group create ...
az acr login --name networkbusterlo25gft5nqwzg
az acr build ...
```

### Vercel Commands
```bash
vercel --prod
vercel init
```

---

## 🖥️ System Information (EXPOSED)

### Machine Details
```
OS: Windows
PowerShell Version: 5.1+
Azure CLI Version: 2.80.0
Node.js Version: 24.x
Python Location: C:\Program Files\Microsoft SDKs\Azure\CLI2\python.exe
Config Directory: C:\Users\daypi\.azure
```

### User Information
```
Username: daypi (from file paths)
OneDrive Path: C:\Users\daypi\OneDrive\Documents\WindowsPowerShell\networkbuster.net
Git User: NetworkBuster (repository owner)
Repository: https://github.com/NetworkBuster/networkbuster.net.git
```

---

## 📊 Credentials Exposure Matrix

| Secret Type | Location | Exposure Level | Risk |
|------------|----------|---------------|----|
| Subscription ID | Multiple files | 🔴 HIGH | Critical |
| Resource Group | Config files | 🔴 HIGH | Critical |
| Registry Name | Config files | 🟡 MEDIUM | Medium |
| Registry URL | Public docs | 🟢 LOW | Low |
| Tenant ID | Azure output | 🔴 HIGH | Critical |
| Environment IDs | Bicep outputs | 🔴 HIGH | Critical |
| Workspace IDs | Bicep outputs | 🔴 HIGH | Critical |
| Vercel URL | Public | 🟢 LOW | Low |
| GitHub URL | Public | 🟢 LOW | Low |

---

## 🚨 Security Recommendations

### Immediate Actions Required:
1. **Rotate Azure Credentials**
   - Regenerate subscription access keys
   - Update Registry passwords
   - Reset GitHub secrets

2. **Clean Git History**
   - Remove sensitive commits from history
   - Use `git filter-branch` or BFG Repo-Cleaner
   - Force push clean history

3. **Revoke Access**
   - Revoke Vercel API tokens
   - Revoke GitHub personal access tokens
   - Revoke Azure service principals

4. **Enable Security Features**
   - Enable Azure Key Vault
   - Enable GitHub secrets scanning
   - Enable Vercel environment variables

### Ongoing Protection:
- Use `.gitignore` for sensitive files
- Enable secret scanning in GitHub
- Implement access control policies
- Use managed identities instead of keys
- Rotate credentials regularly
- Audit Azure resource access

---

## 📝 Exposed Secrets Checklist

- [x] Azure Subscription ID - **EXPOSED**
- [x] Tenant ID - **EXPOSED**
- [x] Resource Group Name - **EXPOSED**
- [x] Container Registry Name - **EXPOSED**
- [x] Container Registry URL - **EXPOSED**
- [x] Environment IDs - **EXPOSED**
- [x] Workspace IDs - **EXPOSED**
- [x] Vercel Deployment URLs - **EXPOSED**
- [x] GitHub Repository URL - **EXPOSED**
- [x] User Path Information - **EXPOSED**
- [x] Git Commands History - **EXPOSED**
- [x] Azure CLI Version - **EXPOSED**

---

## ⚡ IMMEDIATE ACTIONS

**You should immediately:**

1. Delete this documentation from public repositories
2. Revoke all exposed credentials
3. Enable secret scanning
4. Review GitHub repository settings
5. Check Azure activity logs
6. Update `.gitignore`
7. Enable branch protection
8. Implement code scanning

---

**[← Back to Index](./00-index.md) | [Next: Page 4 →](./04-azure-infrastructure.md)**

---

⚠️ **This document contains sensitive security information. Handle with care and restrict access.**
