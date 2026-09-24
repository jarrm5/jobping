-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('open', 'claimed');

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL,
    "homeowner_id" INTEGER NOT NULL,
    "provider_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);
