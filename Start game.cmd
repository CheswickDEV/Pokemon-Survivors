@echo off
setlocal
cd /d "%~dp0"
title Pokemon Survivors
if exist "runtime\node.exe" (
  "runtime\node.exe" server.mjs --open
) else (
  where node >nul 2>nul
  if errorlevel 1 (
    echo Runtime missing. Please extract the complete Windows package.
    echo The source download is not a ready-to-play player package.
    pause
    exit /b 1
  )
  node server.mjs --open
)
if errorlevel 1 pause
