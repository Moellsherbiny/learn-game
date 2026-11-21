
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  GroupChallengeStatus,
  UserRole,
} from "@/lib/generated/prisma/client";

import {
  GROUP_CHALLENGE_QUESTION_DURATION_SECONDS,
} from "@/lib/group-challenge-constants";

export async function advanceGroupChallengeIfExpired(
  challengeId: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("يجب تسجيل الدخول أولاً.");
  }

  if (!challengeId?.trim()) {
    throw new Error("معرف التحدي غير صحيح.");
  }

  const userId = session.user.id;

  // Verify that the current user is authorized.
  const isAuthorized =
    session.user.role === UserRole.TEACHER
      ? await prisma.groupChallenge.findFirst({
          where: {
            id: challengeId,
            teacherId: userId,
          },
          select: {
            id: true,
          },
        })
      : session.user.role === UserRole.STUDENT
        ? await prisma.challengeParticipant.findUnique({
            where: {
              challengeId_studentId: {
                challengeId,
                studentId: userId,
              },
            },
            select: {
              id: true,
            },
          })
        : null;

  if (!isAuthorized) {
    throw new Error("غير مصرح لك بالوصول إلى هذا التحدي.");
  }

  // Get the current challenge state.
  const challenge = await prisma.groupChallenge.findUnique({
    where: {
      id: challengeId,
    },
    select: {
      status: true,
      currentQuestionIndex: true,
      currentQuestionStartedAt: true,
    },
  });

  if (
    !challenge ||
    challenge.status !== GroupChallengeStatus.LIVE ||
    !challenge.currentQuestionStartedAt
  ) {
    return false;
  }

  // Get the total number of questions.
  const totalQuestions = await prisma.challengeQuestion.count({
    where: {
      challengeId,
    },
  });

  if (totalQuestions === 0) {
    return false;
  }

  // Check whether the current question has expired.
  const elapsed =
    Date.now() - challenge.currentQuestionStartedAt.getTime();

  const durationMs =
    GROUP_CHALLENGE_QUESTION_DURATION_SECONDS * 1000;

  if (elapsed < durationMs) {
    return false;
  }

  const now = new Date();

  const isLastQuestion =
    challenge.currentQuestionIndex + 1 >= totalQuestions;

  // Atomically advance the question or finish the challenge.
  const updated = await prisma.groupChallenge.updateMany({
    where: {
      id: challengeId,
      status: GroupChallengeStatus.LIVE,
      currentQuestionIndex: challenge.currentQuestionIndex,
      currentQuestionStartedAt: challenge.currentQuestionStartedAt,
    },

    data: isLastQuestion
      ? {
          status: GroupChallengeStatus.FINISHED,
          finishedAt: now,
        }
      : {
          currentQuestionIndex: {
            increment: 1,
          },
          currentQuestionStartedAt: now,
        },
  });

  return updated.count === 1;
}
