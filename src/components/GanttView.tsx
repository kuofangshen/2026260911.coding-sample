import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Printer, 
  Maximize2, 
  Minimize2, 
  Clock, 
  AlertTriangle, 
  Layers, 
  Calendar, 
  Sparkles
} from 'lucide-react';
import { Card, Board, User, Priority } from '../types';

interface GanttViewProps {
  board: Board;
  cards: Card[];
  users: User[];
  onCardClick: (card: Card) => void;
  onAddCard: (columnId?: string) => void;
}

interface GanttTaskItem {
  id: string;
  phaseNumber: number;
  phaseName: string;
  taskName: string;
  durationDays: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  priority: Priority;
  isUrgent: boolean;
  completed: boolean;
  progressPercent: number;
  originalCard?: Card;
}

export const GanttView: React.FC<GanttViewProps> = ({
  board,
  cards,
  users,
  onCardClick,
  onAddCard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [urgentOnly, setUrgentOnly] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [timeframePreset, setTimeframePreset] = useState<'sample' | 'live'>('sample');

  const timelineConfig = useMemo(() => {
    if (timeframePreset === 'sample') {
      return {
        year: 2023,
        months: [
          { name: '2月 (FEB)', monthIndex: 1, year: 2023, weeks: ['W1', 'W2', 'W3', 'W4'] },
          { name: '3月 (MAR)', monthIndex: 2, year: 2023, weeks: ['W1', 'W2', 'W3', 'W4'] },
          { name: '4月 (APR)', monthIndex: 3, year: 2023, weeks: ['W1', 'W2', 'W3', 'W4'] }
        ],
        baseDate: new Date(2023, 1, 1),
        endDate: new Date(2023, 3, 30),
        totalWeeks: 12
      };
    } else {
      return {
        year: 2026,
        months: [
          { name: '8月 (AUG)', monthIndex: 7, year: 2026, weeks: ['W1', 'W2', 'W3', 'W4'] },
          { name: '9月 (SEP)', monthIndex: 8, year: 2026, weeks: ['W1', 'W2', 'W3', 'W4'] },
          { name: '10月 (OCT)', monthIndex: 9, year: 2026, weeks: ['W1', 'W2', 'W3', 'W4'] }
        ],
        baseDate: new Date(2026, 7, 1),
        endDate: new Date(2026, 9, 31),
        totalWeeks: 12
      };
    }
  }, [timeframePreset]);

  // Default tasks adhering faithfully to the reference diagram
  const sampleTasks: GanttTaskItem[] = useMemo(() => [
    // Phase 1: 系統初始化
    {
      id: 'task-1-1',
      phaseNumber: 1,
      phaseName: '系統初始化',
      taskName: '伺服器購買與雲端基礎建設',
      durationDays: 2,
      startDate: '2023-02-01',
      endDate: '2023-02-02',
      priority: 'high',
      isUrgent: false,
      completed: true,
      progressPercent: 100
    },
    {
      id: 'task-1-2',
      phaseNumber: 1,
      phaseName: '系統初始化',
      taskName: '系統環境部署與 CI/CD 流程設定',
      durationDays: 5,
      startDate: '2023-02-03',
      endDate: '2023-02-07',
      priority: 'high',
      isUrgent: false,
      completed: true,
      progressPercent: 100
    },

    // Phase 2: 基礎管理
    {
      id: 'task-2-1',
      phaseNumber: 2,
      phaseName: '基礎管理',
      taskName: '使用者管理模組與 RBAC 帳號整合',
      durationDays: 4,
      startDate: '2023-02-08',
      endDate: '2023-02-11',
      priority: 'medium',
      isUrgent: false,
      completed: true,
      progressPercent: 100
    },
    {
      id: 'task-2-2',
      phaseNumber: 2,
      phaseName: '基礎管理',
      taskName: '權限管理與角色矩陣維護',
      durationDays: 5,
      startDate: '2023-02-12',
      endDate: '2023-02-16',
      priority: 'medium',
      isUrgent: false,
      completed: true,
      progressPercent: 100
    },

    // Phase 3: 工單管理
    {
      id: 'task-3-1',
      phaseNumber: 3,
      phaseName: '工單管理',
      taskName: '工單新建，清單查詢與多維篩選',
      durationDays: 8,
      startDate: '2023-02-17',
      endDate: '2023-02-24',
      priority: 'high',
      isUrgent: false,
      completed: true,
      progressPercent: 100
    },
    {
      id: 'task-3-2',
      phaseNumber: 3,
      phaseName: '工單管理',
      taskName: '工單處理，升級處理與審核簽核',
      durationDays: 5,
      startDate: '2023-02-25',
      endDate: '2023-03-01',
      priority: 'medium',
      isUrgent: false,
      completed: false,
      progressPercent: 60
    },
    {
      id: 'task-3-3',
      phaseNumber: 3,
      phaseName: '工單管理',
      taskName: '工單結束並回饋客戶 (CSAT)',
      durationDays: 2,
      startDate: '2023-03-02',
      endDate: '2023-03-03',
      priority: 'low',
      isUrgent: false,
      completed: false,
      progressPercent: 0
    },

    // Phase 4: 客戶管理
    {
      id: 'task-4-1',
      phaseNumber: 4,
      phaseName: '客戶管理',
      taskName: '客戶新建，清單查詢與歷史追蹤',
      durationDays: 15,
      startDate: '2023-03-04',
      endDate: '2023-03-18',
      priority: 'urgent',
      isUrgent: true,
      completed: false,
      progressPercent: 40
    },
    {
      id: 'task-4-2',
      phaseNumber: 4,
      phaseName: '客戶管理',
      taskName: '客戶聯絡人管理與通信記錄',
      durationDays: 6,
      startDate: '2023-03-19',
      endDate: '2023-03-24',
      priority: 'medium',
      isUrgent: false,
      completed: false,
      progressPercent: 20
    },
    {
      id: 'task-4-3',
      phaseNumber: 4,
      phaseName: '客戶管理',
      taskName: '客戶合約管理與 SLA 服務等級協議驗證',
      durationDays: 20,
      startDate: '2023-03-25',
      endDate: '2023-04-13',
      priority: 'urgent',
      isUrgent: true,
      completed: false,
      progressPercent: 15
    },

    // Phase 5: 監控報表
    {
      id: 'task-5-1',
      phaseNumber: 5,
      phaseName: '監控報表',
      taskName: '員工工作量分析與工時燃盡統計',
      durationDays: 5,
      startDate: '2023-04-14',
      endDate: '2023-04-18',
      priority: 'medium',
      isUrgent: false,
      completed: false,
      progressPercent: 0
    },
    {
      id: 'task-5-2',
      phaseNumber: 5,
      phaseName: '監控報表',
      taskName: '客戶畫像與服務趨勢視覺化儀表板',
      durationDays: 5,
      startDate: '2023-04-19',
      endDate: '2023-04-23',
      priority: 'low',
      isUrgent: false,
      completed: false,
      progressPercent: 0
    }
  ], []);

  // Map live cards to GanttTaskItems
  const liveTasks: GanttTaskItem[] = useMemo(() => {
    return cards.map((card, idx) => {
      let sDate = card.startDate || '2026-08-10';
      let eDate = card.dueDate || '2026-08-25';
      
      const s = new Date(sDate);
      const e = new Date(eDate);
      const diffDays = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24)));

      const pNumber = card.phaseNumber || ((idx % 4) + 1);
      const phaseNames = ['需求與架構設計', '核心開發與組件', 'API 整合與測試', '交付與驗收'];
      const pName = card.phase || phaseNames[(pNumber - 1) % phaseNames.length];

      return {
        id: card.id,
        phaseNumber: pNumber,
        phaseName: pName,
        taskName: card.title,
        durationDays: diffDays,
        startDate: sDate,
        endDate: eDate,
        priority: card.priority,
        isUrgent: card.priority === 'urgent',
        completed: card.columnId === 'col-4',
        progressPercent: card.columnId === 'col-4' ? 100 : (card.columnId === 'col-2' ? 50 : 10),
        originalCard: card
      };
    });
  }, [cards]);

  const activeTaskList = timeframePreset === 'sample' ? sampleTasks : liveTasks;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return activeTaskList.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!t.taskName.toLowerCase().includes(q) && !t.phaseName.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedPhase !== 'all' && t.phaseName !== selectedPhase) {
        return false;
      }
      if (urgentOnly && !t.isUrgent) {
        return false;
      }
      return true;
    });
  }, [activeTaskList, searchQuery, selectedPhase, urgentOnly]);

  // Group tasks by Phase
  const groupedPhases = useMemo(() => {
    const map = new Map<number, { phaseNumber: number; phaseName: string; tasks: GanttTaskItem[] }>();
    filteredTasks.forEach(task => {
      if (!map.has(task.phaseNumber)) {
        map.set(task.phaseNumber, {
          phaseNumber: task.phaseNumber,
          phaseName: task.phaseName,
          tasks: []
        });
      }
      map.get(task.phaseNumber)!.tasks.push(task);
    });
    return Array.from(map.values()).sort((a, b) => a.phaseNumber - b.phaseNumber);
  }, [filteredTasks]);

  // Calculate Gantt bar position in the 12-week grid
  const calculateBarPosition = (startDateStr: string, endDateStr: string) => {
    const baseDate = timelineConfig.baseDate;
    const endWindow = timelineConfig.endDate;
    const totalWindowMs = endWindow.getTime() - baseDate.getTime();

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    let offsetMs = start.getTime() - baseDate.getTime();
    let durationMs = end.getTime() - start.getTime() + (1000 * 3600 * 24);

    let leftPct = (offsetMs / totalWindowMs) * 100;
    let widthPct = (durationMs / totalWindowMs) * 100;

    leftPct = Math.max(0, Math.min(100, leftPct));
    widthPct = Math.max(2.5, Math.min(100 - leftPct, widthPct));

    return { leftPct, widthPct };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className={`flex-1 flex flex-col min-h-0 bg-white overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''
      }`}
      id="gantt-chart-container"
    >
      {/* Top Action & Filter Toolbar */}
      <div className="bg-white border-b-2 border-black px-6 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Search & Mode Selectors */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-black absolute left-3 top-2.5" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋任務、子任務或階段..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-black text-black placeholder-neutral-500 font-mono focus:outline-none focus:border-2 focus:border-black transition-all"
                id="input-gantt-search"
              />
            </div>

            {/* Dataset switch */}
            <div className="flex items-center border border-black bg-white text-xs font-mono">
              <button
                type="button"
                onClick={() => setTimeframePreset('sample')}
                className={`px-3 py-1.5 flex items-center gap-1.5 uppercase tracking-wider transition-colors duration-100 ${
                  timeframePreset === 'sample' 
                    ? 'bg-black text-white font-bold' 
                    : 'text-black hover:bg-neutral-100'
                }`}
                title="規格書範本（資訊系統專案管理計畫）"
                id="btn-gantt-sample"
              >
                <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>專案計畫甘特圖範本</span>
              </button>
              <button
                type="button"
                onClick={() => setTimeframePreset('live')}
                className={`px-3 py-1.5 flex items-center gap-1.5 border-l border-black uppercase tracking-wider transition-colors duration-100 ${
                  timeframePreset === 'live' 
                    ? 'bg-black text-white font-bold' 
                    : 'text-black hover:bg-neutral-100'
                }`}
                title="當前看板任務同步排程"
                id="btn-gantt-live"
              >
                <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>當前看板任務 ({cards.length})</span>
              </button>
            </div>
          </div>

          {/* Right: Filters & Controls */}
          <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
            {/* Phase filter */}
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="bg-white border border-black text-black px-2.5 py-1.5 focus:outline-none cursor-pointer"
              id="filter-gantt-phase"
            >
              <option value="all">所有階段 (ALL PHASES)</option>
              <option value="系統初始化">1. 系統初始化</option>
              <option value="基礎管理">2. 基礎管理</option>
              <option value="工單管理">3. 工單管理</option>
              <option value="客戶管理">4. 客戶管理</option>
              <option value="監控報表">5. 監控報表</option>
            </select>

            {/* Urgent only button */}
            <button
              type="button"
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`px-3 py-1.5 border border-black uppercase tracking-wider flex items-center gap-1.5 transition-colors duration-100 ${
                urgentOnly 
                  ? 'bg-black text-white font-bold' 
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
              id="btn-urgent-filter"
            >
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>僅看緊急項目</span>
            </button>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 text-black bg-white border border-black hover:bg-black hover:text-white transition-colors duration-100"
              title="列印 / 匯出 PDF"
            >
              <Printer className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-black bg-white border border-black hover:bg-black hover:text-white transition-colors duration-100"
              title={isFullscreen ? "退出全螢幕" : "全螢幕檢視"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" strokeWidth={1.5} /> : <Maximize2 className="w-4 h-4" strokeWidth={1.5} />}
            </button>

            {/* Add Task button */}
            <button
              type="button"
              onClick={() => onAddCard()}
              className="btn-mono-primary"
              id="btn-gantt-add-task"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              <span>新增排程任務</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Gantt Canvas */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 min-h-0 bg-white bg-texture-grid">
        <div className="max-w-[1500px] mx-auto bg-white border-2 border-black overflow-hidden">
          
          {/* Main Title Header: Pure Stark Black Bar */}
          <div className="bg-black text-white py-3.5 px-6 text-center font-serif font-bold text-base sm:text-lg tracking-widest uppercase border-b-2 border-black select-none">
            資訊系統專案管理計畫 — 甘特圖排程表 (PROJECT GANTT SCHEDULE)
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-black table-fixed min-w-[1000px]">
              {/* Header Columns */}
              <thead>
                <tr className="bg-neutral-100 text-black font-mono font-bold border-b-2 border-black uppercase tracking-wider">
                  {/* Left Metadata Columns */}
                  <th className="w-12 py-3 px-2 text-center border-r-2 border-black">NO.</th>
                  <th className="w-28 py-3 px-3 text-center border-r-2 border-black">階段任務</th>
                  <th className="w-52 py-3 px-3 text-center border-r-2 border-black">工作子項目</th>
                  <th className="w-16 py-3 px-2 text-center border-r-2 border-black">工時(天)</th>
                  <th className="w-24 py-3 px-2 text-center border-r-2 border-black">開始日</th>
                  <th className="w-24 py-3 px-2 text-center border-r-2 border-black">結束日</th>

                  {/* Timeline Month Headers */}
                  {timelineConfig.months.map((m) => (
                    <th 
                      key={m.name} 
                      colSpan={4} 
                      className="py-2 px-2 text-center border-r-2 border-black bg-black text-white font-mono font-bold text-xs uppercase tracking-wider"
                    >
                      {m.name}
                    </th>
                  ))}
                </tr>

                {/* Sub-header: Weeks Row */}
                <tr className="bg-neutral-50 text-neutral-800 font-mono text-[10px] border-b-2 border-black font-semibold">
                  <th colSpan={6} className="border-r-2 border-black py-1 bg-white"></th>
                  {timelineConfig.months.map((m) => 
                    m.weeks.map((w, wIdx) => (
                      <th 
                        key={`${m.name}-${w}`} 
                        className={`w-12 py-1.5 px-1 text-center font-mono ${
                          wIdx === 3 ? 'border-r-2 border-black' : 'border-r border-neutral-300'
                        }`}
                      >
                        {w}
                      </th>
                    ))
                  )}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-black font-mono">
                {groupedPhases.length === 0 ? (
                  <tr>
                    <td colSpan={18} className="py-16 text-center text-neutral-500 text-xs italic font-serif">
                      查無符合篩選條件的甘特任務
                    </td>
                  </tr>
                ) : (
                  groupedPhases.map((phaseGroup) => {
                    const taskCount = phaseGroup.tasks.length;

                    return phaseGroup.tasks.map((task, tIndex) => {
                      const isFirstInPhase = tIndex === 0;
                      const { leftPct, widthPct } = calculateBarPosition(task.startDate, task.endDate);

                      return (
                        <tr 
                          key={task.id} 
                          onClick={() => task.originalCard && onCardClick(task.originalCard)}
                          className={`hover:bg-neutral-100 transition-colors duration-100 ${task.originalCard ? 'cursor-pointer' : ''}`}
                        >
                          {/* NO. */}
                          {isFirstInPhase && (
                            <td 
                              rowSpan={taskCount} 
                              className="py-3 px-2 text-center font-mono font-bold text-black border-r-2 border-black bg-neutral-50 align-middle text-sm"
                            >
                              {phaseGroup.phaseNumber}
                            </td>
                          )}

                          {/* 階段任務 Phase Name */}
                          {isFirstInPhase && (
                            <td 
                              rowSpan={taskCount} 
                              className="py-3 px-3 text-center font-serif font-bold text-black border-r-2 border-black bg-neutral-50 align-middle text-xs"
                            >
                              {phaseGroup.phaseName}
                            </td>
                          )}

                          {/* 子任務 Subtask */}
                          <td className="py-2.5 px-3 text-left font-serif font-medium text-black border-r-2 border-black truncate max-w-[200px]" title={task.taskName}>
                            <div className="flex items-center gap-1.5">
                              {task.isUrgent && (
                                <span className="px-1 py-0.2 bg-black text-white text-[9px] font-mono font-bold uppercase shrink-0">
                                  URGENT
                                </span>
                              )}
                              <span className="truncate">{task.taskName}</span>
                            </div>
                          </td>

                          {/* 工時 (天) */}
                          <td className="py-2.5 px-2 text-center font-mono text-black font-semibold border-r-2 border-black">
                            {task.durationDays}
                          </td>

                          {/* 開始時間 */}
                          <td className="py-2.5 px-2 text-center font-mono text-neutral-600 border-r-2 border-black text-[11px]">
                            {task.startDate}
                          </td>

                          {/* 結束時間 */}
                          <td className="py-2.5 px-2 text-center font-mono text-neutral-600 border-r-2 border-black text-[11px]">
                            {task.endDate}
                          </td>

                          {/* Timeline Grid (12 weeks across) with overlaid Gantt Bar */}
                          <td colSpan={12} className="p-0 border-r-2 border-black relative bg-white h-11">
                            {/* Background Grid Lines for the 12 weeks */}
                            <div className="absolute inset-0 flex pointer-events-none">
                              {Array.from({ length: 12 }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`flex-1 ${
                                    (i + 1) % 4 === 0 ? 'border-r-2 border-black' : 'border-r border-neutral-200'
                                  }`} 
                                />
                              ))}
                            </div>

                            {/* Overlaid Gantt Bar */}
                            <div 
                              className="absolute top-2 bottom-2 z-10 flex items-center justify-center transition-all duration-100 group"
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`
                              }}
                            >
                              <div
                                className={`w-full h-full flex items-center justify-center font-mono font-bold text-[10px] px-1 overflow-hidden transition-all ${
                                  task.isUrgent 
                                    ? 'bg-black text-white border-2 border-white outline outline-2 outline-black' 
                                    : 'bg-black text-white border border-black hover:bg-neutral-800'
                                }`}
                                title={`${task.taskName} (${task.durationDays}天) [${task.startDate} ~ ${task.endDate}]`}
                              >
                                {task.isUrgent ? (
                                  <span className="tracking-widest uppercase font-bold text-[10px]">
                                    ★ 緊急 ({task.durationDays}D)
                                  </span>
                                ) : (
                                  <span className="truncate text-[10px] uppercase">
                                    {task.durationDays} DAYS
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Legend */}
          <div className="py-3 px-6 bg-white border-t-2 border-black flex flex-wrap items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-black border border-black inline-block" />
                <span className="uppercase font-semibold">標準排程項目 (STANDARD TASK)</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-black border-2 border-white outline outline-1 outline-black inline-block" />
                <span className="font-bold uppercase">緊急/關鍵路徑 (URGENT / CRITICAL PATH)</span>
              </span>
            </div>

            <div className="font-serif font-bold text-black uppercase tracking-widest">
              MONOCHROME GANTT ARCHITECTURE
            </div>
          </div>
        </div>

        {/* Schedule Metric Summary Cards */}
        <div className="max-w-[1500px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-5 border-2 border-black">
            <div className="flex items-center justify-between text-neutral-600 text-xs font-mono uppercase tracking-wider mb-2">
              <span>任務總數</span>
              <Calendar className="w-4 h-4 text-black" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold text-black font-serif">
              {activeTaskList.length} <span className="text-xs font-mono font-normal text-neutral-500">ITEMS</span>
            </div>
          </div>

          <div className="bg-black text-white p-5 border-2 border-black">
            <div className="flex items-center justify-between text-neutral-300 text-xs font-mono uppercase tracking-wider mb-2">
              <span>緊急項目</span>
              <AlertTriangle className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold text-white font-serif">
              {activeTaskList.filter(t => t.isUrgent).length} <span className="text-xs font-mono font-normal text-neutral-400">URGENT</span>
            </div>
          </div>

          <div className="bg-white p-5 border-2 border-black">
            <div className="flex items-center justify-between text-neutral-600 text-xs font-mono uppercase tracking-wider mb-2">
              <span>總工時估算</span>
              <Clock className="w-4 h-4 text-black" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold text-black font-serif">
              {activeTaskList.reduce((acc, t) => acc + t.durationDays, 0)} <span className="text-xs font-mono font-normal text-neutral-500">DAYS</span>
            </div>
          </div>

          <div className="bg-white p-5 border-2 border-black">
            <div className="flex items-center justify-between text-neutral-600 text-xs font-mono uppercase tracking-wider mb-2">
              <span>主要階段</span>
              <Layers className="w-4 h-4 text-black" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold text-black font-serif">
              {groupedPhases.length} <span className="text-xs font-mono font-normal text-neutral-500">PHASES</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
