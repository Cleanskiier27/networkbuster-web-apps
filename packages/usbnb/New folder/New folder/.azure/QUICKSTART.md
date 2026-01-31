# 🚀 Azure Runtime Quick Start

## Current Status
✅ **Azure Infrastructure Deployed Successfully!**

### What Was Created:
- **Container Registry**: `networkbusterlo25gft5nqwzg.azurecr.io`
- **Container App Environment**: `networkbuster-env` 
- **Log Analytics**: `networkbuster-logs`
- **Resource Group**: `networkbuster-rg` (East US)
- **Subscription**: `cdb580bc-e2e9-4866-aac2-aa86f0a25cb3`

---

## 🔧 Quick Commands

### 1. Check Resources Created
```powershell
# List all resources
az resource list --resource-group networkbuster-rg --output table

# Check Container Apps
az containerapp list --resource-group networkbuster-rg

# View Log Analytics
az monitor log-analytics workspace show --resource-group networkbuster-rg --workspace-name networkbuster-logs
```

### 2. Build Docker Images (When Docker is Available)
```powershell
# Start the deployment script
.\deploy-azure.ps1

# Or manually build
docker build -t networkbusterlo25gft5nqwzg.azurecr.io/networkbuster-server:latest -f Dockerfile .
docker build -t networkbusterlo25gft5nqwzg.azurecr.io/networkbuster-overlay:latest -f challengerepo\real-time-overlay\Dockerfile .\challengerepo\real-time-overlay

# Push to registry
az acr login --name networkbusterlo25gft5nqwzg
docker push networkbusterlo25gft5nqwzg.azurecr.io/networkbuster-server:latest
docker push networkbusterlo25gft5nqwzg.azurecr.io/networkbuster-overlay:latest
```

### 3. Deploy Container Apps
```powershell
# Get registry password
$regPass = az acr credential show --name networkbusterlo25gft5nqwzg --query "passwords[0].value" -o tsv

# Deploy
az deployment group create `
  --resource-group networkbuster-rg `
  --template-file infra/container-apps.bicep `
  --parameters `
    containerAppEnvId="/subscriptions/cdb580bc-e2e9-4866-aac2-aa86f0a25cb3/resourceGroups/networkbuster-rg/providers/Microsoft.App/managedEnvironments/networkbuster-env" `
    containerRegistryLoginServer="networkbusterlo25gft5nqwzg.azurecr.io" `
    containerRegistryUsername="$(az acr credential show --name networkbusterlo25gft5nqwzg --query username -o tsv)" `
    containerRegistryPassword="$regPass" `
    registryPassword="$regPass"
```

### 4. View Deployment URLs
```powershell
# Main Server
az containerapp show --name networkbuster-server --resource-group networkbuster-rg --query 'properties.configuration.ingress.fqdn' -o tsv

# Overlay UI
az containerapp show --name networkbuster-overlay --resource-group networkbuster-rg --query 'properties.configuration.ingress.fqdn' -o tsv
```

### 5. View Logs
```powershell
# Stream logs from Log Analytics
az monitor log-analytics query --workspace networkbuster-logs --analytics-query "ContainerAppConsoleLogs_CL | tail 100"

# Or check containerapp directly
az containerapp logs show --name networkbuster-server --resource-group networkbuster-rg --follow
```

---

## 📁 Files Created

```
infra/
├── main.bicep              ← Base infrastructure
├── container-apps.bicep    ← Container Apps deployment  
└── parameters.json         ← Deployment parameters

.azure/
├── DEPLOYMENT.md           ← Full deployment guide
└── azure.yaml              ← Azure CLI config

.github/workflows/
└── deploy-azure.yml        ← CI/CD pipeline

Dockerfile                  ← Main Server container
challengerepo/real-time-overlay/Dockerfile  ← Overlay UI container

deploy-azure.ps1            ← PowerShell deployment script
deploy-azure.sh             ← Bash deployment script
```

---

## 🎯 Architecture

```
GitHub → Push → Azure DevOps/GitHub Actions → Docker Build → ACR Push → Container Apps → Public URLs
  ↓                                                                            ↓
main & bigtree branches                                         https://networkbuster-server-xxx.azurecontainerapps.io
                                                                https://networkbuster-overlay-xxx.azurecontainerapps.io
```

---

## 📊 Deployment Timeline

1. ✅ **Base Infrastructure** (Completed)
   - Container Registry
   - Log Analytics  
   - Container App Environment

2. ⏳ **Docker Images** (Next)
   - Build locally or in CI/CD
   - Push to Container Registry

3. ⏳ **Container Apps** (After Images)
   - Deploy Main Server
   - Deploy Overlay UI
   - Configure auto-scaling

4. ⏳ **CI/CD Integration** (After Apps)
   - Configure GitHub Actions
   - Add Azure credentials
   - Enable automatic deployments

---

## 💡 Tips

- **Scale Apps**: Edit Container App replicas in Azure Portal
- **Update Images**: Push new image tag and update Container App
- **Monitor Health**: Check Log Analytics for errors
- **Cost Control**: Use Basic ACR SKU, Container Apps consumption billing
- **Security**: Use Azure Key Vault for secrets (optional)

---

## 📞 Support

- **Container Apps Docs**: https://learn.microsoft.com/azure/container-apps/
- **Bicep Docs**: https://learn.microsoft.com/azure/azure-resource-manager/bicep/
- **Azure CLI Docs**: https://learn.microsoft.com/cli/azure/

---

**Last Updated**: December 14, 2025  
**Status**: ✅ Infrastructure Ready for Image Build & Deployment
