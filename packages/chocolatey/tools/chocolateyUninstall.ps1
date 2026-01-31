$ErrorActionPreference = 'Stop'

$packageName = 'networkbuster'
$serviceName = 'NetworkBuster'
$installDir = Join-Path $env:ProgramFiles $packageName

# Stop service
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($service) {
    Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
    Remove-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
}

# Remove installation directory
if (Test-Path $installDir) {
    Remove-Item -Path $installDir -Recurse -Force
}

Write-ChocolateySuccess $packageName
