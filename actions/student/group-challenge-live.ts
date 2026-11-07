
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  UserRole,
  GroupChallengeStatus,
} from "@/lib/generated/prisma/client";

// ============================================
// Authentication
// ============================================

async function requireStudent() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("يجب تسجيل الدخول أولاً.");
  }

  if (session.user.role !== UserRole.STUDENT) {
    throw new Error("هذه العملية متاحة للطلاب فقط.");
  }

  return session.user.id;
}

// ============================================
// Get Live Challenge State
// ============================================

export async function getStudentGroupChallengeLiveStateAction(
  challengeId: string
) {
  const studentId = await requireStudent();

  if (!challengeId?.trim()) {
    throw new Error("معرف التحدي غير صحيح.");
  }

  // Verify student participation
  const participant = await prisma.challengeParticipant.findUnique({
    where: {
      challengeId_studentId: {
        challengeId,
        studentId,
      },
    },

    select: {
      id: true,
      team: true,
      isReady: true,
      score: true,
    },
  });

  if (!participant) {
    throw new Error("أنت غير منضم إلى هذا التحدي.");
  }

  // Get challenge state
  const challenge = await prisma.groupChallenge.findUnique({
    where: {
      id: challengeId,
    },

    select: {
      id: true,
      title: true,
      status: true,
      currentQuestionIndex: true,
      currentQuestionStartedAt: true,

      course: {
        select: {
          title: true,
        },
      },

      participants: {
        orderBy: {
          joinedAt: "asc",
        },

        select: {
          id: true,
          team: true,
          isReady: true,
          score: true,

          student: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!challenge) {
    throw new Error("التحدي غير موجود.");
  }

  const teamA = challenge.participants.filter(
    (item) => item.team === "TEAM_A"
  );

  const teamB = challenge.participants.filter(
    (item) => item.team === "TEAM_B"
  );

  const teamStatistics = {
    teamA: {
      participants: teamA.length,
      score: teamA.reduce(
        (total, item) => total + item.score,
        0
      ),
      readyCount: teamA.filter((item) => item.isReady).length,
    },

    teamB: {
      participants: teamB.length,
      score: teamB.reduce(
        (total, item) => total + item.score,
        0
      ),
      readyCount: teamB.filter((item) => item.isReady).length,
    },
  };

  const readyCount = challenge.participants.filter(
    (item) => item.isReady
  ).length;

  // Do not expose questions before the challenge starts
  let currentQuestion = null;
  let hasAnswered = false;
  let remainingSeconds = null;

  if (challenge.status === GroupChallengeStatus.LIVE) {
    const question = await prisma.challengeQuestion.findFirst({
      where: {
        challengeId,
        order: challenge.currentQuestionIndex + 1,
      },

      select: {
        id: true,
        question: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        leftText: true,
        rightText: true,
        order: true,
        timeLimit: true,
      },
    });

    if (question) {
      currentQuestion = question;

      const existingAnswer = await prisma.challengeAnswer.findUnique({
        where: {
          challengeQuestionId_participantId: {
            challengeQuestionId: question.id,
            participantId: participant.id,
          },
        },

        select: {
          id: true,
          isCorrect: true,
          responseTime: true,
        },
      });

      hasAnswered = Boolean(existingAnswer);

      if (challenge.currentQuestionStartedAt) {
        const elapsedMilliseconds =
          Date.now() -
          challenge.currentQuestionStartedAt.getTime();

        const elapsedSeconds = Math.floor(
          elapsedMilliseconds / 1000
        );

        remainingSeconds = Math.max(
          0,
          question.timeLimit - elapsedSeconds
        );
      }
    }
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
      waitingCount:
        challenge.participants.length - readyCount,
      ...teamStatistics,
    },

    participants: challenge.participants,
  };
}
