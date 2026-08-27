-- CreateEnum
CREATE TYPE "BattleInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "BattleInvitation" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "team" "TeamType" NOT NULL,
    "status" "BattleInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "BattleInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BattleInvitation_studentId_status_idx" ON "BattleInvitation"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BattleInvitation_roomId_studentId_key" ON "BattleInvitation"("roomId", "studentId");

-- AddForeignKey
ALTER TABLE "BattleInvitation" ADD CONSTRAINT "BattleInvitation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "BattleRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleInvitation" ADD CONSTRAINT "BattleInvitation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
