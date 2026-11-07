/*
  Warnings:

  - Added the required column `question` to the `ChallengeQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChallengeQuestion" DROP CONSTRAINT "ChallengeQuestion_lessonContentId_fkey";

-- DropIndex
DROP INDEX "ChallengeQuestion_challengeId_lessonContentId_key";

-- AlterTable
ALTER TABLE "ChallengeParticipant" ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ChallengeQuestion" ADD COLUMN     "answer" TEXT,
ADD COLUMN     "leftText" TEXT,
ADD COLUMN     "optionA" TEXT,
ADD COLUMN     "optionB" TEXT,
ADD COLUMN     "optionC" TEXT,
ADD COLUMN     "optionD" TEXT,
ADD COLUMN     "question" TEXT NOT NULL,
ADD COLUMN     "rightText" TEXT,
ALTER COLUMN "lessonContentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GroupChallenge" ADD COLUMN     "pointsPerQuestion" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "questionTimeSeconds" INTEGER NOT NULL DEFAULT 20;

-- AddForeignKey
ALTER TABLE "ChallengeQuestion" ADD CONSTRAINT "ChallengeQuestion_lessonContentId_fkey" FOREIGN KEY ("lessonContentId") REFERENCES "LessonContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
