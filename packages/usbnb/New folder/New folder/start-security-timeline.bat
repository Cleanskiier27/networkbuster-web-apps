@echo off
REM NetworkBuster Security & Timeline Quick Start
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   NetworkBuster Security & Timeline System                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Starting all services...
echo.

REM Start Security Monitor on port 3006
echo [1/3] Starting Security Monitor (Port 3006)...
start "Security Monitor" cmd /k "node security-monitor.js"
timeout /t 2 /nobreak >nul

REM Start Timeline Tracker on port 3007
echo [2/3] Starting Timeline Tracker (Port 3007)...
start "Timeline Tracker" cmd /k "node timeline-tracker.js"
timeout /t 2 /nobreak >nul

REM Start Main Server on port 3000
echo [3/3] Starting Main Server (Port 3000)...
start "Main Server" cmd /k "node server-universal.js"
timeout /t 2 /nobreak >nul

echo.
echo ✅ All services started!
echo.
echo Services:
echo   🛡️  Security Monitor  - http://localhost:3006
echo   ⏰ Timeline Tracker   - http://localhost:3007
echo   🌐 Main Server        - http://localhost:3000
echo.
echo Dashboard:
echo   📊 Security Dashboard - http://localhost:3000/dashboard-security.html
echo.
echo Press any key to open dashboard...
pause >nul

start http://localhost:3000/dashboard-security.html

echo.
echo Dashboard opened. All services are running.
echo Close this window when done.
echo.
