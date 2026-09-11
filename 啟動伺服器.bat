@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ====================================================
echo   專案管理與 RFI 追蹤系統 - 本機伺服器啟動程式
echo ====================================================
echo.

REM 1. 檢查 Node.js 是否已安裝
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [錯誤] 系統未安裝 Node.js 或未加入 PATH 環境變數！
    echo 請先前往官方網站下載並安裝 Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 2. 檢查並關閉可能殘留的舊行程 (Port 3000)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo [提示] 偵測到 Port 3000 已被舊行程 (PID: %%a) 佔用，正在結束舊行程...
    taskkill /F /PID %%a >nul 2>nul
)
if exist ".server.pid" del /f /q .server.pid >nul 2>nul

REM 3. 檢查 node_modules 是否存在
if not exist "node_modules\" (
    echo [提示] 初次執行，正在安裝專案必要依賴套件 (npm install)...
    echo 這可能需要 1~2 分鐘，請稍候...
    call npm.cmd install
    if %errorlevel% neq 0 (
        echo [錯誤] 依賴安裝失敗，請檢查網路連線或權限。
        pause
        exit /b 1
    )
    echo [完成] 依賴套件安裝成功！
    echo.
)

REM 4. 啟動伺服器 (使用 Vite 本機伺服器，支援即時更新與極速響應)
echo [啟動] 正在啟動本機伺服器 (Port 3000)...
start "專案管理與 RFI 系統本機伺服器 - Port 3000" cmd /k "cd /d "%~dp0" && npm.cmd run dev"

REM 5. 等待伺服器就緒並開啟瀏覽器
echo [等待] 正在等待伺服器就緒...
timeout /t 3 /nobreak >nul

echo [瀏覽器] 正在開啟應用程式頁面: http://localhost:3000
start http://localhost:3000

echo.
echo ====================================================
echo   [成功] 伺服器已在專屬命令視窗中運行！
echo   * 本機網址: http://localhost:3000
echo   * 如需關閉伺服器，請直接雙擊執行【關閉伺服器.bat】
echo ====================================================
echo.
timeout /t 5
