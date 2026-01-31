# NetworkBuster Security & Timeline Quick Start (PowerShell)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   NetworkBuster Security & Timeline System                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting all services..." -ForegroundColor Yellow
Write-Host ""

# Start Security Monitor
Write-Host "[1/3] Starting Security Monitor (Port 3006)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node security-monitor.js"
Start-Sleep -Seconds 2

# Start Timeline Tracker
Write-Host "[2/3] Starting Timeline Tracker (Port 3007)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node timeline-tracker.js"
Start-Sleep -Seconds 2

# Start Main Server
Write-Host "[3/3] Starting Main Server (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server-universal.js"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  🛡️  Security Monitor  - http://localhost:3006" -ForegroundColor White
Write-Host "  ⏰ Timeline Tracker   - http://localhost:3007" -ForegroundColor White
Write-Host "  🌐 Main Server        - http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Dashboard:" -ForegroundColor Cyan
Write-Host "  📊 Security Dashboard - http://localhost:3000/dashboard-security.html" -ForegroundColor White
Write-Host ""
Write-Host "Opening dashboard in 3 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Start-Process "http://localhost:3000/dashboard-security.html"

Write-Host ""
Write-Host "✅ Dashboard opened. All services are running." -ForegroundColor Green
Write-Host ""
Write-Host "To stop services, close each PowerShell window." -ForegroundColor Gray
Write-Host ""
