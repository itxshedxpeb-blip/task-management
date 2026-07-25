'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackingApi } from '../services/trackingApi';

function trackingKey(entityType: string, entityId?: string) {
  return ['tracking', entityType, entityId].filter(Boolean);
}

// ─── UNIFIED TRACKING ────────────────────────────────────

export function useTrackingData(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['tracking', entityType, entityId, 'all'],
    queryFn: () => trackingApi.getTracking(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

// ─── STATUS ──────────────────────────────────────────────

export function useStatus(entityType: string, entityId: string) {
  return useQuery({
    queryKey: trackingKey(entityType, entityId),
    queryFn: () => trackingApi.getStatus(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function usePipeline(entityType: string) {
  return useQuery({
    queryKey: ['tracking', entityType, 'pipeline'],
    queryFn: () => trackingApi.getPipeline(entityType),
    enabled: !!entityType,
  });
}

export function useChangeStatus(entityType: string, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ status, reason }: { status: string; reason?: string }) =>
      trackingApi.changeStatus(entityType, entityId, status, reason),
    onSuccess: () => {
      // Invalidate tracking queries
      queryClient.invalidateQueries({ queryKey: trackingKey(entityType, entityId) });
      queryClient.invalidateQueries({ queryKey: ['tracking', entityType, entityId, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['tracking', entityType, entityId, 'all'] });
      
      // Invalidate dashboard to ensure stats stay synchronized
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── TIMELINE ────────────────────────────────────────────

export function useTimeline(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['tracking', entityType, entityId, 'timeline'],
    queryFn: () => trackingApi.getTimeline(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

// ─── COMMENTS ────────────────────────────────────────────

export function useComments(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['tracking', entityType, entityId, 'comments'],
    queryFn: () => trackingApi.getComments(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useAddComment(entityType: string, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      trackingApi.addComment(entityType, entityId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking', entityType, entityId, 'comments'] });
    },
  });
}

export function useDeleteComment(entityType: string, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => trackingApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking', entityType, entityId, 'comments'] });
    },
  });
}

// ─── ATTACHMENTS ─────────────────────────────────────────

export function useAttachments(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['tracking', entityType, entityId, 'attachments'],
    queryFn: () => trackingApi.getAttachments(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useAddAttachment(entityType: string, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof trackingApi.addAttachment>[2]) =>
      trackingApi.addAttachment(entityType, entityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking', entityType, entityId, 'attachments'] });
    },
  });
}

export function useDeleteAttachment(entityType: string, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) => trackingApi.deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking', entityType, entityId, 'attachments'] });
    },
  });
}

// ─── APPROVALS ───────────────────────────────────────────

export function useApprovals(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['tracking', entityType, entityId, 'approvals'],
    queryFn: () => trackingApi.getApprovals(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useRequestApproval(entityType: string, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ approverId, level }: { approverId: string; level?: number }) =>
      trackingApi.requestApproval(entityType, entityId, approverId, level),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking', entityType, entityId, 'approvals'] });
    },
  });
}

export function useRespondToApproval(entityType: string, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ approvalId, status, comment }: { approvalId: string; status: 'Approved' | 'Rejected'; comment?: string }) =>
      trackingApi.respondToApproval(approvalId, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking', entityType, entityId, 'approvals'] });
      queryClient.invalidateQueries({ queryKey: trackingKey(entityType, entityId) });
    },
  });
}

// ─── NOTIFICATIONS ───────────────────────────────────────

export function useNotifications(unreadOnly?: boolean) {
  return useQuery({
    queryKey: ['notifications', { unreadOnly }],
    queryFn: () => trackingApi.getNotifications(unreadOnly),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trackingApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => trackingApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
