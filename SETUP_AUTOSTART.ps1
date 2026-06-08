##########################################################################
#  SETUP AUTO-START ON WINDOWS BOOT
#  Run this script ONCE on the client's PC (as Administrator).
#  After this, the system starts automatically every time Windows boots.
##########################################################################

param(
    [string]$AppDir = $PSScriptRoot
)

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host "   SECURITY SYSTEM - WINDOWS AUTO-START SETUP" -ForegroundColor Cyan
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. Verify Node.js is installed ---
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCmd) { $nodeCmd.Source } else { $null }
if (-not $nodePath) {
    Write-Host "  ERROR: Node.js is not installed." -ForegroundColor Red
    Write-Host "  Please install from: https://nodejs.org (choose LTS version)" -ForegroundColor Yellow
    Write-Host "  Then run this setup script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  [OK] Node.js found at: $nodePath" -ForegroundColor Green

# --- 2. Run npm install if node_modules missing ---
$nodeModulesPath = Join-Path $AppDir "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "  Installing dependencies (first time only)..." -ForegroundColor Yellow
    Push-Location $AppDir
    npm install
    Pop-Location
    Write-Host "  [OK] Dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  [OK] Dependencies already installed." -ForegroundColor Green
}

# --- 3. Create a Windows Task Scheduler task to start server on boot ---
$taskName = "SecuritySystemServer"
$serverScript = Join-Path $AppDir "server.js"
$logFile = Join-Path $AppDir "server.log"

# Remove old task if it exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "  Removed old scheduled task." -ForegroundColor Yellow
}

# Create the action: run node server.js silently
$action = New-ScheduledTaskAction `
    -Execute "node.exe" `
    -Argument "`"$serverScript`"" `
    -WorkingDirectory $AppDir

# Trigger: at system startup
$trigger = New-ScheduledTaskTrigger -AtStartup

# Run as SYSTEM so it works even when no user is logged in
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -RestartOnIdle `
    -MultipleInstances IgnoreNew

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Auto-starts the Security Management System server on Windows boot." `
    -Force

Write-Host "  [OK] Auto-start task registered: '$taskName'" -ForegroundColor Green

# --- 4. Create a Desktop shortcut to launch browser ---
$desktopPath = [Environment]::GetFolderPath("CommonDesktopDirectory")
$shortcutPath = Join-Path $desktopPath "Security System.lnk"
$launcherBat = Join-Path $AppDir "START_SYSTEM.bat"

$WScriptShell = New-Object -ComObject WScript.Shell
$shortcut = $WScriptShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $launcherBat
$shortcut.WorkingDirectory = $AppDir
$shortcut.Description = "Open Security Management System"
$shortcut.IconLocation = "shell32.dll,23"
$shortcut.WindowStyle = 7  # Minimized - so the CMD window hides
$shortcut.Save()

Write-Host "  [OK] Desktop shortcut created: 'Security System'" -ForegroundColor Green

# --- 5. Start the server right now ---
Write-Host ""
Write-Host "  Starting server now..." -ForegroundColor Yellow
Start-Process -FilePath "node.exe" -ArgumentList $serverScript -WorkingDirectory $AppDir -WindowStyle Hidden -RedirectStandardOutput $logFile

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Green
Write-Host "   SETUP COMPLETE!" -ForegroundColor Green
Write-Host "  ================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  What was done:" -ForegroundColor White
Write-Host "  - Server will auto-start every time Windows boots" -ForegroundColor White
Write-Host "  - Desktop shortcut 'Security System' created" -ForegroundColor White
Write-Host "  - Server is running now at: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "  HOW TO USE:" -ForegroundColor Cyan
Write-Host "  - Double-click 'Security System' on Desktop to open" -ForegroundColor White
Write-Host "  - Works like a real website/app in Chrome" -ForegroundColor White
Write-Host "  - No internet required" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to finish"
