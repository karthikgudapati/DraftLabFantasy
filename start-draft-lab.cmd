@echo off
rem Launch Draft Lab: build if needed, start server (hidden), open browser. Safe to run repeatedly.
cd /d "%~dp0"
if not exist "dist\index.html" (
  echo Building Draft Lab for first run...
  call npm install
  call npm run build
)
powershell -NoProfile -WindowStyle Hidden -Command "if (-not (Get-NetTCPConnection -LocalPort 8843 -State Listen -ErrorAction SilentlyContinue)) { Start-Process pwsh -WindowStyle Hidden -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','%~dp0serve.ps1' ; Start-Sleep 2 }"
start http://localhost:8843/
