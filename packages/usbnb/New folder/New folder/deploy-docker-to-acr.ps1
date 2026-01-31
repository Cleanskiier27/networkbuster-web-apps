# Deploy Docker images to Azure Container Registry

param(
    [string]$RegistryName = "networkbusterlo25gft5nqwzg",
    [string]$RegistryUrl = "networkbusterlo25gft5nqwzg.azurecr.io",
    [string]$ResourceGroup = "networkbuster-rg"
)

Write-Host "NetworkBuster Docker Deployment Guide" -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

# Get registry credentials
Write-Host "Obtaining ACR credentials..." -ForegroundColor Yellow
$credentials = az acr credential show --resource-group $ResourceGroup --name $RegistryName | ConvertFrom-Json
$username = $credentials.username
$password = $credentials.passwords[0].value

Write-Host "Credentials obtained successfully`n" -ForegroundColor Green

# Display options
Write-Host "DEPLOYMENT OPTIONS`n" -ForegroundColor Yellow

Write-Host "Option A - Use Azure Cloud Shell (RECOMMENDED):" -ForegroundColor Cyan
Write-Host "  1. Go to https://shell.azure.com"
Write-Host "  2. Upload your project"
Write-Host "  3. Run: az acr build --registry $RegistryName --image networkbuster:latest --image networkbuster:v1.0.1 .`n"

Write-Host "Option B - Local Docker Build (requires Docker Desktop):" -ForegroundColor Cyan
Write-Host "  1. docker login $RegistryUrl -u $username"
Write-Host "  2. docker build -t $RegistryUrl/networkbuster:latest ."
Write-Host "  3. docker push $RegistryUrl/networkbuster:latest`n"

Write-Host "Registry Information:" -ForegroundColor Yellow
Write-Host "  URL: $RegistryUrl"
Write-Host "  Username: $username"
Write-Host "  Password: $password`n"

Write-Host "Container Apps Deployment:" -ForegroundColor Yellow
Write-Host "  Template: infra/container-apps.bicep"
Write-Host "  Environment: networkbuster-env"
Write-Host "  Location: eastus`n"

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Choose deployment option above"
Write-Host "  2. Push images to $RegistryUrl"
Write-Host "  3. Deploy container apps with Bicep"
Write-Host "  4. Configure custom domains (optional)"
Write-Host "  5. Monitor with Log Analytics`n"

Write-Host "Deployment complete!" -ForegroundColor Green
