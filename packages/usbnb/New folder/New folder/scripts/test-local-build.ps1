# Test local build helper for Windows
# Steps performed:
# 1) npm ci
# 2) npm run dist:zip
# 3) run convert-icon (optional)
# 4) npm run dist:nsis
# 5) verify dist contains zip and installer

$ErrorActionPreference = 'Stop'

Write-Output "Starting local build test..."

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Write-Error "npm not found in PATH. Install Node.js and npm first."; exit 1 }
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) { Write-Output "Chocolatey not found — certain installs will require admin. Proceeding if tools exist." }

npm ci
npm run dist:zip

# Try convert icon, but don't fail if ImageMagick isn't present
try {
    powershell -ExecutionPolicy Bypass -File scripts/installer/convert-icon.ps1
} catch {
    Write-Output "Icon conversion skipped or failed (ImageMagick missing). Place an ICO at scripts/installer/icon.ico to embed icon."
}

npm run dist:nsis

$package = Get-Content package.json | ConvertFrom-Json
$zipName = "dist\${package.name}-${package.version}.zip"
$exeName = "dist\NetworkBuster-${package.version}-Setup.exe"

if ((Test-Path $zipName) -and (Test-Path $exeName)) {
    Write-Output "Local build test succeeded. Artifacts found: $zipName, $exeName"
    exit 0
} else {
    Write-Error "Local build test failed. Missing artifacts. Zip present: $(Test-Path $zipName), Installer present: $(Test-Path $exeName)"
    exit 1
}