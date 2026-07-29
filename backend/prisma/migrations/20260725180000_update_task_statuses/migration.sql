-- Create new TaskStatus enum
CREATE TYPE "TaskStatus_new" AS ENUM ('Draft', 'Todo', 'InProgress', 'OnHold', 'Completed', 'Archived', 'Cancelled');

-- Migrate Task.status column
ALTER TABLE "Task" ADD COLUMN "status_new" "TaskStatus_new" NOT NULL DEFAULT 'Todo';

UPDATE "Task" SET "status_new" = CASE
  WHEN "status" = 'Todo' THEN 'Todo'::"TaskStatus_new"
  WHEN "status" = 'InProgress' THEN 'InProgress'::"TaskStatus_new"
  WHEN "status" = 'Blocked' THEN 'OnHold'::"TaskStatus_new"
  WHEN "status" = 'Review' THEN 'InProgress'::"TaskStatus_new"
  WHEN "status" = 'Completed' THEN 'Completed'::"TaskStatus_new"
  WHEN "status" = 'Verified' THEN 'Completed'::"TaskStatus_new"
  WHEN "status" = 'Rejected' THEN 'Cancelled'::"TaskStatus_new"
  WHEN "status" = 'Closed' THEN 'Archived'::"TaskStatus_new"
  WHEN "status" = 'Cancelled' THEN 'Cancelled'::"TaskStatus_new"
  WHEN "status" = 'Reopened' THEN 'Todo'::"TaskStatus_new"
  ELSE 'Todo'::"TaskStatus_new"
END;

-- Drop old column and rename new
ALTER TABLE "Task" DROP COLUMN "status";
ALTER TABLE "Task" RENAME COLUMN "status_new" TO "status";

-- Drop old enum type and rename new
DROP TYPE "TaskStatus";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
