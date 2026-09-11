# 專案管理與 RFI 系統 - 本機伺服器停止腳本 (PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  專案管理與 RFI 追蹤系統 - 關閉本機伺服器 (PS)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$stopped = $false

# 1. 檢查 PID 檔
if (Test-Path ".server.pid") {
    $pidToKill = Get-Content ".server.pid" -Raw
    $pidToKill = $pidToKill.Trim()
    if ($pidToKill) {
        try {
            Stop-Process -Id ([int]$pidToKill) -Force -ErrorAction SilentlyContinue
            Write-Host "[成功] 已依據 PID 檔終止行程 (PID: $pidToKill)" -ForegroundColor Green
            $stopped = $true
        } catch {}
    }
    Remove-Item ".server.pid" -Force -ErrorAction SilentlyContinue
}

# 2. 檢查 Port 3000
try {
    $connections = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "[成功] 已釋放 Port 3000 行程 (PID: $($conn.OwningProcess))" -ForegroundColor Green
        $stopped = $true
    }
} catch {}

if ($stopped) {
    Write-Host "[完成] 本機伺服器已成功關閉。" -ForegroundColor Green
} else {
    Write-Host "[資訊] 目前無正在運行的伺服器 (Port 3000 空閒)。" -ForegroundColor Yellow
}
