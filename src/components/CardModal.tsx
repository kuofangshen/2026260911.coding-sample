import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckSquare, 
  Paperclip, 
  Link2, 
  FileCode, 
  UploadCloud, 
  Trash2, 
  Plus, 
  ExternalLink, 
  Eye, 
  Edit3
} from 'lucide-react';
import { Card, User, RFI, Attachment, Priority, ChecklistItem } from '../types';
import { 
  ROLE_PERMISSIONS, 
  formatFileSize, 
  generateId 
} from '../utils';

interface CardModalProps {
  card: Card | null;
  boardTitle: string;
  users: User[];
  rfis: RFI[];
  currentUser: User;
  onClose: () => void;
  onSave: (updatedCard: Card) => void;
  onDelete: (cardId: string) => void;
  onCreateRfiFromCard: (card: Card) => void;
  onOpenHtmlStudio: (initialCode: string) => void;
  onPreviewAttachment: (attachment: Attachment) => void;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  boardTitle,
  users,
  rfis,
  currentUser,
  onClose,
  onSave,
  onDelete,
  onCreateRfiFromCard,
  onOpenHtmlStudio,
  onPreviewAttachment,
}) => {
  if (!card) return null;

  const permissions = ROLE_PERMISSIONS[currentUser.role];
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [priority, setPriority] = useState<Priority>(card.priority);
  const [startDate, setStartDate] = useState(card.startDate || card.createdAt?.slice(0, 10) || '2026-09-01');
  const [dueDate, setDueDate] = useState(card.dueDate);
  const [phase, setPhase] = useState(card.phase || '工單管理');
  const [tags, setTags] = useState<string[]>(card.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [assignees, setAssignees] = useState<string[]>(card.assignees || []);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card.checklist || []);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [linkedRfiId, setLinkedRfiId] = useState<string>(card.rfiId || '');
  const [htmlSnippet, setHtmlSnippet] = useState<string>(card.htmlSnippet || '');
  const [attachments, setAttachments] = useState<Attachment[]>(card.attachments || []);
  
  const [activeTab, setActiveTab] = useState<'details' | 'checklist' | 'attachments' | 'htmlCode'>('details');
  const [descMode, setDescMode] = useState<'write' | 'preview'>('write');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [pasteAlert, setPasteAlert] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Clipboard Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Url = event.target?.result as string;
              const newAttachment: Attachment = {
                id: generateId('att'),
                entityType: 'Card',
                entityId: card.id,
                fileName: `PASTE_${new Date().getTime()}.png`,
                fileUrl: base64Url,
                fileSize: file.size,
                fileType: file.type || 'image/png',
                uploadedBy: currentUser.id,
                uploadedAt: new Date().toISOString(),
                previewType: 'image'
              };

              setAttachments(prev => [...prev, newAttachment]);
              setDescription(prev => prev + `\n\n![${newAttachment.fileName}](${newAttachment.fileUrl})\n`);
              setPasteAlert('已自動嵌入剪貼簿截圖');
              setTimeout(() => setPasteAlert(null), 3000);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [card.id, currentUser.id]);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const MAX_SIZE = 25 * 1024 * 1024;

    Array.from(fileList).forEach((file: File) => {
      if (file.size > MAX_SIZE) {
        alert(`檔案「${file.name}」超過 25MB 限制，無法上傳。`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileDataUrl = e.target?.result as string;
        const isImg = file.type.startsWith('image/');
        const isPdf = file.type.includes('pdf');
        
        const newAttachment: Attachment = {
          id: generateId('att'),
          entityType: 'Card',
          entityId: card.id,
          fileName: file.name,
          fileUrl: fileDataUrl,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
          uploadedBy: currentUser.id,
          uploadedAt: new Date().toISOString(),
          previewType: isImg ? 'image' : isPdf ? 'pdf' : 'doc'
        };

        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = () => {
    const updated: Card = {
      ...card,
      title,
      description,
      priority,
      startDate,
      dueDate,
      phase,
      tags,
      assignees,
      checklist,
      rfiId: linkedRfiId || undefined,
      htmlSnippet,
      attachments,
      updatedAt: new Date().toISOString()
    };
    onSave(updated);
    onClose();
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklist(prev => [
      ...prev,
      { id: generateId('chk'), text: newChecklistText.trim(), completed: false }
    ]);
    setNewChecklistText('');
  };

  const toggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const removeChecklist = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(newTagInput.trim())) {
        setTags([...tags, newTagInput.trim()]);
      }
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const toggleAssignee = (userId: string) => {
    if (assignees.includes(userId)) {
      setAssignees(assignees.filter(id => id !== userId));
    } else {
      setAssignees([...assignees, userId]);
    }
  };

  const linkedRfi = rfis.find(r => r.id === linkedRfiId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div 
        className="bg-white border-4 border-black w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
        id="card-detail-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
              {boardTitle}
            </span>
            <span className="text-neutral-400 font-mono">/</span>
            <span className="text-xs text-neutral-600 font-mono">TASK_ID: {card.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {pasteAlert && (
              <span className="text-xs font-mono font-bold text-black border border-black px-2.5 py-1">
                {pasteAlert}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-black hover:bg-black hover:text-white transition-colors duration-100"
              id="btn-close-card-modal"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b-2 border-black px-6 bg-white gap-4 text-xs font-mono shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 uppercase tracking-wider transition-colors duration-100 flex items-center gap-1.5 ${
              activeTab === 'details' ? 'border-black text-black font-bold' : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} /> 基本詳情 (DETAILS)
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 border-b-2 uppercase tracking-wider transition-colors duration-100 flex items-center gap-1.5 ${
              activeTab === 'checklist' ? 'border-black text-black font-bold' : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" strokeWidth={1.5} /> 檢查清單 ({completedCount}/{checklist.length})
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`py-3 border-b-2 uppercase tracking-wider transition-colors duration-100 flex items-center gap-1.5 ${
              activeTab === 'attachments' ? 'border-black text-black font-bold' : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" strokeWidth={1.5} /> 附件清單 ({attachments.length})
          </button>
          <button
            onClick={() => setActiveTab('htmlCode')}
            className={`py-3 border-b-2 uppercase tracking-wider transition-colors duration-100 flex items-center gap-1.5 ${
              activeTab === 'htmlCode' ? 'border-black text-black font-bold' : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" strokeWidth={1.5} /> HTML 交付成果預覽
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Main Details */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Title & Rich Description */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <label className="block text-xs font-mono font-bold text-black uppercase tracking-wider mb-1.5">
                    卡片標題 (TASK TITLE)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-lg font-serif font-bold text-black border-2 border-black px-4 py-2.5 focus:outline-none focus:bg-neutral-50"
                    placeholder="輸入任務卡片標題..."
                    id="input-card-title"
                  />
                </div>

                {/* Description Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-black uppercase tracking-wider">
                      詳細說明 (DESCRIPTION & MARKDOWN)
                    </label>
                    <div className="flex items-center border border-black font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setDescMode('write')}
                        className={`px-2.5 py-1 uppercase transition-colors duration-100 ${descMode === 'write' ? 'bg-black text-white font-bold' : 'text-black hover:bg-neutral-100'}`}
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => setDescMode('preview')}
                        className={`px-2.5 py-1 uppercase border-l border-black transition-colors duration-100 ${descMode === 'preview' ? 'bg-black text-white font-bold' : 'text-black hover:bg-neutral-100'}`}
                      >
                        預覽
                      </button>
                    </div>
                  </div>

                  {descMode === 'write' ? (
                    <div className="relative">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={7}
                        className="w-full text-xs font-serif text-black border-2 border-black p-3.5 focus:outline-none leading-relaxed"
                        placeholder="請詳細描述任務內容... 可在此處直接按 Ctrl+V (Cmd+V) 貼上剪貼簿圖片"
                        id="textarea-card-description"
                      />
                      <div className="text-[10px] font-mono text-neutral-500 mt-1 flex items-center justify-between">
                        <span>提示: 在此按下 [Ctrl+V] 可直接將截圖上傳並嵌入。</span>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[160px] p-4 bg-neutral-50 border-2 border-black text-xs font-serif leading-relaxed text-black whitespace-pre-wrap">
                      {description || <span className="text-neutral-400 italic">尚無詳細說明</span>}
                    </div>
                  )}
                </div>

                {/* Progress Mini Bar */}
                {checklist.length > 0 && (
                  <div className="p-4 bg-white border-2 border-black">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-black uppercase mb-2">
                      <span className="flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-black" strokeWidth={1.5} />
                        子任務進度 (CHECKLIST PROGRESS)
                      </span>
                      <span>{completedCount} / {checklist.length} ({progressPercent}%)</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-3 border border-black overflow-hidden">
                      <div 
                        className="bg-black h-full transition-all duration-100"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right 1 Col: Metadata & Controls */}
              <div className="space-y-5 bg-white p-4 border-2 border-black text-xs font-mono">
                {/* Priority */}
                <div>
                  <label className="block font-bold text-black mb-1.5 uppercase tracking-wider">
                    優先級 (PRIORITY)
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-white border border-black px-3 py-2 text-black cursor-pointer focus:outline-none"
                    id="select-card-priority"
                  >
                    <option value="urgent">[URGENT] 緊急項目 (關鍵路徑)</option>
                    <option value="high">[HIGH] 高優先級</option>
                    <option value="medium">[MEDIUM] 中優先級</option>
                    <option value="low">[LOW] 低優先級</option>
                  </select>
                </div>

                {/* Phase */}
                <div>
                  <label className="block font-bold text-black mb-1.5 uppercase tracking-wider">
                    甘特圖階段 (PHASE)
                  </label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    className="w-full bg-white border border-black px-3 py-2 text-black cursor-pointer focus:outline-none"
                    id="select-card-phase"
                  >
                    <option value="系統初始化">1. 系統初始化</option>
                    <option value="基礎管理">2. 基礎管理</option>
                    <option value="工單管理">3. 工單管理</option>
                    <option value="客戶管理">4. 客戶管理</option>
                    <option value="監控報表">5. 監控報表</option>
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-black mb-1.5 uppercase tracking-wider">
                      開始日 (START)
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white border border-black px-2 py-1.5 text-black text-xs focus:outline-none"
                      id="input-card-start-date"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-black mb-1.5 uppercase tracking-wider">
                      結束日 (DUE)
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-white border border-black px-2 py-1.5 text-black text-xs focus:outline-none"
                      id="input-card-due-date"
                    />
                  </div>
                </div>

                {/* Assignees */}
                <div>
                  <label className="block font-bold text-black mb-1.5 uppercase tracking-wider">
                    指派人員 (ASSIGNEES)
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto bg-white p-2 border border-black">
                    {users.map(u => (
                      <label 
                        key={u.id}
                        className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 cursor-pointer select-none border-b border-neutral-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={assignees.includes(u.id)}
                          onChange={() => toggleAssignee(u.id)}
                          className="w-3.5 h-3.5 border border-black accent-black"
                        />
                        <img 
                          src={u.avatar} 
                          alt={u.name} 
                          className="w-5 h-5 border border-black object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="truncate">
                          <span className="font-bold text-black">{u.name}</span>
                          <span className="text-[10px] text-neutral-500 ml-1">({u.role})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Linked RFI */}
                <div className="pt-2 border-t-2 border-black">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-black uppercase tracking-wider flex items-center gap-1">
                      <Link2 className="w-3.5 h-3.5 text-black" strokeWidth={1.5} />
                      關聯 RFI 單號
                    </label>
                    <button
                      type="button"
                      onClick={() => onCreateRfiFromCard(card)}
                      className="text-[11px] font-bold text-black hover:underline"
                      title="由本卡片直接建立新 RFI"
                    >
                      + 新建 RFI
                    </button>
                  </div>
                  <select
                    value={linkedRfiId}
                    onChange={(e) => setLinkedRfiId(e.target.value)}
                    className="w-full bg-white border border-black px-2.5 py-1.5 text-black focus:outline-none"
                    id="select-linked-rfi"
                  >
                    <option value="">-- 無關聯 RFI --</option>
                    {rfis.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.rfiNumber} - {r.title.slice(0, 20)}...
                      </option>
                    ))}
                  </select>

                  {linkedRfi && (
                    <div className="mt-2 p-2.5 bg-neutral-50 border border-black">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-black">{linkedRfi.rfiNumber}</span>
                        <span className="text-[10px] uppercase px-1 border border-black">
                          {linkedRfi.status}
                        </span>
                      </div>
                      <p className="text-neutral-700 mt-1 font-serif text-xs line-clamp-2">{linkedRfi.title}</p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="pt-2 border-t-2 border-black">
                  <label className="block font-bold text-black mb-1.5 uppercase tracking-wider">
                    標籤 (TAGS)
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map(t => (
                      <span 
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 border border-black text-black font-mono text-[10px] uppercase font-bold"
                      >
                        {t}
                        <button 
                          type="button" 
                          onClick={() => removeTag(t)}
                          className="hover:underline ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="輸入標籤後按 Enter..."
                    className="w-full bg-white border border-black px-2.5 py-1.5 text-black text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div>
                  <h4 className="font-serif font-bold text-black text-base uppercase">任務檢查清單 (SUBTASKS & CHECKLIST)</h4>
                  <p className="text-xs font-serif text-neutral-600">拆解為子任務以精確掌握執行進度</p>
                </div>
                <div className="text-xs font-mono font-bold text-black">
                  {progressPercent}% 完成
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-100 h-3 border border-black overflow-hidden">
                <div 
                  className="bg-black h-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Checklist items */}
              <div className="space-y-2 mt-4">
                {checklist.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 border-2 border-black transition-colors ${
                      item.completed ? 'bg-neutral-100 text-neutral-400' : 'bg-white text-black'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklist(item.id)}
                        className="w-4 h-4 border border-black accent-black cursor-pointer"
                      />
                      <span className={`text-xs font-mono ${item.completed ? 'line-through text-neutral-400' : 'text-black font-semibold'}`}>
                        {item.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeChecklist(item.id)}
                      className="p-1 text-black hover:bg-black hover:text-white transition-colors"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add checklist item */}
              <form onSubmit={handleAddChecklist} className="flex gap-2 mt-4 font-mono text-xs">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="新增子任務項目..."
                  className="flex-1 border border-black px-4 py-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="btn-mono-primary"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} /> <span>新增</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Attachments & Clipboard Paste */}
          {activeTab === 'attachments' && (
            <div className="space-y-6">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  processFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed border-black p-8 text-center cursor-pointer transition-colors duration-100 ${
                  isDraggingOver 
                    ? 'bg-neutral-200' 
                    : 'bg-neutral-50 hover:bg-neutral-100'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => processFiles(e.target.files)}
                  multiple
                  className="hidden"
                />
                <div className="w-12 h-12 border-2 border-black bg-white text-black flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h4 className="font-mono font-bold text-black text-xs uppercase mb-1">
                  點擊或將檔案拖曳至此處上傳 (UPLOAD FILES)
                </h4>
                <p className="text-xs font-serif text-neutral-600 mb-2">
                  支援格式：圖片 (.png, .jpg, .webp)、文件 (.pdf, .docx, .xlsx, .zip)
                </p>
                <span className="inline-block text-[10px] font-mono text-black border border-black px-2.5 py-1">
                  單檔限制 25MB • 支援 CTRL+V 剪貼簿直接貼圖
                </span>
              </div>

              {/* Attachments List */}
              <div className="space-y-3 font-mono">
                <h4 className="text-xs font-bold text-black uppercase tracking-wider">
                  已上傳附件清單 ({attachments.length})
                </h4>

                {attachments.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-xs font-serif italic">
                    尚未上傳任何附件或截圖。
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {attachments.map(att => (
                      <div 
                        key={att.id}
                        className="bg-white border-2 border-black p-3 flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          {att.fileType.startsWith('image/') ? (
                            <img 
                              src={att.fileUrl} 
                              alt={att.fileName}
                              className="w-12 h-12 border border-black object-cover shrink-0 bg-neutral-100" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-12 h-12 border border-black bg-neutral-100 text-black flex items-center justify-center shrink-0">
                              <Paperclip className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-black truncate" title={att.fileName}>
                              {att.fileName}
                            </p>
                            <p className="text-[10px] text-neutral-500">
                              {formatFileSize(att.fileSize)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-black text-xs">
                          <button
                            type="button"
                            onClick={() => onPreviewAttachment(att)}
                            className="text-black hover:underline uppercase font-bold text-[10px] flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> 預覽
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttachments(attachments.filter(a => a.id !== att.id))}
                            className="text-neutral-500 hover:text-black p-1"
                            title="刪除附件"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: HTML Code Snippet */}
          {activeTab === 'htmlCode' && (
            <div className="space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-black text-sm uppercase">HTML 前端交付代碼與即時預覽</h4>
                  <p className="text-xs font-serif text-neutral-600">
                    可在此直接編寫此任務卡片關聯的 HTML/CSS/JS 交付原型組件
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onOpenHtmlStudio(htmlSnippet || '<!-- 在此編寫交付成果 HTML 代碼 -->\n<div class="p-6 bg-white border-2 border-black">\n  <h2 class="text-xl font-bold font-serif">交付成果標題</h2>\n</div>');
                    onClose();
                  }}
                  className="btn-mono-secondary"
                >
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>在獨立 HTML Studio 開啟</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    HTML 源代碼 (SOURCE CODE)
                  </label>
                  <textarea
                    value={htmlSnippet}
                    onChange={(e) => setHtmlSnippet(e.target.value)}
                    rows={12}
                    className="w-full bg-neutral-900 text-neutral-100 p-3 font-mono text-xs leading-5 border-2 border-black focus:outline-none"
                    placeholder="在此貼上或編寫 HTML 代碼..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    即時渲染預覽 (LIVE PREVIEW)
                  </label>
                  <div className="h-[280px] bg-white border-2 border-black overflow-hidden flex flex-col">
                    <iframe
                      srcDoc={htmlSnippet || '<div style="font-family: monospace; color: #666; padding: 24px; text-align: center;">尚未輸入 HTML 代碼</div>'}
                      title="Card HTML Deliverable"
                      className="w-full flex-1 border-none bg-white"
                      sandbox="allow-scripts allow-modals"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-black bg-white shrink-0">
          <div>
            {permissions.canCreateDeleteBoard && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`確定要刪除卡片「${card.title}」嗎？此操作不可逆。`)) {
                    onDelete(card.id);
                    onClose();
                  }
                }}
                className="btn-mono-danger font-mono"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                <span>刪除卡片</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="btn-mono-secondary"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-mono-primary"
              id="btn-save-card"
            >
              儲存變更
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
