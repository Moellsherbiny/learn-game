"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  UserRole,
  GroupChallengeStatus,
} from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { advanceGroupChallengeIfExpired } from "@/lib/group-challenge";
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
          timeLimit: true,
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

  return {
    ...challenge,

    currentQuestion:
      challenge.questions[challenge.currentQuestionIndex] ?? null,

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
      throw new Error("لا يمكن بدء هذا التحدي في حالته الحالية.");
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
      throw new Error("يجب أن يكون جميع الطلاب جاهزين أولاً.");
    }

    const updated = await tx.groupChallenge.updateMany({
      where: {
        id: challengeId,
        teacherId,
        status: GroupChallengeStatus.WAITING,
      },

      data: {
        status: GroupChallengeStatus.LIVE,
        currentQuestionIndex: 0,
        startedAt: new Date(),
        currentQuestionStartedAt: new Date()
      },
    });

    if (updated.count !== 1) {
      throw new Error("تم تغيير حالة التحدي بالفعل. حاول مرة أخرى.");
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

// ============================================
// 3. Next Challenge Question
// ============================================

export async function nextGroupChallengeQuestionAction(
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
          },
        },
      },
    });

    if (!challenge) {
      throw new Error("التحدي غير موجود أو غير مصرح لك.");
    }

    if (challenge.status !== GroupChallengeStatus.LIVE) {
      throw new Error("التحدي ليس قيد التشغيل.");
    }

    const nextIndex = challenge.currentQuestionIndex + 1;

    if (nextIndex >= challenge._count.questions) {
      throw new Error(
        "وصلت إلى آخر سؤال. يمكنك إنهاء التحدي الآن."
      );
    }

    const updated = await tx.groupChallenge.updateMany({
      where: {
        id: challengeId,
        teacherId,
        status: GroupChallengeStatus.LIVE,
        currentQuestionIndex: challenge.currentQuestionIndex,
      },

      data: {
        currentQuestionIndex: {
          increment: 1,
        },
        currentQuestionStartedAt:new Date()
      },
    });

    if (updated.count !== 1) {
      throw new Error(
        "تم تحديث السؤال بالفعل. أعد تحميل بيانات التحدي."
      );
    }

    return tx.groupChallenge.findUniqueOrThrow({
      where: {
        id: challengeId,
      },

      include: {
        questions: {
          where: {
            order: nextIndex + 1,
          },

          select: {
            id: true,
            question: true,
            order: true,
            timeLimit: true,
          },
        },
      },
    });
  });

  revalidatePath(`/teacher/group-challenges/${challengeId}`);
  revalidatePath("/student/group-challenges");

  return {
    success: true,
    message: "تم الانتقال إلى السؤال التالي.",
    challenge: result,
    currentQuestion: result.questions[0] ?? null,
  };
}

// ============================================
// 4. Finish Group Challenge
// ============================================

export async function finishGroupChallengeAction(
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

      select: {
        id: true,
        status: true,
      },
    });

    if (!challenge) {
      throw new Error("التحدي غير موجود أو غير مصرح لك.");
    }

    if (challenge.status !== GroupChallengeStatus.LIVE) {
      throw new Error("لا يمكن إنهاء التحدي في حالته الحالية.");
    }

    const updated = await tx.groupChallenge.updateMany({
      where: {
        id: challengeId,
        teacherId,
        status: GroupChallengeStatus.LIVE,
      },

      data: {
        status: GroupChallengeStatus.FINISHED,
        finishedAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      throw new Error("تعذر إنهاء التحدي. حاول مرة أخرى.");
    }

    return tx.groupChallenge.findUniqueOrThrow({
      where: {
        id: challengeId,
      },

      select: {
        id: true,
        title: true,
        status: true,
        startedAt: true,
        finishedAt: true,
        currentQuestionIndex: true,
      },
    });
  });

  revalidatePath("/teacher/group-challenges");
  revalidatePath(`/teacher/group-challenges/${challengeId}`);
  revalidatePath("/student/group-challenges");

  return {
    success: true,
    message: "تم إنهاء التحدي بنجاح.",
    challenge: result,
  };
}
