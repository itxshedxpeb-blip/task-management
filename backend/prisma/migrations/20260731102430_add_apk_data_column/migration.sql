-- AlterTable
ALTER TABLE "AppVersion" DROP COLUMN "fileUrl";

-- AlterTable
ALTER TABLE "AppVersion" ADD COLUMN "apkData" BYTEA;

-- CreateIndex
CREATE UNIQUE INDEX "AppVersion_platform_key" ON "AppVersion"("platform");

-- DropIndex
DROP INDEX "AppVersion_versionName_key";
