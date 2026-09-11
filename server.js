import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 載入本地環境變數 (.env.local 或 .env)
dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');
const PID_FILE = path.join(__dirname, '.server.pid');

// 記錄當前行程 PID 供關閉腳本使用
try {
  fs.writeFileSync(PID_FILE, process.pid.toString(), 'utf8');
} catch (e) {
  console.warn('警告: 無法寫入 .server.pid 檔案');
}

// 支援 JSON 與 URL 編碼請求
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 伺服器健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: '專案管理與 RFI 追蹤系統 本機伺服器',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

// 檢查 dist 目錄是否存在
if (fs.existsSync(DIST_DIR)) {
  // 託管 Vite 編譯後的靜態檔案
  app.use(express.static(DIST_DIR));

  // SPA 路由回退：所有非 API 請求皆回傳 index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  // 若尚未編譯 dist
  app.get('*', (req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="UTF-8">
        <title>伺服器已啟動 - 請先建置專案</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; background: #fafafa; color: #111; line-height: 1.6; }
          .card { max-width: 600px; margin: 0 auto; background: white; border: 2px solid #000; padding: 32px; }
          h1 { margin-top: 0; font-size: 24px; border-bottom: 2px solid #000; padding-bottom: 12px; }
          code { background: #f0f0f0; padding: 3px 6px; font-family: monospace; border: 1px solid #ddd; }
          .btn { display: inline-block; background: #000; color: #fff; padding: 10px 18px; text-decoration: none; font-weight: bold; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>專案管理與 RFI 追蹤系統伺服器已啟動</h1>
          <p>伺服器已成功監聽在 Port <strong>${PORT}</strong>，但尚未偵測到 <code>dist/</code> 建置檔案。</p>
          <p>若您要運行<strong>生產伺服器</strong>，請先於專案目錄執行建置指令：</p>
          <p><code>npm run build</code></p>
          <p>若您要運行<strong>開發環境（支援即時熱更新）</strong>，請執行：</p>
          <p><code>npm run dev</code></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 13px; color: #666;">行程 PID: ${process.pid} | 狀態: 正常運行中</p>
        </div>
      </body>
      </html>
    `);
  });
}

const server = app.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log('  專案管理與 RFI 追蹤系統 - 本機伺服器已啟動');
  console.log('====================================================');
  console.log(`  * 本機網址:   http://localhost:${PORT}`);
  console.log(`  * 網路連線:   http://${HOST}:${PORT}`);
  console.log(`  * 行程 PID:   ${process.pid}`);
  console.log('  * 關閉方式:   執行 關閉伺服器.bat 或按 Ctrl+C');
  console.log('====================================================');
});

// 安全退出處理
function cleanupAndExit() {
  console.log('\n正在關閉本機伺服器...');
  try {
    if (fs.existsSync(PID_FILE)) {
      fs.unlinkSync(PID_FILE);
    }
  } catch (e) {}
  server.close(() => {
    console.log('本機伺服器已安全關閉。');
    process.exit(0);
  });
}

process.on('SIGINT', cleanupAndExit);
process.on('SIGTERM', cleanupAndExit);
