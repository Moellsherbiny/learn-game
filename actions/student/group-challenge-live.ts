"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GroupChallengeStatus, UserRole, type GameType } from "@/lib/generated/prisma/client";
import { advanceGroupChallengeIfExpired } from "@/lib/group-challenge";
import { GROUP_CHALLENGE_QUESTION_DURATION_SECONDS } from "@/lib/group-challenge-constants";
import { getMatchingOptionId, stableShuffle } from "@/lib/group-challenge-matching";

async function requireStudent() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("يجب تسجيل الدخول أولاً.");
  if (session.user.role !== UserRole.STUDENT) throw new Error("هذه العملية متاحة للطلاب فقط.");
  return session.user.id;
}

type SafeOption = { id: string; text: string };
type SafeQuestion = {
  id: string;
  question: string;
  gameType: GameType;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  leftText: string | null;
  rightText: string | null;
  order: number;
  timeLimit: number;
  matchingOptions: { left: SafeOption[]; right: SafeOption[] } | null;
};

export async function getStudentGroupChallengeLiveStateAction(challengeId: string) {
  const studentId = await requireStudent();
  if (!challengeId?.trim()) throw new Error("معرف التحدي غير صحيح.");

  const participant = await prisma.challengeParticipant.findUnique({
    where: { challengeId_studentId: { challengeId, studentId } },
    select: { id: true, team: true, isReady: true, score: true },
  });
  if (!participant) throw new Error("أنت غير منضم إلى هذا التحدي.");

  // Question expiry and transition are server-owned and atomic.
  await advanceGroupChallengeIfExpired(challengeId);

  const challenge = await prisma.groupChallenge.findUnique({
    where: { id: challengeId },
    select: {
      id: true,
      title: true,
      status: true,
      currentQuestionIndex: true,
      currentQuestionStartedAt: true,
      course: { select: { title: true } },
      participants: {
        orderBy: { joinedAt: "asc" },
        select: {
          id: true,
          team: true,
          isReady: true,
          score: true,
          student: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });
  if (!challenge) throw new Error("التحدي غير موجود.");

  const teamA = challenge.participants.filter((p) => p.team === "TEAM_A");
  const teamB = challenge.participants.filter((p) => p.team === "TEAM_B");
  const readyCount = challenge.participants.filter((p) => p.isReady).length;

  let currentQuestion: SafeQuestion | null = null;
  let hasAnswered = false;
  let remainingSeconds: number | null = null;

  if (challenge.status === GroupChallengeStatus.LIVE) {
    const question = await prisma.challengeQuestion.findFirst({
      where: { challengeId, order: challenge.currentQuestionIndex + 1 },
      select: {
        id: true, question: true, gameType: true,
        optionA: true, optionB: true, optionC: true, optionD: true,
        leftText: true, rightText: true, order: true,
        challengeQuestionItems: { select: { id: true, leftText: true, rightText: true } },
      },
    });
    if (!question) throw new Error("السؤال الحالي غير موجود.");

    if (question.gameType !== "QUIZ" && question.gameType !== "MATCHING" && question.gameType !== "FILL_BLANKS") {
      throw new Error("نوع السؤال غير مدعوم في تحديات المجموعات.");
    }

    const existingAnswer = await prisma.challengeAnswer.findUnique({
      where: {
        challengeQuestionId_participantId: {
          challengeQuestionId: question.id,
          participantId: participant.id,
        },
      },
      select: { id: true },
    });
    hasAnswered = Boolean(existingAnswer);

    if (challenge.currentQuestionStartedAt) {
      const elapsed = Math.floor((Date.now() - challenge.currentQuestionStartedAt.getTime()) / 1000);
      remainingSeconds = Math.max(0, GROUP_CHALLENGE_QUESTION_DURATION_SECONDS - elapsed);
    }

    const matchingOptions = question.gameType === "MATCHING"
      ? {
          left: stableShuffle(
            question.challengeQuestionItems.map((item) => ({
              id: getMatchingOptionId(question.id, "left", item.id),
              text: item.leftText,
            })),
            (item) => item.id,
            `${question.id}:left`,
          ),
          right: stableShuffle(
            question.challengeQuestionItems.map((item) => ({
              id: getMatchingOptionId(question.id, "right", item.id),
              text: item.rightText,
            })),
            (item) => item.id,
            `${question.id}:right`,
          ),
        }
      : null;

    currentQuestion = {
      id: question.id,
      question: question.question,
      gameType: question.gameType,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      leftText: question.gameType === "MATCHING" ? null : question.leftText,
      rightText: question.gameType === "MATCHING" ? null : question.rightText,
      order: question.order,
      timeLimit: GROUP_CHALLENGE_QUESTION_DURATION_SECONDS,
      matchingOptions,
    };
  }

  return {
    success: true,
    serverTime: new Date().toISOString(),
    challenge: {
      id: challenge.id,
      title: challenge.title,
      status: challenge.status,
      currentQuestionIndex: challenge.currentQuestionIndex,
      course: challenge.course,
    },
    participant,
    currentQuestion,
    hasAnswered,
    remainingSeconds,
    statistics: {
      totalParticipants: challenge.participants.length,
      readyCount,
      waitingCount: challenge.participants.length - readyCount,
      teamA: {
        participants: teamA.length,
        score: teamA.reduce((sum, p) => sum + p.score, 0),
        readyCount: teamA.filter((p) => p.isReady).length,
      },
      teamB: {
        participants: teamB.length,
        score: teamB.reduce((sum, p) => sum + p.score, 0),
        readyCount: teamB.filter((p) => p.isReady).length,
      },
    },
    participants: challenge.participants,
  };
}
