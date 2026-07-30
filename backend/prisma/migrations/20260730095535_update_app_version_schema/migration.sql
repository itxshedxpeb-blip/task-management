/*
  Warnings:

  - You are about to drop the column `buildNumber` on the `AppVersion` table. All the data in the column will be lost.
  - You are about to drop the column `isStable` on the `AppVersion` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `AppVersion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[versionName]` on the table `AppVersion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `versionCode` to the `AppVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionName` to the `AppVersion` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AppVersion_version_idx";

-- DropIndex
DROP INDEX "AppVersion_version_key";

-- AlterTable
ALTER TABLE "AppVersion" DROP COLUMN "buildNumber",
DROP COLUMN "isStable",
DROP COLUMN "version",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isMandatory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minimumSupportedVersion" TEXT,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "versionCode" INTEGER NOT NULL,
ADD COLUMN     "versionName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AppVersion_versionName_key" ON "AppVersion"("versionName");

-- CreateIndex
CREATE INDEX "AppVersion_isActive_idx" ON "AppVersion"("isActive");

-- CreateIndex
CREATE INDEX "AppVersion_versionName_idx" ON "AppVersion"("versionName");
