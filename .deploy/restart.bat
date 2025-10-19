@echo off
REM Auto-deploy watcher restart script

cd /d "%~dp0"

echo Restarting auto-deploy watcher...
call stop.bat
timeout /t 1 >nul
call start.bat
