@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ====================================================
echo   專案管理與 RFI 追蹤系統 - 本機伺服器關閉程式
echo ====================================================
echo.

set KILLED=0

REM 1. 檢查 .server.pid 檔案
if exist ".server.pid" (
    set /p SERVER_PID=<.server.pid
    if defined SERVER_PID (
        echo [處理] 偵測到 PID 記錄檔 (%SERVER_PID%)，正在終止行程...
        taskkill /F /PID %SERVER_PID% >nul 2>nul
        if %errorlevel% equ 0 set KILLED=1
        del /f /q .server.pid >nul 2>nul
    )
)

REM 2. 搜尋並清理監聽於 Port 3000 的所有行程
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo [處理] 發現佔用 Port 3000 之伺服器行程 (PID: %%a)，正在關閉...
    taskkill /F /PID %%a >nul 2>nul
    if %errorlevel% equ 0 set KILLED=1
)

REM 3. 關閉具有專屬視窗標題的視窗 (可選防護)
taskkill /F /FI "WINDOWTITLE eq 專案管理與 RFI 系統*" >nul 2>nul

echo.
if %KILLED% equ 1 (
    echo ====================================================
    echo   [成功] 本機伺服器已全數停止，Port 3000 已釋放！
    echo ====================================================
) else (
    echo ====================================================
    echo   [資訊] 未發現正在運行的本機伺服器 (Port 3000 目前空閒)。
    echo ====================================================
)

echo.
timeout /t 3
