/*
  Warnings:

  - The primary key for the `Recording` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `transcripts` on the `Recording` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Recording` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'ANNOTATOR', 'REVIEWER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'MODIFIED', 'REVIEWED');

-- DropForeignKey
ALTER TABLE "Recording" DROP CONSTRAINT "Recording_userId_fkey";

-- AlterTable
ALTER TABLE "Recording" DROP CONSTRAINT "Recording_pkey",
DROP COLUMN "transcripts",
DROP COLUMN "userId",
ADD COLUMN     "helper_text" TEXT,
ADD COLUMN     "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modified_by_id" TEXT,
ADD COLUMN     "reviewed_by_id" TEXT,
ADD COLUMN     "reviewed_transcript" TEXT,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transcript" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Recording_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Recording_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_modified_by_id_fkey" FOREIGN KEY ("modified_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
