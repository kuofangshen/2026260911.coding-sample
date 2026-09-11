import React, { useState } from 'react';
import { Send, Check, Copy, Server, Database } from 'lucide-react';
import { Board, Card, RFI, User } from '../types';

interface ApiConsoleProps {
  board: Board;
  cards: Card[];
  rfis: RFI[];
  users: User[];
  currentUser: User;
}

interface EndpointDef {
  id: string;
  section: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestBody?: string;
  mockResponse: (context: { board: Board; cards: Card[]; rfis: RFI[]; users: User[]; currentUser: User }) => any;
}

export const ApiConsole: React.FC<ApiConsoleProps> = ({
  board,
  cards,
  rfis,
  users,
  currentUser
}) => {
  const endpoints: EndpointDef[] = [
    {
      id: 'auth-me',
      section: '5.1 身份認證 (Auth)',
      method: 'GET',
      path: '/api/v1/auth/me',
      description: '取得當前登入者資訊與 RBAC 權限角色',
      mockResponse: ({ currentUser }) => ({
        success: true,
        data: {
          user: currentUser,
          token_type: 'Bearer',
          expires_in: 86400,
          permissions: ['cards.read', 'cards.write', 'rfis.read', 'rfis.reply']
        }
      })
    },
    {
      id: 'auth-login',
      section: '5.1 身份認證 (Auth)',
      method: 'POST',
      path: '/api/v1/auth/login',
      description: '使用者登入並簽發 JWT Token',
      requestBody: JSON.stringify({ email: 'alex.chang@megacorp.com', password: '••••••••••••' }, null, 2),
      mockResponse: ({ currentUser }) => ({
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3ItYWRtaW4iLCJyb2xlIjoiYWRtaW4ifQ...',
        user: currentUser
      })
    },
    {
      id: 'get-board',
      section: '5.2 看板與卡片 (Kanban & Cards)',
      method: 'GET',
      path: `/api/v1/boards/${board.id}`,
      description: '取得特定看板結構、工作流欄位與卡片清單',
      mockResponse: ({ board, cards }) => ({
        success: true,
        data: {
          board,
          cardsCount: cards.filter(c => c.boardId === board.id).length,
          cards: cards.filter(c => c.boardId === board.id)
        }
      })
    },
    {
      id: 'post-cards',
      section: '5.2 看板與卡片 (Kanban & Cards)',
      method: 'POST',
      path: '/api/v1/cards',
      description: '建立新卡片至指定工作流欄位',
      requestBody: JSON.stringify({
        board_id: board.id,
        column_id: board.columns[1]?.id || 'col-todo',
        title: '新增工程測試用卡片',
        description: '由 RESTful API v1 自動建立',
        priority: 'high',
        due_date: '2026-09-30'
      }, null, 2),
      mockResponse: ({ board }) => ({
        success: true,
        message: 'Card created successfully',
        data: {
          id: 'card-generated-' + Math.floor(Math.random() * 1000),
          board_id: board.id,
          title: '新增工程測試用卡片',
          status: 'created',
          created_at: new Date().toISOString()
        }
      })
    },
    {
      id: 'patch-card-pos',
      section: '5.2 看板與卡片 (Kanban & Cards)',
      method: 'PATCH',
      path: '/api/v1/cards/card-101/position',
      description: '拖拽卡片時更新目標欄位與排序 (Drag & Drop)',
      requestBody: JSON.stringify({
        target_column_id: 'col-in-progress',
        order_index: 0
      }, null, 2),
      mockResponse: () => ({
        success: true,
        message: 'Card position updated',
        updated_at: new Date().toISOString()
      })
    },
    {
      id: 'get-rfis',
      section: '5.3 RFI 追蹤 (RFI)',
      method: 'GET',
      path: '/api/v1/rfis?status=all&category=all',
      description: '條件篩選與分頁查詢 RFI 清單',
      mockResponse: ({ rfis }) => ({
        success: true,
        total: rfis.length,
        data: rfis
      })
    },
    {
      id: 'post-rfi-response',
      section: '5.3 RFI 追蹤 (RFI)',
      method: 'POST',
      path: '/api/v1/rfis/rfi-2026-001/responses',
      description: '提交或發布 RFI 回覆/官方答覆',
      requestBody: JSON.stringify({
        message: '已核對最新圖面，無衝突處。',
        is_official: false
      }, null, 2),
      mockResponse: ({ currentUser }) => ({
        success: true,
        message: 'Response posted',
        thread_id: 'msg-' + Date.now(),
        author: currentUser.name,
        timestamp: new Date().toISOString()
      })
    },
    {
      id: 'post-attachments',
      section: '5.4 檔案與附件 (Uploads)',
      method: 'POST',
      path: '/api/v1/attachments/upload',
      description: '上傳圖片/貼圖/工程文件 (回傳 URL 與 metadata)',
      requestBody: 'FormData: { file: (binary), entity_type: "Card", entity_id: "card-101" }',
      mockResponse: () => ({
        success: true,
        data: {
          id: 'att-' + Date.now(),
          file_name: 'transformer_schematic.png',
          file_url: 'https://storage.cloud.google.com/mes-bucket/transformer_schematic.png',
          file_size: 1420580,
          mime_type: 'image/png',
          uploaded_at: new Date().toISOString()
        }
      })
    }
  ];

  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(endpoints[0].id);
  const [responseOutput, setResponseOutput] = useState<string>('');
  const [executing, setExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedEndpoint = endpoints.find(e => e.id === selectedEndpointId) || endpoints[0];

  const handleExecuteRequest = () => {
    setExecuting(true);
    setTimeout(() => {
      const resp = selectedEndpoint.mockResponse({ board, cards, rfis, users, currentUser });
      setResponseOutput(JSON.stringify(resp, null, 2));
      setExecuting(false);
    }, 150);
  };

  const handleCopyResponse = () => {
    if (!responseOutput) return;
    navigator.clipboard.writeText(responseOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white overflow-y-auto" id="api-console-view">
      {/* Header */}
      <div className="bg-white border-b-2 border-black px-6 py-5 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Server className="w-5 h-5 text-black" strokeWidth={1.5} />
          <h2 className="text-2xl font-serif font-bold text-black uppercase">
            RESTful API 規格文件與互動測試台 (API CONSOLE)
          </h2>
        </div>
        <p className="text-xs font-mono text-neutral-600">
          依據規格說明書規劃，以 RESTful + JSON + JWT 實作前後端分離通信介面
        </p>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Side: Endpoints Directory */}
        <div className="w-full lg:w-1/3 space-y-4 font-mono">
          <div className="bg-white border-2 border-black p-4">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3 pb-2 border-b border-black">
              API 端點目錄 (ENDPOINTS DIRECTORY)
            </h3>

            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {endpoints.map(ep => {
                const isSelected = ep.id === selectedEndpointId;
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSelectedEndpointId(ep.id);
                      setResponseOutput('');
                    }}
                    className={`w-full text-left p-2.5 border-2 text-xs transition-colors duration-100 flex flex-col gap-1 ${
                      isSelected 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black border-neutral-300 hover:border-black'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold border ${isSelected ? 'border-white text-white' : 'border-black text-black'}`}>
                        {ep.method}
                      </span>
                      <span className="font-bold truncate">
                        {ep.path}
                      </span>
                    </div>
                    <span className={`text-[11px] truncate font-serif ${isSelected ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      {ep.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Database Schema Summary Card */}
          <div className="bg-white text-black p-4 border-2 border-black text-xs space-y-2 font-mono">
            <div className="flex items-center gap-2 font-bold uppercase pb-1 border-b border-black">
              <Database className="w-4 h-4 text-black" strokeWidth={1.5} />
              <span>SCHEMA 核心實體模型</span>
            </div>
            <div className="text-[11px] text-neutral-700 space-y-1">
              <div>• <b>Users</b>: id, name, email, role, created_at</div>
              <div>• <b>Boards & Columns</b>: id, title, order_index</div>
              <div>• <b>Cards</b>: id, col_id, title, priority, due_date</div>
              <div>• <b>RFIs</b>: id, rfi_number, status, raised_by</div>
              <div>• <b>Attachments</b>: id, entity_type, file_url</div>
            </div>
          </div>
        </div>

        {/* Right Side: Request Inspector & Runner */}
        <div className="w-full lg:w-2/3 space-y-4 font-mono">
          <div className="bg-white border-2 border-black p-6 space-y-5">
            {/* Endpoint Info Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-bold border-2 border-black bg-black text-white">
                  {selectedEndpoint.method}
                </span>
                <span className="font-bold text-black text-base">
                  {selectedEndpoint.path}
                </span>
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={executing}
                className="btn-mono-primary text-xs"
                id="btn-send-api-request"
              >
                <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{executing ? 'CONNECTING...' : '發送測試 (SEND)'}</span>
              </button>
            </div>

            <p className="text-xs font-serif text-neutral-700">
              {selectedEndpoint.description}
            </p>

            {/* Request Body if present */}
            {selectedEndpoint.requestBody && (
              <div>
                <div className="text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  REQUEST PAYLOAD (JSON):
                </div>
                <pre className="bg-neutral-100 text-black p-3 text-xs font-mono overflow-x-auto border border-black">
                  {selectedEndpoint.requestBody}
                </pre>
              </div>
            )}

            {/* Response Output */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-black uppercase tracking-wider">
                    RESPONSE PAYLOAD:
                  </span>
                  {responseOutput && (
                    <span className="text-[10px] font-mono font-bold text-black border border-black px-2 py-0.5">
                      STATUS: 200 OK • 12ms
                    </span>
                  )}
                </div>

                {responseOutput && (
                  <button
                    onClick={handleCopyResponse}
                    className="btn-mono-secondary text-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    <span>{copied ? 'COPIED' : 'COPY'}</span>
                  </button>
                )}
              </div>

              <div className="bg-white text-black p-4 text-xs font-mono min-h-[160px] max-h-[380px] overflow-auto border-2 border-black leading-relaxed">
                {responseOutput ? (
                  <pre>{responseOutput}</pre>
                ) : (
                  <div className="text-neutral-400 italic h-full flex items-center justify-center font-serif text-xs">
                    點擊右上角「發送測試 (SEND)」按鈕以檢視即時 JSON 響應。
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
