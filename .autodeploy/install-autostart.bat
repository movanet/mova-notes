@echo off
REM ============================================================
REM Auto-Deploy Watcher - Auto-Start Installer
REM Version: 3.0
REM Created: 2025-10-28
REM ============================================================
REM
REM This script installs a Windows Task Scheduler task that
REM automatically starts the Auto-Deploy Watcher at system login.
REM
REM The watcher will run silently in the background and
REM automatically commit/push changes when you export notes.
REM
REM ============================================================

title Auto-Deploy Watcher - Install Auto-Start
color 0A
echo.
echo ============================================================
echo  Auto-Deploy Watcher - Auto-Start Installer v3.0
echo ============================================================
echo.
echo This will install a Task Scheduler entry that:
echo   - Starts the watcher automatically at system login
echo   - Runs silently in the background (no console window)
echo   - Monitors docs/ folder for changes
echo   - Auto-commits and pushes to GitHub
echo.
echo ============================================================
echo.

REM Get the directory of this script
cd /d "%~dp0"

REM Verify required files exist
if not exist "auto-deploy-task.xml" (
    color 0C
    echo [ERROR] auto-deploy-task.xml not found!
    echo Please ensure all files are in the same directory.
    echo.
    pause
    exit /b 1
)

if not exist "watcher-silent.vbs" (
    color 0C
    echo [ERROR] watcher-silent.vbs not found!
    echo Please ensure all files are in the same directory.
    echo.
    pause
    exit /b 1
)

if not exist "watcher.js" (
    color 0C
    echo [ERROR] watcher.js not found!
    echo Please ensure all files are in the same directory.
    echo.
    pause
    exit /b 1
)

REM Check if task already exists
schtasks /Query /TN "Obsidian\AutoDeploy Watcher" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Task already exists!
    echo.
    choice /C YN /M "Do you want to replace the existing task? (Y/N)"
    if errorlevel 2 (
        echo.
        echo Installation cancelled.
        pause
        exit /b 0
    )
    echo.
    echo Removing existing task...
    schtasks /Delete /TN "Obsidian\AutoDeploy Watcher" /F >nul 2>&1
)

REM Install the task
echo [1/3] Installing Task Scheduler entry...
schtasks /Create /XML "%~dp0auto-deploy-task.xml" /TN "Obsidian\AutoDeploy Watcher" >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Failed to install task!
    echo.
    echo This usually happens if:
    echo   1. You need Administrator privileges
    echo   2. The XML file is corrupted
    echo   3. Task Scheduler service is not running
    echo.
    echo Please try:
    echo   - Right-click this file and "Run as Administrator"
    echo   - Check if Task Scheduler service is running
    echo.
    pause
    exit /b 1
)

echo [OK] Task installed successfully!
echo.

REM Verify installation
echo [2/3] Verifying installation...
schtasks /Query /TN "Obsidian\AutoDeploy Watcher" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Task was installed but cannot be found!
    echo.
    pause
    exit /b 1
)

echo [OK] Task verified!
echo.

REM Test the task
echo [3/3] Testing task...
echo (This will start the watcher now)
schtasks /Run /TN "Obsidian\AutoDeploy Watcher" >nul 2>&1
timeout /t 2 >nul

REM Check if watcher process is running
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo [OK] Watcher is running!
) else (
    color 0E
    echo [WARNING] Watcher may not have started.
    echo Check Task Scheduler for details.
)

echo.
echo ============================================================
echo  Installation Complete!
echo ============================================================
echo.
color 0A
echo The Auto-Deploy Watcher will now start automatically:
echo   - At system login (with 30-second delay)
echo   - Runs silently in the background
echo   - No console window will appear
echo.
echo To manage the task:
echo   - View: Press Win+R, type "taskschd.msc", find "Obsidian"
echo   - Uninstall: Run "uninstall-autostart.bat"
echo   - Logs: Check "deploy.log" and "deploy-errors.log"
echo.
echo ============================================================
echo.
pause
