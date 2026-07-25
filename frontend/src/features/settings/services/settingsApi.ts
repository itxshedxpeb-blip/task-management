import { api } from '@/core/api';
import { BackendPendingError } from '@/core/api/capabilities';
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
import { MODULES } from '../constants/settingsConstants';

const DEFAULT_SYSTEM_PREFERENCES: SystemPreferences = {
  timezone: 'Asia/Kolkata',
  language: 'en',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12-hour',
  fileUploadLimit: 10,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
  defaultTheme: 'light',
};

let moduleStore: Module[] = MODULES.map((module) => ({
  ...module,
  name: module.name as Module['name'],
  requiredPermissions: [...module.requiredPermissions],
}));

const MODULE_DEFAULTS: Record<string, { name: string; settings: Record<string, unknown> }> = {};

function pending(resource: string): never {
  throw new BackendPendingError(resource);
}

export const settingsApi = {
  async getCompany(): Promise<Company> {
    return pending('settings-company');
  },

  async updateCompany(_data: Partial<Company>): Promise<Company> {
    return pending('settings-company');
  },

  async getBranches(): Promise<Branch[]> {
    return pending('settings-branches');
  },

  async createBranch(_data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Branch> {
    return pending('settings-branches');
  },

  async updateBranch(_id: string, _data: Partial<Branch>): Promise<Branch> {
    return pending('settings-branches');
  },

  async deleteBranch(_id: string): Promise<void> {
    return pending('settings-branches');
  },

  async getUsers(): Promise<User[]> {
    const response = await api.get<{ data: { rows?: User[] } | User[] }>('/users');
    const payload = response.data;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray((payload as { rows?: User[] }).rows)) {
      return (payload as { rows: User[] }).rows;
    }
    return [];
  },

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'loginHistory'>): Promise<User> {
    const response = await api.post<{ data: User }>('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await api.patch<{ data: User }>(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getRoles(): Promise<Role[]> {
    const response = await api.get<{ data: Role[] }>('/roles');
    return response.data ?? [];
  },

  async createRole(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const response = await api.post<{ data: Role }>('/roles', data);
    return response.data;
  },

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    const response = await api.patch<{ data: Role }>(`/roles/${id}`, data);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  },

  async getModules(): Promise<Module[]> {
    return moduleStore;
  },

  async updateModule(id: string, data: Partial<Module>): Promise<Module> {
    moduleStore = moduleStore.map((module) =>
      module.id === id ? { ...module, ...data, id, updatedAt: new Date() } : module,
    );
    const updated = moduleStore.find((module) => module.id === id);
    if (!updated) {
      throw new Error(`Module not found: ${id}`);
    }
    return updated;
  },

  async getSystemPreferences(): Promise<SystemPreferences> {
    return { ...DEFAULT_SYSTEM_PREFERENCES };
  },

  async updateSystemPreferences(_data: Partial<SystemPreferences>): Promise<SystemPreferences> {
    return pending('settings-preferences');
  },

  async getModuleConfiguration(moduleId: string): Promise<ModuleConfiguration> {
    const defaults = MODULE_DEFAULTS[moduleId];
    if (defaults) {
      return { id: moduleId, name: defaults.name, settings: defaults.settings };
    }
    return { id: moduleId, name: '', settings: {} };
  },

  async getSettingsStats(): Promise<SettingsStats> {
    return pending('settings-stats');
  },

  async getSecuritySettings(): Promise<SecuritySettings> {
    return pending('settings-security');
  },

  async updateSecuritySettings(_data: Partial<SecuritySettings>): Promise<SecuritySettings> {
    return pending('settings-security');
  },
};
