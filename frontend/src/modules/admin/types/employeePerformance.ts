import type { TaskCategory, TaskPriority, TaskStatus } from '@/features/task-management/types';

export type EmployeeCardTone = 'green' | 'orange' | 'red' | 'blue' | 'grey';
export type WorkloadLevel = 'low' | 'medium' | 'high';
export type PerformanceBadge =
  | 'Excellent'
  | 'Good'
  | 'Average'
  | 'Needs Attention'
  | 'Overloaded'
  | 'No Tasks';

export interface EmployeeTaskRef {
  id: string;
  taskId: number;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  dueDate: string | null;
}

export interface EmployeeTaskSummary {
  statusCounts: Partial<Record<TaskStatus, number>>;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  activeTasks: number;
  overdueTasks: number;
  dueToday: number;
  dueThisWeek: number;
  dueThisMonth: number;
  cancelledTasks: number;
  rejectedTasks: number;
  completedToday: number;
  assignedToday: number;
  completionRate: number;
  avgCompletionHours: number;
  onTimeCompletionRate: number;
  currentTask: EmployeeTaskRef | null;
  highestPriorityTask: EmployeeTaskRef | null;
  lastCompletedTask: {
    id: string;
    taskId: number;
    title: string;
    priority: TaskPriority;
    completedAt: string;
  } | null;
  workloadScore: number;
  workloadLevel: WorkloadLevel;
  performanceBadge: PerformanceBadge;
  cardTone: EmployeeCardTone;
  productivityScore: number;
}

export interface EmployeeProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  userType: string;
  isActive: boolean;
  isVerified: boolean;
  employeeId: string | null;
  department: string | null;
  designation: string | null;
  phone: string | null;
  joiningDate: string | null;
  createdAt: string;
  lastLogin: string | null;
}

export interface EmployeeListItem extends EmployeeProfile {
  stats: EmployeeTaskSummary;
}

export interface EmployeePerformance extends EmployeeProfile {
  online: boolean;
  stats: EmployeeTaskSummary;
  summary: EmployeeTaskSummary & { total: number };
}

export interface EmployeeTaskRow {
  id: string;
  taskId: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory | null;
  progress: number;
  createdAt: string;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  updatedAt: string;
  assignedUserName: string | null;
  createdByName: string | null;
  estimatedHours: number;
  timeSpent: number;
}

export interface EmployeeTimelineEvent {
  id: string;
  activityType: string;
  kind: 'assigned' | 'started' | 'updated' | 'completed' | 'verified' | 'rejected' | 'cancelled' | 'activity';
  description: string;
  performedBy: string | null;
  performedByName: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
  taskId: string;
  taskNumber: number;
  taskTitle: string;
  taskStatus: TaskStatus;
}

export interface TrendPoint {
  bucket: string;
  label: string;
  created: number;
  completed: number;
}

export interface WeeklyTrendPoint extends TrendPoint {
  overdue: number;
}

export interface EmployeeReport {
  employee: Pick<
    EmployeeProfile,
    'id' | 'name' | 'employeeId' | 'department' | 'designation'
  > | null;
  summary: EmployeeTaskSummary | null;
  onTimeCompletionRate: number;
  productivityScore: number;
  charts: {
    dailyTrend: TrendPoint[];
    weeklyTrend: WeeklyTrendPoint[];
    monthlyTrend: TrendPoint[];
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface EmployeeTodayTaskRef {
  id: string;
  taskId: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  dueDate: string | null;
}

export interface EmployeeTodayCompletedTask {
  id: string;
  taskId: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  completedAt: string;
}

export interface EmployeeTodayLastActivity {
  id: string;
  activityType: string;
  kind: EmployeeTimelineEvent['kind'];
  description: string;
  performedByName: string | null;
  createdAt: string;
  taskId: string;
  taskNumber: number;
  taskTitle: string;
}

export interface EmployeeToday {
  date: string;
  productivityToday: number;
  counts: {
    completedToday: number;
    assignedToday: number;
    dueToday: number;
    pending: number;
    overdue: number;
    activityToday: number;
    filesAddedToday: number;
    commentsAddedToday: number;
  };
  currentTask: EmployeeTodayTaskRef | null;
  completedToday: EmployeeTodayCompletedTask[];
  assignedToday: EmployeeTodayTaskRef[];
  dueToday: EmployeeTodayTaskRef[];
  lastActivity: EmployeeTodayLastActivity | null;
}

export interface EmployeeListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'active' | 'inactive';
  role?: string;
  department?: string;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeTasksParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  overdue?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'completedAt' | 'priority' | 'progress' | 'title';
  sortOrder?: 'asc' | 'desc';
}
