-- Add next follow-up fields to TaskActivityLog
ALTER TABLE "TaskActivityLog" ADD COLUMN "nextFollowUpDate" TEXT;
ALTER TABLE "TaskActivityLog" ADD COLUMN "nextFollowUpTime" TEXT;
ALTER TABLE "TaskActivityLog" ADD COLUMN "nextFollowUpAction" TEXT;
ALTER TABLE "TaskActivityLog" ADD COLUMN "taskStatus" TEXT;
ALTER TABLE "TaskActivityLog" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add index on nextFollowUpDate
CREATE INDEX "TaskActivityLog_nextFollowUpDate_idx" ON "TaskActivityLog"("nextFollowUpDate");
