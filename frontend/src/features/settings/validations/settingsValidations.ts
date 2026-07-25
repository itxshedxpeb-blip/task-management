/**
 * Settings Module Validations
 * Zod validation schemas for all settings forms
 */

import { z } from 'zod';

// ─── Company Validations ─────────────────────────────────────────────────────────

export const companySchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  legalCompanyName: z.string().min(2, 'Legal company name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
  gstNumber: z.string().regex(/^[0-9A-Z]{15}$/, 'Invalid GST number (15 characters)'),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number'),
  cinNumber: z.string().optional(),
  msmeNumber: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid mobile number'),
  supportEmail: z.string().email('Invalid support email'),
  supportPhone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid support phone'),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/, 'Invalid color format'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/, 'Invalid color format'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/, 'Invalid color format'),
  themeMode: z.enum(['light', 'dark', 'system']),
});

// ─── Branch Validations ──────────────────────────────────────────────────────────

export const branchSchema = z.object({
  branchCode: z.string().min(2, 'Branch code must be at least 2 characters'),
  branchName: z.string().min(2, 'Branch name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
  gstNumber: z.string().regex(/^[0-9A-Z]{15}$/, 'Invalid GST number'),
  contactPerson: z.string().min(2, 'Contact person name required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid mobile number'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// ─── User Validations ───────────────────────────────────────────────────────────

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid mobile number'),
  role: z.enum(['owner', 'admin', 'manager', 'employee']),
  department: z.string().optional(),
  designation: z.string().optional(),
  isActive: z.boolean().default(true),
});

// ─── Role Validations ────────────────────────────────────────────────────────────

export const roleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  permissions: z.array(z.string()).min(1, 'At least one permission required'),
});

// ─── Module Validations ─────────────────────────────────────────────────────────

export const moduleSchema = z.object({
  isEnabled: z.boolean(),
  isVisible: z.boolean(),
});

// ─── Workflow Validations ────────────────────────────────────────────────────────

export const workflowStageSchema = z.object({
  name: z.string().min(2, 'Stage name must be at least 2 characters'),
  order: z.number().min(1, 'Order must be at least 1'),
  description: z.string().optional(),
  isRequired: z.boolean().default(false),
});

export const workflowSchema = z.object({
  name: z.string().min(2, 'Workflow name must be at least 2 characters'),
  module: z.string().min(1, 'Module is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  stages: z.array(workflowStageSchema).min(1, 'At least one stage required'),
  isActive: z.boolean().default(true),
});

// ─── Notification Settings Validations ────────────────────────────────────────────

export const notificationRuleSchema = z.object({
  name: z.string().min(2, 'Rule name must be at least 2 characters'),
  event: z.string().min(1, 'Event is required'),
  channels: z.array(z.enum(['email', 'whatsapp', 'in_app', 'sms'])).min(1, 'At least one channel required'),
  roles: z.array(z.enum(['owner', 'admin', 'manager', 'employee'])).min(1, 'At least one role required'),
  template: z.string().min(1, 'Template is required'),
  isActive: z.boolean().default(true),
});

export const notificationSettingsSchema = z.object({
  emailEnabled: z.boolean(),
  whatsappEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  rules: z.array(notificationRuleSchema).optional(),
});

// ─── Communication Settings Validations ───────────────────────────────────────────

export const smtpSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().min(1).max(65535, 'Port must be between 1 and 65535'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  fromEmail: z.string().email('Invalid from email'),
  fromName: z.string().min(1, 'From name is required'),
  secure: z.boolean().default(true),
});

export const whatsappSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  apiKey: z.string().min(1, 'API key is required'),
  businessId: z.string().min(1, 'Business ID is required'),
});

export const smsSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  apiKey: z.string().min(1, 'API key is required'),
  senderId: z.string().min(1, 'Sender ID is required'),
});

export const communicationSettingsSchema = z.object({
  smtp: smtpSchema,
  whatsapp: whatsappSchema.optional(),
  sms: smsSchema.optional(),
  emailEnabled: z.boolean(),
  whatsappEnabled: z.boolean(),
  smsEnabled: z.boolean(),
});

// ─── Integration Validations ─────────────────────────────────────────────────────

export const integrationSchema = z.object({
  name: z.string().min(2, 'Integration name must be at least 2 characters'),
  type: z.enum(['meta', 'facebook', 'instagram', 'whatsapp', 'email', 'google_maps', 'custom']),
  isEnabled: z.boolean().default(false),
  credentials: z.record(z.string(), z.string()).optional(),
});

// ─── Security Settings Validations ───────────────────────────────────────────────

export const passwordPolicySchema = z.object({
  minLength: z.number().min(6).max(32, 'Min length must be between 6 and 32'),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  expiryDays: z.number().min(0).max(365, 'Expiry days must be between 0 and 365'),
});

export const securitySettingsSchema = z.object({
  passwordPolicy: passwordPolicySchema,
  sessionTimeout: z.number().min(5).max(1440, 'Session timeout must be between 5 and 1440 minutes'),
  maxLoginAttempts: z.number().min(3).max(10, 'Max login attempts must be between 3 and 10'),
  lockoutDuration: z.number().min(5).max(60, 'Lockout duration must be between 5 and 60 minutes'),
  ipRestrictions: z.array(z.string()).optional(),
  twoFactorEnabled: z.boolean(),
});

// ─── Backup Settings Validations ──────────────────────────────────────────────────

export const backupSettingsSchema = z.object({
  autoBackupEnabled: z.boolean(),
  backupSchedule: z.enum(['daily', 'weekly', 'monthly']),
  retentionDays: z.number().min(1).max(365, 'Retention days must be between 1 and 365'),
  backupLocation: z.enum(['local', 'cloud']),
  cloudProvider: z.string().optional(),
});

// ─── System Preferences Validations ───────────────────────────────────────────────

export const systemPreferencesSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.string().min(1, 'Language is required'),
  currency: z.string().min(1, 'Currency is required'),
  dateFormat: z.string().min(1, 'Date format is required'),
  timeFormat: z.enum(['12-hour', '24-hour']),
  fileUploadLimit: z.number().min(1).max(100, 'File upload limit must be between 1 and 100 MB'),
  allowedFileTypes: z.array(z.string()).min(1, 'At least one file type required'),
  defaultTheme: z.enum(['light', 'dark', 'system']),
});


