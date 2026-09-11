# 專案管理與 RFI 系統 - 本機伺服器啟動腳本 (PowerShell)
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  專案管理與 RFI 追蹤系統 - 本機伺服器啟動程式 (PS)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. 檢查 Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[錯誤] 系統未安裝 Node.js 或未加入 PATH！請至 https://nodejs.org 安裝。" -ForegroundColor Red
    exit 1
}

# 2. 檢查舊行程 (Port 3000)
$existing = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "[提示] 發現 Port 3000 已被佔用，正在關閉舊行程 (PID: $($existing.OwningProcess))..." -ForegroundColor Yellow
    Stop-Process -Id $existing.OwningProcess -Force -ErrorAction SilentlyContinue
}
if (Test-Path ".server.pid") { Remove-Item ".server.pid" -Force -ErrorAction SilentlyContinue }

# 3. 檢查 node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "[提示] 正在安裝依賴套件 (npm install)..." -ForegroundColor Yellow
    & cmd.exe /c "npm.cmd install"
}

# 4. 啟動伺服器
Write-Host "[啟動] 正在啟動本機伺服器 (Port 3000)..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$ScriptDir`" && npm.cmd run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# 5. 開啟瀏覽器
Write-Host "[瀏覽器] 正在開啟 http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "[完成] 伺服器啟動完成！停止伺服器可執行 ./stop-server.ps1 或 關閉伺服器.bat" -ForegroundColor Green
