@echo off
REM ================================================================
REM  SECURITY SYSTEM - SILENT SERVER STARTER (BOOT ONLY)
REM  This runs automatically when Windows starts.
REM  It ONLY starts the server in background - does NOT open Chrome.
REM  When user wants to open the app, they use the Desktop shortcut.
REM ================================================================
powershell -WindowStyle Hidden -Command "Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory '%~dp0' -WindowStyle Hidden -RedirectStandardOutput '%~dp0server.log' -RedirectStandardError '%~dp0server-error.log'"
