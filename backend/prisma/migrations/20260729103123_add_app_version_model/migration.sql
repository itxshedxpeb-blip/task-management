/*
  Warnings:

  - You are about to alter the column `estimatedHours` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `timeSpent` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `otp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpAttempts` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `OtpChallenge` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "estimatedHours" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "timeSpent" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "otp",
DROP COLUMN "otpAttempts",
DROP COLUMN "otpExpiry",
ALTER COLUMN "isVerified" SET DEFAULT true;

-- DropTable
DROP TABLE "OtpChallenge";

-- DropEnum
DROP TYPE "OtpPurpose";

-- CreateTable
CREATE TABLE "AppVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "buildNumber" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "releaseNotes" TEXT,
    "isLatest" BOOLEAN NOT NULL DEFAULT false,
    "isStable" BOOLEAN NOT NULL DEFAULT true,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "uploadedBy" TEXT NOT NULL,
    "uploadedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppVersion_version_key" ON "AppVersion"("version");

-- CreateIndex
CREATE INDEX "AppVersion_platform_idx" ON "AppVersion"("platform");

-- CreateIndex
CREATE INDEX "AppVersion_isLatest_idx" ON "AppVersion"("isLatest");

-- CreateIndex
CREATE INDEX "AppVersion_version_idx" ON "AppVersion"("version");
