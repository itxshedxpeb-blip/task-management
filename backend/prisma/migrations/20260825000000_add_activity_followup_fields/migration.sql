-- AlterTable: Add follow-up fields and updatedAt to TaskActivityLog
ALTER TABLE "TaskActivityLog" ADD COLUMN "nextFollowUpDate" TEXT,
ADD COLUMN "nextFollowUpTime" TEXT,
ADD COLUMN "nextFollowUpAction" TEXT,
ADD COLUMN "taskStatus" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex: Index for follow-up date lookups
CREATE INDEX "TaskActivityLog_nextFollowUpDate_idx" ON "TaskActivityLog"("nextFollowUpDate");

-- CreateIndex: Index for performedBy lookups
CREATE INDEX "TaskActivityLog_performedBy_idx" ON "TaskActivityLog"("performedBy");
