Param(
    [string]$DistZip = "dist/${PWD##*/}-$(Get-Content package.json | ConvertFrom-Json).version.zip",
    [string]$StagingDir = "$PSScriptRoot/../staging",
    [string]$NSISExe = "makensis"
)

$ErrorActionPreference = 'Stop'

# Ensure dist exists
if (-not (Test-Path "dist")) { New-Item -ItemType Directory dist | Out-Null }

# Extract zip to staging
if (Test-Path $StagingDir) { Remove-Item -Recurse -Force $StagingDir }
New-Item -ItemType Directory -Path $StagingDir | Out-Null

$package = Get-Content package.json | ConvertFrom-Json
$zipName = "${package.name}-${package.version}.zip"
$zipPath = Join-Path (Resolve-Path "dist") $zipName
if (-not (Test-Path $zipPath)) {
    Write-Error "Zip not found: $zipPath - please run npm run dist:zip first"
    exit 1
}

Write-Output "Extracting $zipPath to $StagingDir"
Expand-Archive -Path $zipPath -DestinationPath $StagingDir -Force

# Ensure NSIS available
if (-not (Get-Command $NSISExe -ErrorAction SilentlyContinue)) {
    Write-Output "makensis not found — installing via Chocolatey (requires admin)"
    choco install nsis -y
}

# Check for icon and EULA
$iconPath = Join-Path $PSScriptRoot 'installer\icon.ico'
$eulaPath = Join-Path $PSScriptRoot 'installer\EULA.txt'
$brandingDir = Join-Path $PSScriptRoot 'installer\branding'
if (-not (Test-Path $eulaPath)) { Write-Error "EULA not found at $eulaPath. Please create EULA.txt in scripts/installer."; exit 1 }

# Copy icon if present into staging
if (Test-Path $iconPath) {
    Copy-Item $iconPath -Destination $StagingDir -Force -Recurse
} else {
    Write-Output "No installer icon found at $iconPath. You may place scripts/installer/icon.ico or run scripts/installer/convert-icon.ps1 to generate one from icon-placeholder.png"
}

# Copy branding assets into staging if present
if (Test-Path $brandingDir) {
    Copy-Item $brandingDir -Destination $StagingDir -Force -Recurse
    Write-Output "Branding assets copied to staging."
} else {
    Write-Output "No branding assets directory found at $brandingDir. Place branding assets in scripts/installer/branding/."
}

$version = $package.version
$stg = (Resolve-Path $StagingDir).ProviderPath.Replace('\', '\\')
$iconArg = ''
if (Test-Path $iconPath) { $iconArg = "-DICON_FILE=\"$stg\\scripts\\installer\\icon.ico\"" }

$cmd = "makensis -DSTAGEDIR=\"$stg\" -DVERSION=\"$version\" $iconArg scripts\\installer\\networkbuster-installer.nsi"
Write-Output "Running: $cmd"
Invoke-Expression $cmd

# Move installer to dist
$exeName = "NetworkBuster-$version-Setup.exe"
if (Test-Path $exeName) { Move-Item $exeName -Destination dist -Force }
Write-Output "Installer moved to dist\$exeName"

# Move installer to dist
$exeName = "NetworkBuster-$version-Setup.exe"
if (Test-Path $exeName) { Move-Item $exeName -Destination dist -Force }
Write-Output "Installer moved to dist\$exeName"