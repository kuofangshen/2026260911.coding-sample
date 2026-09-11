import React, { useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  HardDrive,
  FileText
} from 'lucide-react';
import { Board, Card, RFI, ActivityLog, AppNotification } from '../types';

interface LocalDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Board[];
  cards: Card[];
  rfis: RFI[];
  activityLogs: ActivityLog[];
  notifications: AppNotification[];
  onImportData: (data: {
    boards?: Board[];
    cards?: Card[];
    rfis?: RFI[];
    activityLogs?: ActivityLog[];
    notifications?: AppNotification[];
  }) => void;
  onResetData: () => void;
}

export const LocalDataModal: React.FC<LocalDataModalProps> = ({
  isOpen,
  onClose,
  boards,
  cards,
  rfis,
  activityLogs,
  notifications,
  onImportData,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 匯出 JSON 備份檔
  const handleExport = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      boards,
      cards,
      rfis,
      activityLogs,
      notifications,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `kanban-rfi-backup-${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 處理匯入檔案
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (confirm('確定要匯入此備份資料嗎？這將會更新目前的看板、任務與 RFI 單據。')) {
          onImportData(parsed);
          alert('備份資料匯入成功！');
          onClose();
        }
      } catch (err) {
        alert('匯入失敗：請確認檔案為合法的 JSON 格式。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 重設為預設範例資料
  const handleReset = () => {
    if (confirm('警告：確定要將所有資料還原為初始範例資料嗎？此操作將會清除您目前的所有修改！')) {
      onResetData();
      alert('已成功還原為初始預設資料。');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white border-2 border-black w-full max-w-lg overflow-hidden shadow-none animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="bg-black text-white px-5 py-4 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-white" strokeWidth={1.5} />
            <h2 className="font-serif font-bold text-lg tracking-tight">本機資料持久化與備份管理</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-neutral-800 p-1 border border-white"
            title="關閉視窗"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className="border border-black p-4 bg-neutral-50 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-black shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="text-xs font-mono space-y-1">
              <div className="font-bold text-black uppercase tracking-wider">本機電腦版狀態：LocalStorage 自動同步中</div>
              <p className="text-neutral-600 font-sans text-xs">
                您在此電腦上的所有任務卡片、RFI 需求單與時程異動，皆會自動保存在本地瀏覽器存儲區中，重新整理或重啟伺服器不會遺失。
              </p>
            </div>
          </div>

          {/* Current Stats */}
          <div className="grid grid-cols-3 gap-3 text-center font-mono">
            <div className="border border-black p-3 bg-white">
              <div className="text-2xl font-bold text-black">{boards.length}</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">專案看板</div>
            </div>
            <div className="border border-black p-3 bg-white">
              <div className="text-2xl font-bold text-black">{cards.length}</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">任務卡片</div>
            </div>
            <div className="border border-black p-3 bg-white">
              <div className="text-2xl font-bold text-black">{rfis.length}</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">RFI 單據</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 font-mono text-xs">
            {/* 匯出備份 */}
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between px-4 py-3 bg-black text-white hover:bg-neutral-800 border border-black transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-white" strokeWidth={1.5} />
                <div className="text-left">
                  <div className="font-bold uppercase tracking-wider">匯出 JSON 備份檔</div>
                  <div className="text-[10px] text-neutral-300 font-sans">將目前所有看板、任務、RFI 與日誌匯出儲存</div>
                </div>
              </div>
              <span className="text-[10px] border border-white px-2 py-0.5 uppercase">EXPORT</span>
            </button>

            {/* 匯入備份 */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between px-4 py-3 bg-white text-black hover:bg-neutral-100 border border-black transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Upload className="w-4 h-4 text-black" strokeWidth={1.5} />
                <div className="text-left">
                  <div className="font-bold uppercase tracking-wider">匯入 JSON 備份檔</div>
                  <div className="text-[10px] text-neutral-500 font-sans">載入先前儲存的備份檔以還原或轉移資料</div>
                </div>
              </div>
              <span className="text-[10px] border border-black px-2 py-0.5 uppercase">IMPORT</span>
            </button>

            {/* 還原預設 */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-between px-4 py-3 bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-neutral-700" strokeWidth={1.5} />
                <div className="text-left">
                  <div className="font-bold uppercase tracking-wider">還原為系統初始範例</div>
                  <div className="text-[10px] text-neutral-500 font-sans">清除本地修改並重設為出廠範例資料</div>
                </div>
              </div>
              <span className="text-[10px] border border-neutral-400 px-2 py-0.5 uppercase">RESET</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-100 border-t border-black flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-black text-white text-xs font-mono font-bold uppercase hover:bg-neutral-800 border border-black"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
