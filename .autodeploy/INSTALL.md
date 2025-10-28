# Auto-Deploy Watcher - Installation Guide

## One-Click Auto-Start Setup

This guide explains how to set up the Auto-Deploy Watcher to start automatically when you log in to Windows.

---

## Quick Install

### Step 1: Install Auto-Start

1. **Right-click** on `install-autostart.bat`
2. Select **"Run as Administrator"**
3. Follow the prompts
4. Done! ✅

The watcher will now start automatically 30 seconds after Windows login.

### Step 2: Verify Installation

1. Open Task Scheduler (Win+R → `taskschd.msc`)
2. Navigate to: **Task Scheduler Library → Obsidian**
3. You should see: **"AutoDeploy Watcher"**
4. Status should be: **Ready**

---

## What Happens After Installation

### Automatic Startup

```
Windows Login
    ↓ (wait 30 seconds)
Watcher starts silently in background
    ↓
You open Obsidian
    ↓
Export a note (Ctrl+P → Publish)
    ↓
Watcher detects change → Auto-commit → Auto-push
    ↓
GitHub Actions deploys
    ↓
Live at https://notes.alafghani.info
```

### Key Features

- ✅ **Starts automatically** at Windows login
- ✅ **Runs silently** (no console window)
- ✅ **Survives reboots** (Task Scheduler handles it)
- ✅ **No manual intervention** needed
- ✅ **Easy to enable/disable** (Task Scheduler GUI)

---

## Manual Control

### Start Watcher Now

If you don't want to wait for the next login:

```bash
# Option 1: Via Task Scheduler
Win+R → taskschd.msc → Find "AutoDeploy Watcher" → Right-click → Run

# Option 2: Via command line
cd D:\Obsidian\obsidianpublish\.autodeploy
wscript watcher-silent.vbs
```

### Stop Watcher

The watcher runs continuously. To stop it:

1. Open Task Manager (`Ctrl+Shift+Esc`)
2. Find **node.exe** processes
3. End the watcher process (check Command line column for "watcher.js")

Or disable the task in Task Scheduler.

### Uninstall Auto-Start

1. **Double-click** on `uninstall-autostart.bat`
2. Confirm the prompts
3. Done!

After uninstalling, you'll need to manually run `start.bat` when you want to use the watcher.

---

## Files Created

| File | Purpose |
|------|---------|
| `watcher-silent.vbs` | Launches watcher without console window |
| `auto-deploy-task.xml` | Task Scheduler definition |
| `install-autostart.bat` | One-click installer |
| `uninstall-autostart.bat` | One-click uninstaller |

---

## Troubleshooting

### "Access is denied" error

**Solution:** Right-click `install-autostart.bat` and select "Run as Administrator"

### Task installs but watcher doesn't start

1. Check Task Scheduler (Win+R → `taskschd.msc`)
2. Find task under **Obsidian → AutoDeploy Watcher**
3. Right-click → **Properties** → **History** tab
4. Check for error messages

Common issues:
- Node.js not in system PATH
- `watcher.js` file missing
- Git not configured

### Watcher starts multiple times

The Task Scheduler settings prevent this (`IgnoreNew` policy), but if it happens:

1. Open Task Scheduler
2. Find the task
3. Check **Settings** tab
4. Ensure "If the task is already running" = "Do not start a new instance"

### Want to see the watcher console

If you prefer to see the console window:

1. Don't use the Task Scheduler installation
2. Instead, use the **Startup Folder** method:
   - Create shortcut to `start.bat`
   - Move to: `shell:startup` (Win+R → type this)
   - Console window will appear at login

---

## Advanced Configuration

### Change Startup Delay

Edit `auto-deploy-task.xml`:

```xml
<Delay>PT30S</Delay>  <!-- PT30S = 30 seconds -->
```

Change to:
- `PT1M` = 1 minute
- `PT2M` = 2 minutes
- Remove line = Start immediately

Then reinstall the task.

### Run on Schedule Instead of Login

Edit `auto-deploy-task.xml`, replace `<LogonTrigger>` with:

```xml
<CalendarTrigger>
  <StartBoundary>2025-10-28T09:00:00</StartBoundary>
  <Enabled>true</Enabled>
  <ScheduleByDay>
    <DaysInterval>1</DaysInterval>
  </ScheduleByDay>
</CalendarTrigger>
```

This runs daily at 9:00 AM.

### Multiple Triggers

You can add multiple triggers in the XML:

```xml
<Triggers>
  <LogonTrigger>
    <Enabled>true</Enabled>
    <Delay>PT30S</Delay>
  </LogonTrigger>
  <BootTrigger>
    <Enabled>true</Enabled>
    <Delay>PT1M</Delay>
  </BootTrigger>
</Triggers>
```

This starts at both login AND system boot.

---

## Monitoring

### Check Watcher Status

```bash
# View deployment log
cat D:\Obsidian\obsidianpublish\.autodeploy\deploy.log

# View errors
cat D:\Obsidian\obsidianpublish\.autodeploy\deploy-errors.log

# Check if watcher is running
tasklist | findstr node.exe
```

### View Recent Deployments

```bash
# Last 10 deployments
tail -n 20 deploy.log

# Watch log in real-time
tail -f deploy.log
```

---

## Uninstallation

### Complete Removal

1. Run `uninstall-autostart.bat`
2. Delete the `.autodeploy/` folder (optional)
3. Remove from startup if you added it there

### Keep Files, Remove Auto-Start Only

Just run `uninstall-autostart.bat` - keeps all files but disables auto-start.

---

## Benefits Over Manual Start

| Feature | Manual (`start.bat`) | Auto-Start (Task Scheduler) |
|---------|---------------------|---------------------------|
| Starts at login | ❌ No | ✅ Yes (30s delay) |
| Survives reboot | ❌ No | ✅ Yes |
| Silent operation | ❌ Console window | ✅ Hidden |
| Easy to disable | ❌ Must close window | ✅ Task Scheduler GUI |
| Resource usage | Same | Same |
| Reliability | Medium | High |

---

## Support

If you encounter issues:

1. Check `deploy-errors.log`
2. Check Task Scheduler History tab
3. Verify Node.js and Git are installed
4. Ensure repository access is configured

For more help, see the main README-DEPLOYMENT.md file.
