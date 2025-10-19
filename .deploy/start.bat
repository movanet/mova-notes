@echo off
REM Auto-deploy watcher starter script

cd /d "%~dp0"

REM Check if already running
if exist "watcher.pid" (
    echo Watcher may already be running. Use restart.bat to restart.
)

REM Start watcher in background
echo Starting auto-deploy watcher...
start /B node auto-deploy.js

echo Watcher started successfully!
timeout /t 2 /nobreak >nul
