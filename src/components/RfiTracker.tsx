import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  FileQuestion, 
  Layers, 
  ChevronRight
} from 'lucide-react';
import { RFI, User, Card } from '../types';
import { 
  RFI_STATUS_CONFIG, 
  RFI_CATEGORY_CONFIG, 
  ROLE_PERMISSIONS, 
  formatDate 
} from '../utils';

interface RfiTrackerProps {
  rfis: RFI[];
  users: User[];
  cards: Card[];
  currentUser: User;
  onRfiClick: (rfi: RFI) => void;
  onNewRfi: () => void;
  onConvertToCard: (rfi: RFI) => void;
}

export const RfiTracker: React.FC<RfiTrackerProps> = ({
  rfis,
  users,
  cards,
  currentUser,
  onRfiClick,
  onNewRfi,
  onConvertToCard,
}) => {
  const permissions = ROLE_PERMISSIONS[currentUser.role];
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'table' | 'grid'>('table');

  // Filtered RFIs
  const filteredRfis = rfis.filter(rfi => {
    if (selectedStatus !== 'all' && rfi.status !== selectedStatus) {
      return false;
    }
    if (selectedCategory !== 'all' && rfi.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = rfi.rfiNumber.toLowerCase().includes(q);
      const matchTitle = rfi.title.toLowerCase().includes(q);
      const matchQuest = rfi.question.toLowerCase().includes(q);
      if (!matchNum && !matchTitle && !matchQuest) return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalRfiCount = rfis.length;
  const answeredOrClosedCount = rfis.filter(r => r.status === 'answered' || r.status === 'closed').length;
  const resolutionRate = totalRfiCount > 0 ? Math.round((answeredOrClosedCount / totalRfiCount) * 100) : 0;
  const underReviewCount = rfis.filter(r => r.status === 'under_review').length;
  const submittedCount = rfis.filter(r => r.status === 'submitted').length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white overflow-y-auto" id="rfi-tracker-view">
      {/* Top Metric Stats Row */}
      <div className="bg-white border-b-2 border-black px-6 py-6 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-black tracking-tight uppercase">
              工程資訊需求單 (RFI) 追蹤與答覆中心
            </h2>
            <p className="text-xs font-serif text-neutral-600 mt-1">
              五階段審核閉環流轉：工程疑義、設計變更、時程與成本影響專案控管
            </p>
          </div>

          <div className="flex items-center gap-2">
            {permissions.canSubmitRfi && (
              <button
                onClick={onNewRfi}
                className="btn-mono-primary"
                id="btn-create-rfi"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>提出 RFI 需求單</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white border-2 border-black">
            <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-widest block mb-1">
              總提出單據 (TOTAL RFIS)
            </span>
            <div className="text-3xl font-serif font-bold text-black">
              {totalRfiCount} <span className="text-xs font-mono font-normal text-neutral-500">ITEMS</span>
            </div>
          </div>

          <div className="p-4 bg-white border-2 border-black">
            <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-widest block mb-1">
              處理審核中 (IN REVIEW)
            </span>
            <div className="text-3xl font-serif font-bold text-black">
              {underReviewCount + submittedCount} <span className="text-xs font-mono font-normal text-neutral-500">ACTIVE</span>
            </div>
          </div>

          <div className="p-4 bg-white border-2 border-black">
            <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-widest block mb-1">
              官方已答覆 (ANSWERED)
            </span>
            <div className="text-3xl font-serif font-bold text-black">
              {rfis.filter(r => r.status === 'answered').length} <span className="text-xs font-mono font-normal text-neutral-500">REPLIED</span>
            </div>
          </div>

          <div className="p-4 bg-black text-white border-2 border-black">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-1">
              解決與結案率 (RESOLUTION)
            </span>
            <div className="text-3xl font-serif font-bold text-white">
              {resolutionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="bg-white border-b-2 border-black px-6 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-black absolute left-3 top-2.5" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋 RFI 編號 (如 RFI-2026-001) 或主旨..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-black text-black placeholder-neutral-500 font-mono focus:outline-none focus:border-2 focus:border-black"
              id="input-rfi-search"
            />
          </div>

          {/* Status and Category dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-black px-2.5 py-1.5 text-black cursor-pointer focus:outline-none"
              id="filter-rfi-status"
            >
              <option value="all">所有狀態 (ALL STATUS)</option>
              <option value="draft">草稿 (Draft)</option>
              <option value="submitted">已提交 (Submitted)</option>
              <option value="under_review">處理中 (Under Review)</option>
              <option value="answered">已答覆 (Answered)</option>
              <option value="closed">已結案 (Closed)</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-black px-2.5 py-1.5 text-black cursor-pointer focus:outline-none"
              id="filter-rfi-category"
            >
              <option value="all">所有提問類別 (ALL CATEGORIES)</option>
              <option value="spec_query">規格疑義</option>
              <option value="design_change">設計變更</option>
              <option value="schedule_impact">時程影響</option>
              <option value="cost_impact">成本影響</option>
            </select>

            {/* Layout view buttons */}
            <div className="flex border border-black bg-white">
              <button
                onClick={() => setViewLayout('table')}
                className={`px-3 py-1 uppercase tracking-wider transition-colors duration-100 ${
                  viewLayout === 'table' ? 'bg-black text-white font-bold' : 'text-black hover:bg-neutral-100'
                }`}
              >
                列表視圖
              </button>
              <button
                onClick={() => setViewLayout('grid')}
                className={`px-3 py-1 border-l border-black uppercase tracking-wider transition-colors duration-100 ${
                  viewLayout === 'grid' ? 'bg-black text-white font-bold' : 'text-black hover:bg-neutral-100'
                }`}
              >
                卡片視圖
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 bg-white bg-texture-grid">
        {filteredRfis.length === 0 ? (
          <div className="bg-white border-2 border-black p-12 text-center text-neutral-500">
            <FileQuestion className="w-12 h-12 text-black mx-auto mb-3" strokeWidth={1} />
            <p className="text-base font-serif font-bold text-black mb-1">查無符合條件的 RFI 需求單</p>
            <p className="text-xs font-serif text-neutral-600">請嘗試變更篩選條件或點擊上方「提出 RFI 需求單」建立新單據。</p>
          </div>
        ) : viewLayout === 'table' ? (
          /* Table View */
          <div className="bg-white border-2 border-black overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-black text-white font-mono uppercase tracking-wider border-b-2 border-black">
                <tr>
                  <th className="py-3 px-4">RFI 編號</th>
                  <th className="py-3 px-4">主旨與說明摘要</th>
                  <th className="py-3 px-4">類別</th>
                  <th className="py-3 px-4">狀態</th>
                  <th className="py-3 px-4">提問人 ➔ 審查人</th>
                  <th className="py-3 px-4">回覆期限</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-serif">
                {filteredRfis.map(rfi => {
                  const statusCfg = RFI_STATUS_CONFIG[rfi.status];
                  const categoryCfg = RFI_CATEGORY_CONFIG[rfi.category];
                  const raisedUser = users.find(u => u.id === rfi.raisedBy);
                  const assignedUser = users.find(u => u.id === rfi.assignedTo);
                  const linkedCard = rfi.linkedCardId ? cards.find(c => c.id === rfi.linkedCardId) : null;

                  return (
                    <tr 
                      key={rfi.id}
                      onClick={() => onRfiClick(rfi)}
                      className="hover:bg-neutral-100 transition-colors duration-100 cursor-pointer group"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-black whitespace-nowrap">
                        {rfi.rfiNumber}
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-bold text-black text-sm group-hover:underline truncate">
                          {rfi.title}
                        </div>
                        <div className="text-neutral-600 truncate mt-0.5 text-xs">
                          {rfi.question}
                        </div>
                        {linkedCard && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-neutral-500">
                            <Layers className="w-3 h-3 text-black" strokeWidth={1.5} />
                            <span>卡片: {linkedCard.title.slice(0, 15)}...</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] font-mono uppercase ${categoryCfg.bg} ${categoryCfg.color}`}>
                          {categoryCfg.label}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                          {statusCfg.label}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img 
                            src={raisedUser?.avatar} 
                            alt={raisedUser?.name} 
                            className="w-5 h-5 border border-black object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="font-mono text-xs">
                            <span className="font-bold text-black">{raisedUser?.name}</span>
                            <span className="text-neutral-500 mx-1">➔</span>
                            <span className="text-neutral-700">{assignedUser?.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-neutral-800 font-mono">
                        {formatDate(rfi.requiredResponseDate)}
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {!rfi.linkedCardId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onConvertToCard(rfi);
                              }}
                              className="px-2 py-1 border border-black bg-white hover:bg-black hover:text-white text-[11px] font-mono uppercase tracking-wider transition-colors duration-100"
                              title="一鍵將此 RFI 轉為看板任務"
                            >
                              轉化卡片
                            </button>
                          )}
                          <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRfis.map(rfi => {
              const statusCfg = RFI_STATUS_CONFIG[rfi.status];
              const categoryCfg = RFI_CATEGORY_CONFIG[rfi.category];

              return (
                <div
                  key={rfi.id}
                  onClick={() => onRfiClick(rfi)}
                  className="bg-white border-2 border-black p-5 hover:bg-neutral-50 transition-colors duration-100 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono font-bold text-black text-xs">
                        {rfi.rfiNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono uppercase ${categoryCfg.bg} ${categoryCfg.color}`}>
                        {categoryCfg.label}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-black text-base mb-2 hover:underline line-clamp-2">
                      {rfi.title}
                    </h4>

                    <p className="font-serif text-xs text-neutral-600 line-clamp-3 mb-4 leading-relaxed">
                      {rfi.question}
                    </p>

                    {rfi.officialAnswer && (
                      <div className="mb-4 p-3 bg-neutral-100 border border-black text-xs font-serif">
                        <span className="font-bold text-black block mb-1 uppercase font-mono tracking-wider">
                          官方正式答覆 (OFFICIAL RESPONSE):
                        </span>
                        <p className="text-black line-clamp-2">{rfi.officialAnswer}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t-2 border-black flex items-center justify-between text-xs font-mono">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                      {statusCfg.label.split(' ')[0]}
                    </span>

                    <div className="text-neutral-600 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-black" strokeWidth={1.5} />
                      <span>限期: {formatDate(rfi.requiredResponseDate)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
