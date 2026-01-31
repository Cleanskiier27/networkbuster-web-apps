param(
  [string]$target = "${PWD}\start-desktop.bat",
  [string]$name = "NetworkBuster Launcher"
)
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcut = Join-Path $desktop ("$name.lnk")
$WshShell = New-Object -ComObject WScript.Shell
$sc = $WshShell.CreateShortcut($shortcut)
$sc.TargetPath = $target
$sc.WorkingDirectory = "${PWD}"
$sc.Save()
Write-Output "Shortcut created: $shortcut"