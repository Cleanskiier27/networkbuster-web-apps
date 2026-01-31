$ErrorActionPreference = 'Stop'
$toolsDir = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"

# Download NetworkBuster
$packageName = 'networkbuster'
$version = '1.0.1'
$url = "https://github.com/NetworkBuster/networkbuster.net/releases/download/v${version}/networkbuster-${version}-win-x64.zip"
$checksum = '00000000000000000000000000000000'  # Update with actual checksum
$checksumType = 'sha256'

$installDir = Join-Path $env:ProgramFiles $packageName
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

# Download and extract
$zipPath = Join-Path $toolsDir "networkbuster.zip"
Get-ChocolateyWebFile -PackageName $packageName `
                      -FileFullPath $zipPath `
                      -Url $url `
                      -ChecksumType $checksumType `
                      -Checksum $checksum

# Extract
$shell = New-Object -ComObject Shell.Application
$zip = $shell.NameSpace($zipPath)
$dest = $shell.NameSpace($installDir)
$dest.CopyHere($zip.Items(), 16)
Remove-Item $zipPath -Force

# Add to PATH
Install-ChocolateyPath -PathToInstall $installDir -PathType Machine

# Create service
$serviceName = 'NetworkBuster'
if (!(Get-Service -Name $serviceName -ErrorAction SilentlyContinue)) {
    $exePath = Join-Path $installDir 'server.exe'
    New-Service -Name $serviceName `
                -DisplayName 'NetworkBuster Server' `
                -BinaryPathName $exePath `
                -StartupType Automatic | Out-Null
}

Write-ChocolateySuccess $packageName
