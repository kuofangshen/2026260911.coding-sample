import React, { useState } from 'react';
import { 
  Trello, 
  FileQuestion, 
  Code2, 
  BarChart3, 
  Server, 
  History, 
  Bell, 
  ChevronDown, 
  Shield, 
  Check, 
  Layers,
  CalendarRange
} from 'lucide-react';
import { Board, User, AppNotification } from '../types';
import { ROLE_PERMISSIONS, formatDateTime } from '../utils';

interface NavbarProps {
  currentTab: 'kanban' | 'gantt' | 'rfi' | 'htmlStudio' | 'analytics' | 'apiConsole' | 'auditLogs';
  onTabChange: (tab: 'kanban' | 'gantt' | 'rfi' | 'htmlStudio' | 'analytics' | 'apiConsole' | 'auditLogs') => void;
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (boardId: string) => void;
  users: User[];
  currentUser: User;
  onSwitchUser: (user: User) => void;
  notifications: AppNotification[];
  onNotificationClick: (notif: AppNotification) => void;
  onMarkAllNotificationsRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  boards,
  activeBoardId,
  onSelectBoard,
  users,
  currentUser,
  onSwitchUser,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);
  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];
  const roleConfig = ROLE_PERMISSIONS[currentUser.role];

  return (
    <header className="bg-white text-black border-b-2 border-black shrink-0 z-40 sticky top-0 select-none bg-texture-lines">
      {/* Top Main Nav */}
      <div className="px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Board Switcher */}
        <div className="flex items-center gap-5 min-w-0">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-mono font-bold text-sm border border-black">
              KR
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif font-bold text-base tracking-tight text-black leading-none">
                KANBAN & RFI SYSTEM
              </h1>
              <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase block mt-1">
                MINIMALIST MONOCHROME EDITION
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-black hidden md:block" />

          {/* Board Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-black px-2.5 py-1 text-xs font-mono">
            <Layers className="w-3.5 h-3.5 text-black shrink-0" strokeWidth={1.5} />
            <select
              value={activeBoardId}
              onChange={(e) => onSelectBoard(e.target.value)}
              className="bg-white text-black font-mono font-semibold focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[240px] truncate"
              id="select-active-board"
            >
              {boards.map(b => (
                <option key={b.id} value={b.id} className="bg-white text-black font-mono">
                  {b.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => onTabChange('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-wider transition-colors duration-100 ${
              currentTab === 'kanban' 
                ? 'bg-black text-white border border-black font-bold' 
                : 'text-black border border-transparent hover:border-black hover:bg-neutral-100'
            }`}
            id="tab-kanban"
          >
            <Trello className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>敏捷看板</span>
          </button>

          <button
            onClick={() => onTabChange('gantt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-wider transition-colors duration-100 ${
              currentTab === 'gantt' 
                ? 'bg-black text-white border border-black font-bold' 
                : 'text-black border border-transparent hover:border-black hover:bg-neutral-100'
            }`}
            id="tab-gantt"
          >
            <CalendarRange className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>專案甘特圖</span>
          </button>

          <button
            onClick={() => onTabChange('rfi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-wider transition-colors duration-100 ${
              currentTab === 'rfi' 
                ? 'bg-black text-white border border-black font-bold' 
                : 'text-black border border-transparent hover:border-black hover:bg-neutral-100'
            }`}
            id="tab-rfi"
          >
            <FileQuestion className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>RFI 需求單</span>
          </button>

          <button
            onClick={() => onTabChange('htmlStudio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-wider transition-colors duration-100 ${
              currentTab === 'htmlStudio' 
                ? 'bg-black text-white border border-black font-bold' 
                : 'text-black border border-transparent hover:border-black hover:bg-neutral-100'
            }`}
            id="tab-html-studio"
          >
            <Code2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>HTML 編輯器</span>
            <span className="bg-black text-white text-[9px] font-mono px-1 py-0.2 uppercase border border-white">
              LIVE
            </span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-wider transition-colors duration-100 ${
              currentTab === 'analytics' 
                ? 'bg-black text-white border border-black font-bold' 
                : 'text-black border border-transparent hover:border-black hover:bg-neutral-100'
            }`}
            id="tab-analytics"
          >
            <BarChart3 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>報表分析</span>
          </button>

          <button
            onClick={() => onTabChange('apiConsole')}
            className={`flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-wider transition-colors duration-100 ${
              currentTab === 'apiConsole' 
                ? 'bg-black text-white border border-black font-bold' 
                : 'text-black border border-transparent hover:border-black hover:bg-neutral-100'
            }`}
            id="tab-api-console"
          >
            <Server className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>API 規範</span>
          </button>

          <button
            onClick={() => onTabChange('auditLogs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-wider transition-colors duration-100 ${
              currentTab === 'auditLogs' 
                ? 'bg-black text-white border border-black font-bold' 
                : 'text-black border border-transparent hover:border-black hover:bg-neutral-100'
            }`}
            id="tab-audit-logs"
          >
            <History className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>稽核歷程</span>
          </button>
        </nav>

        {/* Right: Role Switcher & Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-neutral-100 border border-black text-xs font-mono font-semibold text-black transition-colors duration-100"
              title="切換使用者角色 (RBAC 模擬)"
              id="btn-role-switcher"
            >
              <Shield className="w-3.5 h-3.5 text-black" strokeWidth={1.5} />
              <span className="hidden sm:inline">角色:</span>
              <span className={`px-1.5 py-0.2 text-[10px] uppercase font-mono ${roleConfig.badgeBg} ${roleConfig.badgeColor}`}>
                {roleConfig.label.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-black" strokeWidth={1.5} />
            </button>

            {/* Role Dropdown */}
            {showRoleMenu && (
              <div 
                className="absolute right-0 mt-1 w-64 bg-white border-2 border-black py-1 z-50 text-xs font-mono"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-2 border-b border-black text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-100">
                  切換測試使用者角色 (RBAC)
                </div>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchUser(u)}
                    className="w-full px-3 py-2 text-left hover:bg-black hover:text-white flex items-center justify-between transition-colors duration-100 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={u.avatar} 
                        alt={u.name} 
                        className="w-6 h-6 border border-black object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-black group-hover:text-white">{u.name}</div>
                        <div className="text-[10px] text-neutral-500 group-hover:text-neutral-300 uppercase">{u.title}</div>
                      </div>
                    </div>
                    {currentUser.id === u.id && (
                      <Check className="w-4 h-4 text-black group-hover:text-white" strokeWidth={2} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-1.5 text-black hover:bg-black hover:text-white border border-black transition-colors duration-100 relative"
              id="btn-notifications-bell"
            >
              <Bell className="w-4 h-4" strokeWidth={1.5} />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white border border-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notifications Popover Drawer */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white border-2 border-black overflow-hidden z-50 text-xs">
                <div className="p-3 border-b-2 border-black flex items-center justify-between bg-black text-white">
                  <div className="flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider">
                    <Bell className="w-4 h-4 text-white" strokeWidth={1.5} />
                    <span>站內推播通知 ({notifications.length})</span>
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-[10px] text-white hover:underline uppercase font-mono tracking-widest font-semibold"
                    >
                      全部標為已讀
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-black font-sans">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-neutral-500 italic font-serif">尚無任何通知</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onNotificationClick(n);
                          setShowNotifMenu(false);
                        }}
                        className={`p-3.5 hover:bg-neutral-100 transition-colors duration-100 cursor-pointer space-y-1 ${
                          !n.read ? 'bg-neutral-50 border-l-4 border-black' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-serif font-bold ${!n.read ? 'text-black' : 'text-neutral-600'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {formatDateTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-neutral-700 text-xs leading-relaxed font-serif">
                          {n.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current User Avatar */}
          <div className="flex items-center pl-1">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 border-2 border-black object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Subnav for Mobile / Tablet screens */}
      <div className="xl:hidden px-4 py-2 border-t border-black bg-neutral-100 flex items-center gap-2 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => onTabChange('kanban')}
          className={`px-3 py-1 shrink-0 border border-black uppercase ${currentTab === 'kanban' ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          敏捷看板
        </button>
        <button
          onClick={() => onTabChange('gantt')}
          className={`px-3 py-1 shrink-0 border border-black uppercase ${currentTab === 'gantt' ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          專案甘特圖
        </button>
        <button
          onClick={() => onTabChange('rfi')}
          className={`px-3 py-1 shrink-0 border border-black uppercase ${currentTab === 'rfi' ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          RFI 需求單
        </button>
        <button
          onClick={() => onTabChange('htmlStudio')}
          className={`px-3 py-1 shrink-0 border border-black uppercase flex items-center gap-1 ${currentTab === 'htmlStudio' ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          <Code2 className="w-3 h-3" strokeWidth={1.5} /> HTML 編輯器
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-3 py-1 shrink-0 border border-black uppercase ${currentTab === 'analytics' ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          報表分析
        </button>
        <button
          onClick={() => onTabChange('apiConsole')}
          className={`px-3 py-1 shrink-0 border border-black uppercase ${currentTab === 'apiConsole' ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          API 規範
        </button>
        <button
          onClick={() => onTabChange('auditLogs')}
          className={`px-3 py-1 shrink-0 border border-black uppercase ${currentTab === 'auditLogs' ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          稽核歷程
        </button>
      </div>
    </header>
  );
};
