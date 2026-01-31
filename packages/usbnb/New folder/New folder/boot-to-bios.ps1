# NetworkBuster BIOS Boot Utility (PowerShell)
# Reboot system directly into BIOS/UEFI firmware settings

param(
    [switch]$Force,
    [int]$Delay = 10
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   NetworkBuster BIOS Boot Utility                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check for admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script requires Administrator privileges" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host "Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Display warning
Write-Host "⚠️  WARNING: System will restart into BIOS/UEFI" -ForegroundColor Yellow
Write-Host ""
Write-Host "Before proceeding:" -ForegroundColor White
Write-Host "  • Save all open work" -ForegroundColor Gray
Write-Host "  • Close all applications" -ForegroundColor Gray
Write-Host "  • Review BIOS-OPTIMIZATION-GUIDE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Recommended BIOS settings:" -ForegroundColor Cyan
Write-Host "  ✓ Enable Intel VT-x / AMD-V (virtualization)" -ForegroundColor Gray
Write-Host "  ✓ Enable XMP/DOCP (memory speed)" -ForegroundColor Gray
Write-Host "  ✓ Set SATA mode to AHCI" -ForegroundColor Gray
Write-Host "  ✓ Enable UEFI boot mode" -ForegroundColor Gray
Write-Host "  ✓ Disable unnecessary devices" -ForegroundColor Gray
Write-Host ""

if (-not $Force) {
    $confirmation = Read-Host "Type 'YES' to continue or 'NO' to cancel"
    
    if ($confirmation -ne "YES") {
        Write-Host ""
        Write-Host "❌ Cancelled. No changes made." -ForegroundColor Yellow
        Write-Host ""
        exit 0
    }
}

Write-Host ""
Write-Host "🔄 Preparing to restart into BIOS..." -ForegroundColor Cyan
Write-Host ""
Write-Host "System will restart in $Delay seconds..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to cancel" -ForegroundColor Gray
Write-Host ""

# Countdown
for ($i = $Delay; $i -gt 0; $i--) {
    Write-Host "  Restarting in $i seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "🚀 Rebooting to BIOS now..." -ForegroundColor Green
Write-Host ""

# Restart to UEFI firmware
try {
    shutdown /r /fw /t 0 /c "NetworkBuster: Rebooting to BIOS/UEFI for optimization"
    Write-Host "✅ Restart command executed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to restart to BIOS" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative method:" -ForegroundColor Yellow
    Write-Host "1. Open Settings" -ForegroundColor Gray
    Write-Host "2. Go to Update & Security → Recovery" -ForegroundColor Gray
    Write-Host "3. Click 'Restart now' under Advanced startup" -ForegroundColor Gray
    Write-Host "4. Select Troubleshoot → Advanced Options → UEFI Firmware Settings" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
