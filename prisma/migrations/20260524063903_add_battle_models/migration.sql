/*
  Warnings:

  - You are about to drop the column `answeredAt` on the `BattleAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `BattleAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `team` on the `BattleAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `BattleParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `correctAnswer` on the `BattleQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `currentQuestionIndex` on the `BattleRoom` table. All the data in the column will be lost.
  - You are about to drop the column `currentTurn` on the `BattleRoom` table. All the data in the column will be lost.
  - You are about to drop the column `endedAt` on the `BattleRoom` table. All the data in the column will be lost.
  - You are about to drop the column `hostId` on the `BattleRoom` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `BattleRoom` table. All the data in the column will be lost.
  - You are about to drop the column `teamAScore` on the `BattleRoom` table. All the data in the column will be lost.
  - You are about to drop the column `teamBScore` on the `BattleRoom` table. All the data in the column will be lost.
  - The `status` column on the `BattleRoom` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[questionId,studentId]` on the table `BattleAnswer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roomId,studentId]` on the table `BattleParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `answer` to the `BattleAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responseTime` to the `BattleAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `BattleAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `BattleParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `BattleQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BattleQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `BattleRoom` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('WAITING', 'LIVE', 'FINISHED');

-- DropForeignKey
ALTER TABLE "BattleAnswer" DROP CONSTRAINT "BattleAnswer_roomId_fkey";

-- DropForeignKey
ALTER TABLE "BattleParticipant" DROP CONSTRAINT "BattleParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "BattleRoom" DROP CONSTRAINT "BattleRoom_hostId_fkey";

-- DropIndex
DROP INDEX "BattleParticipant_roomId_userId_key";

-- AlterTable
ALTER TABLE "BattleAnswer" DROP COLUMN "answeredAt",
DROP COLUMN "roomId",
DROP COLUMN "team",
ADD COLUMN     "answer" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "responseTime" INTEGER NOT NULL,
ADD COLUMN     "studentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BattleParticipant" DROP COLUMN "userId",
ADD COLUMN     "isReady" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "studentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BattleQuestion" DROP COLUMN "correctAnswer",
ADD COLUMN     "answer" TEXT,
ADD COLUMN     "leftText" TEXT,
ADD COLUMN     "optionA" TEXT,
ADD COLUMN     "optionB" TEXT,
ADD COLUMN     "optionC" TEXT,
ADD COLUMN     "optionD" TEXT,
ADD COLUMN     "rightText" TEXT,
ADD COLUMN     "timeLimit" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "type" "GameType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "points" SET DEFAULT 100;

-- AlterTable
ALTER TABLE "BattleRoom" DROP COLUMN "currentQuestionIndex",
DROP COLUMN "currentTurn",
DROP COLUMN "endedAt",
DROP COLUMN "hostId",
DROP COLUMN "startedAt",
DROP COLUMN "teamAScore",
DROP COLUMN "teamBScore",
ADD COLUMN     "currentQuestion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "teacherId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BattleStatus" NOT NULL DEFAULT 'WAITING';

-- DropEnum
DROP TYPE "RoomStatus";

-- CreateIndex
CREATE UNIQUE INDEX "BattleAnswer_questionId_studentId_key" ON "BattleAnswer"("questionId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "BattleParticipant_roomId_studentId_key" ON "BattleParticipant"("roomId", "studentId");

-- AddForeignKey
ALTER TABLE "BattleRoom" ADD CONSTRAINT "BattleRoom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleParticipant" ADD CONSTRAINT "BattleParticipant_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleAnswer" ADD CONSTRAINT "BattleAnswer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
