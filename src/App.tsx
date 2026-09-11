import React, { useState, useEffect } from 'react';
import { 
  INITIAL_USERS, 
  INITIAL_BOARDS, 
  INITIAL_CARDS, 
  INITIAL_RFIS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ACTIVITY_LOGS 
} from './mockData';
import { 
  Board, 
  Card, 
  RFI, 
  User, 
  Attachment, 
  AppNotification, 
  ActivityLog, 
  Column 
} from './types';
import { generateId, generateRfiNumber } from './utils';
import { Navbar } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { GanttView } from './components/GanttView';
import { RfiTracker } from './components/RfiTracker';
import { LiveHtmlEditor } from './components/LiveHtmlEditor';
import { AnalyticsView } from './components/AnalyticsView';
import { ApiConsole } from './components/ApiConsole';
import { AuditLogsView } from './components/AuditLogsView';
import { CardModal } from './components/CardModal';
import { RfiModal } from './components/RfiModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { LocalDataModal } from './components/LocalDataModal';

const LOCAL_STORAGE_KEY = 'kanban_rfi_app_data_v1';

function getInitialData<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${key}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`無法讀取本機儲存資料 (${key}):`, e);
  }
  return fallback;
}

export default function App() {
  // Core Entities State (整合 LocalStorage 自動持久化)
  const [boards, setBoards] = useState<Board[]>(() => getInitialData('boards', INITIAL_BOARDS));
  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_activeBoardId`);
      return saved || 'board-1';
    } catch {
      return 'board-1';
    }
  });
  const [cards, setCards] = useState<Card[]>(() => getInitialData('cards', INITIAL_CARDS));
  const [rfis, setRfis] = useState<RFI[]>(() => getInitialData('rfis', INITIAL_RFIS));
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = getInitialData<User | null>('currentUser', null);
    return savedUser || INITIAL_USERS[2];
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getInitialData('notifications', INITIAL_NOTIFICATIONS));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => getInitialData('activityLogs', INITIAL_ACTIVITY_LOGS));

  // Active View & Modals
  const [currentTab, setCurrentTab] = useState<'kanban' | 'gantt' | 'rfi' | 'htmlStudio' | 'analytics' | 'apiConsole' | 'auditLogs'>('kanban');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedRfi, setSelectedRfi] = useState<RFI | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [studioCode, setStudioCode] = useState<string>('');
  const [isLocalDataModalOpen, setIsLocalDataModalOpen] = useState(false);

  // 本地持久化資料自動儲存 (LocalStorage Sync)
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_boards`, JSON.stringify(boards));
    } catch (e) {}
  }, [boards]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_cards`, JSON.stringify(cards));
    } catch (e) {}
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_rfis`, JSON.stringify(rfis));
    } catch (e) {}
  }, [rfis]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_activeBoardId`, activeBoardId);
    } catch (e) {}
  }, [activeBoardId]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_activityLogs`, JSON.stringify(activityLogs));
    } catch (e) {}
  }, [activityLogs]);

  // 資料匯入與重置處理
  const handleImportData = (data: {
    boards?: Board[];
    cards?: Card[];
    rfis?: RFI[];
    activityLogs?: ActivityLog[];
    notifications?: AppNotification[];
  }) => {
    if (data.boards && Array.isArray(data.boards)) setBoards(data.boards);
    if (data.cards && Array.isArray(data.cards)) setCards(data.cards);
    if (data.rfis && Array.isArray(data.rfis)) setRfis(data.rfis);
    if (data.activityLogs && Array.isArray(data.activityLogs)) setActivityLogs(data.activityLogs);
    if (data.notifications && Array.isArray(data.notifications)) setNotifications(data.notifications);
  };

  const handleResetData = () => {
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(LOCAL_STORAGE_KEY)) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {}
    setBoards(INITIAL_BOARDS);
    setActiveBoardId('board-1');
    setCards(INITIAL_CARDS);
    setRfis(INITIAL_RFIS);
    setCurrentUser(INITIAL_USERS[2]);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
  };

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];

  // Activity Log Helper
  const addActivityLog = (
    entityType: 'Board' | 'Card' | 'RFI',
    entityId: string,
    entityTitle: string,
    action: string,
    details: string
  ) => {
    const newLog: ActivityLog = {
      id: generateId('log'),
      entityType,
      entityId,
      entityTitle,
      action,
      details,
      userId: currentUser.id,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Push In-App Notification Helper
  const pushNotification = (title: string, content: string, type: 'mention' | 'assignment' | 'rfi_status' | 'system', link?: string) => {
    const newNotif: AppNotification = {
      id: generateId('notif'),
      userId: currentUser.id,
      title,
      content,
      type,
      read: false,
      link,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // CARD OPERATIONS
  const handleAddCard = (columnId?: string) => {
    const targetColumnId = columnId || activeBoard.columns[0]?.id || 'col-backlog';
    const todayStr = new Date().toISOString().split('T')[0];
    const dueStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const newCard: Card = {
      id: generateId('card'),
      boardId: activeBoardId,
      columnId: targetColumnId,
      title: '新建立之專案任務卡片',
      description: '請在此輸入詳細驗收規範與執行步驟...',
      priority: 'medium',
      phase: '工單管理',
      startDate: todayStr,
      dueDate: dueStr,
      tags: ['待規劃'],
      assignees: [currentUser.id],
      checklist: [
        { id: generateId('chk'), text: '需求確認與技術評估', completed: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: []
    };

    setCards(prev => [...prev, newCard]);
    addActivityLog('Card', newCard.id, newCard.title, '建立新卡片', `於欄位建立新任務並指派給 ${currentUser.name}`);
    setSelectedCard(newCard);
  };

  const handleMoveCard = (cardId: string, targetColumnId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || card.columnId === targetColumnId) return;

    const targetCol = activeBoard.columns.find(col => col.id === targetColumnId);
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, columnId: targetColumnId, updatedAt: new Date().toISOString() } : c));

    addActivityLog(
      'Card', 
      card.id, 
      card.title, 
      '拖拽變更欄位', 
      `移動至「${targetCol?.title || targetColumnId}」欄位`
    );
  };

  const handleSaveCard = (updatedCard: Card) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    addActivityLog('Card', updatedCard.id, updatedCard.title, '更新卡片資訊', '編輯了任務說明、檢查清單或優先級');
  };

  const handleDeleteCard = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    setCards(prev => prev.filter(c => c.id !== cardId));
    if (card) {
      addActivityLog('Card', card.id, card.title, '刪除卡片', '任務卡片已自看板移除');
    }
  };

  const handleSaveToCardFromStudio = (cardId: string, htmlSnippet: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, htmlSnippet, updatedAt: new Date().toISOString() } : c));
    const card = cards.find(c => c.id === cardId);
    addActivityLog('Card', cardId, card?.title || cardId, '嵌入 HTML 交付代碼', '由 HTML Studio 同步儲存前端交付代碼');
    pushNotification('代碼已嵌入卡片', `HTML 渲染成果已成功儲存至「${card?.title || '卡片'}」`, 'system', cardId);
  };

  // RFI OPERATIONS
  const handleNewRfi = () => {
    const nextNumber = generateRfiNumber(rfis.length);
    const newRfi: RFI = {
      id: generateId('rfi'),
      rfiNumber: nextNumber,
      title: '新提出之工程技術需求疑義 (RFI)',
      category: 'spec_query',
      question: '請詳細列出圖面不符、規格衝突或技術澄清事項...',
      status: 'draft',
      raisedBy: currentUser.id,
      assignedTo: users.find(u => u.role === 'pm')?.id || users[0].id,
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      requiredResponseDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      attachments: [],
      thread: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRfis(prev => [newRfi, ...prev]);
    addActivityLog('RFI', newRfi.id, `${newRfi.rfiNumber} ${newRfi.title}`, '起草 RFI', `建立草稿，等待正式提交審核`);
    setSelectedRfi(newRfi);
  };

  const handleSaveRfi = (updatedRfi: RFI) => {
    const oldRfi = rfis.find(r => r.id === updatedRfi.id);
    setRfis(prev => prev.map(r => r.id === updatedRfi.id ? updatedRfi : r));

    if (oldRfi && oldRfi.status !== updatedRfi.status) {
      addActivityLog(
        'RFI', 
        updatedRfi.id, 
        `${updatedRfi.rfiNumber} ${updatedRfi.title}`, 
        '狀態流轉變更', 
        `由 ${oldRfi.status} 推進為 ${updatedRfi.status}`
      );
      pushNotification(
        `RFI 狀態變更：${updatedRfi.rfiNumber}`,
        `單據已轉移至「${updatedRfi.status}」，請相關人員留意審查進度。`,
        'rfi_status',
        updatedRfi.id
      );
    } else {
      addActivityLog(
        'RFI', 
        updatedRfi.id, 
        `${updatedRfi.rfiNumber} ${updatedRfi.title}`, 
        '更新 RFI 內容', 
        '修改了提問細節或更新官方答覆'
      );
    }
  };

  // CONVERT RFI TO CARD
  const handleConvertRfiToCard = (rfi: RFI) => {
    const backlogCol = activeBoard.columns[0]?.id || 'col-backlog';
    const newCard: Card = {
      id: generateId('card-rfi'),
      boardId: activeBoardId,
      columnId: backlogCol,
      title: `[${rfi.rfiNumber}] 執行事項：${rfi.title}`,
      description: `### 依據 RFI 衍生之工程任務
- **RFI 編號**：${rfi.rfiNumber}
- **問題陳述**：${rfi.question}
- **官方答覆**：${rfi.officialAnswer || '尚無官方正式答覆'}`,
      priority: rfi.category === 'cost_impact' || rfi.category === 'schedule_impact' ? 'high' : 'medium',
      dueDate: rfi.dueDate,
      tags: ['RFI衍生', rfi.category],
      assignees: [rfi.assignedTo, currentUser.id],
      rfiId: rfi.id,
      checklist: [
        { id: generateId('chk'), text: `核對 ${rfi.rfiNumber} 答覆並執行圖面修改`, completed: false },
        { id: generateId('chk'), text: '提送專案經理與業主復驗', completed: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: rfi.attachments
    };

    setCards(prev => [...prev, newCard]);
    // Also link card back to RFI
    setRfis(prev => prev.map(r => r.id === rfi.id ? { ...r, linkedCardId: newCard.id } : r));

    addActivityLog('Card', newCard.id, newCard.title, '由 RFI 轉化卡片', `成功連結至單據 ${rfi.rfiNumber}`);
    pushNotification('RFI 已轉化為看板卡片', `已在看板建立對應任務：「${newCard.title}」`, 'system', newCard.id);
    setSelectedRfi(null);
    setSelectedCard(newCard);
    setCurrentTab('kanban');
  };

  // CREATE RFI FROM CARD
  const handleCreateRfiFromCard = (card: Card) => {
    const nextNumber = generateRfiNumber(rfis.length);
    const newRfi: RFI = {
      id: generateId('rfi-from-card'),
      rfiNumber: nextNumber,
      title: `針對「${card.title}」之規格確認疑義`,
      category: 'spec_query',
      question: `在執行看板卡片任務時發現設計與施工疑義：\n\n${card.description.slice(0, 200)}...`,
      status: 'submitted',
      raisedBy: currentUser.id,
      assignedTo: users.find(u => u.role === 'pm')?.id || users[0].id,
      dueDate: card.dueDate,
      requiredResponseDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      linkedCardId: card.id,
      attachments: card.attachments || [],
      thread: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRfis(prev => [newRfi, ...prev]);
    // Link card to RFI
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, rfiId: newRfi.id } : c));

    addActivityLog('RFI', newRfi.id, `${newRfi.rfiNumber} ${newRfi.title}`, '由卡片建立 RFI', `關聯任務卡片 ${card.title}`);
    pushNotification('新建立 RFI 需求單', `已從卡片提交 ${newRfi.rfiNumber}，並呈送 PM 審理。`, 'rfi_status', newRfi.id);
    setSelectedCard(null);
    setSelectedRfi(newRfi);
  };

  // COLUMN OPERATIONS
  const handleAddColumn = (title: string) => {
    const newCol: Column = {
      id: generateId('col'),
      boardId: activeBoardId,
      title,
      orderIndex: activeBoard.columns.length,
      color: 'border-slate-300'
    };
    setBoards(prev => prev.map(b => b.id === activeBoardId ? { ...b, columns: [...b.columns, newCol] } : b));
    addActivityLog('Board', activeBoardId, activeBoard.title, '新增看板欄位', `建立「${title}」工作流`);
  };

  const handleDeleteColumn = (columnId: string) => {
    setBoards(prev => prev.map(b => b.id === activeBoardId ? { ...b, columns: b.columns.filter(c => c.id !== columnId) } : b));
    addActivityLog('Board', activeBoardId, activeBoard.title, '刪除看板欄位', `移除工作流欄位 ID: ${columnId}`);
  };

  // NOTIFICATION CLICK
  const handleNotificationClick = (notif: AppNotification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.link) {
      const cardTarget = cards.find(c => c.id === notif.link);
      if (cardTarget) {
        setSelectedCard(cardTarget);
        setCurrentTab('kanban');
        return;
      }
      const rfiTarget = rfis.find(r => r.id === notif.link || r.rfiNumber === notif.link);
      if (rfiTarget) {
        setSelectedRfi(rfiTarget);
        setCurrentTab('rfi');
        return;
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-black font-sans" id="app-root-container">
      {/* Global Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        boards={boards}
        activeBoardId={activeBoardId}
        onSelectBoard={setActiveBoardId}
        users={users}
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllNotificationsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onOpenLocalData={() => setIsLocalDataModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {currentTab === 'kanban' && (
          <KanbanBoard
            board={activeBoard}
            cards={cards}
            users={users}
            rfis={rfis}
            currentUser={currentUser}
            onCardClick={setSelectedCard}
            onAddCard={handleAddCard}
            onMoveCard={handleMoveCard}
            onAddColumn={handleAddColumn}
            onDeleteColumn={handleDeleteColumn}
            onOpenRfi={(rfiId) => {
              const r = rfis.find(item => item.id === rfiId);
              if (r) setSelectedRfi(r);
            }}
          />
        )}

        {currentTab === 'gantt' && (
          <GanttView
            board={activeBoard}
            cards={cards}
            users={users}
            onCardClick={setSelectedCard}
            onAddCard={() => handleAddCard()}
          />
        )}

        {currentTab === 'rfi' && (
          <RfiTracker
            rfis={rfis}
            users={users}
            cards={cards}
            currentUser={currentUser}
            onRfiClick={setSelectedRfi}
            onNewRfi={handleNewRfi}
            onConvertToCard={handleConvertRfiToCard}
          />
        )}

        {currentTab === 'htmlStudio' && (
          <div className="flex-1 p-4 bg-white overflow-hidden">
            <LiveHtmlEditor
              initialCode={studioCode}
              cards={cards}
              onSaveToCard={handleSaveToCardFromStudio}
            />
          </div>
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            board={activeBoard}
            cards={cards}
            rfis={rfis}
            users={users}
          />
        )}

        {currentTab === 'apiConsole' && (
          <ApiConsole
            board={activeBoard}
            cards={cards}
            rfis={rfis}
            users={users}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'auditLogs' && (
          <AuditLogsView
            logs={activityLogs}
            users={users}
          />
        )}
      </main>

      {/* MODAL 1: Card Detail & Editor Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          boardTitle={activeBoard.title}
          users={users}
          rfis={rfis}
          currentUser={currentUser}
          onClose={() => setSelectedCard(null)}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
          onCreateRfiFromCard={handleCreateRfiFromCard}
          onOpenHtmlStudio={(code) => {
            setStudioCode(code);
            setCurrentTab('htmlStudio');
          }}
          onPreviewAttachment={setPreviewAttachment}
        />
      )}

      {/* MODAL 2: RFI Detail, Stepper & Response Modal */}
      {selectedRfi && (
        <RfiModal
          rfi={selectedRfi}
          users={users}
          cards={cards}
          currentUser={currentUser}
          onClose={() => setSelectedRfi(null)}
          onSave={handleSaveRfi}
          onConvertToCard={handleConvertRfiToCard}
          onPreviewAttachment={setPreviewAttachment}
        />
      )}

      {/* MODAL 3: File & Document Online Preview Modal */}
      {previewAttachment && (
        <FilePreviewModal
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}

      {/* MODAL 4: Local Data Persistence & Backup Modal */}
      <LocalDataModal
        isOpen={isLocalDataModalOpen}
        onClose={() => setIsLocalDataModalOpen(false)}
        boards={boards}
        cards={cards}
        rfis={rfis}
        activityLogs={activityLogs}
        notifications={notifications}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />
    </div>
  );
}
