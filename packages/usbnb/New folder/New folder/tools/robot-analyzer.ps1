Param(
  [Parameter(Mandatory = $false)][string]$Prompt = "Analyze lunar recycling and space materials. Summarize risks and opportunities.",
  [string]$Endpoint = $env:AZURE_OPENAI_ENDPOINT,
  [string]$ApiKey = $env:AZURE_OPENAI_KEY,
  [string]$Deployment = $env:AZURE_OPENAI_DEPLOYMENT
)

if (-not $Endpoint -or -not $ApiKey -or -not $Deployment) {
  Write-Error "Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT first."
  exit 1
}

$body = @{
  messages = @(
    @{ role = "system"; content = "You are NetBot, an expert in recycling, lunar regolith processing, and space materials." },
    @{ role = "user";   content = $Prompt }
  )
  max_tokens  = 512
  temperature = 0.2
} | ConvertTo-Json -Depth 6

$headers = @{
  "api-key"      = $ApiKey
  "Content-Type" = "application/json"
}

$uri = "$Endpoint/openai/deployments/$Deployment/chat/completions?api-version=2024-02-15-preview"
$response = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body
$response.choices.message.content
