-- Composite indexes for hot Task query patterns
-- These support the most common WHERE clauses in dashboard, KPI, and task-list queries.

-- User task list filtered by status: WHERE isDeleted=false AND assignedUserId=X AND status=Y
CREATE INDEX IF NOT EXISTS "Task_isDeleted_assignedUserId_status_idx"
  ON "Task"("isDeleted", "assignedUserId", "status");

-- Overdue / due-today queries: WHERE isDeleted=false AND status=X AND dueDate<Y
CREATE INDEX IF NOT EXISTS "Task_isDeleted_status_dueDate_idx"
  ON "Task"("isDeleted", "status", "dueDate");

-- Completion-date queries: WHERE isDeleted=false AND status='Completed' AND completedAt>Y
CREATE INDEX IF NOT EXISTS "Task_isDeleted_status_completedAt_idx"
  ON "Task"("isDeleted", "status", "completedAt");

-- Dashboard due queries per user: WHERE isDeleted=false AND assignedUserId=X AND dueDate<Y
CREATE INDEX IF NOT EXISTS "Task_isDeleted_assignedUserId_dueDate_idx"
  ON "Task"("isDeleted", "assignedUserId", "dueDate");
