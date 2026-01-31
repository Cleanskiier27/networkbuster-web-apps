<#
generate-icons.ps1
Generates multi-size PNG icons and an ICO from `scripts/installer/branding/logo.svg` or `scripts/installer/branding/icons/icon-256.png` using ImageMagick (`magick`).
Usage: powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1
#>
$ErrorActionPreference = 'Stop'

$branding = Join-Path $PSScriptRoot 'installer\branding'
$iconsDir = Join-Path $branding 'icons'
if (-not (Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir | Out-Null }

$sourceSvg = Join-Path $branding 'logo.svg'
$sourcePng = Join-Path $iconsDir 'icon-256.png'

if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Output "ImageMagick 'magick' not found. Install ImageMagick to generate icons automatically."
    Write-Output "Place prepared icons into $iconsDir or run the convert script on a machine with ImageMagick."
    exit 0
}

$sizes = @(256,128,64,48,32,16)

if (Test-Path $sourceSvg) {
    foreach ($s in $sizes) {
        $out = Join-Path $iconsDir "icon-$s.png"
        Write-Output "Generating $out from $sourceSvg"
        magick convert -background none -density 300 $sourceSvg -resize ${s}x${s} $out
    }
} elseif (Test-Path $sourcePng) {
    foreach ($s in $sizes) {
        $out = Join-Path $iconsDir "icon-$s.png"
        Write-Output "Generating $out from $sourcePng"
        magick convert $sourcePng -resize ${s}x${s} $out
    }
} else {
    Write-Error "No source logo.svg or icon-256.png found. Place one in $branding or $iconsDir."
}

# Build ICO
$ico = Join-Path $iconsDir 'icon.ico'
$pngs = $sizes | ForEach-Object { "icon-$_" } | ForEach-Object { Join-Path $iconsDir "$_ + '.png'" }
$pngArgs = $sizes | ForEach-Object { Join-Path $iconsDir "icon-$_.png" }
$pngArgsStr = $pngArgs -join ' '
Write-Output "Creating ICO $ico from: $pngArgsStr"
magick convert $pngArgsStr $ico
Write-Output "Created ICO: $ico"
