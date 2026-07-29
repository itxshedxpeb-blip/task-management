/*
  Warnings:

  - The values [APPROVAL_REQUIRED] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [ORGANIZATION_INVITE] on the enum `OtpPurpose` will be removed. If these variants are still used in the database, this will fail.
  - The values [OWNER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [SYSTEM_ADMIN,COMPANY_ADMIN,MANAGER] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `organizationId` on the `ActivityFeed` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `AutomationRule` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `CustomView` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Label` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `LoginAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `SavedFilter` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `afterImages` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `beforeImages` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `completionNotes` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `completionProof` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `incentiveValue` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `verificationNotes` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedBy` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `TaskTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `organizationType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `EventRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalaryAdjustment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StatusPipeline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Label` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('TASK_ASSIGNED', 'TASK_COMPLETED', 'TASK_VERIFIED', 'TASK_REJECTED', 'COMMENT_ADDED', 'MENTION', 'STATUS_CHANGED', 'DUE_DATE_REMINDER', 'SLA_BREACH');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OtpPurpose_new" AS ENUM ('REGISTRATION', 'FORGOT_PASSWORD', 'EMAIL_VERIFICATION', 'CHANGE_EMAIL', 'TWO_FACTOR');
ALTER TABLE "OtpChallenge" ALTER COLUMN "purpose" TYPE "OtpPurpose_new" USING ("purpose"::text::"OtpPurpose_new");
ALTER TYPE "OtpPurpose" RENAME TO "OtpPurpose_old";
ALTER TYPE "OtpPurpose_new" RENAME TO "OtpPurpose";
DROP TYPE "public"."OtpPurpose_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('SUPER_ADMIN', 'EMPLOYEE');
ALTER TABLE "public"."User" ALTER COLUMN "userType" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "userType" TYPE "UserType_new" USING ("userType"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "public"."UserType_old";
ALTER TABLE "User" ALTER COLUMN "userType" SET DEFAULT 'EMPLOYEE';
COMMIT;

-- DropForeignKey
ALTER TABLE "ActivityFeed" DROP CONSTRAINT "ActivityFeed_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "AutomationRule" DROP CONSTRAINT "AutomationRule_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "CustomView" DROP CONSTRAINT "CustomView_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "EventRule" DROP CONSTRAINT "EventRule_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Label" DROP CONSTRAINT "Label_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "SalaryAdjustment" DROP CONSTRAINT "SalaryAdjustment_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "SavedFilter" DROP CONSTRAINT "SavedFilter_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "StatusPipeline" DROP CONSTRAINT "StatusPipeline_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "TaskTemplate" DROP CONSTRAINT "TaskTemplate_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";

-- DropIndex
DROP INDEX "ActivityFeed_organizationId_createdAt_idx";

-- DropIndex
DROP INDEX "ActivityFeed_organizationId_entityType_entityId_idx";

-- DropIndex
DROP INDEX "AuditLog_organizationId_idx";

-- DropIndex
DROP INDEX "AutomationRule_organizationId_idx";

-- DropIndex
DROP INDEX "AutomationRule_organizationId_isActive_idx";

-- DropIndex
DROP INDEX "CustomView_organizationId_idx";

-- DropIndex
DROP INDEX "Department_organizationId_idx";

-- DropIndex
DROP INDEX "Department_organizationId_name_key";

-- DropIndex
DROP INDEX "Label_organizationId_idx";

-- DropIndex
DROP INDEX "Label_organizationId_name_key";

-- DropIndex
DROP INDEX "Notification_organizationId_idx";

-- DropIndex
DROP INDEX "Role_organizationId_idx";

-- DropIndex
DROP INDEX "Role_organizationId_name_key";

-- DropIndex
DROP INDEX "SavedFilter_organizationId_idx";

-- DropIndex
DROP INDEX "Task_organizationId_idx";

-- DropIndex
DROP INDEX "Task_organizationId_isDeleted_idx";

-- DropIndex
DROP INDEX "Task_organizationId_priority_idx";

-- DropIndex
DROP INDEX "Task_organizationId_status_idx";

-- DropIndex
DROP INDEX "TaskTemplate_organizationId_idx";

-- DropIndex
DROP INDEX "User_organizationId_idx";

-- DropIndex
DROP INDEX "User_organizationId_role_idx";

-- AlterTable
ALTER TABLE "ActivityFeed" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "AutomationRule" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "CustomView" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Label" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "LoginAttempt" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "SavedFilter" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "afterImages",
DROP COLUMN "beforeImages",
DROP COLUMN "completionNotes",
DROP COLUMN "completionProof",
DROP COLUMN "incentiveValue",
DROP COLUMN "organizationId",
DROP COLUMN "verificationNotes",
DROP COLUMN "verifiedBy",
ADD COLUMN     "assignedById" TEXT,
ADD COLUMN     "assignedByName" TEXT,
ADD COLUMN     "completedById" TEXT,
ADD COLUMN     "completedByName" TEXT,
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedById" TEXT,
ADD COLUMN     "verifiedById" TEXT;

-- AlterTable
ALTER TABLE "TaskTemplate" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mobile",
DROP COLUMN "organizationId",
DROP COLUMN "organizationType",
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "joiningDate" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "isActive" SET DEFAULT true;

-- DropTable
DROP TABLE "EventRule";

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "SalaryAdjustment";

-- DropTable
DROP TABLE "StatusPipeline";

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "TeamMember";

-- DropEnum
DROP TYPE "OrganizationStatus";

-- DropEnum
DROP TYPE "OrganizationType";

-- DropEnum
DROP TYPE "SalaryAdjustmentStatus";

-- DropEnum
DROP TYPE "SalaryAdjustmentType";

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "folder" TEXT NOT NULL DEFAULT '/',
    "tags" TEXT[],
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Note_createdById_idx" ON "Note"("createdById");

-- CreateIndex
CREATE INDEX "Note_folder_idx" ON "Note"("folder");

-- CreateIndex
CREATE INDEX "Note_isPinned_idx" ON "Note"("isPinned");

-- CreateIndex
CREATE INDEX "Note_isDeleted_idx" ON "Note"("isDeleted");

-- CreateIndex
CREATE INDEX "ActivityFeed_entityType_entityId_idx" ON "ActivityFeed"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityFeed_createdAt_idx" ON "ActivityFeed"("createdAt");

-- CreateIndex
CREATE INDEX "AutomationRule_isActive_idx" ON "AutomationRule"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Label_name_key" ON "Label"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");

-- CreateIndex
CREATE INDEX "Task_isPinned_idx" ON "Task"("isPinned");

-- CreateIndex
CREATE INDEX "Task_isFavorite_idx" ON "Task"("isFavorite");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
