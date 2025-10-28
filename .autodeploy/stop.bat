@echo off
REM Auto-Deploy Watcher Stopper
REM Stops the running watcher process

echo Stopping Auto-Deploy Watcher...

REM Find and kill the watcher window
taskkill /FI "WINDOWTITLE eq Auto-Deploy Watcher" /F >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo Watcher stopped successfully!
) else (
    echo No running watcher found.
)

timeout /t 2
