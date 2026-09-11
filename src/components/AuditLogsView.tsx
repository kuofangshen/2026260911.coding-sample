import React, { useState } from 'react';
import { History, Clock } from 'lucide-react';
import { ActivityLog, User } from '../types';
import { formatDateTime } from '../utils';

interface AuditLogsViewProps {
  logs: ActivityLog[];
  users: User[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, users }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filtered = logs.filter(log => {
    if (filterType !== 'all' && log.entityType !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = log.entityTitle.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      if (!matchTitle && !matchAction && !matchDetails) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-white p-6 space-y-6" id="audit-logs-view">
      {/* Header */}
      <div className="bg-white border-2 border-black p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-black" strokeWidth={1.5} />
            <h2 className="text-2xl font-serif font-bold text-black uppercase">
              系統活動歷程與變更稽核日誌 (AUDIT TRAIL)
            </h2>
          </div>
          <p className="text-xs font-mono text-neutral-600 mt-1">
            完整追蹤卡片拖動、RFI 狀態流轉、官方答覆簽發與附件上傳歷史
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋操作者、標題或動作..."
            className="border-2 border-black px-3 py-1.5 bg-white text-black focus:outline-none placeholder:text-neutral-400"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border-2 border-black px-2.5 py-1.5 bg-white font-bold text-black focus:outline-none cursor-pointer"
          >
            <option value="all">所有實體 (ALL)</option>
            <option value="Card">看板卡片 (CARD)</option>
            <option value="RFI">需求單 (RFI)</option>
            <option value="Board">專案看板 (BOARD)</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white border-2 border-black p-6">
        <div className="relative pl-6 border-l-2 border-black space-y-6">
          {filtered.length === 0 ? (
            <div className="text-neutral-400 text-xs font-mono italic py-4">無符合的稽核紀錄。</div>
          ) : (
            filtered.map((log) => {
              const actor = users.find(u => u.id === log.userId);
              return (
                <div key={log.id} className="relative">
                  {/* Timeline Square Node */}
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-black border-2 border-white ring-1 ring-black" />

                  <div className="bg-white border-2 border-black p-4 space-y-2 hover:bg-neutral-50 transition-colors duration-100">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                      <div className="flex items-center gap-2">
                        {actor && (
                          <img
                            src={actor.avatar}
                            alt={actor.name}
                            className="w-5 h-5 border border-black object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span className="font-bold text-black text-xs">
                          {actor?.name || '系統核心'}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          ({actor?.role.toUpperCase()})
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold border border-black bg-black text-white uppercase">
                          {log.action}
                        </span>
                      </div>

                      <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" strokeWidth={1.5} />
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>

                    <div className="text-xs font-mono font-bold text-black">
                      TARGET: <span className="underline">{log.entityTitle}</span>
                    </div>

                    <p className="text-xs font-serif text-neutral-800 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
