export const ROUTES = {
  login: '/login',
  register: '/register',

  admin: '/admin',
  adminLogin: '/admin/login',
  adminDashboard: '/admin/dashboard',
  adminEmployees: '/admin/employees',
  adminTasks: '/admin/tasks',
  adminReports: '/admin/reports',
  adminSettings: '/admin/settings',

  app: '/app',
  appTasks: '/app/tasks',
  appTaskDetail: (id: string) => `/app/tasks/${id}`,
  appBoard: '/app/board',
  appCalendar: '/app/calendar',
  appPriorityMatrix: '/app/priority-matrix',
  appNotes: '/app/notes',
  appProfile: '/app/profile',
  appSettings: '/app/settings',
} as const;

export type RouteKey = keyof typeof ROUTES;
