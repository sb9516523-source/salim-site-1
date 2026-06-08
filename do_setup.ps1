$AppDir     = 'C:\Users\salim\.gemini\antigravity\scratch\valley-security-system'
$launcher   = Join-Path $AppDir 'START_SYSTEM.bat'
$silentBoot = Join-Path $AppDir 'START_SERVER_SILENT.bat'

Write-Host ""
Write-Host "  SECURITY SYSTEM - SETUP" -ForegroundColor Cyan
Write-Host ""

$shell = New-Object -ComObject WScript.Shell

# 1. Desktop Shortcut
Write-Host "  [1/2] Creating Desktop shortcut..." -ForegroundColor Cyan
$desktopPath  = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath 'Security System.lnk'
$sc = $shell.CreateShortcut($shortcutPath)
$sc.TargetPath       = $launcher
$sc.WorkingDirectory = $AppDir
$sc.Description      = 'Open Security Management System'
$sc.IconLocation     = 'shell32.dll,23'
$sc.WindowStyle      = 7
$sc.Save()
if (Test-Path $shortcutPath) { Write-Host "  [OK] Desktop shortcut created!" -ForegroundColor Green }
else { Write-Host "  [FAIL] Desktop shortcut failed." -ForegroundColor Red }

# 2. Startup Folder - silent server only on boot
Write-Host "  [2/2] Adding to Windows Startup (silent server on boot)..." -ForegroundColor Cyan
$startupFolder   = [Environment]::GetFolderPath('Startup')
$startupShortcut = Join-Path $startupFolder 'SecuritySystemBoot.lnk'
$sc2 = $shell.CreateShortcut($startupShortcut)
$sc2.TargetPath       = $silentBoot
$sc2.WorkingDirectory = $AppDir
$sc2.Description      = 'Security System boot server'
$sc2.WindowStyle      = 7
$sc2.Save()
if (Test-Path $startupShortcut) { Write-Host "  [OK] Auto-start on boot registered!" -ForegroundColor Green }
else { Write-Host "  [FAIL] Startup shortcut failed." -ForegroundColor Red }

Write-Host ""
Write-Host "  ALL DONE!" -ForegroundColor Green
Write-Host ""
Write-Host "  HOW IT WORKS:" -ForegroundColor Cyan
Write-Host "  - PC boots  : server starts silently in background" -ForegroundColor White
Write-Host "  - Open app  : double-click Security System on Desktop" -ForegroundColor White
Write-Host "  - No server : shortcut starts it automatically then opens Chrome" -ForegroundColor White
Write-Host ""
