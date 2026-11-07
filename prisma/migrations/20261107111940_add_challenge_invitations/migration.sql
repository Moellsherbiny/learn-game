-- CreateEnum
CREATE TYPE "ChallengeInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "ChallengeInvitation" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "ChallengeInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "ChallengeInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChallengeInvitation_studentId_status_idx" ON "ChallengeInvitation"("studentId", "status");

-- CreateIndex
CREATE INDEX "ChallengeInvitation_challengeId_status_idx" ON "ChallengeInvitation"("challengeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeInvitation_challengeId_studentId_key" ON "ChallengeInvitation"("challengeId", "studentId");

-- AddForeignKey
ALTER TABLE "ChallengeInvitation" ADD CONSTRAINT "ChallengeInvitation_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "GroupChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeInvitation" ADD CONSTRAINT "ChallengeInvitation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
