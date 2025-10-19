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
tasklist /FI "PID eq %PID%" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Stopping watcher (PID: %PID%)...
    taskkill /PID %PID% /F >nul 2>&1
    del watcher.pid
    echo Watcher stopped successfully!
) else (
    echo Watcher process not found (stale PID file)
    del watcher.pid
)
