/*
  Warnings:

  - The values [open,claimed,closed] on the enum `JobStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `category` on the `Job` table. All the data in the column will be lost.
  - Added the required column `service_type_id` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urgency` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobUrgency" AS ENUM ('ASAP', 'WITHIN_WEEK', 'FLEXIBLE');

-- AlterEnum
BEGIN;
CREATE TYPE "JobStatus_new" AS ENUM ('OPEN', 'CLAIMED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "JobStatus_new" USING ("status"::text::"JobStatus_new");
ALTER TYPE "JobStatus" RENAME TO "JobStatus_old";
ALTER TYPE "JobStatus_new" RENAME TO "JobStatus";
DROP TYPE "public"."JobStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "category",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "service_type_id" INTEGER NOT NULL,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "urgency" "JobUrgency" NOT NULL,
ALTER COLUMN "zip_code" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "Homeowner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Homeowner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "service_radius" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderService" (
    "provider_id" INTEGER NOT NULL,
    "service_type_id" INTEGER NOT NULL,

    CONSTRAINT "ProviderService_pkey" PRIMARY KEY ("provider_id","service_type_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Homeowner_email_key" ON "Homeowner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_email_key" ON "Provider"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_name_key" ON "ServiceType"("name");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_service_type_id_idx" ON "Job"("service_type_id");

-- CreateIndex
CREATE INDEX "Job_zip_code_idx" ON "Job"("zip_code");

-- AddForeignKey
ALTER TABLE "ProviderService" ADD CONSTRAINT "ProviderService_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderService" ADD CONSTRAINT "ProviderService_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_homeowner_id_fkey" FOREIGN KEY ("homeowner_id") REFERENCES "Homeowner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
