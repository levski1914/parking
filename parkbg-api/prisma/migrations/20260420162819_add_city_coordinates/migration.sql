/*
  Warnings:

  - Added the required column `centerLat` to the `cities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `centerLng` to the `cities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "centerLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "centerLng" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "defaultZoom" DOUBLE PRECISION NOT NULL DEFAULT 13;
