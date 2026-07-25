/**
 * Settings Module Types
 * Single Source of Truth for all settings configuration across Task Manager
 */

// ─── Company Types ─────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  companyName: string;
  legalCompanyName: string;
  logo?: string;
  sidebarLogo?: string;
  loginLogo?: string;
  favicon?: string;
  watermark?: string;
  loginBackground?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  gstNumber: string;
  panNumber: string;
  cinNumber: string;
  msmeNumber: string;
  website: string;
  email: string;
  mobile: string;
  supportEmail: string;
  supportPhone: string;
  
  // Social Links
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  x?: string;
  
  // Branding
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  themeMode: 'light' | 'dark' | 'system';
  
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Branch Types ─────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  branchCode: string;
  branchName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  gstNumber: string;
  contactPerson: string;
  email: string;
  mobile: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── User Types ───────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  designation?: string;
  isActive: boolean;
  isLocked: boolean;
  lastLogin?: Date;
  activeSession?: string;
  loginHistory: LoginHistory[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginHistory {
  id: string;
  loginAt: Date;
  logoutAt?: Date;
  ipAddress: string;
  device: string;
  browser: string;
  location?: string;
}

// ─── Permission Types ────────────────────────────────────────────────────────

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'print' | 'send';

export interface Permission {
  id: string;
  module: string;
  action: PermissionAction;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Module Types ─────────────────────────────────────────────────────────────

export type ModuleName = 'task-management';

export interface Module {
  id: string;
  name: ModuleName;
  displayName: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  isVisible: boolean;
  isLocked: boolean;
  requiredPermissions: PermissionAction[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── System Preferences Types ───────────────────────────────────────────────────

export interface SystemPreferences {
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  fileUploadLimit: number;
  allowedFileTypes: string[];
  defaultTheme: 'light' | 'dark' | 'system';
}

// ─── Configuration Types ────────────────────────────────────────────────────────

export interface ModuleConfiguration {
  id: string;
  name: string;
  settings: Record<string, any>;
}

// ─── Settings Stats Types ───────────────────────────────────────────────────────

export interface SettingsStats {
  totalUsers: number;
  activeUsers: number;
  enabledModules: number;
  disabledModules: number;
  pendingApprovals: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

// ─── Security Settings Types ───────────────────────────────────────────────────

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays: number;
}

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  ipRestrictions: string[];
  twoFactorEnabled: boolean;
}
