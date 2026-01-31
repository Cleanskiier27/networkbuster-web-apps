# convert-icon.ps1
# Try to convert scripts/installer/icon-placeholder.png to scripts/installer/icon.ico using ImageMagick (`magick`) or warn the user.
$png = Join-Path $PSScriptRoot 'icon-placeholder.png'
$ico = Join-Path $PSScriptRoot 'icon.ico'

if (-not (Test-Path $png)) { Write-Error "PNG not found: $png"; exit 1 }

if (Get-Command magick -ErrorAction SilentlyContinue) {
    Write-Output "Converting $png -> $ico using ImageMagick"
    magick convert $png -define icon:auto-resize=256,128,64,48,32,16 $ico
    Write-Output "Icon created: $ico"
    # Also generate all size PNGs and a multi-size ICO using generate-icons.ps1
    Write-Output "Generating multi-size icons using scripts/generate-icons.ps1"
    powershell -ExecutionPolicy Bypass -File "$(Join-Path $PSScriptRoot '..\generate-icons.ps1')"
} else {
    Write-Output "ImageMagick (magick) not found. Please install ImageMagick or place an ICO at scripts/installer/icon.ico"
    Write-Output "You can install ImageMagick via Chocolatey: choco install imagemagick -y"
    Write-Output "Or run scripts/generate-icons.ps1 on a machine with ImageMagick to create multi-size icons."
}
