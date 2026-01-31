Param(
  [string]$Upstream = 'https://github.com/Cleanskiier27/Final.git',
  [string]$Fork = '',
  [string]$Branch = 'feature/network-boost'
)

# Apply contribution to upstream repo (PowerShell version)
$ErrorActionPreference = 'Stop'
$workdir = (Get-Location).ProviderPath
$contrib = Join-Path $workdir 'contrib\Cleanskiier27-final'
if (-not (Test-Path $contrib)) { Write-Error "Contribution path not found: $contrib"; exit 1 }

$tmp = New-Item -ItemType Directory -Path (Join-Path $env:TEMP ([System.Guid]::NewGuid()))
try {
  Push-Location $tmp.FullName
  git clone $Upstream repo
  Set-Location repo
  git checkout -b $Branch
  Write-Output "Copying files..."
  robocopy (Resolve-Path $contrib) (Get-Location).Path /E /XD .git
  git add .
  if ((git diff --staged --quiet) -eq $true) { Write-Output "No changes to commit."; exit 0 }
  git commit -m "Add Network Boost cross-platform utilities: scripts, docs, and PR notes"
  if ([string]::IsNullOrEmpty($Fork)) {
    Write-Output "No fork provided. Please add your fork as a remote and push the branch. Example: git remote add fork <fork-url>; git push fork $Branch"
    exit 0
  }
  git remote add fork $Fork
  git push fork $Branch --set-upstream
  if (Get-Command gh -ErrorAction SilentlyContinue) {
    gh pr create --fill --base main --head "$(git remote get-url fork | ForEach-Object { ($_ -split ':')[-1] -replace '\.git$','' }):$Branch"
  } else {
    Write-Output "Pushed branch. Use GitHub UI to open a PR or install gh to open PR automatically."
  }
} finally {
  Pop-Location
  Remove-Item -Recurse -Force $tmp
}
