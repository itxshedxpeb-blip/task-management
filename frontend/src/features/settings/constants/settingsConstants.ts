/**
 * Settings Module Constants
 */

export const MODULES = [
  {
    id: 'task-management',
    name: 'task-management',
    displayName: 'Task Management',
    description: 'Manage tasks and assignments',
    icon: 'CheckSquare',
    isEnabled: true,
    isVisible: true,
    isLocked: false,
    requiredPermissions: ['view', 'create', 'edit', 'delete'],
  },
] as const;

export const PERMISSIONS = [
  { id: '1', module: 'task-management', action: 'view', description: 'View tasks' },
  { id: '2', module: 'task-management', action: 'create', description: 'Create tasks' },
  { id: '3', module: 'task-management', action: 'edit', description: 'Edit tasks' },
  { id: '4', module: 'task-management', action: 'delete', description: 'Delete tasks' },
  { id: '5', module: 'settings', action: 'view', description: 'View settings' },
  { id: '6', module: 'settings', action: 'edit', description: 'Edit settings' },
] as const;

export const DEFAULT_ROLES = [
  {
    id: '1',
    name: 'Owner',
    description: 'Full access to all modules and settings',
    permissions: PERMISSIONS.map(p => p.id),
    isSystem: true,
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Administrative access to most modules',
    permissions: PERMISSIONS.filter(p => p.action !== 'delete').map(p => p.id),
    isSystem: true,
  },
  {
    id: '3',
    name: 'Manager',
    description: 'Manager access with approval rights',
    permissions: PERMISSIONS.filter(p => ['view', 'create', 'edit'].includes(p.action)).map(p => p.id),
    isSystem: true,
  },
  {
    id: '4',
    name: 'Employee',
    description: 'Basic access to view and create',
    permissions: PERMISSIONS.filter(p => ['view', 'create'].includes(p.action)).map(p => p.id),
    isSystem: true,
  },
] as const;

export const TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const;

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
] as const;

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
] as const;

export const DATE_FORMATS = [
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY-MM-DD',
  'DD-MM-YYYY',
] as const;

export const TIME_FORMATS = [
  '12-hour',
  '24-hour',
] as const;

export const NOTIFICATION_EVENTS = [
  'user_created',
  'task_assigned',
  'task_completed',
  'task_verified',
] as const;

export const INTEGRATION_TYPES = [
  'email',
  'custom',
] as const;
