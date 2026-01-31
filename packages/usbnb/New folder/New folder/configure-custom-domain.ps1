# NetworkBuster Custom Domain Configuration Script

param(
    [string]$Domain = "networkbuster.net",
    [string]$ResourceGroup = "networkbuster-rg",
    [string]$KeyVaultName = "networkbuster-kv",
    [string]$ContainerAppName = "networkbuster-server",
    [string]$RegistryUrl = "networkbusterlo25gft5nqwzg.azurecr.io"
)

Write-Host "NetworkBuster Custom Domain Setup" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

# Step 1: Get current app information
Write-Host "Step 1: Retrieving Container App information..." -ForegroundColor Yellow
$containerApp = az containerapp show `
    --name $ContainerAppName `
    --resource-group $ResourceGroup | ConvertFrom-Json

if ($containerApp) {
    Write-Host "Found Container App: $($containerApp.name)" -ForegroundColor Green
    Write-Host "FQDN: $($containerApp.properties.configuration.ingress.fqdn)`n" -ForegroundColor Green
}

# Step 2: Create Key Vault if needed
Write-Host "Step 2: Setting up Key Vault for certificates..." -ForegroundColor Yellow
$kvExists = az keyvault show --name $KeyVaultName --resource-group $ResourceGroup 2>$null
if ($kvExists) {
    Write-Host "Key Vault already exists: $KeyVaultName" -ForegroundColor Green
} else {
    Write-Host "Creating Key Vault: $KeyVaultName" -ForegroundColor Yellow
    az keyvault create `
        --name $KeyVaultName `
        --resource-group $ResourceGroup `
        --location eastus | Out-Null
    Write-Host "Key Vault created successfully" -ForegroundColor Green
}

# Step 3: Display DNS configuration
Write-Host "`nStep 3: Required DNS Records" -ForegroundColor Yellow
Write-Host "============================`n" -ForegroundColor Yellow

Write-Host "For Vercel (Main App):" -ForegroundColor Cyan
Write-Host "  Root domain: $Domain"
Write-Host "  Type: A Record (Primary)"
Write-Host "  Values: 76.76.19.21 and 76.76.20.21"
Write-Host "  OR CNAME: cname.vercel-dns.com`n"

Write-Host "  Subdomain: www.$Domain"
Write-Host "  Type: CNAME"
Write-Host "  Value: cname.vercel-dns.com`n"

if ($containerApp) {
    Write-Host "For Azure Container Apps (API):" -ForegroundColor Cyan
    Write-Host "  Subdomain: api.$Domain"
    Write-Host "  Type: CNAME"
    Write-Host "  Value: $($containerApp.properties.configuration.ingress.fqdn)`n"
}

# Step 4: Provide instructions
Write-Host "Step 4: Configuration Instructions" -ForegroundColor Yellow
Write-Host "==================================`n" -ForegroundColor Yellow

Write-Host "FOR VERCEL:" -ForegroundColor Cyan
Write-Host "  1. Go to vercel.com > Projects > NetworkBuster"
Write-Host "  2. Settings > Domains"
Write-Host "  3. Add domain: $Domain"
Write-Host "  4. Configure DNS records (see above)"
Write-Host "  5. Wait 24-48 hours for propagation"
Write-Host "  6. Vercel will auto-provision SSL certificate`n"

Write-Host "FOR AZURE CONTAINER APPS:" -ForegroundColor Cyan
Write-Host "  1. Generate or upload SSL certificate to Key Vault"
Write-Host "  2. In Azure Portal > Container Apps > $ContainerAppName"
Write-Host "  3. Go to Custom domains"
Write-Host "  4. Add domain: api.$Domain"
Write-Host "  5. Select certificate from Key Vault"
Write-Host "  6. Configure DNS CNAME record`n"

# Step 5: Provide certificate generation help
Write-Host "Step 5: SSL Certificate Options" -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

Write-Host "Option A: Let's Encrypt (Free)" -ForegroundColor Cyan
Write-Host "  certbot certonly --standalone -d $Domain -d www.$Domain -d api.$Domain`n"

Write-Host "Option B: Purchase Certificate" -ForegroundColor Cyan
Write-Host "  1. Use your domain registrar or GoDaddy"
Write-Host "  2. Download certificate files (.pem, .key, .pfx)"
Write-Host "  3. Upload to Key Vault:"
Write-Host "     az keyvault certificate import --vault-name $KeyVaultName --name cert --file cert.pfx`n"

Write-Host "Option C: Azure-managed Certificate" -ForegroundColor Cyan
Write-Host "  Use Azure App Service managed certificate feature`n"

# Step 6: Verification instructions
Write-Host "Step 6: Verification" -ForegroundColor Yellow
Write-Host "====================`n" -ForegroundColor Yellow

Write-Host "Test DNS propagation:" -ForegroundColor Cyan
Write-Host "  nslookup $Domain"
Write-Host "  nslookup www.$Domain"
Write-Host "  nslookup api.$Domain"
Write-Host "  Or use: https://www.whatsmydns.net`n"

Write-Host "Test HTTPS:" -ForegroundColor Cyan
Write-Host "  curl -I https://$Domain"
Write-Host "  curl -I https://api.$Domain`n"

Write-Host "Check certificate:" -ForegroundColor Cyan
Write-Host "  openssl s_client -connect $Domain`:443 -servername $Domain`n"

# Step 7: Summary
Write-Host "Step 7: Summary" -ForegroundColor Yellow
Write-Host "===============`n" -ForegroundColor Yellow

$summary = @{
    "Primary Domain" = $Domain
    "API Domain" = "api.$Domain"
    "Key Vault" = $KeyVaultName
    "Container App" = $ContainerAppName
    "Resource Group" = $ResourceGroup
    "FQDN" = if ($containerApp) { $containerApp.properties.configuration.ingress.fqdn } else { "Not found" }
}

$summary | ConvertTo-Json | Write-Host

Write-Host "`nSetup Complete! Follow the instructions above to configure your domains." -ForegroundColor Green
Write-Host "For detailed information, see: CUSTOM-DOMAIN-SETUP.md`n" -ForegroundColor Cyan
