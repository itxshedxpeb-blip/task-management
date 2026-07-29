import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api';

interface BackendResponse<T> {
  message?: string;
  data: T;
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  folder: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export function useNotes(params?: { folder?: string; search?: string }) {
  return useQuery({
    queryKey: ['notes', params],
    queryFn: async () => {
      const query: Record<string, any> = {};
      if (params?.folder) query.folder = params.folder;
      if (params?.search) query.search = params.search;
      const res = await api.get<BackendResponse<{ rows: Note[] }>>('/notes', { params: query });
      return res.data;
    },
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      const res = await api.get<BackendResponse<Note>>(`/notes/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content?: string; folder?: string; tags?: string[] }) =>
      api.post<BackendResponse<Note>>('/notes', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch<BackendResponse<Note>>(`/notes/${id}`, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      qc.invalidateQueries({ queryKey: ['note', variables.id] });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<BackendResponse<void>>(`/notes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
