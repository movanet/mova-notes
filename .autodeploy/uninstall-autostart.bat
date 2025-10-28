@echo off
REM ============================================================
REM Auto-Deploy Watcher - Auto-Start Uninstaller
REM Version: 3.0
REM Created: 2025-10-28
REM ============================================================
REM
REM This script removes the Task Scheduler task that
REM automatically starts the Auto-Deploy Watcher.
REM
REM After uninstalling, you'll need to manually run start.bat
REM to use the watcher.
REM
REM ============================================================

title Auto-Deploy Watcher - Uninstall Auto-Start
color 0E
echo.
echo ============================================================
echo  Auto-Deploy Watcher - Auto-Start Uninstaller v3.0
echo ============================================================
echo.
echo This will remove the Task Scheduler entry.
echo.
echo After uninstalling:
echo   - Watcher will NOT start automatically at login
echo   - You'll need to manually run start.bat when needed
echo   - Current running watcher will NOT be stopped
echo.
echo ============================================================
echo.

REM Check if task exists
schtasks /Query /TN "Obsidian\AutoDeploy Watcher" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [INFO] Task is not installed.
    echo Nothing to uninstall.
    echo.
    pause
    exit /b 0
)

echo Task found: "Obsidian\AutoDeploy Watcher"
echo.
choice /C YN /M "Are you sure you want to uninstall? (Y/N)"
if errorlevel 2 (
    echo.
    echo Uninstallation cancelled.
    pause
    exit /b 0
)

echo.
echo Uninstalling...
schtasks /Delete /TN "Obsidian\AutoDeploy Watcher" /F >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Failed to uninstall task!
    echo.
    echo This usually happens if:
    echo   1. You need Administrator privileges
    echo   2. Task is currently running and locked
    echo.
    echo Please try:
    echo   - Right-click this file and "Run as Administrator"
    echo   - Stop the task in Task Scheduler first
    echo.
    pause
    exit /b 1
)

echo.
color 0A
echo ============================================================
echo  Uninstallation Complete!
echo ============================================================
echo.
echo The auto-start task has been removed.
echo.
echo To use the watcher now, you must manually run:
echo   - start.bat (from this folder)
echo   - Or reinstall: run install-autostart.bat
echo.
echo Note: This did NOT stop the currently running watcher.
echo       To stop it, run: stop.bat
echo.
echo ============================================================
echo.
pause
