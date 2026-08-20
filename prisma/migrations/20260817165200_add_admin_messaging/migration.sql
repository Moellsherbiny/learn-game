/*
  Warnings:

  - Added the required column `type` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('STUDENT_TEACHER', 'ADMIN_STUDENT', 'ADMIN_TEACHER');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "type" "ConversationType" NOT NULL;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
