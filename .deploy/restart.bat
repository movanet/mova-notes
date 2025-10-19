@echo off
REM Auto-deploy watcher restart script

cd /d "%~dp0"

echo Restarting auto-deploy watcher...

REM Stop watcher
call stop.bat

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start watcher
call start.bat

echo Watcher restarted successfully!
