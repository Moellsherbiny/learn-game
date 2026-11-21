
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  UserRole,
  GroupChallengeStatus,
} from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { advanceGroupChallengeIfExpired } from "@/lib/group-challenge";
import {
  GROUP_CHALLENGE_QUESTION_DURATION_SECONDS,
} from "@/lib/group-challenge-constants";

// ============================================
// Authentication
// ============================================

async function requireTeacher() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("يجب تسجيل الدخول أولاً.");
  }

  if (session.user.role !== UserRole.TEACHER) {
    throw new Error("غير مصرح لك.");
  }

  return session.user.id;
}

// ============================================
// 1. Get Challenge Control State
// ============================================

export async function getGroupChallengeControlStateAction(
  challengeId: string
) {
  const teacherId = await requireTeacher();

  if (!challengeId?.trim()) {
    throw new Error("معرف التحدي غير صحيح.");
  }

  // Automatically advance the challenge if the current question expired.
  // The helper also finishes the challenge after the last question.
  await advanceGroupChallengeIfExpired(challengeId);

  const challenge = await prisma.groupChallenge.findFirst({
    where: {
      id: challengeId,
      teacherId,
    },

    include: {
      course: {
        select: {
          id: true,
          title: true,
        },
      },

      questions: {
        orderBy: {
          order: "asc",
        },

        select: {
          id: true,
          question: true,
          order: true,

          _count: {
            select: {
              answers: true,
            },
          },
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
          joinedAt: true,

          student: {
            select: {
              id: true,
              name: true,
              image: true,
              level: true,
              xp: true,
            },
          },
        },
      },

      _count: {
        select: {
          participants: true,
          questions: true,
        },
      },
    },
  });

  if (!challenge) {
    throw new Error("التحدي غير موجود أو غير مصرح لك.");
  }

  const teamA = challenge.participants.filter(
    (participant) => participant.team === "TEAM_A"
  );

  const teamB = challenge.participants.filter(
    (participant) => participant.team === "TEAM_B"
  );

  const readyCount = challenge.participants.filter(
    (participant) => participant.isReady
  ).length;

  // Every question has a fixed duration of 60 seconds.
  const questions = challenge.questions.map((question) => ({
    ...question,
    timeLimit: GROUP_CHALLENGE_QUESTION_DURATION_SECONDS,
  }));

  return {
    ...challenge,
    questions,

    currentQuestion:
      questions[challenge.currentQuestionIndex] ?? null,

    statistics: {
      totalParticipants: challenge.participants.length,
      readyCount,

      waitingCount:
        challenge.participants.length - readyCount,

      teamA: {
        count: teamA.length,
        score: teamA.reduce(
          (total, participant) => total + participant.score,
          0
        ),
      },

      teamB: {
        count: teamB.length,
        score: teamB.reduce(
          (total, participant) => total + participant.score,
          0
        ),
      },
    },
  };
}

// ============================================
// 2. Start Group Challenge
// ============================================

export async function startGroupChallengeAction(
  challengeId: string
) {
  const teacherId = await requireTeacher();

  if (!challengeId?.trim()) {
    throw new Error("معرف التحدي غير صحيح.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const challenge = await tx.groupChallenge.findFirst({
      where: {
        id: challengeId,
        teacherId,
      },

      include: {
        _count: {
          select: {
            questions: true,
            participants: true,
          },
        },

        participants: {
          select: {
            isReady: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new Error("التحدي غير موجود أو غير مصرح لك.");
    }

    if (challenge.status !== GroupChallengeStatus.WAITING) {
      throw new Error(
        "لا يمكن بدء هذا التحدي في حالته الحالية."
      );
    }

    if (challenge._count.questions === 0) {
      throw new Error("لا يمكن بدء تحدي بدون أسئلة.");
    }

    if (challenge._count.participants === 0) {
      throw new Error("لا يوجد طلاب منضمون إلى التحدي.");
    }

    const allReady = challenge.participants.every(
      (participant) => participant.isReady
    );

    if (!allReady) {
      throw new Error(
        "يجب أن يكون جميع الطلاب جاهزين أولاً."
      );
    }

    const now = new Date();

    const updated = await tx.groupChallenge.updateMany({
      where: {
        id: challengeId,
        teacherId,
        status: GroupChallengeStatus.WAITING,
      },

      data: {
        status: GroupChallengeStatus.LIVE,
        currentQuestionIndex: 0,
        startedAt: now,
        currentQuestionStartedAt: now,
      },
    });

    if (updated.count !== 1) {
      throw new Error(
        "تم تغيير حالة التحدي بالفعل. حاول مرة أخرى."
      );
    }

    return tx.groupChallenge.findUniqueOrThrow({
      where: {
        id: challengeId,
      },

      select: {
        id: true,
        title: true,
        status: true,
        currentQuestionIndex: true,
        startedAt: true,
      },
    });
  });

  revalidatePath("/teacher/group-challenges");
  revalidatePath(`/teacher/group-challenges/${challengeId}`);
  revalidatePath("/student/group-challenges");

  return {
    success: true,
    message: "تم بدء التحدي بنجاح.",
    challenge: result,
  };
}
