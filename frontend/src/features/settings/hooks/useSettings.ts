/**
 * Settings React Query Hooks
 * All hooks use the API services with automatic fallback to mock data
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { settingsApi } from '../services/settingsApi';
import type {
  Company,
  Branch,
  User,
  Role,
  Module,
  SystemPreferences,
  ModuleConfiguration,
  SettingsStats,
  SecuritySettings,
} from '../types';

// ─── Company Hooks ─────────────────────────────────────────────────────────────

export const useCompany = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['settings', 'company'],
    queryFn: () => settingsApi.getCompany(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Company>) => settingsApi.updateCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'company'] });
    },
  });
};

// ─── Branch Hooks ──────────────────────────────────────────────────────────────

export const useBranches = (options?: UseQueryOptions<Branch[]>) => {
  return useQuery<Branch[]>({
    queryKey: ['settings', 'branches'],
    queryFn: () => settingsApi.getBranches(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>) => 
      settingsApi.createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'branches'] });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Branch> }) =>
      settingsApi.updateBranch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'branches'] });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'branches'] });
    },
  });
};

// ─── User Hooks ───────────────────────────────────────────────────────────────

export const useUsers = (options?: UseQueryOptions<User[]>) => {
  return useQuery<User[]>({
    queryKey: ['settings', 'users'],
    queryFn: () => settingsApi.getUsers(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'loginHistory'>) =>
      settingsApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'stats'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      settingsApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'stats'] });
    },
  });
};

// ─── Role Hooks ────────────────────────────────────────────────────────────────

export const useRoles = (options?: UseQueryOptions<Role[]>) => {
  return useQuery<Role[]>({
    queryKey: ['settings', 'roles'],
    queryFn: () => settingsApi.getRoles(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) =>
      settingsApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'roles'] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) =>
      settingsApi.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'roles'] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'roles'] });
    },
  });
};

// ─── Module Hooks ──────────────────────────────────────────────────────────────

export const useModules = (options?: UseQueryOptions<Module[]>) => {
  return useQuery<Module[]>({
    queryKey: ['settings', 'modules'],
    queryFn: () => settingsApi.getModules(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Module> }) =>
      settingsApi.updateModule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'modules'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar'] });
    },
  });
};

// ─── System Preferences Hooks ────────────────────────────────────────────────────

export const useSystemPreferences = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['settings', 'preferences'],
    queryFn: () => settingsApi.getSystemPreferences(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useUpdateSystemPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<SystemPreferences>) =>
      settingsApi.updateSystemPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'preferences'] });
    },
  });
};

// ─── Module Configuration Hooks ─────────────────────────────────────────────────

export const useModuleConfiguration = (moduleId: string, options?: UseQueryOptions<ModuleConfiguration>) => {
  return useQuery<ModuleConfiguration>({
    queryKey: ['settings', 'module-config', moduleId],
    queryFn: () => settingsApi.getModuleConfiguration(moduleId),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

// ─── Stats Hooks ───────────────────────────────────────────────────────────────

export const useSettingsStats = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['settings', 'stats'],
    queryFn: () => settingsApi.getSettingsStats(),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// ─── Security Settings Hooks ───────────────────────────────────────────────────

export const useSecuritySettings = (options?: UseQueryOptions<SecuritySettings>) => {
  return useQuery<SecuritySettings>({
    queryKey: ['settings', 'security-config'],
    queryFn: () => settingsApi.getSecuritySettings(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useUpdateSecuritySettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<SecuritySettings>) => settingsApi.updateSecuritySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'security-config'] });
    },
  });
};
