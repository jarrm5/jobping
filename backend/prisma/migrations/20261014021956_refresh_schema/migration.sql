-- CreateTable
CREATE TABLE "zip_code_locations" (
    "id" UUID NOT NULL,
    "zip_code" VARCHAR(10) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zip_code_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zip_code_locations_zip_code_key" ON "zip_code_locations"("zip_code");

-- CreateIndex
CREATE INDEX "zip_code_locations_latitude_longitude_idx" ON "zip_code_locations"("latitude", "longitude");
