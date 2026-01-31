Write-Host "Admin Verification"; Write-Host "Policy: $(Get-ExecutionPolicy)"; Write-Host "D: Drive: $(if (Test-Path D:\) { 'OK' } else { 'NOT FOUND' })"
