/*
  Warnings:

  - You are about to drop the column `fileData` on the `Recording` table. All the data in the column will be lost.
  - You are about to drop the `Transcript` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transcript" DROP CONSTRAINT "Transcript_recordingId_fkey";

-- AlterTable
ALTER TABLE "Recording" DROP COLUMN "fileData",
ADD COLUMN     "transcripts" TEXT;

-- DropTable
DROP TABLE "Transcript";
