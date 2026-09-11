export type UserRole = 'admin' | 'pm' | 'member' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  title: string;
  department: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  entityType: 'Card' | 'RFI';
  entityId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // in bytes
  fileType: string;
  uploadedBy: string; // user id
  uploadedAt: string;
  previewType?: 'image' | 'pdf' | 'doc' | 'code' | 'other';
}

export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  startDate?: string;
  dueDate: string;
  phase?: string; // 階段/主任務分組
  tags: string[];
  assignees: string[]; // User IDs
  rfiId?: string; // Linked RFI ID
  checklist: ChecklistItem[];
  htmlSnippet?: string; // Embedded HTML deliverable/code
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  orderIndex: number;
  color?: string;
  maxCards?: number;
}

export interface Board {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  columns: Column[];
}

export type RfiStatus = 'draft' | 'submitted' | 'under_review' | 'answered' | 'closed';

export type RfiCategory = 'design_change' | 'spec_query' | 'schedule_impact' | 'cost_impact';

export interface RfiThreadMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  isOfficial?: boolean;
  attachments?: Attachment[];
}

export interface RFI {
  id: string;
  rfiNumber: string; // e.g. RFI-2026-001
  title: string;
  category: RfiCategory;
  question: string;
  officialAnswer?: string;
  answeredBy?: string;
  answeredAt?: string;
  status: RfiStatus;
  raisedBy: string; // user id
  assignedTo: string; // reviewer user id
  dueDate: string;
  requiredResponseDate: string;
  linkedCardId?: string;
  attachments: Attachment[];
  thread: RfiThreadMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'mention' | 'assignment' | 'rfi_status' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  entityType: 'Board' | 'Card' | 'RFI';
  entityId: string;
  entityTitle: string;
  action: string;
  details: string;
  userId: string;
  timestamp: string;
}
