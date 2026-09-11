import { User, Board, Card, RFI, ActivityLog, AppNotification } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: '張維哲',
    email: 'alex.chang@megacorp.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    title: '系統架構主管 (Admin)',
    department: '技術研發部'
  },
  {
    id: 'usr-pm',
    name: '林雅婷',
    email: 'yating.lin@megacorp.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'pm',
    title: '資深專案經理 (PM)',
    department: '工程管理處'
  },
  {
    id: 'usr-member',
    name: '陳冠宇',
    email: 'guanyu.chen@megacorp.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    title: '資深全端工程師 (Member)',
    department: '系統開發組'
  },
  {
    id: 'usr-client',
    name: '王大同 (總監)',
    email: 'david.wang@client-partner.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'client',
    title: '業主專案監察總監 (Client)',
    department: '永續建設股份有限公司'
  }
];

export const INITIAL_BOARDS: Board[] = [
  {
    id: 'board-1',
    title: '智慧製造核心系統 (Core MES Platform)',
    description: '整合 IoT 即時資料採集、自動化派工與看板視覺化控制之現代化工業製造專案',
    createdBy: 'usr-admin',
    createdAt: '2026-08-01T09:00:00Z',
    columns: [
      { id: 'col-backlog', boardId: 'board-1', title: 'Backlog 需求儲備', orderIndex: 0, color: 'border-slate-300' },
      { id: 'col-todo', boardId: 'board-1', title: 'To Do 待處理', orderIndex: 1, color: 'border-amber-400' },
      { id: 'col-in-progress', boardId: 'board-1', title: 'In Progress 進行中', orderIndex: 2, color: 'border-blue-500' },
      { id: 'col-review', boardId: 'board-1', title: 'Review 技術審核', orderIndex: 3, color: 'border-purple-500' },
      { id: 'col-done', boardId: 'board-1', title: 'Done 已驗收', orderIndex: 4, color: 'border-emerald-500' }
    ]
  },
  {
    id: 'board-2',
    title: '二期廠房機電自動化工程 (Phase II MEP)',
    description: '機電管線佈署、高低壓配電櫃審驗與 SCADA 介面連動',
    createdBy: 'usr-pm',
    createdAt: '2026-08-15T14:30:00Z',
    columns: [
      { id: 'col-b2-todo', boardId: 'board-2', title: 'To Do 待發包', orderIndex: 0, color: 'border-amber-400' },
      { id: 'col-b2-doing', boardId: 'board-2', title: 'Doing 施工中', orderIndex: 1, color: 'border-blue-500' },
      { id: 'col-b2-test', boardId: 'board-2', title: 'Testing 試車檢驗', orderIndex: 2, color: 'border-indigo-500' },
      { id: 'col-b2-done', boardId: 'board-2', title: 'Accepted 驗收移交', orderIndex: 3, color: 'border-emerald-500' }
    ]
  }
];

export const INITIAL_CARDS: Card[] = [
  // 1. 系統初始化
  {
    id: 'card-104',
    boardId: 'board-1',
    columnId: 'col-done',
    title: '架構規劃與 RESTful API v1 介面標準化',
    description: '完成規範書第 5 章 API 設計，涵蓋 Auth、Boards、Cards、RFIs、Attachments。',
    priority: 'medium',
    phase: '系統初始化',
    startDate: '2026-08-01',
    dueDate: '2026-08-05',
    tags: ['Architecture', 'API', 'Docs'],
    assignees: ['usr-admin'],
    checklist: [
      { id: 'chk-10', text: '撰寫 REST API 規範文件', completed: true },
      { id: 'chk-11', text: '建立 Mock Server 響應邏輯', completed: true }
    ],
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-05T17:00:00Z'
  },
  {
    id: 'card-106',
    boardId: 'board-1',
    columnId: 'col-done',
    title: '伺服器購買與雲端環境部署',
    description: '完成容器化 Docker/Kubernetes 叢集配置與基礎監控。',
    priority: 'medium',
    phase: '系統初始化',
    startDate: '2026-08-05',
    dueDate: '2026-08-15',
    tags: ['DevOps', 'Cloud', 'Server'],
    assignees: ['usr-admin'],
    checklist: [
      { id: 'chk-13', text: '伺服器採購與規格核驗', completed: true },
      { id: 'chk-14', text: '系統環境部署與連線測試', completed: true }
    ],
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-08-15T18:00:00Z'
  },
  // 2. 基礎管理
  {
    id: 'card-103',
    boardId: 'board-1',
    columnId: 'col-review',
    title: 'RBAC 權限矩陣與外部訪客 (Client) 訪問隔離',
    description: `依據規範實作四級權限：
1. 系統管理者 (Admin)
2. 專案經理 (PM)
3. 團隊成員 (Member)
4. 外部訪客/客戶 (Client)`,
    priority: 'medium',
    phase: '基礎管理',
    startDate: '2026-08-16',
    dueDate: '2026-08-25',
    tags: ['Security', 'RBAC', 'Auth'],
    assignees: ['usr-admin', 'usr-pm'],
    checklist: [
      { id: 'chk-7', text: '設計角色切換模擬器', completed: true },
      { id: 'chk-8', text: '驗證 Client 角色不能刪除看板', completed: true },
      { id: 'chk-9', text: '驗證 Member 角色不可直接結案 RFI', completed: true }
    ],
    createdAt: '2026-08-16T08:00:00Z',
    updatedAt: '2026-08-25T18:00:00Z'
  },
  {
    id: 'card-107',
    boardId: 'board-1',
    columnId: 'col-done',
    title: '使用者組織階層與個人資料管理',
    description: '建構團隊成員、主管與委託方之多層級組織樹狀圖。',
    priority: 'low',
    phase: '基礎管理',
    startDate: '2026-08-20',
    dueDate: '2026-08-30',
    tags: ['Users', 'Organization'],
    assignees: ['usr-pm'],
    checklist: [
      { id: 'chk-15', text: '部門架構建立', completed: true },
      { id: 'chk-16', text: '個人資訊編輯與頭像設定', completed: true }
    ],
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-30T17:00:00Z'
  },
  // 3. 工單管理
  {
    id: 'card-102',
    boardId: 'board-1',
    columnId: 'col-todo',
    title: '整合剪貼簿貼圖自動上傳至富文本區塊',
    description: `使用者在卡片描述或 RFI 官方答覆區塊按下 Ctrl+V (或 Cmd+V) 時，系統自動攔截剪貼簿中的點陣圖片數據。`,
    priority: 'high',
    phase: '工單管理',
    startDate: '2026-08-28',
    dueDate: '2026-09-12',
    tags: ['UX', '富文本', '剪貼簿貼圖'],
    assignees: ['usr-member'],
    checklist: [
      { id: 'chk-5', text: '實作 onPaste 事件監聽器與 blob 解析', completed: true },
      { id: 'chk-6', text: '加入預覽縮圖及移除按鈕', completed: false }
    ],
    createdAt: '2026-08-28T14:00:00Z',
    updatedAt: '2026-09-06T09:30:00Z'
  },
  {
    id: 'card-101',
    boardId: 'board-1',
    columnId: 'col-in-progress',
    title: '實作 SCADA 即時遙測 HTML 監控面板 (Live Widget)',
    description: `針對主泵站感測器數據開發前端輕量化監控 Widget，支援 HTML 預覽與即時狀態更新。`,
    priority: 'urgent',
    phase: '工單管理',
    startDate: '2026-09-02',
    dueDate: '2026-09-20',
    tags: ['Frontend', 'SCADA', 'HTML預覽', 'IoT'],
    assignees: ['usr-member', 'usr-pm'],
    rfiId: 'rfi-2026-001',
    checklist: [
      { id: 'chk-1', text: '完成 WebSocket 遙測數據模擬封包', completed: true },
      { id: 'chk-2', text: '編寫 HTML/CSS 即時壓力指針組件', completed: true },
      { id: 'chk-3', text: '通過 RFI-2026-001 變壓器電壓規格確認', completed: true },
      { id: 'chk-4', text: '整合進看板卡片 HTML 即時預覽容器', completed: false }
    ],
    htmlSnippet: `<div class="p-4 bg-slate-900 text-white rounded-xl font-sans border border-slate-700 shadow-xl max-w-sm">
  <div class="flex items-center justify-between pb-3 border-b border-slate-800">
    <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> SCADA 直播遙測
    </span>
    <span class="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">NODE #04</span>
  </div>
  <div class="my-4 text-center">
    <div class="text-4xl font-mono font-bold tracking-tight text-white">220.4 <span class="text-sm font-normal text-slate-400">VAC</span></div>
    <div class="text-xs text-slate-400 mt-1">主變壓器輸出電壓 (負載 68%)</div>
  </div>
  <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
    <div class="bg-gradient-to-r from-emerald-500 to-amber-500 h-full w-2/3"></div>
  </div>
</div>`,
    createdAt: '2026-09-02T10:15:00Z',
    updatedAt: '2026-09-08T16:20:00Z',
    attachments: [
      {
        id: 'att-1',
        entityType: 'Card',
        entityId: 'card-101',
        fileName: 'scada_dashboard_mockup.png',
        fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        fileSize: 1048576,
        fileType: 'image/png',
        uploadedBy: 'usr-member',
        uploadedAt: '2026-09-03T11:00:00Z',
        previewType: 'image'
      }
    ]
  },
  {
    id: 'card-108',
    boardId: 'board-1',
    columnId: 'col-todo',
    title: '工單處理與升級流程及客戶反饋閉環',
    description: '確保工單於 SLA 時限內獲得答覆與驗收核可。',
    priority: 'medium',
    phase: '工單管理',
    startDate: '2026-09-12',
    dueDate: '2026-09-26',
    tags: ['Workflow', 'SLA'],
    assignees: ['usr-pm'],
    checklist: [
      { id: 'chk-17', text: 'SLA 逾期警示設定', completed: false },
      { id: 'chk-18', text: '滿意度回饋問卷連結', completed: false }
    ],
    createdAt: '2026-09-04T11:00:00Z',
    updatedAt: '2026-09-04T11:00:00Z'
  },
  // 4. 客戶管理
  {
    id: 'card-109',
    boardId: 'board-1',
    columnId: 'col-todo',
    title: '客戶新建與清單智慧查詢模組',
    description: '支援客戶等級評估、統一編號自動檢核與歷史專案歸檔。',
    priority: 'urgent',
    phase: '客戶管理',
    startDate: '2026-09-15',
    dueDate: '2026-10-02',
    tags: ['CRM', 'Client', 'Search'],
    assignees: ['usr-pm', 'usr-client'],
    checklist: [
      { id: 'chk-19', text: '統編與公司驗證 API 串接', completed: true },
      { id: 'chk-20', text: '即時搜尋與過濾器', completed: false }
    ],
    createdAt: '2026-09-05T10:00:00Z',
    updatedAt: '2026-09-08T15:00:00Z'
  },
  {
    id: 'card-110',
    boardId: 'board-1',
    columnId: 'col-backlog',
    title: '客戶聯絡人與合約審批管理',
    description: '工程款期程、履約保證金與合約電子附件簽署驗證。',
    priority: 'urgent',
    phase: '客戶管理',
    startDate: '2026-09-25',
    dueDate: '2026-10-20',
    tags: ['Contract', 'Finance'],
    assignees: ['usr-client'],
    checklist: [
      { id: 'chk-21', text: '合約模板庫建立', completed: false },
      { id: 'chk-22', text: '財務款項追蹤', completed: false }
    ],
    createdAt: '2026-09-06T14:00:00Z',
    updatedAt: '2026-09-06T14:00:00Z'
  },
  // 5. 監控報表
  {
    id: 'card-105',
    boardId: 'board-1',
    columnId: 'col-backlog',
    title: '員工工作量分析與 SCADA 即時畫像',
    description: '規劃 Stage 2 擴充：員工工作量分佈圖、燃盡趨勢與多人在線狀態。',
    priority: 'low',
    phase: '監控報表',
    startDate: '2026-10-01',
    dueDate: '2026-10-18',
    tags: ['Analytics', 'Dashboard'],
    assignees: ['usr-member'],
    checklist: [
      { id: 'chk-12', text: '技術評估 Socket.io / WebSocket 原生架構', completed: false }
    ],
    createdAt: '2026-09-05T11:20:00Z',
    updatedAt: '2026-09-05T11:20:00Z'
  }
];

export const INITIAL_RFIS: RFI[] = [
  {
    id: 'rfi-2026-001',
    rfiNumber: 'RFI-2026-001',
    title: '主泵站高低壓變壓器繞組等級與耐溫標準規格疑義',
    category: 'spec_query',
    question: `在原招標文件 E-04 規範中，高低壓變壓器指定為 F 級絕緣 (155°C)，但最新技術附錄要求需符合 H 級 (180°C) 並具備低噪音防震基座。
請問施工團隊是否依 H 級最新規格辦理採購？預估對原定供貨期程是否產生延遲影響？

請工程設計處與電機工程師儘速確認。`,
    officialAnswer: `【電機設計處 官方正式答覆】
經與業主機電專案小組審查會議決議：
1. 確定變更採用 H 級 (180°C) 乾式低噪音變壓器，確保長時滿載運轉壽命。
2. 設備廠商已預留產線，供貨時程維持原訂 2026 年 10 月 12 日不變。
3. 相關成本微幅差額已列入第二次專案變更預算追加簽呈中。`,
    answeredBy: 'usr-pm',
    answeredAt: '2026-09-07T14:30:00Z',
    status: 'answered',
    raisedBy: 'usr-client',
    assignedTo: 'usr-pm',
    dueDate: '2026-09-10',
    requiredResponseDate: '2026-09-08',
    linkedCardId: 'card-101',
    attachments: [
      {
        id: 'att-rfi-1',
        entityType: 'RFI',
        entityId: 'rfi-2026-001',
        fileName: 'transformer_spec_sheet_v2.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        fileSize: 3450000,
        fileType: 'application/pdf',
        uploadedBy: 'usr-client',
        uploadedAt: '2026-09-05T09:00:00Z',
        previewType: 'pdf'
      }
    ],
    thread: [
      {
        id: 'msg-1',
        userId: 'usr-client',
        message: '已附上業主監造顧問建議書，請林經理(@yating.lin)與陳工程師核對。',
        timestamp: '2026-09-05T09:15:00Z'
      },
      {
        id: 'msg-2',
        userId: 'usr-member',
        message: '確認已收到文件，目前正與變壓器原廠研華技師核對尺寸，基座固定螺栓規格相符。',
        timestamp: '2026-09-06T10:40:00Z'
      },
      {
        id: 'msg-3',
        userId: 'usr-pm',
        message: '官方答覆已送審並呈報核定，已將本單狀態更新為 Answered。',
        timestamp: '2026-09-07T14:32:00Z',
        isOfficial: true
      }
    ],
    createdAt: '2026-09-05T08:30:00Z',
    updatedAt: '2026-09-07T14:32:00Z'
  },
  {
    id: 'rfi-2026-002',
    rfiNumber: 'RFI-2026-002',
    title: 'PLC 與 SCADA 通訊協定 Modbus-TCP 輪詢超時與時程影響',
    category: 'schedule_impact',
    question: '現場測試時發現西門子 S7-1500 與既有廠區 Modbus Gateway 存在 350ms 延遲，超過設計規範的 100ms。是否允許調寬逾時門檻？還是需要採購專用通訊介面卡？',
    status: 'under_review',
    raisedBy: 'usr-member',
    assignedTo: 'usr-admin',
    dueDate: '2026-09-16',
    requiredResponseDate: '2026-09-14',
    attachments: [],
    thread: [
      {
        id: 'msg-4',
        userId: 'usr-member',
        message: '已記錄網路抓包 log，正等待技術主管 @alex.chang 協助檢視。',
        timestamp: '2026-09-08T16:00:00Z'
      }
    ],
    createdAt: '2026-09-08T15:00:00Z',
    updatedAt: '2026-09-08T16:00:00Z'
  },
  {
    id: 'rfi-2026-003',
    rfiNumber: 'RFI-2026-003',
    title: '廠房二期加裝防爆等級 (ATEX Zone 1) 氣體感測器預算調整',
    category: 'cost_impact',
    question: '因應勞安主管機關最新查核指示，化學品加藥間須升級為 ATEX Zone 1 防爆防護等級，增加氣體偵測器 6 組及防爆配管線槽。',
    status: 'submitted',
    raisedBy: 'usr-pm',
    assignedTo: 'usr-client',
    dueDate: '2026-09-25',
    requiredResponseDate: '2026-09-20',
    attachments: [],
    thread: [],
    createdAt: '2026-09-09T11:00:00Z',
    updatedAt: '2026-09-09T11:00:00Z'
  },
  {
    id: 'rfi-2026-004',
    rfiNumber: 'RFI-2026-004',
    title: '即時監控面板 HTML 與 SVG 動態管線渲染規格確認',
    category: 'design_change',
    question: '為求現場維護人員能在瀏覽器平滑檢視管線流動動畫，提案使用純 HTML5 + CSS3 代碼渲染，無需 Flash 或重型外掛。',
    status: 'draft',
    raisedBy: 'usr-member',
    assignedTo: 'usr-pm',
    dueDate: '2026-09-30',
    requiredResponseDate: '2026-09-28',
    attachments: [],
    thread: [],
    createdAt: '2026-09-10T09:20:00Z',
    updatedAt: '2026-09-10T09:20:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-member',
    title: 'RFI 官方答覆通知',
    content: '林專案經理 已對 RFI-2026-001 (變壓器規格疑義) 發布官方正式答覆。',
    type: 'rfi_status',
    read: false,
    link: 'rfi-2026-001',
    createdAt: '2026-09-07T14:32:00Z'
  },
  {
    id: 'notif-2',
    userId: 'usr-member',
    title: '卡片指派通知',
    content: '您被指派至卡片：「實作 SCADA 即時遙測 HTML 監控面板」。',
    type: 'assignment',
    read: false,
    link: 'card-101',
    createdAt: '2026-09-02T10:15:00Z'
  },
  {
    id: 'notif-3',
    userId: 'usr-admin',
    title: 'RFI 審核指派通知',
    content: '陳冠宇 在 RFI-2026-002 (Modbus-TCP 輪詢超時) 提及了您。',
    type: 'mention',
    read: true,
    link: 'rfi-2026-002',
    createdAt: '2026-09-08T16:00:00Z'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    entityType: 'RFI',
    entityId: 'rfi-2026-001',
    entityTitle: 'RFI-2026-001 變壓器規格疑義',
    action: '發布官方答覆',
    details: '狀態由 Under Review 轉為 Answered，並附註官方裁決',
    userId: 'usr-pm',
    timestamp: '2026-09-07T14:32:00Z'
  },
  {
    id: 'log-2',
    entityType: 'Card',
    entityId: 'card-101',
    entityTitle: '實作 SCADA 即時遙測 HTML 監控面板',
    action: '變更狀態',
    details: '從「待處理」拖曳移至「進行中」',
    userId: 'usr-member',
    timestamp: '2026-09-06T11:20:00Z'
  },
  {
    id: 'log-3',
    entityType: 'Card',
    entityId: 'card-101',
    entityTitle: '實作 SCADA 即時遙測 HTML 監控面板',
    action: '更新 HTML 程式碼附件',
    details: '嵌入 SCADA 直播遙測儀表板代碼，支援前端同步預覽',
    userId: 'usr-member',
    timestamp: '2026-09-06T15:45:00Z'
  },
  {
    id: 'log-4',
    entityType: 'RFI',
    entityId: 'rfi-2026-002',
    entityTitle: 'RFI-2026-002 Modbus-TCP 輪詢超時',
    action: '建立 RFI 單',
    details: '陳冠宇 提出時程影響評估申請，指定 張維哲 審查',
    userId: 'usr-member',
    timestamp: '2026-09-08T15:00:00Z'
  }
];

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
  js: string;
}

export const CODE_TEMPLATES: CodeTemplate[] = [
  {
    id: 'rfi-official-memo',
    name: 'RFI 官方答覆審驗報告 (Engineering Memo)',
    description: '標準工程 RFI 正式回覆單據格式，支援公司抬頭、編號戳記與核可印章',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .memo-card { max-width: 650px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 20px; font-weight: 700; color: #0f172a; }
    .rfi-badge { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-family: monospace; font-size: 14px; }
    .grid-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f1f5f9; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
    .meta-item b { color: #475569; display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 2px; }
    .section-title { font-size: 14px; font-weight: 600; color: #334155; margin-top: 20px; margin-bottom: 8px; border-left: 3px solid #0ea5e9; padding-left: 8px; }
    .content-box { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; font-size: 14px; line-height: 1.6; }
    .official-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; color: #166534; font-size: 14px; line-height: 1.6; margin-top: 16px; position: relative; }
    .stamp { position: absolute; right: 20px; bottom: 12px; border: 2px solid #16a34a; color: #16a34a; font-weight: bold; font-size: 12px; padding: 4px 8px; border-radius: 4px; transform: rotate(-5deg); text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="memo-card">
    <div class="header">
      <div>
        <div class="title">工程資訊需求單 (RFI) 官方回執備忘錄</div>
        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">智慧製造核心系統 - 機電與自動化標段</div>
      </div>
      <div class="rfi-badge">RFI-2026-001</div>
    </div>

    <div class="grid-meta">
      <div class="meta-item"><b>發起人員 (Raised By)</b>王大同 (業主專案監察總監)</div>
      <div class="meta-item"><b>審查專案經理 (PM Reviewer)</b>林雅婷 (工程管理處)</div>
      <div class="meta-item"><b>提問類別 (Category)</b>規格疑義 (Spec Query)</div>
      <div class="meta-item"><b>答覆日期 (Response Date)</b>2026-09-07 (依限回覆)</div>
    </div>

    <div class="section-title">原始需求確認與提問事項</div>
    <div class="content-box">
      原招標 E-04 規範高低壓變壓器指定 F 級絕緣 (155°C)，但技術附錄建議 H 級 (180°C)。施工團隊是否依 H 級辦理採購？期程是否受影響？
    </div>

    <div class="section-title">官方正式答覆意見 (Official Ruling)</div>
    <div class="official-box">
      <b>裁決：確定變更採購 H 級乾式低噪音變壓器。</b><br/>
      1. 製造商已備料鎖定產線，預計於 2026-10-12 準時出廠交貨，無工期延誤風險。<br/>
      2. 規格升級價差已核定於專案第二期工程追加預算案。<br/>
      <div class="stamp">Approved / 已核可</div>
    </div>
  </div>
</body>
</html>`,
    css: `/* 可於下方直接自訂擴充樣式 */`,
    js: `// 即時交互腳本
console.log("RFI 官方答覆備忘錄已就緒。");`
  },
  {
    id: 'scada-widget',
    name: '即時 SCADA 遙測儀表 (Live Telemetry Widget)',
    description: '具有動態指針、壓力刻度、即時警報切換之工程監控組件',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 24px; background: #0b1120; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #e2e8f0; display: flex; justify-content: center; }
    .widget-container { width: 100%; max-width: 480px; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .status-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .status-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #064e3b; color: #34d399; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #34d399; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.3); } }
    .gauge-display { text-align: center; margin: 24px 0; }
    .value-huge { font-size: 48px; font-weight: 800; letter-spacing: -1px; color: #38bdf8; }
    .unit { font-size: 18px; color: #94a3b8; font-weight: 400; margin-left: 4px; }
    .label { color: #94a3b8; font-size: 13px; margin-top: 4px; }
    .meter-bar { height: 12px; background: #334155; border-radius: 6px; overflow: hidden; position: relative; margin-top: 12px; }
    .meter-fill { height: 100%; width: 68%; background: linear-gradient(90deg, #10b981 0%, #0284c7 60%, #f59e0b 100%); transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; }
    .stat-col { text-align: center; }
    .stat-val { font-size: 16px; font-weight: 700; color: #f8fafc; }
    .stat-lbl { font-size: 11px; color: #64748b; margin-top: 2px; }
    .btn-action { margin-top: 20px; width: 100%; padding: 10px; background: #0284c7; hover: #0369a1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: inherit; font-size: 13px; }
    .btn-action:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="widget-container">
    <div class="status-header">
      <div class="status-tag">
        <span class="pulse-dot"></span> SCADA LIVE 500ms
      </div>
      <span style="font-size: 12px; color: #64748b;">PUMP-STATION #02</span>
    </div>

    <div class="gauge-display">
      <div class="value-huge"><span id="metric-val">4.82</span><span class="unit">Bar</span></div>
      <div class="label">主給水管線即時水壓 (安全範圍: 3.5 ~ 6.0 Bar)</div>
      
      <div class="meter-bar">
        <div class="meter-fill" id="meter-fill"></div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-col">
        <div class="stat-val" id="temp-val">42.8 °C</div>
        <div class="stat-lbl">軸承溫度</div>
      </div>
      <div class="stat-col">
        <div class="stat-val" id="flow-val">320 L/m</div>
        <div class="stat-lbl">瞬間流量</div>
      </div>
      <div class="stat-col">
        <div class="stat-val" style="color: #34d399;">NORMAL</div>
        <div class="stat-lbl">運轉狀態</div>
      </div>
    </div>

    <button class="btn-action" onclick="simulateDataPulse()">⚡ 觸發即時遙測脈衝更新</button>
  </div>

  <script>
    function simulateDataPulse() {
      const val = (4.0 + Math.random() * 1.5).toFixed(2);
      document.getElementById('metric-val').innerText = val;
      const percent = Math.min(100, Math.max(10, (val / 7.0) * 100));
      document.getElementById('meter-fill').style.width = percent + '%';
      document.getElementById('temp-val').innerText = (40 + Math.random() * 5).toFixed(1) + ' °C';
      document.getElementById('flow-val').innerText = Math.floor(300 + Math.random() * 50) + ' L/m';
    }
  </script>
</body>
</html>`,
    css: ``,
    js: `// SCADA Live Telemetry Script Ready`
  },
  {
    id: 'kanban-burn-down',
    name: '敏捷衝刺交付指標卡 (Sprint Delivery Badge)',
    description: '視覺化 Sprint 里程碑進度、剩餘故事點 (Story Points) 與驗收倒數',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 24px; font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; }
    .card { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .badge { font-size: 12px; font-weight: 700; background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 9999px; }
    .title { font-size: 18px; font-weight: 800; color: #1e293b; }
    .progress-bar-bg { height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; margin: 16px 0; }
    .progress-bar-fill { height: 100%; width: 78%; background: linear-gradient(90deg, #6366f1, #3b82f6); }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f8fafc; padding: 14px; border-radius: 12px; text-align: center; }
    .num { font-size: 22px; font-weight: 800; color: #0f172a; }
    .desc { font-size: 12px; color: #64748b; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="top">
      <span class="badge">SPRINT 24 (ACTIVE)</span>
      <span style="font-size: 12px; color: #64748b;">剩餘 4 工作天</span>
    </div>
    <div class="title">智慧製造 MES 第二階段交付進度</div>
    <div style="font-size: 13px; color: #64748b; margin-top: 4px;">團隊速率：32 pts / 燃盡率達 78%</div>
    
    <div class="progress-bar-bg">
      <div class="progress-bar-fill"></div>
    </div>

    <div class="metrics">
      <div>
        <div class="num">28 / 36</div>
        <div class="desc">完成故事點</div>
      </div>
      <div>
        <div class="num" style="color: #059669;">100%</div>
        <div class="desc">RFI 結案率</div>
      </div>
      <div>
        <div class="num" style="color: #4f46e5;">0 阻礙</div>
        <div class="desc">技術阻礙單</div>
      </div>
    </div>
  </div>
</body>
</html>`,
    css: ``,
    js: `console.log("Sprint badge rendered.");`
  }
];
