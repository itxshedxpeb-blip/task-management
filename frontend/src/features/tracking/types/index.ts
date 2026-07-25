export interface StatusPipeline {
  id: string;
  organizationId: string;
  entityType: string;
  status: string;
  label: string;
  order: number;
  isInitial: boolean;
  isFinal: boolean;
  isActive: boolean;
  allowedTransitions: string[];
  color?: string;
  icon?: string;
  metadata?: any;
}

export interface StatusHistory {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  fromStatus?: string | null;
  toStatus: string;
  changedById?: string | null;
  reason?: string | null;
  changedAt: string;
  metadata?: any;
}

export interface StatusInfo {
  currentStatus: string | null;
  allowedTransitions: string[];
  pipeline: StatusPipeline[];
  history: StatusHistory[];
}

export interface TimelineDetailField {
  label: string;
  value: string;
}

export interface TimelineRelatedRecord {
  label: string;
  value: string;
  code?: string | null;
}

export interface TimelineEntry {
  id: string;
  /** Business type of the card */
  type: 'status_change' | 'created' | 'updated' | 'activity' | 'comment' | 'attachment' | 'approval' | 'event' | 'audit';
  /** Business-language title — never raw event names */
  title: string;
  action?: string;
  description: string;
  timestamp: string;
  /** Resolved display name — never a database id */
  performedBy?: string | null;
  performedByRole?: string | null;
  department?: string | null;
  fromStatus?: string | null;
  toStatus?: string | null;
  reason?: string | null;
  details?: TimelineDetailField[];
  relatedRecords?: TimelineRelatedRecord[];
  displayCode?: string | null;
  entityLabel?: string;
  /** @deprecated internal only — UI must not render */
  userId?: string | null;
  metadata?: any;
  data?: any;
  children?: TimelineEntry[];
  icon?: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorRole?: string | null;
  department?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  /** @deprecated — prefer authorName; never show in UI */
  organizationId?: string;
  entityType?: string;
  entityId?: string;
  isDeleted?: boolean;
}

export interface Attachment {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category?: string | null;
  uploadedById?: string | null;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  level: number;
  requestedById: string;
  approverId: string;
  status: string;
  comment?: string | null;
  requestedAt: string;
  respondedAt?: string | null;
  metadata?: any;
}

export interface Notification {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

// ─── UNIFIED TRACKING RESPONSE ───────────────────────────

export interface PipelineStage {
  id: string;
  status: string;
  label: string;
  order: number;
  color?: string | null;
  isInitial: boolean;
  isFinal: boolean;
  isCurrent: boolean;
  isPast: boolean;
  allowedTransitions: string[];
}

export interface StageDetails {
  stage: string;
  title: string;
  fields?: Record<string, any>;
  entity?: Record<string, any> | null;
}

export interface TrackingData {
  currentStatus: string | null;
  currentStage: PipelineStage | null;
  allowedTransitions: string[];
  pipeline: PipelineStage[];
  progress: number;
  stageDetails: StageDetails | null;
  timeline: TimelineEntry[];
  comments: Comment[];
  attachments: Attachment[];
  approvals: ApprovalRequest[];
}
