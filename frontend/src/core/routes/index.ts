export const ROUTES = {
  // Auth
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',

  // Admin Portal
  adminLogin: '/admin/login',
  adminDashboard: '/admin/dashboard',
  adminCompanies: '/admin/companies',
  adminUsers: '/admin/users',
  adminOrganizations: '/admin/organizations',
  adminPlans: '/admin/plans',
  adminAnalytics: '/admin/analytics',
  adminAuditLogs: '/admin/audit-logs',
  adminSettings: '/admin/settings',

  // App (Company Workspace)
  app: '/app',
  appInbox: '/app/inbox',
  appMyWork: '/app/my-work',
  appTasks: '/app/tasks',
  appTaskDetail: (id: string) => `/app/tasks/${id}`,
  appBoard: '/app/board',
  appCalendar: '/app/calendar',
  appTimeline: '/app/timeline',
  appReports: '/app/reports',
  appPeople: '/app/people',
  appDepartments: '/app/departments',
  appTemplates: '/app/templates',
  appAutomations: '/app/automations',
  appSettings: '/app/settings',
  appSettingsCompany: '/app/settings/company',
  appSettingsBranches: '/app/settings/branches',
  appSettingsUsers: '/app/settings/users',
  appSettingsRoles: '/app/settings/roles',
  appSettingsPermissions: '/app/settings/permissions',
  appSettingsLabels: '/app/settings/labels',
  appSettingsModules: '/app/settings/modules',

  // Legacy (kept for backward compat during migration)
  dashboard: '/dashboard',
  tasks: '/dashboard/task-management',
  tasksDetail: (id: string) => `/dashboard/task-management/${id}`,
  settings: '/settings',
  settingsDashboard: '/settings',
  settingsCompany: '/settings/company',
  settingsBranches: '/settings/branches',
  settingsUsers: '/settings/users',
  settingsRoles: '/settings/roles',
  settingsPermissions: '/settings/permissions',
  settingsModules: '/settings/modules',
  settingsSecurity: '/settings/security',
  settingsPreferences: '/settings/preferences',
} as const;

export type RouteKey = keyof typeof ROUTES;
