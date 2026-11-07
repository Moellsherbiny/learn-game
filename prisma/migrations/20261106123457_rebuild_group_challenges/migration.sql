/*
  Warnings:

  - You are about to drop the `BattleAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BattleInvitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BattleParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BattleQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BattleRoom` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GroupChallengeStatus" AS ENUM ('WAITING', 'LIVE', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChallengeTeam" AS ENUM ('TEAM_A', 'TEAM_B');

-- DropForeignKey
ALTER TABLE "BattleAnswer" DROP CONSTRAINT "BattleAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "BattleAnswer" DROP CONSTRAINT "BattleAnswer_studentId_fkey";

-- DropForeignKey
ALTER TABLE "BattleInvitation" DROP CONSTRAINT "BattleInvitation_roomId_fkey";

-- DropForeignKey
ALTER TABLE "BattleInvitation" DROP CONSTRAINT "BattleInvitation_studentId_fkey";

-- DropForeignKey
ALTER TABLE "BattleParticipant" DROP CONSTRAINT "BattleParticipant_roomId_fkey";

-- DropForeignKey
ALTER TABLE "BattleParticipant" DROP CONSTRAINT "BattleParticipant_studentId_fkey";

-- DropForeignKey
ALTER TABLE "BattleQuestion" DROP CONSTRAINT "BattleQuestion_roomId_fkey";

-- DropForeignKey
ALTER TABLE "BattleRoom" DROP CONSTRAINT "BattleRoom_teacherId_fkey";

-- DropTable
DROP TABLE "BattleAnswer";

-- DropTable
DROP TABLE "BattleInvitation";

-- DropTable
DROP TABLE "BattleParticipant";

-- DropTable
DROP TABLE "BattleQuestion";

-- DropTable
DROP TABLE "BattleRoom";

-- DropEnum
DROP TYPE "BattleInvitationStatus";

-- DropEnum
DROP TYPE "BattleStatus";

-- DropEnum
DROP TYPE "TeamType";

-- CreateTable
CREATE TABLE "GroupChallenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "GroupChallengeStatus" NOT NULL DEFAULT 'WAITING',
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeQuestion" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "lessonContentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeParticipant" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "team" "ChallengeTeam" NOT NULL,
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeAnswer" (
    "id" TEXT NOT NULL,
    "challengeQuestionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupChallenge_code_key" ON "GroupChallenge"("code");

-- CreateIndex
CREATE INDEX "GroupChallenge_teacherId_status_idx" ON "GroupChallenge"("teacherId", "status");

-- CreateIndex
CREATE INDEX "GroupChallenge_courseId_idx" ON "GroupChallenge"("courseId");

-- CreateIndex
CREATE INDEX "ChallengeQuestion_lessonContentId_idx" ON "ChallengeQuestion"("lessonContentId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeQuestion_challengeId_lessonContentId_key" ON "ChallengeQuestion"("challengeId", "lessonContentId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeQuestion_challengeId_order_key" ON "ChallengeQuestion"("challengeId", "order");

-- CreateIndex
CREATE INDEX "ChallengeParticipant_challengeId_team_idx" ON "ChallengeParticipant"("challengeId", "team");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeParticipant_challengeId_studentId_key" ON "ChallengeParticipant"("challengeId", "studentId");

-- CreateIndex
CREATE INDEX "ChallengeAnswer_participantId_idx" ON "ChallengeAnswer"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeAnswer_challengeQuestionId_participantId_key" ON "ChallengeAnswer"("challengeQuestionId", "participantId");

-- AddForeignKey
ALTER TABLE "GroupChallenge" ADD CONSTRAINT "GroupChallenge_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupChallenge" ADD CONSTRAINT "GroupChallenge_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeQuestion" ADD CONSTRAINT "ChallengeQuestion_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "GroupChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeQuestion" ADD CONSTRAINT "ChallengeQuestion_lessonContentId_fkey" FOREIGN KEY ("lessonContentId") REFERENCES "LessonContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipant" ADD CONSTRAINT "ChallengeParticipant_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "GroupChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipant" ADD CONSTRAINT "ChallengeParticipant_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAnswer" ADD CONSTRAINT "ChallengeAnswer_challengeQuestionId_fkey" FOREIGN KEY ("challengeQuestionId") REFERENCES "ChallengeQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAnswer" ADD CONSTRAINT "ChallengeAnswer_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ChallengeParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
