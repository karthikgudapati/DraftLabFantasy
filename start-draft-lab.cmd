@echo off
rem Launch Draft Lab: server (hidden) + browser. Safe to run repeatedly.
powershell -NoProfile -WindowStyle Hidden -Command "if (-not (Get-NetTCPConnection -LocalPort 8843 -State Listen -ErrorAction SilentlyContinue)) { Start-Process pwsh -WindowStyle Hidden -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','%~dp0serve.ps1' ; Start-Sleep 2 }"
start http://localhost:8843/
