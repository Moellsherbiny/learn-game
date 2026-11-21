
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
// Helpers
// ============================================

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return hash >>> 0;
}

function stableShuffle<T>(
  items: T[],
  getKey: (item: T) => string,
  seed: string
): T[] {
  return [...items].sort((a, b) => {
    const hashA = hashString(`${seed}:${getKey(a)}`);
    const hashB = hashString(`${seed}:${getKey(b)}`);

    if (hashA === hashB) {
      return getKey(a).localeCompare(getKey(b));
    }

    return hashA - hashB;
  });
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

  // ============================================
  // Team Statistics
  // ============================================

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

  // ============================================
  // Current Question State
  // ============================================

  let currentQuestion = null;
  let hasAnswered = false;
  let remainingSeconds: number | null = null;

  // Do not expose questions before the challenge starts
  if (challenge.status === GroupChallengeStatus.LIVE) {
    const question = await prisma.challengeQuestion.findFirst({
      where: {
        challengeId,
        order: challenge.currentQuestionIndex + 1,
      },
      select: {
        id: true,
        question: true,
        gameType: true,

        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,

        leftText: true,
        rightText: true,

        order: true,
        timeLimit: true,

        challengeQuestionItems: {
          select: {
            id: true,
            leftText: true,
            rightText: true,
          },
        },
      },
    });

    if (question) {
      // Reject unsupported game types in Group Challenge.
      if (
        question.gameType !== "QUIZ" &&
        question.gameType !== "MATCHING" &&
        question.gameType !== "FILL_BLANKS"
      ) {
        throw new Error(
          "نوع السؤال غير مدعوم في تحديات المجموعات."
        );
      }

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

      // ============================================
      // Prepare Safe Question Data
      // ============================================

      const {
        challengeQuestionItems,
        leftText,
        rightText,
        ...safeQuestion
      } = question;

      if (question.gameType === "MATCHING") {
        const matchingItems = challengeQuestionItems;

        const leftOptions = stableShuffle(
          matchingItems.map((item) => ({
            id: item.id,
            text: item.leftText,
          })),
          (item) => item.id,
          `${question.id}:left`
        );

        const rightOptions = stableShuffle(
          matchingItems.map((item) => ({
            id: item.id,
            text: item.rightText,
          })),
          (item) => item.id,
          `${question.id}:right`
        );

        currentQuestion = {
          ...safeQuestion,
          leftText: null,
          rightText: null,
          matchingOptions: {
            left: leftOptions,
            right: rightOptions,
          },
        };
      } else {
        currentQuestion = {
          ...safeQuestion,
          leftText,
          rightText,
          matchingOptions: null,
        };
      }
    }
  }

  // ============================================
  // Response
  // ============================================

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
