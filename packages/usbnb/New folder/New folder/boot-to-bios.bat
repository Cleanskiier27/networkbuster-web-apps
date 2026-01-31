@echo off
REM NetworkBuster BIOS Boot Script
REM Automated system reboot into BIOS/UEFI

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   NetworkBuster BIOS Boot Utility                          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo This will restart your computer and boot into BIOS/UEFI setup.
echo.
echo IMPORTANT:
echo   - Save all work before continuing
echo   - You will need to configure BIOS settings manually
echo   - Refer to BIOS-OPTIMIZATION-GUIDE.md for optimal settings
echo.

choice /C YN /M "Do you want to continue"
if errorlevel 2 goto :cancel
if errorlevel 1 goto :reboot

:reboot
echo.
echo Restarting into BIOS...
echo.
shutdown /r /fw /t 5 /c "NetworkBuster: Rebooting to BIOS/UEFI for optimization"
echo System will restart in 5 seconds...
echo Press Ctrl+C to cancel
timeout /t 5
goto :end

:cancel
echo.
echo Cancelled. No changes made.
echo.
goto :end

:end
pause
