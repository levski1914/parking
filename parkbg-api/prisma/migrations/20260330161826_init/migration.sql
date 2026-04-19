-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OWNER', 'CLIENT');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('MUNICIPALITY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ZoneType" AS ENUM ('BLUE', 'GREEN', 'PINK', 'OTHER');

-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('PRIVATE', 'MUNICIPAL');

-- CreateEnum
CREATE TYPE "ParkingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('ZONE', 'PARKING');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWED', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "ownerType" "OwnerType",
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "zoneType" "ZoneType" NOT NULL,
    "name" TEXT NOT NULL,
    "polygonGeoJson" JSONB NOT NULL,
    "smsNumber" TEXT,
    "smsTemplate" TEXT,
    "priceText" TEXT NOT NULL,
    "maxDurationText" TEXT,
    "workingHoursText" TEXT,
    "extraInfo" TEXT,
    "source" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parkings" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "parkingType" "ParkingType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "priceText" TEXT NOT NULL,
    "approxCapacity" INTEGER,
    "openingHoursText" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "amenities" JSONB,
    "photos" JSONB,
    "status" "ParkingStatus" NOT NULL DEFAULT 'PENDING',
    "source" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parkings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "userId" TEXT,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "zoneId" TEXT,
    "parkingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "zones_cityId_idx" ON "zones"("cityId");

-- CreateIndex
CREATE INDEX "zones_ownerUserId_idx" ON "zones"("ownerUserId");

-- CreateIndex
CREATE INDEX "zones_zoneType_idx" ON "zones"("zoneType");

-- CreateIndex
CREATE INDEX "parkings_cityId_idx" ON "parkings"("cityId");

-- CreateIndex
CREATE INDEX "parkings_ownerUserId_idx" ON "parkings"("ownerUserId");

-- CreateIndex
CREATE INDEX "parkings_parkingType_idx" ON "parkings"("parkingType");

-- CreateIndex
CREATE INDEX "parkings_status_idx" ON "parkings"("status");

-- CreateIndex
CREATE INDEX "parkings_latitude_longitude_idx" ON "parkings"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "reports_userId_idx" ON "reports"("userId");

-- CreateIndex
CREATE INDEX "reports_targetType_targetId_idx" ON "reports"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "reports_zoneId_idx" ON "reports"("zoneId");

-- CreateIndex
CREATE INDEX "reports_parkingId_idx" ON "reports"("parkingId");

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_parkingId_fkey" FOREIGN KEY ("parkingId") REFERENCES "parkings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
