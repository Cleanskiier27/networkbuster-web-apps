#!/usr/bin/env powershell
<#
.SYNOPSIS
NetworkBuster Local Development - Works WITHOUT Docker
.DESCRIPTION
Runs tri-server system (Web, API, Audio) directly
No Docker dependency - perfect when Docker is broken
#>

Write-Host @"
╔════════════════════════════════════════════════════════════╗
║  NetworkBuster Local Development                           ║
║  Running 3 Servers WITHOUT Docker                          ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check prerequisites
Write-Host "`n✓ Checking prerequisites..." -ForegroundColor Yellow

$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "✗ Node.js not found! Install from nodejs.org" -ForegroundColor Red
    exit 1
}

$npmVersion = npm --version 2>$null
if (-not $npmVersion) {
    Write-Host "✗ npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "  npm: $npmVersion" -ForegroundColor Green

# Install dependencies
Write-Host "`n✓ Installing dependencies..." -ForegroundColor Yellow
npm install 2>&1 | Select-Object -Last 3

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║  Starting All 3 Servers...                                 ║
╚════════════════════════════════════════════════════════════╝

Services:
  🌐 Web Server      → http://localhost:3000
  ⚙️  API Server     → http://localhost:3001
  🎵 Audio Lab      → http://localhost:3002/audio-lab

Commands:
  - Ctrl+C stops all servers
  - Open browsers to test each service

Startup:
"@ -ForegroundColor Cyan

# Start servers
$servers = @(
    @{Name='Main Web Server'; File='server-universal.js'; Port=3000; Icon='🌐'},
    @{Name='API Server'; File='api/server-universal.js'; Port=3001; Icon='⚙️'},
    @{Name='Audio Streaming'; File='server-audio.js'; Port=3002; Icon='🎵'}
)

$processes = @()

foreach ($server in $servers) {
    Write-Host "  Starting $($server.Icon) $($server.Name) on port $($server.Port)..." -ForegroundColor Gray
    $proc = Start-Process node -ArgumentList $server.File -PassThru -NoNewWindow
    $processes += $proc
    Start-Sleep -Milliseconds 800
}

Write-Host @"

✅ All servers started!

Ports in use:
  3000 - Web Server (Control Panel, Music Player)
  3001 - API Server (System Data, Health Checks)
  3002 - Audio Server (Audio Lab, Synthesis, Analysis)

Ready to test!
"@ -ForegroundColor Green

# Health check after startup
Start-Sleep -Seconds 3

Write-Host "`n📊 Checking server health..." -ForegroundColor Yellow

$ports = @(3000, 3001, 3002)
foreach ($port in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ Server on port $port is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⏳ Server on port $port starting (try again in 2 seconds)" -ForegroundColor Yellow
    }
}

Write-Host @"

🎵 Quick Test URLs:
  http://localhost:3000              - Main dashboard with music player
  http://localhost:3000/control-panel - Control panel with equalizer
  http://localhost:3001/api/health    - API health check
  http://localhost:3002/audio-lab     - Audio lab (frequency synthesis)

📝 In another terminal, run:
  curl http://localhost:3000/api/health
  curl http://localhost:3001/api/specs
  curl -X POST http://localhost:3002/api/audio/stream/create

Press Ctrl+C to stop all servers.
"@ -ForegroundColor Cyan

# Wait and monitor
$running = $true
while ($running) {
    foreach ($proc in $processes) {
        if ($proc.HasExited) {
            Write-Host "`n✗ Server process exited unexpectedly" -ForegroundColor Red
            $running = $false
            break
        }
    }
    
    if ($running) {
        Start-Sleep -Seconds 2
    }
}

# Cleanup on exit
Write-Host "`nShutting down servers..." -ForegroundColor Yellow
foreach ($proc in $processes) {
    if (-not $proc.HasExited) {
        $proc.Kill()
        $proc.WaitForExit()
    }
}

Write-Host "✓ All servers stopped" -ForegroundColor Green
