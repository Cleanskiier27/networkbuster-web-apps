metadata description = 'Deploy Container Apps to NetworkBuster environment'

param location string = 'eastus'
param projectName string = 'networkbuster'
param containerAppEnvId string
param containerRegistryLoginServer string
param containerRegistryUsername string
param containerRegistryPassword string
@secure()
param registryPassword string

// Main Server Container App
resource mainServerApp 'Microsoft.App/containerApps@2023-11-02-preview' = {
  name: '${projectName}-server'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnvId
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      registries: [
        {
          server: containerRegistryLoginServer
          username: containerRegistryUsername
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: registryPassword
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'server'
          image: '${containerRegistryLoginServer}/networkbuster-server:latest'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 5
      }
    }
  }
}

// Overlay UI Container App
resource overlayUiApp 'Microsoft.App/containerApps@2023-11-02-preview' = {
  name: '${projectName}-overlay'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnvId
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      registries: [
        {
          server: containerRegistryLoginServer
          username: containerRegistryUsername
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: registryPassword
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'overlay'
          image: '${containerRegistryLoginServer}/networkbuster-overlay:latest'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

// Outputs
output mainServerUrl string = 'https://${mainServerApp.properties.configuration.ingress.fqdn}'
output overlayUrl string = 'https://${overlayUiApp.properties.configuration.ingress.fqdn}'
