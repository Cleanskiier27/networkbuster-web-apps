# Page 12: Quick Reference

## ⚡ Command Cheat Sheet & Quick Links

---

## 🚀 Quick Start Commands

### Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Start production server
npm start

# Build all applications
npm run build:all
```

### Git Operations
```bash
# Clone repository
git clone https://github.com/NetworkBuster/networkbuster.net.git

# Check status
git status

# Commit changes
git commit -m "message"

# Push to remote
git push

# Sync branches
git checkout bigtree && git merge main && git push
git checkout main && git merge bigtree && git push
```

### Docker Operations
```bash
# Build server image
docker build -t networkbuster-server:latest -f Dockerfile .

# Build overlay image
docker build -t networkbuster-overlay:latest -f challengerepo/real-time-overlay/Dockerfile ./challengerepo/real-time-overlay

# Run locally
docker run -p 3000:3000 networkbuster-server:latest
```

### Azure Operations
```bash
# Login to Azure
az login

# List subscriptions
az account list --output table

# Set subscription
az account set --subscription "subscription-id"

# Create resource group
az group create --name networkbuster-rg --location eastus

# Deploy infrastructure
az deployment group create --resource-group networkbuster-rg --template-file infra/main.bicep

# Login to registry
az acr login --name networkbusterlo25gft5nqwzg

# Push image
docker push networkbusterlo25gft5nqwzg.azurecr.io/networkbuster-server:latest
```

### Vercel Operations
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# View deployment logs
vercel logs
```

---

## 🔗 Important Links

### Repositories
- **GitHub:** https://github.com/NetworkBuster/networkbuster.net
- **Default Branch:** bigtree
- **Primary Branch:** main

### Deployments
- **Vercel Production:** https://networkbuster-bhxd2dnzq-networkbuster.vercel.app
- **Azure Portal:** https://portal.azure.com
- **GitHub Actions:** https://github.com/NetworkBuster/networkbuster.net/actions

### Documentation
- **Azure Docs:** https://docs.microsoft.com/azure
- **Vercel Docs:** https://vercel.com/docs
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev

### Configuration Files
- **Local:** `vercel.json` (root)
- **API:** `api/vercel.json`
- **Azure:** `infra/main.bicep`
- **Container Apps:** `infra/container-apps.bicep`
- **GitHub Actions:** `.github/workflows/`

---

## 📊 Important Values

### Azure Credentials
```
Subscription ID: cdb580bc-e2e9-4866-aac2-aa86f0a25cb3
Tenant ID: e06af08b-87ac-4220-b55e-6bac69aa8d84
Resource Group: networkbuster-rg
Region: eastus
```

### Container Registry
```
Name: networkbusterlo25gft5nqwzg
Login Server: networkbusterlo25gft5nqwzg.azurecr.io
Username: networkbusterlo25gft5nqwzg
SKU: Basic
```

### Node.js
```
Version: 24.x
Package Manager: npm
Node Modules: ~2GB
```

### Ports
```
Main Server: 3000
Vite Dev: 5173
```

---

## 🔐 GitHub Secrets

### Required for Vercel
```
VERCEL_TOKEN          - Vercel API token
VERCEL_ORG_ID         - Organization ID
VERCEL_PROJECT_ID     - Project ID
```

### Required for Azure
```
AZURE_CREDENTIALS              - Service Principal (JSON)
AZURE_SUBSCRIPTION_ID          - Subscription ID
AZURE_RESOURCE_GROUP           - Resource group
AZURE_REGISTRY_LOGIN_SERVER    - ACR URL
AZURE_REGISTRY_USERNAME        - ACR username
AZURE_REGISTRY_PASSWORD        - ACR password
```

---

## 📁 Directory Structure

```
.
├── .github/workflows/           # GitHub Actions
├── .azure/                      # Azure configuration
│   ├── azure.yaml              # AZD config
│   ├── documentation/          # 12-page docs
│   └── QUICKSTART.md           # Quick guide
├── infra/                       # Infrastructure as Code
│   ├── main.bicep              # Base infrastructure
│   ├── container-apps.bicep    # Container deployment
│   └── parameters.json         # Parameters
├── challengerepo/
│   └── real-time-overlay/      # 3D overlay app
├── web-app/                     # Static pages
├── Dockerfile                   # Server container
├── server.js                    # Express server
├── vercel.json                  # Vercel config
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

---

## 🔧 Configuration Quick Reference

### vercel.json (Root)
```json
{
  "version": 2,
  "buildCommand": "npm run build:all || true",
  "devCommand": "npm start",
  "env": { "NODE_ENV": "production" }
}
```

### Dockerfile (Main)
```dockerfile
FROM node:24-alpine
EXPOSE 3000
CMD ["node", "server.js"]
```

### Azure Parameters
```json
{
  "location": "eastus",
  "projectName": "networkbuster"
}
```

---

## 📈 Performance Targets

```
Page Load Time: <2 seconds
API Response Time: <100ms
Build Time: <5 minutes
Deployment Time: <2 minutes
Uptime Goal: 99.99%
Error Rate: <0.1%
```

---

## 🔄 Typical Workflow

### Daily Development
```
1. Pull latest: git pull
2. Install deps: npm install (if needed)
3. Start dev: npm run dev
4. Make changes
5. Test locally: npm test
6. Commit: git commit -m "message"
7. Push: git push (auto-syncs + deploys)
```

### Deployment Workflow
```
1. Push to main
2. GitHub Actions triggers
3. Install dependencies
4. Build applications
5. Deploy to Vercel
6. Verify health checks
7. Auto-sync to bigtree
8. Both branches updated
```

### Azure Deployment
```
1. Build Docker images: docker build
2. Tag images: docker tag
3. Login to registry: az acr login
4. Push images: docker push
5. Deploy apps: az containerapp create
6. Verify endpoints
```

---

## 🐛 Common Issues & Fixes

### Issue: Build Fails
```bash
# Solution 1: Clear cache
rm -rf node_modules
npm install

# Solution 2: Clean build
npm run clean
npm run build
```

### Issue: Port Already in Use
```bash
# Linux/Mac: Find and kill process
lsof -i :3000
kill -9 <PID>

# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Git Merge Conflicts
```bash
# Abort merge
git merge --abort

# Manual resolution
# Edit files
git add .
git commit -m "Resolve conflicts"
```

### Issue: Docker Build Fails
```bash
# Clear build cache
docker builder prune -a

# Rebuild with no cache
docker build --no-cache -t name:tag .
```

---

## 📞 Support Resources

### Documentation
- [Azure Documentation](https://docs.microsoft.com/azure)
- [Vercel Documentation](https://vercel.com/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [React Documentation](https://react.dev)

### Community
- [Stack Overflow](https://stackoverflow.com)
- [GitHub Discussions](https://github.com/discussions)
- [Azure Community](https://docs.microsoft.com/en-us/answers)

### Internal
- [Project README](../README.md)
- [Technology Guide](./09-frontend-apps.md)
- [API Documentation](./08-api-server.md)

---

## ✅ Pre-Deployment Checklist

- [ ] Code reviewed
- [ ] Tests passing
- [ ] Dependencies up to date
- [ ] Environment variables set
- [ ] Git history clean
- [ ] Branch synced
- [ ] Health checks verified
- [ ] Performance metrics acceptable
- [ ] Security audit passed
- [ ] Documentation updated

---

## 🎯 Emergency Contacts

### Issues
- GitHub Issues: https://github.com/NetworkBuster/networkbuster.net/issues

### Deployments
- Vercel Status: https://vercel.com/status
- Azure Status: https://status.azure.com

### Support
- GitHub Support: https://support.github.com
- Azure Support: https://support.microsoft.com

---

## 🔐 Security Quick Check

```
[ ] Credentials not in source code
[ ] GitHub Secrets configured
[ ] MFA enabled
[ ] Recent commits reviewed
[ ] Deployment logs checked
[ ] Health endpoints responding
[ ] No exposed secrets in logs
[ ] Azure resources secured
```

---

## 📊 Useful Commands by Role

### Developer
```
npm run dev           # Start dev server
npm test              # Run tests
npm run build         # Build app
git push              # Deploy
```

### DevOps
```
az login              # Azure login
docker build          # Build images
az acr push           # Push to registry
az deployment create  # Deploy infra
```

### Operations
```
vercel logs           # Check logs
az monitor            # Azure monitoring
az resource list      # List resources
git log               # View history
```

---

## 💡 Pro Tips

1. **Use git aliases** for common commands
2. **Enable GitHub Copilot** for coding assistance
3. **Use `.env.local`** for local secrets
4. **Monitor Azure costs** regularly
5. **Keep dependencies updated**
6. **Review deploy logs** after each push
7. **Test locally before pushing**
8. **Use meaningful commit messages**

---

## 📞 Quick Decision Guide

### "I want to..."

**Deploy to Vercel**
→ `git push` (automatic)

**Deploy to Azure**
→ Build images → Push to ACR → Deploy apps

**Check deployment status**
→ Visit Vercel dashboard or Azure Portal

**View logs**
→ Vercel: Dashboard / Azure: Log Analytics

**Add a new secret**
→ GitHub Settings → Secrets → New secret

**Scale a service**
→ Azure Portal → Container Apps → Update scaling

**Rollback a deployment**
→ Vercel: Select previous deployment / Azure: Re-deploy

---

**[← Back to Index](./00-index.md)**

---

## 📈 Document Information

**Created:** December 14, 2025  
**Last Updated:** December 14, 2025  
**Total Pages:** 12  
**Word Count:** ~50,000+  
**Status:** ✅ COMPLETE  

---

### Navigation
- [Index](./00-index.md)
- [Page 1: Executive Summary](./01-executive-summary.md)
- [Page 2: Hidden Tools](./02-hidden-tools.md)
- [Page 3: Exposed Secrets](./03-exposed-secrets.md)
- [Page 4: Azure Infrastructure](./04-azure-infrastructure.md)
- [Page 5: CI/CD Pipelines](./05-cicd-pipelines.md)
- [Page 6: Docker Configuration](./06-docker-config.md)
- [Page 7: Git Hooks](./07-git-hooks.md)
- [Page 8: API & Server](./08-api-server.md)
- [Page 9: Frontend Apps](./09-frontend-apps.md)
- [Page 10: Deployment Status](./10-deployment-status.md)
- [Page 11: Security Audit](./11-security-audit.md)
- [Page 12: Quick Reference](./12-quick-reference.md)

