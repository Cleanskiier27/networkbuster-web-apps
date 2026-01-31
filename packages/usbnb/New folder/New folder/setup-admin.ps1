#!/usr/bin/env pwsh
# NetworkBuster Administrator Privileges Setup

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

Clear-Host
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  NetworkBuster Administrator Privileges Setup" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "C:\Users\daypi\OneDrive\Desktop\networkbuster.net"

# 1. Set Execution Policy
Write-Host "[1] Setting Execution Policy..." -ForegroundColor Yellow
try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "    OK: RemoteSigned policy set" -ForegroundColor Green
} catch {
    Write-Host "    WARN: Could not set policy" -ForegroundColor Yellow
}

# 2. Configure Scripts
Write-Host "[2] Configuring script permissions..." -ForegroundColor Yellow
$scripts = @("power-manager.js", "build-pipeline.js", "start-servers.js", "cloud-storage-manager.js")
foreach ($script in $scripts) {
    $path = Join-Path $projectPath $script
    if (Test-Path $path) {
        Write-Host "    OK: $script" -ForegroundColor Green
    }
}

# 3. Configure D: Drive
Write-Host "[3] Configuring D: Drive permissions..." -ForegroundColor Yellow
$cloudDirs = @("D:\networkbuster-cloud", "D:\networkbuster-cloud\backups", "D:\networkbuster-cloud\exports")
foreach ($dir in $cloudDirs) {
    if (-not (Test-Path $dir)) {
        try {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "    OK: Created $dir" -ForegroundColor Green
        } catch {
            Write-Host "    ERR: Could not create $dir" -ForegroundColor Red
        }
    } else {
        Write-Host "    OK: $dir exists" -ForegroundColor Green
    }
}

# 4. Create elevation wrapper
Write-Host "[4] Creating elevation wrapper..." -ForegroundColor Yellow
$elevateContent = 'param([string]$Script, [string[]]$Args); node $Script @Args'
Set-Content -Path (Join-Path $projectPath "run-elevated.ps1") -Value $elevateContent
Write-Host "    OK: run-elevated.ps1 created" -ForegroundColor Green

# 5. Create batch files
Write-Host "[5] Creating batch wrappers..." -ForegroundColor Yellow
$bats = @{
    "start-power-listener.bat" = "@echo off`r`nnode power-manager.js 2`r`npause"
    "start-power-management.bat" = "@echo off`r`nnode power-manager.js 4`r`npause"
    "start-build-pipeline.bat" = "@echo off`r`nnode build-pipeline.js 1`r`npause"
    "backup-cloud-storage.bat" = "@echo off`r`nnode cloud-storage-manager.js backup`r`npause"
}
foreach ($bat in $bats.Keys) {
    Set-Content -Path (Join-Path $projectPath $bat) -Value $bats[$bat] -Encoding ASCII
    Write-Host "    OK: $bat" -ForegroundColor Green
}

# 6. Create verify script
Write-Host "[6] Creating verification script..." -ForegroundColor Yellow
$verifyContent = 'Write-Host "Admin Verification"; Write-Host "Policy: $(Get-ExecutionPolicy)"; Write-Host "D: Drive: $(if (Test-Path D:\) { ''OK'' } else { ''NOT FOUND'' })"'
Set-Content -Path (Join-Path $projectPath "verify-admin.ps1") -Value $verifyContent
Write-Host "    OK: verify-admin.ps1 created" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Quick Commands:" -ForegroundColor Yellow
Write-Host "  npm run power:listen    - Power listener (Option 2)"
Write-Host "  npm run power:server    - Power management (Option 4)"
Write-Host "  npm run pipeline:full   - Build + power pipeline"
Write-Host "  npm run admin:verify    - Verify setup"
Write-Host ""

