import { api, ApiResponse } from '@/core/api';
import {
  StatusInfo,
  StatusPipeline,
  TimelineEntry,
  Comment,
  Attachment,
  ApprovalRequest,
  Notification,
  TrackingData,
} from '../types';

const base = '/tracking';

export const trackingApi = {
  // ─── UNIFIED TRACKING ────────────────────────────────────
  getTracking: (entityType: string, entityId: string) =>
    api.get<ApiResponse<TrackingData>>(`${base}/${entityType}/${entityId}`),

  // ─── STATUS ──────────────────────────────────────────────
  getStatus: (entityType: string, entityId: string) =>
    api.get<ApiResponse<StatusInfo>>(`${base}/${entityType}/${entityId}/status`),

  getPipeline: (entityType: string) =>
    api.get<ApiResponse<StatusPipeline[]>>(`${base}/${entityType}/pipeline`),

  changeStatus: (entityType: string, entityId: string, status: string, reason?: string) =>
    api.post<ApiResponse<StatusInfo>>(`${base}/${entityType}/${entityId}/status`, { status, reason }),

  // ─── TIMELINE ────────────────────────────────────────────
  getTimeline: (entityType: string, entityId: string) =>
    api.get<ApiResponse<TimelineEntry[]>>(`${base}/${entityType}/${entityId}/timeline`),

  // ─── COMMENTS ────────────────────────────────────────────
  getComments: (entityType: string, entityId: string) =>
    api.get<ApiResponse<Comment[]>>(`${base}/${entityType}/${entityId}/comments`),

  addComment: (entityType: string, entityId: string, content: string, parentId?: string) =>
    api.post<ApiResponse<Comment>>(`${base}/${entityType}/${entityId}/comments`, { content, parentId }),

  deleteComment: (commentId: string) =>
    api.delete<ApiResponse<Comment>>(`${base}/comments/${commentId}`),

  // ─── ATTACHMENTS ────────────────────────────────────────
  getAttachments: (entityType: string, entityId: string) =>
    api.get<ApiResponse<Attachment[]>>(`${base}/${entityType}/${entityId}/attachments`),

  addAttachment: (entityType: string, entityId: string, data: {
    fileName: string; originalName: string;
    mimeType: string; size: number; url: string; category?: string;
  }) => api.post<ApiResponse<Attachment>>(`${base}/${entityType}/${entityId}/attachments`, data),

  deleteAttachment: (attachmentId: string) =>
    api.delete<ApiResponse<Attachment>>(`${base}/attachments/${attachmentId}`),

  // ─── APPROVALS ──────────────────────────────────────────
  getApprovals: (entityType: string, entityId: string) =>
    api.get<ApiResponse<ApprovalRequest[]>>(`${base}/${entityType}/${entityId}/approvals`),

  requestApproval: (entityType: string, entityId: string, approverId: string, level?: number) =>
    api.post<ApiResponse<ApprovalRequest>>(`${base}/${entityType}/${entityId}/approvals`, { approverId, level }),

  respondToApproval: (approvalId: string, status: 'Approved' | 'Rejected', comment?: string) =>
    api.patch<ApiResponse<ApprovalRequest>>(`${base}/approvals/${approvalId}`, { status, comment }),

  // ─── NOTIFICATIONS ──────────────────────────────────────
  getNotifications: (unreadOnly?: boolean) =>
    api.get<ApiResponse<Notification[]>>(`${base}/notifications`, { params: { unreadOnly } }),

  markNotificationRead: (id: string) =>
    api.patch<ApiResponse<void>>(`${base}/notifications/${id}/read`),

  markAllNotificationsRead: () =>
    api.post<ApiResponse<void>>(`${base}/notifications/read-all`),
};
