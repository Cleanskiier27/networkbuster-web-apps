metadata description = 'Configure custom domains and SSL certificates for NetworkBuster'

param location string = 'eastus'
param projectName string = 'networkbuster'
param containerAppName string = '${projectName}-server'
param containerAppEnvName string = '${projectName}-env'

// Reference existing Key Vault or create new one
param keyVaultName string = '${projectName}-kv'

// Certificate parameters
@secure()
param certificatePfxBase64 string = ''

// Create Key Vault for certificate storage
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: false
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: []
  }
}

// Container App Environment reference
resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-11-02-preview' existing = {
  name: containerAppEnvName
}

// Certificate secret in Key Vault (if provided)
resource certificateSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (!empty(certificatePfxBase64)) {
  parent: keyVault
  name: '${projectName}-cert'
  properties: {
    value: certificatePfxBase64
  }
}

// Custom domain binding for Container App (requires manual configuration in Azure Portal currently)
// Output information needed for manual setup
output keyVaultId string = keyVault.id
output keyVaultName string = keyVault.name
output containerAppEnvId string = containerAppEnv.id
output dnsRecordsRequired array = [
  {
    type: 'CNAME'
    name: 'api'
    value: '${containerAppName}.${location}.azurecontainerapps.io'
    description: 'Point api.networkbuster.net to Container App'
  }
  {
    type: 'TXT'
    name: '_acme-challenge'
    value: 'verification-string-from-certificate-provider'
    description: 'SSL certificate verification (if using Let\'s Encrypt)'
  }
]
output customDomainInstructions object = {
  step1: 'Upload certificate to Key Vault or generate new certificate'
  step2: 'In Azure Portal, navigate to Container App > Custom domains'
  step3: 'Add custom domain and bind certificate'
  step4: 'Update DNS records to point to Container App FQDN'
  step5: 'Verify domain ownership with certificate provider'
  step6: 'Enable HTTPS enforcement'
}
