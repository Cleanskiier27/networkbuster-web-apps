# NetworkBuster Azure Runtime Deployment

## ✅ Deployment Status

**Infrastructure Deployed Successfully!**

### Azure Resources Created

#### 1. **Container Registry** (Azure Container Registry)
- **Name**: `networkbusterlo25gft5nqwzg`
- **Login Server**: `networkbusterlo25gft5nqwzg.azurecr.io`
- **SKU**: Basic
- **Purpose**: Store and manage Docker container images
- **Admin Access**: Enabled

#### 2. **Log Analytics Workspace**
- **Name**: `networkbuster-logs`
- **Location**: East US
- **Retention**: 30 days
- **Purpose**: Monitor and collect logs from Container Apps

#### 3. **Container App Environment**
- **Name**: `networkbuster-env`
- **Location**: East US
- **Logging**: Connected to Log Analytics Workspace
- **Purpose**: Managed container orchestration and execution

### Deployment Details

**Subscription ID**: `cdb580bc-e2e9-4866-aac2-aa86f0a25cb3`
**Resource Group**: `networkbuster-rg`
**Region**: East US
**Deployment Time**: ~22 seconds

---

## 📋 Docker Images to Deploy

### Image 1: Main Server
- **Service**: Express.js REST API
- **Image Name**: `networkbuster-server`
- **Dockerfile**: `./Dockerfile`
- **Base Image**: `node:24-alpine`
- **Port**: 3000
- **CPU**: 0.5 cores
- **Memory**: 1 GB
- **Replicas**: 1-5 (auto-scaling)

### Image 2: Overlay UI
- **Service**: React + Three.js Real-time Overlay
- **Image Name**: `networkbuster-overlay`
- **Dockerfile**: `./challengerepo/real-time-overlay/Dockerfile`
- **Base Image**: `node:24-alpine`
- **Port**: 3000
- **CPU**: 0.25 cores
- **Memory**: 0.5 GB
- **Replicas**: 1-3 (auto-scaling)

---

## 🚀 Deployment Steps

### Step 1: Build Docker Images (if Docker is available)

Run the deployment script to build and push images:

```powershell
.\deploy-azure.ps1 -ResourceGroup networkbuster-rg -RegistryName networkbusterlo25gft5nqwzg
```

Or manually build:

```bash
# Build Main Server
docker build -t networkbusterlo25gft5nqwzg.azurecr.io/networkbuster-server:latest -f Dockerfile .

# Build Overlay UI
docker build -t networkbusterlo25gft5nqwzg.azurecr.io/networkbuster-overlay:latest -f challengerepo/real-time-overlay/Dockerfile ./challengerepo/real-time-overlay

# Login to registry
az acr login --name networkbusterlo25gft5nqwzg

# Push images
docker push networkbusterlo25gft5nqwzg.azurecr.io/networkbuster-server:latest
docker push networkbusterlo25gft5nqwzg.azurecr.io/networkbuster-overlay:latest
```

### Step 2: Deploy Container Apps

Get registry credentials:

```powershell
$registryUrl = "networkbusterlo25gft5nqwzg.azurecr.io"
$registryUser = az acr credential show --name networkbusterlo25gft5nqwzg --query username -o tsv
$registryPass = az acr credential show --name networkbusterlo25gft5nqwzg --query "passwords[0].value" -o tsv
```

Deploy using Bicep:

```powershell
az deployment group create `
  --resource-group networkbuster-rg `
  --template-file infra/container-apps.bicep `
  --parameters `
    containerAppEnvId="/subscriptions/cdb580bc-e2e9-4866-aac2-aa86f0a25cb3/resourceGroups/networkbuster-rg/providers/Microsoft.App/managedEnvironments/networkbuster-env" `
    containerRegistryLoginServer=$registryUrl `
    containerRegistryUsername=$registryUser `
    containerRegistryPassword=$registryPass `
    registryPassword=$registryPass
```

### Step 3: Verify Deployment

```powershell
# Get Container App URLs
az containerapp show --name networkbuster-server --resource-group networkbuster-rg --query 'properties.configuration.ingress.fqdn' -o tsv
az containerapp show --name networkbuster-overlay --resource-group networkbuster-rg --query 'properties.configuration.ingress.fqdn' -o tsv
```

---

## 🔐 Security Configuration

### Container Registry Access
- **Authentication**: Username/Password (ACR credentials)
- **Image Pulls**: Configured in Container App secrets
- **Access Control**: Private by default, exposed only to Container Apps

### Container Apps Networking
- **Ingress**: HTTPS only (TLS enabled)
- **Ports**: 3000 (internal)
- **External Traffic**: Allowed (publicly accessible)
- **Identity**: System-assigned managed identity

### Environment Variables
```
NODE_ENV=production
PORT=3000
```

---

## 📊 Monitoring & Logging

### Application Logs
- **Destination**: Log Analytics Workspace
- **Retention**: 30 days
- **Query Workspace**: `networkbuster-logs`

### Health Checks
Both Container Apps include health check probes:

```
Interval: 30 seconds
Timeout: 10 seconds  
Start Period: 5 seconds
Retries: 3
```

---

## 📁 File Structure

```
networkbuster.net/
├── .azure/
│   ├── azure.yaml                    # Azure Developer CLI config
│   └── .gitignore
├── .github/workflows/
│   ├── deploy-azure.yml              # CI/CD pipeline for Azure
│   ├── deploy.yml                    # Existing Vercel pipeline
│   └── sync-branches.yml             # Branch sync pipeline
├── infra/
│   ├── main.bicep                    # Base infrastructure (Registry, Logs, Env)
│   ├── container-apps.bicep          # Container Apps deployment
│   └── parameters.json               # Deployment parameters
├── challengerepo/
│   └── real-time-overlay/
│       └── Dockerfile                # Overlay UI container
├── Dockerfile                        # Main Server container
├── deploy-azure.ps1                  # PowerShell deployment script
├── deploy-azure.sh                   # Bash deployment script
└── ... (rest of project files)
```

---

## 💰 Cost Estimation (Monthly)

| Resource | SKU | Estimated Cost |
|----------|-----|-----------------|
| Container Registry | Basic | ~$5 |
| Log Analytics | Pay-per-GB | ~$2-10 |
| Container Apps | vCPU + Memory | ~$20-50 |
| **Total** | | **~$27-65** |

*Prices based on 1-5 replicas, standard usage patterns*

---

## 🔗 Infrastructure Diagram

```
┌─────────────────────────────────────────────────────┐
│           Azure Resource Group                       │
│        (networkbuster-rg, eastus)                   │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │   Container App Environment                  │   │
│  │     (networkbuster-env)                      │   │
│  │                                               │   │
│  │  ┌──────────────────────────────────────┐    │   │
│  │  │  Main Server Container App           │    │   │
│  │  │  (networkbuster-server)              │    │   │
│  │  │  - Express.js API                    │    │   │
│  │  │  - Port 3000                         │    │   │
│  │  │  - 1-5 replicas                      │    │   │
│  │  │  - 0.5 CPU, 1 GB RAM                │    │   │
│  │  └────────────────┬─────────────────────┘    │   │
│  │                   │                           │   │
│  │  ┌──────────────────────────────────────┐    │   │
│  │  │  Overlay UI Container App            │    │   │
│  │  │  (networkbuster-overlay)             │    │   │
│  │  │  - React + Three.js                  │    │   │
│  │  │  - Port 3000                         │    │   │
│  │  │  - 1-3 replicas                      │    │   │
│  │  │  - 0.25 CPU, 0.5 GB RAM             │    │   │
│  │  └────────────────┬─────────────────────┘    │   │
│  └──────────────────┼──────────────────────────┘    │
│                    │                                 │
│  ┌────────────────┴──────────────────────────┐    │
│  │  Container Registry                       │    │
│  │  (networkbusterlo25gft5nqwzg.azurecr.io) │    │
│  │  - networkbuster-server:latest           │    │
│  │  - networkbuster-overlay:latest          │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Log Analytics Workspace                │    │
│  │  (networkbuster-logs)                  │    │
│  │  - Container logs and metrics          │    │
│  │  - 30-day retention                    │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 CI/CD Pipeline

The Azure deployment is integrated with GitHub Actions:

**Trigger**: Push to `main` or `bigtree` branch

**Steps**:
1. Build Docker images
2. Push to Azure Container Registry
3. Deploy to Container Apps
4. Verify deployment URLs

**File**: `.github/workflows/deploy-azure.yml`

---

## 📝 Environment Setup

### Required Secrets (in GitHub)

For CI/CD to work, add these to GitHub Secrets:

```
AZURE_CREDENTIALS       # Service Principal credentials
AZURE_REGISTRY_LOGIN_SERVER  # networkbusterlo25gft5nqwzg.azurecr.io
AZURE_REGISTRY_USERNAME # ACR username
AZURE_REGISTRY_PASSWORD # ACR password
```

To get ACR credentials:

```powershell
az acr credential show --name networkbusterlo25gft5nqwzg --output json
```

---

## 📞 Next Steps

1. **Build & Push Images**
   - Start Docker daemon
   - Run `deploy-azure.ps1` to build and push images
   
2. **Deploy Container Apps**
   - Run the Bicep deployment for container-apps.bicep
   - Or use the provided PowerShell script
   
3. **Configure CI/CD**
   - Add Azure credentials to GitHub Secrets
   - Push changes to trigger automatic deployment
   
4. **Monitor**
   - Check Log Analytics for container logs
   - Monitor scaling behavior
   - Review health check status

---

## ✅ Deployment Verification Checklist

- [ ] Base infrastructure deployed (Registry, Logs, Env)
- [ ] Docker images built locally or in CI/CD
- [ ] Images pushed to Container Registry
- [ ] Container Apps created and running
- [ ] Health checks passing
- [ ] Services responding on public URLs
- [ ] Logs appearing in Log Analytics
- [ ] Auto-scaling configured
- [ ] GitHub Actions pipeline ready
- [ ] Monitoring alerts configured

---

**Last Updated**: December 14, 2025
**Deployment Status**: ✅ Infrastructure Ready
**Next Phase**: Docker Image Build & Container App Deployment
