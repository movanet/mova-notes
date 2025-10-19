@echo off
REM Auto-deploy watcher starter script

cd /d "%~dp0"

REM Check if already running
if exist "watcher.pid" (
    set /p PID=<watcher.pid
    tasklist /FI "PID eq %PID%" 2>NUL | find /I /N "node.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo Watcher is already running (PID: %PID%)
        exit /b 0
    )
)

REM Start watcher in background
echo Starting auto-deploy watcher...
start /B node auto-deploy.js

echo Watcher started successfully!
timeout /t 2 >nul
