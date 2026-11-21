-- AlterTable
ALTER TABLE "ChallengeAnswer" ADD COLUMN     "answerData" JSONB;

-- CreateTable
CREATE TABLE "ChallengeQuestionItem" (
    "id" TEXT NOT NULL,
    "challengeQuestionId" TEXT NOT NULL,
    "leftText" TEXT NOT NULL,
    "rightText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeQuestionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChallengeQuestionItem_challengeQuestionId_idx" ON "ChallengeQuestionItem"("challengeQuestionId");

-- AddForeignKey
ALTER TABLE "ChallengeQuestionItem" ADD CONSTRAINT "ChallengeQuestionItem_challengeQuestionId_fkey" FOREIGN KEY ("challengeQuestionId") REFERENCES "ChallengeQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
