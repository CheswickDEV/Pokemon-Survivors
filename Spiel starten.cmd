@echo off
setlocal
cd /d "%~dp0"
title Pokemon Survivors
if exist "runtime\node.exe" (
  "runtime\node.exe" server.mjs --open
) else (
  where node >nul 2>nul
  if errorlevel 1 (
    echo Die Laufzeit fehlt. Bitte das vollstaendige Windows-Paket entpacken.
    echo Der Quellcode-Download ist kein fertiges Spielerpaket.
    pause
    exit /b 1
  )
  node server.mjs --open
)
if errorlevel 1 pause
