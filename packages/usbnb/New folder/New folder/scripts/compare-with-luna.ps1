<#
PowerShell helper to clone and produce a simple file-level comparison between this repo and https://github.com/Cleanskiier27/luna.eu
Requires: git, fc (PowerShell Compare-Object), or Windows built-in tools
Usage: .\scripts\compare-with-luna.ps1 -TargetDir external/luna.eu
#>
param(
    [string]$RepoUrl = 'https://github.com/Cleanskiier27/luna.eu',
    [string]$TargetDir = 'external/luna.eu'
)

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error 'git is not installed or not in PATH. Please install git to use this script.'
    exit 1
}

if (-not (Test-Path $TargetDir)) {
    git clone $RepoUrl $TargetDir
} else {
    Push-Location $TargetDir
    git fetch --all
    git pull
    Pop-Location
}

$source = (Resolve-Path .).ProviderPath
$target = (Resolve-Path $TargetDir).ProviderPath

Write-Output "Comparing $source to $target"

# Get file lists
$left = Get-ChildItem -Recurse -File -Path $source | Select-Object -ExpandProperty FullName | ForEach-Object { $_.Substring($source.Length) }
$right = Get-ChildItem -Recurse -File -Path $target | Select-Object -ExpandProperty FullName | ForEach-Object { $_.Substring($target.Length) }

$onlyInSource = $left | Where-Object { $_ -notin $right }
$onlyInTarget = $right | Where-Object { $_ -notin $left }

Write-Output "\nFiles only in this repo (sample):"
$onlyInSource | Select-Object -First 30 | ForEach-Object { Write-Output $_ }

Write-Output "\nFiles only in luna.eu (sample):"
$onlyInTarget | Select-Object -First 30 | ForEach-Object { Write-Output $_ }

# For overlapping files show textual diffs for top N
$common = $left | Where-Object { $_ -in $right } | Select-Object -First 20
if ($common.Count -gt 0) {
    Write-Output "\nText diffs for common files (first 20):"
    foreach ($f in $common) {
        $a = Join-Path $source $f
        $b = Join-Path $target $f
        if ((Get-Content $a -ErrorAction SilentlyContinue) -and (Get-Content $b -ErrorAction SilentlyContinue)) {
            Write-Output "--- $f ---"
            fc $a $b | Select-Object -First 200 | ForEach-Object { Write-Output $_ }
        }
    }
}

Write-Output "\nComparison complete."