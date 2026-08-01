/**
 * Task Management Types
 * 
 * Comprehensive task management system with:
 * - Mandatory photo proof for completion
 * - Employee performance tracking
 * - Payment per task
 * - Salary adjustments
 * - Verification workflow
 * - Cross-module links
 */

// ─── Task Priority ──────────────────────────────────────────────────────────────

export type TaskPriority = 'None' | 'Low' | 'Medium' | 'High' | 'Urgent';

// ─── Task Status ────────────────────────────────────────────────────────────────

export type TaskStatus = 
  | 'Draft'
  | 'Todo'
  | 'InProgress'
  | 'OnHold'
  | 'Completed'
  | 'CompletedLate'
  | 'Incomplete'
  | 'Overdue'
  | 'Archived'
  | 'Cancelled';

// ─── Linked Module Types ─────────────────────────────────────────────────────────

export type LinkedModule = 
  | 'General';

// ─── Task Category ───────────────────────────────────────────────────────────────

export type TaskCategory = 
  | 'General'
  | 'Office'
  | 'Field Work'
  | 'Maintenance'
  | 'Installation'
  | 'Inspection'
  | 'Documentation'
  | 'Meeting'
  | 'Training'
  | 'Other';

// ─── Checklist Item ──────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  order: number;
}

// ─── Task Entity ────────────────────────────────────────────────────────────────

export interface Task {
  // Core Fields
  id: string;
  taskId: string; // Task ID (e.g., "TSK-001")
  title: string;
  description?: string;
  
  // Assignment
  assignedUserId: string;
  assignedUserName: string;
  createdBy: string;
  createdByName: string;
  completedById?: string;
  completedByName?: string;
  
  // Parent/Child
  parentTaskId?: string;
  
  // Dates
  startDate?: Date;
  dueDate?: Date; // Deprecated: No longer used in daily task flow
  reminderDate?: Date;
  completedAt?: Date;
  closedAt?: Date;
  startedAt?: Date;
  assignedAt?: Date;
  
  // Status & Priority
  priority: TaskPriority;
  status: TaskStatus;
  category?: TaskCategory;
  
  // Progress & Time
  progress: number; // 0-100
  estimatedHours?: number;
  timeSpent?: number; // Actual hours spent
  
  // Cross-Module Links (Optional)
  linkedModule?: LinkedModule;
  linkedRecordId?: string;
  linkedRecordName?: string;
  
  // Payment (Incentive-based, not full salary)
  incentiveValue: number; // Set by Admin/Manager - this is the incentive amount, not full salary
  isPaymentEditable: boolean; // Only for authorized users
  
  // Completion Proof (Mandatory)
  // Frontend only: Store as File[] in component state
  // Backend later: Will store as string[] (S3 URLs)
  completionProof?: {
    beforeImages: File[]; // Photos before task started (File[] for frontend phase)
    afterImages: File[]; // Photos after task completed (File[] for frontend phase)
    videoUrl?: string; // Optional video proof (future)
    notes?: string;
    uploadedAt?: Date;
    uploadedBy?: string;
  };
  
  // Completion Details
  completionNotes?: string;
  completionChecklist?: ChecklistItem[];
  
  // Checklist
  checklist?: ChecklistItem[];
  
  // General Notes
  notes?: string;
  internalNotes?: string;
  
  // Activity History (Audit Trail)
  activityHistory?: TaskActivity[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Tags & Flags
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  
  // SLA
  slaDueDate?: Date;
  slaBreached?: boolean;
  
  // Archive
  isArchived?: boolean;
  archivedAt?: Date;
  
  // Subtasks (minimal reference)
  subtasks?: { id: string; title: string; status: TaskStatus }[];
}

// ─── Task Activity History (Audit Trail) ───────────────────────────────────────

export type TaskActivityType =
  | 'Created'
  | 'Assigned'
  | 'Started'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Archived'
  | 'Cancelled'
  | 'Reassigned'
  | 'Priority Changed'
  | 'Due Date Changed'
  | 'Progress Updated'
  | 'Checklist Updated';

export interface TaskActivity {
  id: string;
  taskId: string;
  activityType: TaskActivityType;
  description: string;
  performedBy: string;
  performedByName: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationType =
  | 'Task Assigned'
  | 'Task Completed'
  | 'Task Due Soon'
  | 'Task Overdue';

export interface TaskNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId: string;
  taskTitle: string;
  isRead: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// ─── Employee Performance Stats ─────────────────────────────────────────────────

export interface EmployeePerformanceStats {
  employeeId: string;
  employeeName: string;
  
  // Task Counts
  tasksAssigned: number;
  tasksCompleted: number;
  tasksPending: number;
  tasksOverdue: number;
  
  // Performance Metrics
  completionRate: number;
  onTimeCompletionRate: number;
  averageCompletionTime: number;
  
  // Financial (Incentive-based)
  baseSalary: number; // Monthly base salary
  verifiedTaskIncentives: number; // Total from verified tasks only
  bonuses: number; // Additional bonuses
  advances: number; // Advances taken
  penalties: number; // Penalties applied
  finalPayable: number; // Base + Incentives + Bonus - Advance - Penalty
  
  // Payment Status
  totalPaymentPending: number;
  totalPaymentReceived: number;
  
  // Performance Score
  totalPerformanceScore: number; // calculated based on completion rate, timeliness, quality
  
  // Rankings
  rank?: number;
  percentile?: number;
}

// ─── Salary Adjustment Types ────────────────────────────────────────────────────

export type AdjustmentType = 
  | 'Credit'
  | 'Deduction'
  | 'Advance'
  | 'Bonus'
  | 'Penalty';

// ─── Salary Adjustment ─────────────────────────────────────────────────────────

export interface SalaryAdjustment {
  id: string;
  employeeId: string;
  employeeName: string;
  
  // Adjustment Details
  type: AdjustmentType;
  amount: number;
  description: string;
  reason?: string;
  
  // Reference
  referenceType?: 'Task' | 'Manual' | 'Bonus' | 'Penalty' | 'Other';
  referenceId?: string;
  referenceName?: string;
  
  // Status
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processed';
  
  // Approval
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  
  // Processing
  processedAt?: Date;
  processedBy?: string;
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  notes?: string;
}

// ─── Employee Salary Ledger ─────────────────────────────────────────────────────

export interface EmployeeSalaryLedger {
  employeeId: string;
  employeeName: string;
  
  // Opening Balance
  openingBalance: number;
  
  // Earnings
  taskEarnings: number;
  bonuses: number;
  otherCredits: number;
  
  // Deductions
  advances: number;
  penalties: number;
  otherDeductions: number;
  
  // Current Payable
  currentPayable: number;
  
  // Payment History
  totalPaid: number;
  lastPaymentDate?: Date;
  
  // Adjustments
  adjustments: SalaryAdjustment[];
  
  // Period
  periodStart: Date;
  periodEnd: Date;
}

// ─── DTOs ───────────────────────────────────────────────────────────────────────

export interface CreateTaskDto {
  title: string;
  description?: string;
  assignedUserId: string;
  startDate?: Date;
  reminderDate?: Date;
  priority: TaskPriority;
  category?: TaskCategory;
  linkedModule?: LinkedModule;
  linkedRecordId?: string;
  linkedRecordName?: string;
  incentiveValue: number;
  estimatedHours?: number;
  tags?: string[];
  notes?: string;
  beforeImages?: File[]; // Frontend only: File[] for component state
  checklist?: Omit<ChecklistItem, 'id' | 'completed' | 'completedAt' | 'completedBy'>[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  assignedUserId?: string;
  startDate?: Date;
  reminderDate?: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: TaskCategory;
  linkedModule?: LinkedModule;
  linkedRecordId?: string;
  linkedRecordName?: string;
  incentiveValue?: number;
  progress?: number;
  estimatedHours?: number;
  timeSpent?: number;
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  beforeImages?: File[]; // Frontend only: File[] for component state
  checklist?: ChecklistItem[];
}

export interface CompleteTaskDto {
  completionProof: {
    beforeImages: File[]; // Frontend only: File[] for component state
    afterImages: File[]; // Mandatory - Frontend only: File[] for component state
    videoUrl?: string;
    notes?: string;
  };
  completionNotes: string; // Mandatory
  completionChecklist?: ChecklistItem[]; // Mandatory completion checklist
  timeSpent?: number; // Actual hours spent
  completedAt: Date;
}

export interface VerifyTaskDto {
  status: 'Verified' | 'Rejected';
  verificationNotes?: string;
  verifiedAt: Date;
}

export interface CreateSalaryAdjustmentDto {
  employeeId: string;
  employeeName: string;
  type: AdjustmentType;
  amount: number;
  description: string;
  reason?: string;
  referenceType?: 'Task' | 'Manual' | 'Bonus' | 'Penalty' | 'Other';
  referenceId?: string;
  referenceName?: string;
  notes?: string;
}

export interface UpdateSalaryAdjustmentDto {
  type?: AdjustmentType;
  amount?: number;
  description?: string;
  reason?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Processed';
  notes?: string;
}

// ─── Filter & Query Types ───────────────────────────────────────────────────────

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedUserId?: string;
  linkedModule?: LinkedModule;
  search?: string;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  completedDateFrom?: Date;
  completedDateTo?: Date;
  tags?: string[];
}

export interface TaskQuery {
  page?: number;
  pageSize?: number;
  filter?: TaskFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SalaryAdjustmentFilter {
  employeeId?: string;
  type?: AdjustmentType;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Processed';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SalaryAdjustmentQuery {
  page?: number;
  pageSize?: number;
  filter?: SalaryAdjustmentFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Stats Types ────────────────────────────────────────────────────────────────

export interface TaskStats {
  totalTasks: number;
  draftTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  onHoldTasks: number;
  completedTasks: number;
  archivedTasks: number;
  cancelledTasks: number;
  
  overdueTasks: number;
  dueToday: number;
  dueThisWeek: number;
  
  completedOnTime: number;
  completedLate: number;
  
  tasksByPriority: Record<TaskPriority, number>;
  tasksByStatus: Record<TaskStatus, number>;
  
  completedToday: number;
}

export interface DashboardTaskKPIs {
  openTasks: number;
  overdueTasks: number;
  completedToday: number;
  completedTasks: number;
  completedOnTime: number;
  completedLate: number;
  topPerformers: EmployeePerformanceStats[];
}

// ─── Shared Foundation Types (Phase 3.1) ────────────────────────────────────────
// Reusable types for the shared task component foundation. These extend (not
// replace) the existing task types above and introduce no backend behaviour.

// View modes for task lists. `calendar` and `matrix` are reserved placeholders
// for later phases and are surfaced as disabled options in the UI.
export type TaskViewMode = 'list' | 'kanban' | 'calendar' | 'matrix';

// Minimal user reference used by avatars, followers and assignee displays.
export interface TaskUser {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string;
}

// Scope of a saved view (frontend-only, no persistence yet).
export type SavedViewScope = 'personal' | 'team' | 'public' | 'default';

export interface SavedView {
  id: string;
  name: string;
  scope: SavedViewScope;
  isPinned?: boolean;
  filter?: TaskFilter;
}

// Construction task template (frontend mock for the TemplateSelector).
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: TaskCategory;
  defaultPriority?: TaskPriority;
  checklist?: string[];
}

// Relationship between two tasks for the DependenciesCard (frontend mock).
export type TaskRelationshipType =
  | 'Depends On'
  | 'Blocked By'
  | 'Blocking'
  | 'Related To'
  | 'Duplicate Of';

export interface TaskDependency {
  id: string;
  taskRef: string; // Human-facing task id, e.g. "TSK-002"
  title: string;
  status: TaskStatus;
  relationship: TaskRelationshipType;
}
