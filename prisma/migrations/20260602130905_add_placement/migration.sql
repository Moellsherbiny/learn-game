/*
  Warnings:

  - You are about to drop the column `aiFeedback` on the `PlacementTest` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `PlacementTest` table. All the data in the column will be lost.
  - You are about to drop the column `recommended` on the `PlacementTest` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `PlacementTest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PlacementTest` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PlacementTest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[courseId]` on the table `PlacementTest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `PlacementTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questions` to the `PlacementTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `PlacementTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PlacementTest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlacementTest" DROP CONSTRAINT "PlacementTest_userId_fkey";

-- AlterTable
ALTER TABLE "PlacementTest" DROP COLUMN "aiFeedback",
DROP COLUMN "level",
DROP COLUMN "recommended",
DROP COLUMN "score",
DROP COLUMN "status",
DROP COLUMN "userId",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "questions" JSONB NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "PlacementResult" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "level" "StudentLevel" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "strengths" JSONB,
    "weaknesses" JSONB,
    "feedback" TEXT,
    "answers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacementResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlacementResult_studentId_courseId_key" ON "PlacementResult"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "PlacementTest_courseId_key" ON "PlacementTest"("courseId");

-- AddForeignKey
ALTER TABLE "PlacementTest" ADD CONSTRAINT "PlacementTest_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementResult" ADD CONSTRAINT "PlacementResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementResult" ADD CONSTRAINT "PlacementResult_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
