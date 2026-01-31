# Page 2: Hidden Tools & Scripts

## 🔧 Complete List of All Tools Created

---

## 📋 Flash Commands System (Web-Based)

### 1. `web-app/flash-commands.html`
**Purpose:** Interactive web UI for all operations  
**Features:**
- 13 one-click buttons
- AI-powered suggestions
- Real-time command execution
- Deployment automation

**Commands Included:**
```
1. Deploy to Production   → Runs: git push ; vercel --prod
2. Build All             → Runs: npm run build:all
3. Sync Branches         → Syncs main ↔ bigtree
4. Run Tests             → Executes test suite
5. Check Status          → Gets deployment status
6. AI Analysis           → Analyzes codebase
7. Get Suggestions       → AI code suggestions
8. Generate Docs         → Creates documentation
9. Optimize Code         → Code quality improvements
10. View Logs            → Shows deployment logs
11. Health Check         → Tests all endpoints
12. Clear Cache          → Clears build cache
13. Reset Environment    → Resets configuration
```

---

## 🖥️ Command-Line Tools

### 2. `flash-commands.bat` (Windows PowerShell)
**Location:** Root directory  
**Lines:** 182  
**Purpose:** Windows automation script with all deployment commands

**Features:**
- Color-coded output (Red, Green, Yellow, Cyan)
- Error checking and validation
- Parallel execution support
- Git operations
- Docker commands
- Build automation

**Key Functions:**
```batch
Colors: Red, Green, Yellow, Cyan
Commands: 13 total
Platforms: Windows PowerShell 5.1+
Exit codes: Proper error handling
```

### 3. `flash-commands.sh` (Unix/Linux/Mac)
**Location:** Root directory  
**Lines:** 177  
**Purpose:** POSIX-compliant shell automation

**Features:**
- Cross-platform compatibility
- ANSI color support
- Error trapping
- Logging
- Git sync automation

**Key Functions:**
```bash
Environment: Bash 4.0+
Commands: 13 total
Logging: Automatically logs output
Error handling: Set -e trap
```

---

## ☁️ Azure Deployment Tools

### 4. `deploy-azure.ps1` (PowerShell Script)
**Location:** Root directory  
**Purpose:** Azure infrastructure and Docker deployment

**Parameters:**
```powershell
-ResourceGroup "networkbuster-rg"
-Location "eastus"
-RegistryName "networkbusterlo25gft5nqwzg"
```

**Functions:**
- Azure login verification
- Container Registry login
- Docker image building
- Image pushing to ACR
- Deployment verification

**Error Handling:**
- Docker availability check
- Azure CLI validation
- Registry connectivity test

### 5. `deploy-azure.sh` (Bash Script)
**Location:** Root directory  
**Purpose:** Azure deployment for Linux environments

**Features:**
- Registry authentication
- Image building with ACR
- Container App updates
- Deployment status reporting

---

## 📦 Configuration Tools

### 6. `.azure/azure.yaml`
**Type:** Azure Developer CLI Configuration  
**Purpose:** Service definitions for AZD

**Services Defined:**
```yaml
- api: Main server (Node.js 24.x)
- overlay: UI service (React/Vite)
```

**Ingress Configuration:**
- External access enabled
- Port 3000 exposed
- HTTPS required

### 7. `vercel.json`
**Type:** Vercel Deployment Configuration  
**Purpose:** Production deployment settings

**Key Settings:**
```json
{
  "version": 2,
  "buildCommand": "npm run build:all",
  "devCommand": "npm start",
  "env": {"NODE_ENV": "production"}
}
```

---

## 🏗️ Infrastructure as Code

### 8. `infra/main.bicep`
**Type:** Azure Resource Manager Template  
**Purpose:** Base infrastructure provisioning

**Resources Created:**
- Container Registry (Basic tier)
- Log Analytics Workspace
- Container App Environment
- Networking resources

**Output Variables:**
```bicep
containerRegistryLoginServer
containerAppEnvId
logAnalyticsId
```

### 9. `infra/container-apps.bicep`
**Type:** Azure Resource Manager Template  
**Purpose:** Container App deployment

**Apps Deployed:**
- networkbuster-server (0.5 CPU, 1Gi RAM)
- networkbuster-overlay (0.25 CPU, 0.5Gi RAM)

**Scaling:**
- Server: 1-5 replicas
- Overlay: 1-3 replicas

### 10. `infra/parameters.json`
**Type:** Parameter File  
**Purpose:** Deployment parameters

**Parameters:**
```json
{
  "location": "eastus",
  "projectName": "networkbuster"
}
```

---

## 🐳 Container Configuration

### 11. `Dockerfile` (Main Server)
**Location:** Root directory  
**Purpose:** Express.js application containerization

**Base Image:** `node:24-alpine`  
**Build Strategy:** Multi-stage  
**Security:** Non-root user (nodejs:1001)

**Features:**
- Production dependencies only
- Health checks configured
- Optimized for size and speed

### 12. `challengerepo/real-time-overlay/Dockerfile`
**Location:** Real-time overlay directory  
**Purpose:** React application containerization

**Build Process:**
1. Build stage: Node + Vite compilation
2. Production stage: Serve with `serve` package

**Health Checks:**
- HTTP endpoint validation
- Retry configuration

---

## 🔄 Git Automation

### 13. `.git/hooks/pre-commit`
**Type:** Git Hook Script  
**Purpose:** Pre-commit validation

**Checks:**
- File size validation (>50MB blocks)
- Lint checking
- Test execution
- Security scanning

### 14. `.git/hooks/post-commit`
**Type:** Git Hook Script  
**Purpose:** Post-commit automation

**Actions:**
- Auto-sync main ↔ bigtree
- Push to remote
- Build verification
- Notification system

---

## 📊 GitHub Actions

### 15. `.github/workflows/deploy.yml`
**Trigger:** Push to main/bigtree  
**Purpose:** Auto-deploy to Vercel

**Steps:**
1. Checkout code
2. Install dependencies
3. Build application
4. Deploy to Vercel
5. Verify deployment

### 16. `.github/workflows/sync-branches.yml`
**Trigger:** Push events  
**Purpose:** Keep branches in sync

**Process:**
1. Checkout main
2. Merge bigtree
3. Push changes
4. Cross-sync verification

### 17. `.github/workflows/deploy-azure.yml`
**Trigger:** Push to main/bigtree  
**Purpose:** Deploy to Azure Container Apps

**Pipeline:**
1. Build Docker images
2. Push to ACR
3. Update Container Apps
4. Verify deployment

---

## 📄 Documentation Tools

### 18. `.azure/QUICKSTART.md`
**Purpose:** Quick start guide for Azure deployment  
**Sections:** Prerequisites, Setup, Deployment, Troubleshooting

### 19. `.azure/documentation/00-index.md` through `.../12-quick-reference.md`
**Purpose:** 12-page comprehensive documentation  
**Coverage:** All tools, secrets, and configurations

---

## 🎯 Summary

| Tool | Type | Language | Purpose |
|------|------|----------|---------|
| flash-commands.html | UI | HTML/JS | Web interface |
| flash-commands.bat | Script | Batch | Windows automation |
| flash-commands.sh | Script | Bash | Unix automation |
| deploy-azure.ps1 | Script | PowerShell | Azure deployment |
| deploy-azure.sh | Script | Bash | Azure (Unix) |
| main.bicep | IaC | Bicep | Infrastructure |
| container-apps.bicep | IaC | Bicep | App deployment |
| Dockerfile | Container | Docker | Server image |
| real-time-overlay/Dockerfile | Container | Docker | UI image |
| pre-commit | Hook | Bash | Pre-commit check |
| post-commit | Hook | Bash | Post-commit action |
| deploy.yml | CI/CD | YAML | Vercel deploy |
| sync-branches.yml | CI/CD | YAML | Branch sync |
| deploy-azure.yml | CI/CD | YAML | Azure deploy |

---

**[← Back to Index](./00-index.md) | [Next: Page 3 →](./03-exposed-secrets.md)**
