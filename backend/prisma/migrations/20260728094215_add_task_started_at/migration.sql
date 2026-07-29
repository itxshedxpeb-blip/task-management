-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "startedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");
