<#
Hardened Network Boost PowerShell for Windows
- Performs dry-run by default
- Use -Apply to apply changes, -Confirm:$false to skip prompts
- Writes a robust restore script `network-boost-restore.ps1` that restores prior settings
- Logs to `network-boost.log`
Notes: Requires administrative privileges to apply.
#>
param(
    [switch]$Apply,
    [switch]$Confirm = $true,
    [string]$LogFile = "network-boost.log",
    [string]$RestoreScript = "network-boost-restore.ps1"
)

$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $dir

function Write-Log($msg) {
    $ts = (Get-Date).ToString('u')
    "$ts - $msg" | Out-File -FilePath $LogFile -Append -Encoding UTF8
    Write-Host $msg
}

function Get-TCPGlobalSettings {
    $raw = netsh interface tcp show global 2>$null
    $dict = @{}
    if ($raw) {
        $raw -match '(.+?):\s+(.+)' | Out-Null
        $raw -split "\r?\n" | ForEach-Object {
            if ($_ -match '(.+?):\s+(.+)') {
                $k = $matches[1].Trim() -replace '\s+','_'
                $v = $matches[2].Trim()
                $dict[$k] = $v
            }
        }
    }
    return $dict
}

Write-Log "Starting hardened Windows Network Boost (Apply=$Apply)"
$cur = Get-TCPGlobalSettings
if ($cur.Count -gt 0) { Write-Log "Current TCP settings captured" }

$changes = @(
    @{cmd='netsh interface tcp set global autotuning=normal'; key='Receive_Window_Auto_Tuning_Level'; desc='TCP Auto-Tuning'},
    @{cmd='netsh interface tcp set global congestionprovider=ctcp'; key='Additive_Increase_and_Decrease_Provider'; desc='CTCP congestion provider'},
    @{cmd='netsh interface tcp set global rss=enabled'; key='Receive_Side_Scaling_State'; desc='RSS (Receive Side Scaling)'},
    @{cmd='netsh interface tcp set global chimney=disabled'; key='TCP_Chimney_State'; desc='TCP Chimney (disabled for compatibility)'},
    @{cmd='netsh interface tcp set global ecncapability=disabled'; key='ECN_Capability'; desc='ECN (disabled for compatibility)'}
)

Write-Host "Recommended changes (dry-run):"
$idx=1
foreach ($c in $changes) { Write-Host "[$idx] $($c.desc): $($c.cmd)"; $idx++ }

if (-not $Apply) { Write-Log "Dry-run complete. Run with -Apply to apply changes."; Pop-Location; exit 0 }

if ($Confirm) {
    $ans = Read-Host "Apply recommended changes now? (y/N)"
    if ($ans -notin @('y','Y','yes','Yes')) { Write-Log 'User declined to apply changes.'; Pop-Location; exit 0 }
}

# Create restore script header
"# PowerShell restore script generated on $(Get-Date -Format u)" | Out-File -FilePath $RestoreScript -Encoding UTF8
"# Run with administrative privileges to restore original values." | Out-File -FilePath $RestoreScript -Append -Encoding UTF8
"`$ErrorActionPreference = 'Stop'" | Out-File -FilePath $RestoreScript -Append -Encoding UTF8

# Record current and write restore commands
foreach ($k in $cur.Keys) {
    $v = $cur[$k]
    # Map human-friendly keys to commands where possible (best-effort)
    switch ($k) {
        'Receive_Window_Auto_Tuning_Level' { "# autotuning: $v" | Out-File -FilePath $RestoreScript -Append -Encoding UTF8 }
        default { "# $k = $v" | Out-File -FilePath $RestoreScript -Append -Encoding UTF8 }
}
}

# More robust capturing: write exact netsh restore commands for things we change
foreach ($c in $changes) {
    # parse desired state from cmd (assumes '... <name>=<value>')
    if ($c.cmd -match '=([^\s]+)$') { $desired = $matches[1] } else { $desired = '' }
    # attempt to find current value for informative restore script
    $curVal = ''
    if ($c.key -and $cur.ContainsKey($c.key)) { $curVal = $cur[$c.key] }
    $restoreCmd = "# Restore $($c.desc) (previous: $curVal)" + "`n"
    # best-effort restore mapping
    switch ($c) {
        { $_.cmd -like '*autotuning*' } { $restoreCmd += "netsh interface tcp set global autotuning=$curVal`n" }
        { $_.cmd -like '*congestionprovider*' } { $restoreCmd += "netsh interface tcp set global congestionprovider=$curVal`n" }
        { $_.cmd -like '*rss*' } { $restoreCmd += "netsh interface tcp set global rss=$curVal`n" }
        { $_.cmd -like '*chimney*' } { $restoreCmd += "netsh interface tcp set global chimney=$curVal`n" }
        { $_.cmd -like '*ecncapability*' } { $restoreCmd += "netsh interface tcp set global ecncapability=$curVal`n" }
        default { $restoreCmd += "REM No exact restore for: $($c.cmd)`n" }
    }
    $restoreCmd | Out-File -FilePath $RestoreScript -Append -Encoding UTF8
}

# Apply changes with transaction-like behavior
$applied = @()
try {
    foreach ($c in $changes) {
        Write-Log "Applying: $($c.desc)"
        iex $c.cmd
        $applied += $c
        Write-Log "Applied: $($c.desc)"
    }
} catch {
    Write-Log "Error applying changes: $_. Initiating rollback."
    # attempt rollback by running restore script (best-effort)
    try {
        & powershell -NoProfile -ExecutionPolicy Bypass -File $RestoreScript
        Write-Log "Rollback attempted via $RestoreScript"
    } catch {
        Write-Log "Rollback failed: $_"
    }
    Pop-Location
    throw $_
}

Write-Log "All changes applied successfully. A restore script was written to $RestoreScript and log to $LogFile. Reboot recommended."
Pop-Location
Exit 0
