@echo off
REM Auto-Deploy Watcher Starter
REM Starts the watcher in the background

echo Starting Auto-Deploy Watcher...

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Get the directory of this script
cd /d "%~dp0"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Check if watcher is already running
tasklist /FI "WINDOWTITLE eq Auto-Deploy Watcher" 2>NUL | find /I /N "cmd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Watcher is already running!
    pause
    exit /b 0
)

REM Start watcher in a new window
start "Auto-Deploy Watcher" cmd /k "node watcher.js"

echo Watcher started successfully!
echo A new window has opened for the watcher process.
echo You can close this window.
timeout /t 3
