<#
scripts/network-boost.ps1
Safe, optional network tuning helper for Windows and Linux.
Usage:
  - Interactive dry-run: powershell -ExecutionPolicy Bypass -File scripts/network-boost.ps1
  - Apply non-interactively: powershell -ExecutionPolicy Bypass -File scripts/network-boost.ps1 -Apply -Confirm:$false

The script records previous settings and creates a restore script at the same location if changes are applied.
#>

param(
    [switch]$Apply,
    [switch]$Confirm = $true
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$logFile = Join-Path $scriptDir 'network-boost.log'
$restoreScript = Join-Path $scriptDir 'network-boost-restore.ps1'

function Write-Log($msg) {
    $ts = Get-Date -Format 'u'
    "$ts - $msg" | Out-File -FilePath $logFile -Append -Encoding UTF8
    Write-Output $msg
}

Write-Log "Network boost script started. Apply=$Apply"

# Detect OS
$isWindows = $env:OS -eq 'Windows_NT'
if ($isWindows) {
    Write-Log "Detected Windows environment"
    $current = netsh interface tcp show global 2>$null
    if ($current) {
        Write-Log "Current TCP global settings:"; $current | Out-File -FilePath $logFile -Append
    }

    $recommended = @(
        @{ cmd = 'netsh interface tcp set global autotuning=normal'; desc = 'Set TCP auto-tuning to Normal' },
        @{ cmd = 'netsh interface tcp set global congestionprovider=ctcp'; desc = 'Enable CTCP congestion provider (if available)' },
        @{ cmd = 'netsh interface tcp set global ecncapability=disabled'; desc = 'Disable ECN to improve compatibility' },
        @{ cmd = 'netsh interface tcp set global rss=enabled'; desc = 'Enable Receive Side Scaling (RSS)'
        }
    )

    Write-Output "Recommended Windows tweaks (non-destructive and reversible):"
    $i=1
    foreach ($r in $recommended) { Write-Output ("[$i] $($r.desc) : $($r.cmd)"); $i++ }

    if (-not $Apply) { Write-Output "Run with -Apply to apply these changes."; exit 0 }

    if ($Confirm) {
        $ans = Read-Host "Apply recommended changes now? (y/N)"
        if ($ans -notin @('y','Y','yes','Yes')) { Write-Log 'User declined to apply changes.'; exit 0 }
    }

    # Save current settings to restore script
    Write-Output "Creating restore script: $restoreScript"
    "# Restore script generated on $(Get-Date)" | Out-File $restoreScript -Encoding UTF8
    $currentLines = netsh interface tcp show global | Select-String -Pattern '(.+):\s*(.+)' | ForEach-Object { $_.Matches[0].Groups[1].Value.Trim() + '|' + $_.Matches[0].Groups[2].Value.Trim() }
    foreach ($ln in $currentLines) {
        $parts = $ln -split '\|'
        $k = $parts[0]; $v = $parts[1]
        # We keep a simple log; full restore may require manual commands recorded in log
        "$k = $v" | Out-File $logFile -Append
    }

    # Apply recommended
    foreach ($r in $recommended) {
        try {
            Write-Log "Applying: $($r.cmd)"
            iex $r.cmd
            "$($r.cmd) => OK" | Out-File $logFile -Append
        } catch {
            Write-Log "Failed: $($_)"
        }
    }

    Write-Log "Windows network boost applied. Please reboot for some changes to take effect."
    Write-Output "Done. A log was written to $logFile. Reboot your machine if you applied changes."
    exit 0
}

# Linux path
if (Test-Path '/proc/sys') {
    Write-Log "Detected Linux environment"
    $keys = @{
        'net.core.rmem_max' = 16777216
        'net.core.wmem_max' = 16777216
        'net.ipv4.tcp_window_scaling' = 1
    }

    Write-Output "Recommended Linux sysctl changes:"
    foreach ($k in $keys.Keys) { Write-Output ("$k = $($keys[$k])") }

    if (-not $Apply) { Write-Output "Run with -Apply to apply these changes as root."; exit 0 }

    if ($Confirm) {
        $ans = Read-Host "Apply recommended changes now? (requires root) (y/N)"
        if ($ans -notin @('y','Y','yes','Yes')) { Write-Log 'User declined to apply changes.'; exit 0 }
    }

    # Save current values
    "# Restore script generated on $(Get-Date)" | Out-File $restoreScript -Encoding UTF8
    foreach ($k in $keys.Keys) {
        $old = (sysctl -n $k 2>$null) -replace '\r',''
        "$k|$old" | Out-File $logFile -Append
        "sysctl -w $k=$old" | Out-File $restoreScript -Append
    }

    # Apply
    foreach ($k in $keys.Keys) {
        try {
            Write-Log "Setting $k to $($keys[$k])"
            sysctl -w $k=$($keys[$k]) | Out-Null
            "sysctl -w $k=$($keys[$k])" | Out-File $logFile -Append
        } catch { Write-Log "Failed to set $k: $_" }
    }

    Write-Log "Linux network boost applied (temporary). To make changes permanent, add to /etc/sysctl.conf or a conf in /etc/sysctl.d/."
    Write-Output "Done. A log was written to $logFile. Use $restoreScript to revert changes."
    exit 0
}

Write-Output "Unsupported OS or environment. No changes made."; exit 1
