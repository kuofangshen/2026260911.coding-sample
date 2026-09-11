import { RfiCategory, RfiStatus, Priority, UserRole } from './types';

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

export function generateRfiNumber(existingCount: number): string {
  const nextNum = existingCount + 1;
  return `RFI-2026-${String(nextNum).padStart(3, '0')}`;
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  urgent: { label: '緊急 (Urgent)', color: 'text-white', bg: 'bg-black', border: 'border-black' },
  high: { label: '高 (High)', color: 'text-black', bg: 'bg-white', border: 'border-2 border-black' },
  medium: { label: '中 (Medium)', color: 'text-black', bg: 'bg-white', border: 'border border-black' },
  low: { label: '低 (Low)', color: 'text-neutral-600', bg: 'bg-neutral-100', border: 'border border-neutral-300' },
};

export const RFI_STATUS_CONFIG: Record<RfiStatus, { label: string; step: number; color: string; bg: string; border: string }> = {
  draft: { label: '草稿 (Draft)', step: 1, color: 'text-neutral-600', bg: 'bg-white', border: 'border border-dashed border-neutral-400' },
  submitted: { label: '已提交 (Submitted)', step: 2, color: 'text-black', bg: 'bg-white', border: 'border border-black' },
  under_review: { label: '處理中 (Under Review)', step: 3, color: 'text-black', bg: 'bg-neutral-100', border: 'border-2 border-black' },
  answered: { label: '已答覆 (Answered)', step: 4, color: 'text-black', bg: 'bg-neutral-200', border: 'border border-black' },
  closed: { label: '已結案 (Closed)', step: 5, color: 'text-white', bg: 'bg-black', border: 'border border-black' },
};

export const RFI_CATEGORY_CONFIG: Record<RfiCategory, { label: string; color: string; bg: string }> = {
  design_change: { label: '設計變更', color: 'text-black', bg: 'bg-white border border-black' },
  spec_query: { label: '規格疑義', color: 'text-black', bg: 'bg-neutral-100 border border-black' },
  schedule_impact: { label: '時程影響', color: 'text-white', bg: 'bg-black border border-black' },
  cost_impact: { label: '成本影響', color: 'text-black', bg: 'bg-white border-2 border-black' },
};

export const ROLE_PERMISSIONS: Record<UserRole, {
  label: string;
  badgeBg: string;
  badgeColor: string;
  canManageUsers: boolean;
  canCreateDeleteBoard: boolean;
  canModifyColumns: boolean;
  canApproveRfi: boolean;
  canCloseRfi: boolean;
  canMoveCards: boolean;
  canCreateCards: boolean;
  canSubmitRfi: boolean;
  canReplyRfi: boolean;
  canManageAttachments: boolean;
}> = {
  admin: {
    label: '系統管理者 (Admin)',
    badgeBg: 'bg-black',
    badgeColor: 'text-white',
    canManageUsers: true,
    canCreateDeleteBoard: true,
    canModifyColumns: true,
    canApproveRfi: true,
    canCloseRfi: true,
    canMoveCards: true,
    canCreateCards: true,
    canSubmitRfi: true,
    canReplyRfi: true,
    canManageAttachments: true,
  },
  pm: {
    label: '專案經理 (PM)',
    badgeBg: 'bg-white border border-black',
    badgeColor: 'text-black',
    canManageUsers: false,
    canCreateDeleteBoard: true,
    canModifyColumns: true,
    canApproveRfi: true,
    canCloseRfi: true,
    canMoveCards: true,
    canCreateCards: true,
    canSubmitRfi: true,
    canReplyRfi: true,
    canManageAttachments: true,
  },
  member: {
    label: '團隊成員 (Member)',
    badgeBg: 'bg-neutral-100 border border-neutral-300',
    badgeColor: 'text-black',
    canManageUsers: false,
    canCreateDeleteBoard: false,
    canModifyColumns: false,
    canApproveRfi: false,
    canCloseRfi: false,
    canMoveCards: true,
    canCreateCards: true,
    canSubmitRfi: true,
    canReplyRfi: true,
    canManageAttachments: true,
  },
  client: {
    label: '外部訪客/客戶 (Client)',
    badgeBg: 'bg-white border border-dashed border-black',
    badgeColor: 'text-black',
    canManageUsers: false,
    canCreateDeleteBoard: false,
    canModifyColumns: false,
    canApproveRfi: false,
    canCloseRfi: false,
    canMoveCards: false,
    canCreateCards: false,
    canSubmitRfi: true,
    canReplyRfi: true,
    canManageAttachments: true,
  },
};
