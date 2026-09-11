import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  CheckSquare, 
  Paperclip, 
  FileCode, 
  Link2, 
  Trash2,
  Columns,
  LayoutGrid,
  Maximize2
} from 'lucide-react';
import { Board, Card, User, RFI } from '../types';
import { PRIORITY_CONFIG, ROLE_PERMISSIONS } from '../utils';

interface KanbanBoardProps {
  board: Board;
  cards: Card[];
  users: User[];
  rfis: RFI[];
  currentUser: User;
  onCardClick: (card: Card) => void;
  onAddCard: (columnId: string) => void;
  onMoveCard: (cardId: string, targetColumnId: string) => void;
  onAddColumn: (title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onOpenRfi: (rfiId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  cards,
  users,
  rfis,
  currentUser,
  onCardClick,
  onAddCard,
  onMoveCard,
  onAddColumn,
  onDeleteColumn,
  onOpenRfi,
}) => {
  const permissions = ROLE_PERMISSIONS[currentUser.role];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  
  // Layout mode: 'lanes' (full-height divided lanes with vertical dividers) or 'cards' (floating columns)
  const [layoutMode, setLayoutMode] = useState<'lanes' | 'cards'>('lanes');
  const [fillWidth, setFillWidth] = useState<boolean>(true);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizingColId, setResizingColId] = useState<string | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Collect all unique tags from cards in this board
  const allTags = Array.from(new Set(cards.flatMap(c => c.tags || [])));

  // Filter cards
  const filteredCards = cards.filter(card => {
    if (card.boardId !== board.id) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = card.title.toLowerCase().includes(q);
      const matchDesc = card.description.toLowerCase().includes(q);
      const matchTag = card.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    if (selectedPriority !== 'all' && card.priority !== selectedPriority) {
      return false;
    }

    if (selectedAssignee !== 'all' && !card.assignees.includes(selectedAssignee)) {
      return false;
    }

    if (selectedTag !== 'all' && !card.tags.includes(selectedTag)) {
      return false;
    }

    return true;
  });

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    if (!permissions.canMoveCards) return;
    e.dataTransfer.setData('text/plain', cardId);
    setDraggedCardId(cardId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (cardId && permissions.canMoveCards) {
      onMoveCard(cardId, targetColumnId);
    }
    setDraggedCardId(null);
  };

  // Column Resizing logic
  const handleResizeStart = (e: React.MouseEvent, colId: string) => {
    e.preventDefault();
    setResizingColId(colId);
    startXRef.current = e.clientX;
    const colEl = document.getElementById(`column-lane-${colId}`);
    startWidthRef.current = colEl ? colEl.getBoundingClientRect().width : 320;
    setFillWidth(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingColId) return;
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.max(260, Math.min(700, startWidthRef.current + delta));
      setColumnWidths(prev => ({
        ...prev,
        [resizingColId]: newWidth
      }));
    };

    const handleMouseUp = () => {
      if (resizingColId) {
        setResizingColId(null);
      }
    };

    if (resizingColId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColId]);

  const handleCreateColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    onAddColumn(newColumnTitle.trim());
    setNewColumnTitle('');
    setShowAddColumnModal(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white" id="kanban-workspace">
      {/* Top Filter & Action Bar */}
      <div className="bg-white border-b-2 border-black px-6 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-black absolute left-3 top-2.5" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋卡片標題、標籤或說明..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-black text-black placeholder-neutral-500 font-mono focus:outline-none focus:border-2 focus:border-black transition-all"
                id="input-kanban-search"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-neutral-500 hover:text-black font-mono text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: Filters, Layout Switches & Add Column */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-white border border-black text-black px-2.5 py-1.5 focus:outline-none cursor-pointer"
              id="filter-priority"
            >
              <option value="all">所有優先級 (ALL)</option>
              <option value="urgent">緊急 (URGENT)</option>
              <option value="high">高 (HIGH)</option>
              <option value="medium">中 (MEDIUM)</option>
              <option value="low">低 (LOW)</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="bg-white border border-black text-black px-2.5 py-1.5 focus:outline-none cursor-pointer"
              id="filter-assignee"
            >
              <option value="all">所有指派人員 (ASSIGNEES)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role.toUpperCase()})</option>
              ))}
            </select>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-white border border-black text-black px-2.5 py-1.5 focus:outline-none cursor-pointer"
                id="filter-tag"
              >
                <option value="all">所有標籤 (TAGS)</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
            )}

            {/* Layout Mode Switcher */}
            <div className="flex items-center border border-black bg-white">
              <button
                type="button"
                onClick={() => setLayoutMode('lanes')}
                className={`px-3 py-1.5 flex items-center gap-1 font-mono uppercase tracking-wider text-xs transition-colors duration-100 ${
                  layoutMode === 'lanes' 
                    ? 'bg-black text-white' 
                    : 'text-black hover:bg-neutral-100'
                }`}
                title="全高泳道分欄式（含垂直分隔線）"
                id="btn-layout-lanes"
              >
                <Columns className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">全高泳道</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('cards')}
                className={`px-3 py-1.5 flex items-center gap-1 font-mono uppercase tracking-wider text-xs border-l border-black transition-colors duration-100 ${
                  layoutMode === 'cards' 
                    ? 'bg-black text-white' 
                    : 'text-black hover:bg-neutral-100'
                }`}
                title="浮動卡片分欄式"
                id="btn-layout-cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">獨立分欄</span>
              </button>
            </div>

            {/* Fill Width / Equal width toggle */}
            {layoutMode === 'lanes' && (
              <button
                type="button"
                onClick={() => {
                  setFillWidth(!fillWidth);
                  if (!fillWidth) setColumnWidths({});
                }}
                className={`px-3 py-1.5 border border-black font-mono uppercase tracking-wider text-xs flex items-center gap-1 transition-colors duration-100 ${
                  fillWidth 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
                title="自動均分全螢幕寬度"
              >
                <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{fillWidth ? '等寬鋪滿' : '固定寬度'}</span>
              </button>
            )}

            {/* Add Column Button (PM / Admin only) */}
            {permissions.canModifyColumns && (
              <button
                onClick={() => setShowAddColumnModal(true)}
                className="btn-mono-primary"
                id="btn-add-column"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                <span>新增欄位</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Columns Canvas: FULL HEIGHT WITH VERTICAL DIVIDERS */}
      {layoutMode === 'lanes' ? (
        /* ==================== LANES VIEW (Vertical Divider Lines from top to bottom) ==================== */
        <div className="flex-1 overflow-x-auto min-h-0 flex items-stretch bg-white select-none bg-texture-grid">
          <div className="flex items-stretch h-full w-full min-w-max">
            {board.columns.map((column, index) => {
              const columnCards = filteredCards.filter(c => c.columnId === column.id);
              const isDragOver = dragOverColumnId === column.id;
              const customWidth = columnWidths[column.id];

              return (
                <div
                  key={column.id}
                  style={customWidth ? { width: `${customWidth}px`, flexShrink: 0 } : undefined}
                  className={`relative flex flex-col h-full border-r-2 border-black transition-colors duration-100 ${
                    fillWidth ? 'flex-1 min-w-[280px] max-w-xl' : 'w-80 min-w-[320px]'
                  } ${
                    isDragOver 
                      ? 'bg-neutral-100' 
                      : 'bg-white'
                  }`}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  id={`column-lane-${column.id}`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b-2 border-black bg-white flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2.5 h-2.5 bg-black shrink-0" />
                      <h3 className="font-serif font-bold text-black text-sm uppercase tracking-wider truncate">
                        {column.title}
                      </h3>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 border border-black bg-white text-black shrink-0">
                        {columnCards.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {permissions.canCreateCards && (
                        <button
                          onClick={() => onAddCard(column.id)}
                          className="p-1 text-black hover:bg-black hover:text-white border border-transparent hover:border-black transition-colors duration-100"
                          title="在此欄位新增任務卡片"
                        >
                          <Plus className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      )}

                      {permissions.canModifyColumns && board.columns.length > 2 && (
                        <button
                          onClick={() => {
                            if (confirm(`確定要刪除欄位「${column.title}」嗎？卡片將移出。`)) {
                              onDeleteColumn(column.id);
                            }
                          }}
                          className="p-1 text-black hover:bg-black hover:text-white border border-transparent hover:border-black transition-colors duration-100"
                          title="刪除欄位"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cards Scrollable Vertical Area */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-neutral-50/50">
                    {columnCards.length === 0 ? (
                      <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 text-neutral-500 text-xs italic gap-1 p-4 text-center font-serif">
                        <span>暫無任務卡片</span>
                        <span className="text-[11px] font-mono text-neutral-400">可將卡片拖曳至此處放置</span>
                      </div>
                    ) : (
                      columnCards.map((card) => {
                        const priorityConfig = PRIORITY_CONFIG[card.priority];
                        const completedChecklist = card.checklist?.filter(i => i.completed).length || 0;
                        const totalChecklist = card.checklist?.length || 0;
                        const hasHtmlSnippet = Boolean(card.htmlSnippet && card.htmlSnippet.trim());
                        const linkedRfi = rfis.find(r => r.id === card.rfiId);

                        return (
                          <div
                            key={card.id}
                            draggable={permissions.canMoveCards}
                            onDragStart={(e) => handleDragStart(e, card.id)}
                            onClick={() => onCardClick(card)}
                            className={`group bg-white p-3.5 border border-black hover:border-2 transition-all duration-100 cursor-pointer ${
                              permissions.canMoveCards ? 'active:cursor-grabbing' : ''
                            }`}
                            id={`card-${card.id}`}
                          >
                            {/* Priority Pill & Linked RFI */}
                            <div className="flex items-center justify-between gap-1.5 mb-2">
                              <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border ${priorityConfig.bg} ${priorityConfig.color} ${priorityConfig.border}`}>
                                {priorityConfig.label.split(' ')[0]}
                              </span>

                              {linkedRfi && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenRfi(linkedRfi.id);
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-white text-black hover:bg-black hover:text-white border border-black px-1.5 py-0.5 transition-colors duration-100"
                                  title={`關聯 RFI: ${linkedRfi.title}`}
                                >
                                  <Link2 className="w-3 h-3" strokeWidth={1.5} />
                                  {linkedRfi.rfiNumber}
                                </button>
                              )}
                            </div>

                            {/* Title */}
                            <h4 className="font-serif font-bold text-black text-sm leading-snug mb-1.5 group-hover:underline">
                              {card.title}
                            </h4>

                            {/* Description summary */}
                            {card.description && (
                              <p className="font-serif text-xs text-neutral-600 line-clamp-2 mb-2.5 leading-relaxed">
                                {card.description.replace(/[#*`_]/g, '')}
                              </p>
                            )}

                            {/* Tags */}
                            {card.tags && card.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2.5">
                                {card.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-[10px] font-mono border border-neutral-300 text-neutral-800 px-1.5 py-0.5 bg-neutral-100">
                                    #{tag}
                                  </span>
                                ))}
                                {card.tags.length > 3 && (
                                  <span className="text-[10px] font-mono text-neutral-500">+{card.tags.length - 3}</span>
                                )}
                              </div>
                            )}

                            {/* Indicators row */}
                            <div className="flex items-center justify-between pt-2 border-t border-neutral-200 text-xs text-neutral-600 font-mono">
                              <div className="flex items-center gap-2.5">
                                {totalChecklist > 0 && (
                                  <span 
                                    className="flex items-center gap-1 text-[11px]"
                                    title={`檢查清單完成度 ${completedChecklist}/${totalChecklist}`}
                                  >
                                    <CheckSquare className="w-3.5 h-3.5 text-black" strokeWidth={1.5} />
                                    <span>{completedChecklist}/{totalChecklist}</span>
                                  </span>
                                )}

                                {card.attachments && card.attachments.length > 0 && (
                                  <span className="flex items-center gap-1 text-[11px]" title={`${card.attachments.length} 個附件`}>
                                    <Paperclip className="w-3.5 h-3.5 text-black" strokeWidth={1.5} />
                                    <span>{card.attachments.length}</span>
                                  </span>
                                )}

                                {hasHtmlSnippet && (
                                  <span className="flex items-center gap-1 text-[10px] bg-black text-white px-1.5 py-0.5 font-bold uppercase tracking-wider" title="包含即時 HTML 渲染成果">
                                    <FileCode className="w-3 h-3 text-white" strokeWidth={1.5} />
                                    HTML
                                  </span>
                                )}
                              </div>

                              {/* Assignee Avatars */}
                              <div className="flex items-center -space-x-1 overflow-hidden">
                                {card.assignees.map(uid => {
                                  const user = users.find(u => u.id === uid);
                                  if (!user) return null;
                                  return (
                                    <img
                                      key={user.id}
                                      src={user.avatar}
                                      alt={user.name}
                                      title={`${user.name} (${user.role})`}
                                      className="w-5 h-5 border border-black object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Bottom Quick Add Card Button */}
                  {permissions.canCreateCards && (
                    <div className="p-2 border-t-2 border-black bg-white sticky bottom-0 z-10">
                      <button
                        onClick={() => onAddCard(column.id)}
                        className="w-full py-1.5 text-xs text-black hover:bg-black hover:text-white border border-black flex items-center justify-center gap-1 font-mono uppercase tracking-wider font-semibold transition-colors duration-100"
                      >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2} /> 新增任務
                      </button>
                    </div>
                  )}

                  {/* Drag-to-resize handle on right border */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, column.id)}
                    className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-20 hover:bg-black transition-colors"
                    title="拖拽可調整此欄位寬度"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ==================== CARDS VIEW (Classic block columns) ==================== */
        <div className="flex-1 overflow-x-auto p-6 min-h-0 bg-neutral-100 bg-texture-grid">
          <div className="flex items-stretch gap-5 h-full min-w-max pb-2">
            {board.columns.map((column) => {
              const columnCards = filteredCards.filter(c => c.columnId === column.id);
              const isDragOver = dragOverColumnId === column.id;

              return (
                <div
                  key={column.id}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={`w-80 max-w-xs flex flex-col h-full border-2 border-black bg-white transition-all duration-100 ${
                    isDragOver ? 'bg-neutral-200' : 'bg-white'
                  }`}
                  id={`column-${column.id}`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b-2 border-black flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-black" />
                      <h3 className="font-serif font-bold text-black text-sm uppercase tracking-wider">{column.title}</h3>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 border border-black bg-white text-black">
                        {columnCards.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {permissions.canCreateCards && (
                        <button
                          onClick={() => onAddCard(column.id)}
                          className="p-1 text-black hover:bg-black hover:text-white border border-transparent hover:border-black transition-colors duration-100"
                          title="新增任務卡片"
                        >
                          <Plus className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      )}

                      {permissions.canModifyColumns && board.columns.length > 2 && (
                        <button
                          onClick={() => {
                            if (confirm(`確定要刪除欄位「${column.title}」嗎？卡片將移出。`)) {
                              onDeleteColumn(column.id);
                            }
                          }}
                          className="p-1 text-black hover:bg-black hover:text-white border border-transparent hover:border-black transition-colors duration-100"
                          title="刪除欄位"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cards Scrollable Area */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[120px] bg-neutral-50">
                    {columnCards.length === 0 ? (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-neutral-300 text-neutral-500 text-xs italic font-serif">
                        暫無任務卡片
                      </div>
                    ) : (
                      columnCards.map((card) => {
                        const priorityConfig = PRIORITY_CONFIG[card.priority];
                        const completedChecklist = card.checklist?.filter(i => i.completed).length || 0;
                        const totalChecklist = card.checklist?.length || 0;
                        const hasHtmlSnippet = Boolean(card.htmlSnippet && card.htmlSnippet.trim());
                        const linkedRfi = rfis.find(r => r.id === card.rfiId);

                        return (
                          <div
                            key={card.id}
                            draggable={permissions.canMoveCards}
                            onDragStart={(e) => handleDragStart(e, card.id)}
                            onClick={() => onCardClick(card)}
                            className={`group bg-white p-3.5 border border-black hover:border-2 transition-all duration-100 cursor-pointer ${
                              permissions.canMoveCards ? 'active:cursor-grabbing' : ''
                            }`}
                            id={`card-${card.id}`}
                          >
                            {/* Priority Pill & Linked RFI */}
                            <div className="flex items-center justify-between gap-1.5 mb-2">
                              <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border ${priorityConfig.bg} ${priorityConfig.color} ${priorityConfig.border}`}>
                                {priorityConfig.label.split(' ')[0]}
                              </span>

                              {linkedRfi && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenRfi(linkedRfi.id);
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-white text-black hover:bg-black hover:text-white border border-black px-1.5 py-0.5 transition-colors duration-100"
                                  title={`關聯 RFI: ${linkedRfi.title}`}
                                >
                                  <Link2 className="w-3 h-3" strokeWidth={1.5} />
                                  {linkedRfi.rfiNumber}
                                </button>
                              )}
                            </div>

                            {/* Title */}
                            <h4 className="font-serif font-bold text-black text-sm leading-snug mb-1.5 group-hover:underline">
                              {card.title}
                            </h4>

                            {/* Description summary */}
                            {card.description && (
                              <p className="font-serif text-xs text-neutral-600 line-clamp-2 mb-2.5 leading-relaxed">
                                {card.description.replace(/[#*`_]/g, '')}
                              </p>
                            )}

                            {/* Tags */}
                            {card.tags && card.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2.5">
                                {card.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-[10px] font-mono border border-neutral-300 text-neutral-800 px-1.5 py-0.5 bg-neutral-100">
                                    #{tag}
                                  </span>
                                ))}
                                {card.tags.length > 3 && (
                                  <span className="text-[10px] font-mono text-neutral-500">+{card.tags.length - 3}</span>
                                )}
                              </div>
                            )}

                            {/* Indicators row */}
                            <div className="flex items-center justify-between pt-2 border-t border-neutral-200 text-xs text-neutral-600 font-mono">
                              <div className="flex items-center gap-2.5">
                                {totalChecklist > 0 && (
                                  <span 
                                    className="flex items-center gap-1 text-[11px]"
                                    title={`檢查清單完成度 ${completedChecklist}/${totalChecklist}`}
                                  >
                                    <CheckSquare className="w-3.5 h-3.5 text-black" strokeWidth={1.5} />
                                    <span>{completedChecklist}/{totalChecklist}</span>
                                  </span>
                                )}

                                {card.attachments && card.attachments.length > 0 && (
                                  <span className="flex items-center gap-1 text-[11px]" title={`${card.attachments.length} 個附件`}>
                                    <Paperclip className="w-3.5 h-3.5 text-black" strokeWidth={1.5} />
                                    <span>{card.attachments.length}</span>
                                  </span>
                                )}

                                {hasHtmlSnippet && (
                                  <span className="flex items-center gap-1 text-[10px] bg-black text-white px-1.5 py-0.5 font-bold uppercase tracking-wider" title="包含即時 HTML 渲染成果">
                                    <FileCode className="w-3 h-3 text-white" strokeWidth={1.5} />
                                    HTML
                                  </span>
                                )}
                              </div>

                              {/* Assignee Avatars */}
                              <div className="flex items-center -space-x-1 overflow-hidden">
                                {card.assignees.map(uid => {
                                  const user = users.find(u => u.id === uid);
                                  if (!user) return null;
                                  return (
                                    <img
                                      key={user.id}
                                      src={user.avatar}
                                      alt={user.name}
                                      title={`${user.name} (${user.role})`}
                                      className="w-5 h-5 border border-black object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Bottom Quick Add Card Button */}
                  {permissions.canCreateCards && (
                    <div className="p-2 border-t-2 border-black bg-white">
                      <button
                        onClick={() => onAddCard(column.id)}
                        className="w-full py-1.5 text-xs text-black hover:bg-black hover:text-white border border-black flex items-center justify-center gap-1 font-mono uppercase tracking-wider font-semibold transition-colors duration-100"
                      >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2} /> 新增任務
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Column Modal */}
      {showAddColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white border-4 border-black p-6 w-full max-w-sm">
            <h3 className="text-base font-serif font-bold text-black uppercase tracking-wider mb-4 pb-2 border-b-2 border-black">
              新增工作流欄位 (NEW COLUMN)
            </h3>
            <form onSubmit={handleCreateColumnSubmit} className="space-y-4 font-mono">
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-600 mb-1 font-semibold">
                  欄位名稱 (Title)
                </label>
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="例如：Testing 驗證測試"
                  className="w-full text-xs border-2 border-black px-3 py-2 text-black focus:outline-none focus:bg-neutral-50"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black">
                <button
                  type="button"
                  onClick={() => setShowAddColumnModal(false)}
                  className="btn-mono-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn-mono-primary"
                >
                  確認建立
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
