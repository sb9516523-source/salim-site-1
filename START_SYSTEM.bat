@echo off
REM ================================================================
REM  SECURITY SYSTEM - MAIN LAUNCHER
REM  Double-click this to open the system.
REM  - If server is OFF  → starts it automatically, then opens Chrome
REM  - If server is ON   → just opens Chrome directly
REM  No need to manually start anything!
REM ================================================================

setlocal

set "APP_DIR=%~dp0"
set "PORT=3000"
set "URL=http://localhost:%PORT%"

REM --- Check Node.js ---
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not installed.
    echo Install from https://nodejs.org then try again.
    pause
    exit /b 1
)

REM --- Check if server is already running using PowerShell (more reliable) ---
powershell -Command "try { $r = Invoke-WebRequest -Uri '%URL%/login.html' -TimeoutSec 2 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    goto :openBrowser
)

REM --- Server not running - start it silently in background ---
echo Starting Security System...
powershell -WindowStyle Hidden -Command "Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory '%APP_DIR%' -WindowStyle Hidden -RedirectStandardOutput '%APP_DIR%server.log' -RedirectStandardError '%APP_DIR%server-error.log'"

REM --- Wait up to 15 seconds for server to be ready ---
set /a "attempts=0"
:waitLoop
timeout /t 1 /nobreak >nul
powershell -Command "try { $r = Invoke-WebRequest -Uri '%URL%/login.html' -TimeoutSec 1 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :openBrowser
set /a "attempts+=1"
if %attempts% LSS 15 goto :waitLoop

REM --- Open anyway after timeout ---
:openBrowser

REM --- Try Chrome in App Mode first (no address bar - looks like real app) ---
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%URL%" --start-maximized
    exit /b 0
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%URL%" --start-maximized
    exit /b 0
)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --app="%URL%" --start-maximized
    exit /b 0
)

REM --- Try Edge in App Mode ---
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%URL%" --start-maximized
    exit /b 0
)

REM --- Fallback: default browser ---
start "" "%URL%"
exit /b 0
