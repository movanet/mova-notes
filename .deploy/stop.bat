@echo off
REM Auto-deploy watcher stop script

cd /d "%~dp0"

REM Check if PID file exists
if not exist "watcher.pid" (
    echo Watcher is not running
    exit /b 0
)

REM Read PID and kill process
set /p PID=<watcher.pid

REM Kill the process
taskkill /PID %PID% /F >nul 2>&1

REM Delete PID file
del watcher.pid 2>nul

echo Watcher stopped successfully!
