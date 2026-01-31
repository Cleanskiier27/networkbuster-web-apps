# NetworkBuster Azure Deployment Script
# This script deploys the Azure runtime infrastructure

param(
    [string]$ResourceGroup = "networkbuster-rg",
    [string]$Location = "eastus",
    [string]$RegistryName = "networkbusterlo25gft5nqwzg"
)

Write-Host "🚀 NetworkBuster Azure Deployment" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to Azure
Write-Host "📍 Checking Azure login..." -ForegroundColor Yellow
$account = az account show --output json | ConvertFrom-Json
if (-not $account) {
    Write-Host "❌ Not logged into Azure. Running 'az login'..." -ForegroundColor Red
    az login
}

Write-Host "✓ Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host ""

# Get Registry Details
Write-Host "🔍 Getting Container Registry details..." -ForegroundColor Yellow
$registry = az acr show --resource-group $ResourceGroup --name $RegistryName --output json | ConvertFrom-Json
$registryUrl = $registry.loginServer
Write-Host "✓ Registry: $registryUrl" -ForegroundColor Green
Write-Host ""

# Check Docker
Write-Host "🐳 Checking Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
    
    # Login to ACR
    Write-Host "📋 Logging into Azure Container Registry..." -ForegroundColor Yellow
    az acr login --name $RegistryName
    
    # Build Main Server image
    Write-Host "🔨 Building Main Server image..." -ForegroundColor Yellow
    docker build -t "$registryUrl/networkbuster-server:latest" -f Dockerfile .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Main Server image built successfully" -ForegroundColor Green
        
        # Push Main Server image
        Write-Host "📤 Pushing Main Server image..." -ForegroundColor Yellow
        docker push "$registryUrl/networkbuster-server:latest"
        Write-Host "✓ Main Server image pushed" -ForegroundColor Green
    }
    
    # Build Overlay UI image
    Write-Host "🔨 Building Overlay UI image..." -ForegroundColor Yellow
    docker build -t "$registryUrl/networkbuster-overlay:latest" -f challengerepo\real-time-overlay\Dockerfile .\challengerepo\real-time-overlay
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Overlay UI image built successfully" -ForegroundColor Green
        
        # Push Overlay UI image
        Write-Host "📤 Pushing Overlay UI image..." -ForegroundColor Yellow
        docker push "$registryUrl/networkbuster-overlay:latest"
        Write-Host "✓ Overlay UI image pushed" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "✅ Docker images built and pushed successfully" -ForegroundColor Green
    
} catch {
    Write-Host "⚠️  Docker is not running or not installed" -ForegroundColor Yellow
    Write-Host "📝 Skip local Docker builds" -ForegroundColor Yellow
    Write-Host "   Images can be pushed later when Docker is available" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Azure Deployment Summary" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroup"  
Write-Host "Container Registry: $registryUrl"
Write-Host "Location: $Location"
Write-Host ""
Write-Host "✅ Base infrastructure is ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Build and push Docker images (or use the script with Docker running)"
Write-Host "2. Update Container Apps with the new images using:"
Write-Host "   az containerapp create --name networkbuster-server ..."
Write-Host "   az containerapp create --name networkbuster-overlay ..."
Write-Host ""
