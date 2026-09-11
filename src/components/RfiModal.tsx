import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Paperclip, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Eye, 
  CheckCheck
} from 'lucide-react';
import { RFI, User, Card, Attachment, RfiStatus, RfiCategory, RfiThreadMessage } from '../types';
import { 
  RFI_STATUS_CONFIG, 
  RFI_CATEGORY_CONFIG, 
  ROLE_PERMISSIONS, 
  formatDateTime, 
  generateId 
} from '../utils';

interface RfiModalProps {
  rfi: RFI | null;
  users: User[];
  cards: Card[];
  currentUser: User;
  onClose: () => void;
  onSave: (updatedRfi: RFI) => void;
  onConvertToCard: (rfi: RFI) => void;
  onPreviewAttachment: (attachment: Attachment) => void;
}

export const RfiModal: React.FC<RfiModalProps> = ({
  rfi,
  users,
  cards,
  currentUser,
  onClose,
  onSave,
  onConvertToCard,
  onPreviewAttachment,
}) => {
  if (!rfi) return null;

  const permissions = ROLE_PERMISSIONS[currentUser.role];
  const [status, setStatus] = useState<RfiStatus>(rfi.status);
  const [title, setTitle] = useState(rfi.title);
  const [category, setCategory] = useState<RfiCategory>(rfi.category);
  const [question, setQuestion] = useState(rfi.question);
  const [officialAnswer, setOfficialAnswer] = useState(rfi.officialAnswer || '');
  const [assignedTo, setAssignedTo] = useState(rfi.assignedTo);
  const [dueDate, setDueDate] = useState(rfi.dueDate);
  const [requiredResponseDate, setRequiredResponseDate] = useState(rfi.requiredResponseDate);
  const [thread, setThread] = useState<RfiThreadMessage[]>(rfi.thread || []);
  const [attachments, setAttachments] = useState<Attachment[]>(rfi.attachments || []);
  
  const [newCommentText, setNewCommentText] = useState('');
  const [showOfficialEditor, setShowOfficialEditor] = useState(false);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const raisedByUser = users.find(u => u.id === rfi.raisedBy);
  const assignedToUser = users.find(u => u.id === assignedTo);
  const answeredByUser = rfi.answeredBy ? users.find(u => u.id === rfi.answeredBy) : null;
  const linkedCard = rfi.linkedCardId ? cards.find(c => c.id === rfi.linkedCardId) : null;

  const lifecycleSteps: RfiStatus[] = ['draft', 'submitted', 'under_review', 'answered', 'closed'];
  const currentStepIndex = lifecycleSteps.indexOf(status);

  // Clipboard Paste support for RFI
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
              const newAtt: Attachment = {
                id: generateId('att-rfi'),
                entityType: 'RFI',
                entityId: rfi.id,
                fileName: `RFI_PASTE_${new Date().getTime()}.png`,
                fileUrl: base64Url,
                fileSize: file.size,
                fileType: file.type,
                uploadedBy: currentUser.id,
                uploadedAt: new Date().toISOString(),
                previewType: 'image'
              };
              setAttachments(prev => [...prev, newAtt]);
              setPasteNotice('已自動擷取剪貼簿圖片');
              setTimeout(() => setPasteNotice(null), 3000);
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [rfi.id, currentUser.id]);

  // Handle Lifecycle transition
  const handleTransitionStatus = (newStatus: RfiStatus) => {
    setStatus(newStatus);
    const updated: RFI = {
      ...rfi,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      ...(newStatus === 'answered' ? {
        officialAnswer,
        answeredBy: currentUser.id,
        answeredAt: new Date().toISOString()
      } : {})
    };
    onSave(updated);
  };

  // Submit new reply to Threaded Q&A
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newMsg: RfiThreadMessage = {
      id: generateId('msg'),
      userId: currentUser.id,
      message: newCommentText.trim(),
      timestamp: new Date().toISOString(),
      isOfficial: false
    };

    const updatedThread = [...thread, newMsg];
    setThread(updatedThread);
    setNewCommentText('');

    const updated: RFI = {
      ...rfi,
      thread: updatedThread,
      updatedAt: new Date().toISOString()
    };
    onSave(updated);
  };

  // Save Official Ruling
  const handleSaveOfficialAnswer = () => {
    const updated: RFI = {
      ...rfi,
      officialAnswer,
      answeredBy: currentUser.id,
      answeredAt: new Date().toISOString(),
      status: 'answered',
      thread: [
        ...thread,
        {
          id: generateId('msg'),
          userId: currentUser.id,
          message: `【發布官方正式答覆】：\n${officialAnswer}`,
          timestamp: new Date().toISOString(),
          isOfficial: true
        }
      ],
      updatedAt: new Date().toISOString()
    };
    setStatus('answered');
    setShowOfficialEditor(false);
    onSave(updated);
  };

  const handleGeneralSave = () => {
    const updated: RFI = {
      ...rfi,
      title,
      category,
      question,
      officialAnswer,
      assignedTo,
      dueDate,
      requiredResponseDate,
      status,
      attachments,
      thread,
      updatedAt: new Date().toISOString()
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div 
        className="bg-white border-4 border-black w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
        id="rfi-detail-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-black text-white font-mono font-bold text-sm tracking-wider uppercase">
              {rfi.rfiNumber}
            </span>
            <span className={`px-2.5 py-1 text-xs font-mono uppercase ${RFI_CATEGORY_CONFIG[category].bg} ${RFI_CATEGORY_CONFIG[category].color}`}>
              {RFI_CATEGORY_CONFIG[category].label}
            </span>
            {linkedCard && (
              <span className="hidden sm:flex items-center gap-1 text-xs font-mono text-black border border-black px-2 py-0.5">
                <Layers className="w-3 h-3 text-black" strokeWidth={1.5} />
                卡片: {linkedCard.title.slice(0, 15)}...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {pasteNotice && (
              <span className="text-xs font-mono font-bold text-black border border-black px-2.5 py-1">
                {pasteNotice}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-black hover:bg-black hover:text-white transition-colors duration-100"
              id="btn-close-rfi-modal"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Interactive Lifecycle Status Stepper */}
        <div className="bg-white px-6 py-4 border-b-2 border-black shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-black">
              RFI 狀態生命週期 (LIFECYCLE)
            </span>
            <span className="text-xs font-mono font-bold text-black uppercase">
              目前狀態: [{RFI_STATUS_CONFIG[status].label}]
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 relative">
            {lifecycleSteps.map((stepKey, idx) => {
              const stepCfg = RFI_STATUS_CONFIG[stepKey];
              const isCurrent = status === stepKey;
              const isPast = idx < currentStepIndex;
              const isNext = idx === currentStepIndex + 1;

              return (
                <div key={stepKey} className="flex flex-col items-center text-center">
                  <button
                    onClick={() => {
                      if (permissions.canApproveRfi || stepKey === 'submitted') {
                        handleTransitionStatus(stepKey);
                      }
                    }}
                    disabled={!permissions.canApproveRfi && stepKey !== 'submitted'}
                    className={`w-full py-2 px-1 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1 transition-colors duration-100 ${
                      isCurrent 
                        ? 'bg-black text-white font-bold border-2 border-black' 
                        : isPast 
                        ? 'bg-neutral-100 text-black border border-black font-semibold' 
                        : isNext && permissions.canApproveRfi
                        ? 'bg-white text-black border border-dashed border-black hover:bg-neutral-100 cursor-pointer'
                        : 'bg-white text-neutral-400 border border-neutral-300 opacity-60'
                    }`}
                  >
                    {isPast ? <CheckCheck className="w-3.5 h-3.5 text-black" strokeWidth={2} /> : null}
                    <span className="truncate">{stepCfg.label.split(' ')[0]}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Grid: Details on Left, Side Meta on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Title, Question, Official Ruling, Q&A Thread */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Category */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                  需求單主旨 (RFI TITLE)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-lg font-serif font-bold text-black border-2 border-black px-4 py-2.5 focus:outline-none focus:bg-neutral-50"
                  placeholder="輸入 RFI 資訊需求單主旨..."
                  id="input-rfi-title"
                />
              </div>

              {/* Question Section */}
              <div className="p-4 bg-white border-2 border-black space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-black uppercase tracking-wider">
                  <span>提問與疑義詳細內容 (QUESTION & DETAILS)</span>
                  <span className="text-neutral-500 font-normal">支援 CTRL+V 貼圖</span>
                </div>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={4}
                  className="w-full text-xs font-serif text-black border border-black p-3 focus:outline-none focus:border-2 focus:border-black bg-white leading-relaxed"
                  placeholder="請具體陳述規格疑義、設計變更或法規衝擊..."
                />
              </div>

              {/* Official Answer Box */}
              <div className="p-5 bg-neutral-50 border-2 border-black relative">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-black" strokeWidth={1.5} />
                    <h4 className="font-mono font-bold text-black text-xs uppercase tracking-wider">
                      官方正式答覆 (OFFICIAL RESPONSE)
                    </h4>
                  </div>
                  {permissions.canApproveRfi && (
                    <button
                      type="button"
                      onClick={() => setShowOfficialEditor(!showOfficialEditor)}
                      className="text-xs font-mono uppercase font-bold text-black hover:underline"
                    >
                      {showOfficialEditor ? '收合編輯' : (officialAnswer ? '編輯官方答覆' : '+ 發布官方答覆')}
                    </button>
                  )}
                </div>

                {showOfficialEditor ? (
                  <div className="space-y-3">
                    <textarea
                      value={officialAnswer}
                      onChange={(e) => setOfficialAnswer(e.target.value)}
                      rows={4}
                      className="w-full text-xs font-serif bg-white border-2 border-black p-3 focus:outline-none text-black leading-relaxed"
                      placeholder="請輸入經審查核定的官方裁決回覆..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowOfficialEditor(false)}
                        className="btn-mono-secondary"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveOfficialAnswer}
                        className="btn-mono-primary"
                      >
                        確認發布官方答覆
                      </button>
                    </div>
                  </div>
                ) : officialAnswer ? (
                  <div>
                    <p className="text-xs font-serif text-black leading-relaxed whitespace-pre-wrap">
                      {officialAnswer}
                    </p>
                    {answeredByUser && (
                      <div className="mt-3 text-xs font-mono text-neutral-600 flex items-center justify-between border-t border-black pt-2">
                        <span>核可簽署: {answeredByUser.name} ({answeredByUser.title})</span>
                        <span>答覆時間: {formatDateTime(rfi.answeredAt || '')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-neutral-500 italic">
                    尚未發布官方正式裁定。待專案經理 (PM) 審查後核發。
                  </div>
                )}
              </div>

              {/* Threaded Q&A / Discussion */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono font-bold text-black text-xs uppercase tracking-wider flex items-center gap-2">
                    對話歷程與討論串 (THREADED Q&A)
                  </h4>
                  <span className="text-xs font-mono text-neutral-500">{thread.length} 則紀錄</span>
                </div>

                {/* Messages stream */}
                <div className="space-y-3 bg-white p-4 border-2 border-black max-h-64 overflow-y-auto">
                  {thread.length === 0 ? (
                    <div className="text-center py-4 text-neutral-400 text-xs font-serif italic">
                      目前尚無對話討論。可在下方提出回覆。
                    </div>
                  ) : (
                    thread.map(msg => {
                      const sender = users.find(u => u.id === msg.userId);
                      return (
                        <div 
                          key={msg.id}
                          className={`p-3 border text-xs space-y-1.5 ${
                            msg.isOfficial 
                              ? 'bg-neutral-100 border-2 border-black text-black' 
                              : 'bg-white border border-neutral-300 text-black'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {sender && (
                                <img 
                                  src={sender.avatar} 
                                  alt={sender.name} 
                                  className="w-5 h-5 border border-black object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <span className="font-mono font-bold text-black">
                                {sender?.name || '未知成員'}
                              </span>
                              {msg.isOfficial && (
                                <span className="bg-black text-white text-[9px] font-mono px-1.5 py-0.5 uppercase font-bold">
                                  官方公告
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-neutral-500">
                              {formatDateTime(msg.timestamp)}
                            </span>
                          </div>
                          <p className="font-serif leading-relaxed whitespace-pre-wrap pl-7">
                            {msg.message}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Input Form */}
                <form onSubmit={handleSendComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="輸入回覆訊息..."
                    className="flex-1 text-xs font-mono border border-black px-3.5 py-2.5 focus:outline-none focus:border-2 focus:border-black"
                    id="input-rfi-comment"
                  />
                  <button
                    type="submit"
                    className="btn-mono-primary"
                    id="btn-send-rfi-comment"
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>送出</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right 1 Col: Metadata & Action Controls */}
            <div className="space-y-5 bg-white p-4 border-2 border-black text-xs font-mono">
              {/* Convert to Kanban Card Button */}
              <div className="p-3 bg-neutral-100 border border-black text-center">
                <p className="text-xs font-serif text-black mb-2">
                  將此 RFI 問題轉化為敏捷看板卡片以追蹤執行進度：
                </p>
                <button
                  type="button"
                  onClick={() => onConvertToCard(rfi)}
                  className="btn-mono-primary w-full"
                  id="btn-convert-rfi-to-card"
                >
                  <Layers className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>轉化為看板卡片</span>
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-black mb-1.5 uppercase tracking-wider">
                  提問類別 (CATEGORY)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RfiCategory)}
                  className="w-full bg-white border border-black px-3 py-2 text-black cursor-pointer focus:outline-none"
                >
                  <option value="spec_query">規格疑義 (Spec Query)</option>
                  <option value="design_change">設計變更 (Design Change)</option>
                  <option value="schedule_impact">時程影響 (Schedule Impact)</option>
                  <option value="cost_impact">成本影響 (Cost Impact)</option>
                </select>
              </div>

              {/* Raised By */}
              <div>
                <label className="block font-bold text-black mb-1 uppercase tracking-wider">
                  發起人員 (RAISED BY)
                </label>
                <div className="flex items-center gap-2 p-2 bg-white border border-black">
                  <img 
                    src={raisedByUser?.avatar} 
                    alt={raisedByUser?.name} 
                    className="w-5 h-5 border border-black object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="font-bold text-black">{raisedByUser?.name}</span>
                    <span className="text-[10px] text-neutral-500 ml-1">({raisedByUser?.title})</span>
                  </div>
                </div>
              </div>

              {/* Assigned To Reviewer */}
              <div>
                <label className="block font-bold text-black mb-1.5 uppercase tracking-wider">
                  審查負責人 (ASSIGNED REVIEWER)
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-white border border-black px-3 py-2 text-black cursor-pointer focus:outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-black mb-1 uppercase tracking-wider">
                    要求答覆期限 (REQUIRED DATE)
                  </label>
                  <input
                    type="date"
                    value={requiredResponseDate}
                    onChange={(e) => setRequiredResponseDate(e.target.value)}
                    className="w-full bg-white border border-black px-3 py-2 text-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-black mb-1 uppercase tracking-wider">
                    最終截止日期 (DUE DATE)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-black px-3 py-2 text-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Attachments for RFI */}
              <div className="pt-2 border-t-2 border-black">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-black uppercase tracking-wider">
                    附件清單 ({attachments.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-black font-bold uppercase hover:underline text-[11px]"
                  >
                    + 上傳附件
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (!e.target.files) return;
                      Array.from(e.target.files).forEach((file: File) => {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const newAtt: Attachment = {
                            id: generateId('att-rfi'),
                            entityType: 'RFI',
                            entityId: rfi.id,
                            fileName: file.name,
                            fileUrl: ev.target?.result as string,
                            fileSize: file.size,
                            fileType: file.type || 'application/octet-stream',
                            uploadedBy: currentUser.id,
                            uploadedAt: new Date().toISOString(),
                            previewType: file.type.startsWith('image/') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'doc'
                          };
                          setAttachments(prev => [...prev, newAtt]);
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="hidden"
                  />
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {attachments.map(att => (
                    <div 
                      key={att.id}
                      className="flex items-center justify-between p-2 bg-white border border-black text-xs"
                    >
                      <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                        <Paperclip className="w-3.5 h-3.5 text-black shrink-0" strokeWidth={1.5} />
                        <span className="truncate font-mono" title={att.fileName}>{att.fileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onPreviewAttachment(att)}
                        className="text-black hover:underline p-1 shrink-0"
                        title="預覽"
                      >
                        <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-black bg-white shrink-0">
          <div className="flex items-center gap-2">
            {/* Quick Status Action Buttons */}
            {status === 'draft' && (
              <button
                type="button"
                onClick={() => handleTransitionStatus('submitted')}
                className="btn-mono-secondary font-mono"
              >
                正式提交 RFI (Submit)
              </button>
            )}

            {status === 'submitted' && permissions.canApproveRfi && (
              <button
                type="button"
                onClick={() => handleTransitionStatus('under_review')}
                className="btn-mono-secondary font-mono"
              >
                轉入審核處理 (Start Review)
              </button>
            )}

            {status === 'answered' && permissions.canCloseRfi && (
              <button
                type="button"
                onClick={() => handleTransitionStatus('closed')}
                className="btn-mono-primary font-mono flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                <span>結案歸檔 (Close RFI)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-mono-secondary"
            >
              關閉
            </button>
            <button
              type="button"
              onClick={handleGeneralSave}
              className="btn-mono-primary"
              id="btn-save-rfi-changes"
            >
              儲存 RFI 變更
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
