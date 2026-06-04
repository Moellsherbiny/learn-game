"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// =========================================
// COURSE MAP
// =========================================

export async function getCourseWithModulesAction(courseId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const studentId = session.user.id;

  // =========================================
  // COURSE
  // =========================================

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },

    select: {
      id: true,

      title: true,

      description: true,

      thumbnail: true,

      teacher: {
        select: {
          name: true,

          image: true,
        },
      },

      enrollments: {
        where: {
          studentId,
        },

        select: {
          id: true,
        },
      },

      modules: {
        orderBy: {
          order: "asc",
        },

        select: {
          id: true,

          title: true,

          description: true,

          requiredXp: true,

          order: true,

          level: true,
          lessons: {
            orderBy: {
              order: "asc",
            },

            select: {
              id: true,

              title: true,

              description: true,

              order: true,

              xpReward: true,

              gameType: true,

              progress: {
                where: {
                  studentId,
                },

                select: {
                  completed: true,

                  score: true,

                  stars: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return null;
  }

  // =========================================
  // STUDENT XP
  // =========================================

  const totalXpEarned = await prisma.progress.aggregate({
    where: {
      studentId,

      lesson: {
        module: {
          courseId,
        },
      },
    },

    _sum: {
      xpEarned: true,
    },
  });

  const progressStats =   await prisma.progress.findMany({
    where: {
      studentId,
      completed: true,

      lesson: {
        module: {
          courseId,
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },

    take: 3,
  });

  const avgScore =
    progressStats.length > 0
      ? progressStats.reduce((sum, p) => sum + p.score, 0) /
        progressStats.length
      : 0;

  const avgAttempts =
    progressStats.length > 0
      ? progressStats.reduce((sum, p) => sum + p.attempts, 0) /
        progressStats.length
      : 1;
  const isFastLearner =
    progressStats.length === 3 && avgScore >= 85 && avgAttempts <= 1.5;
  return {
    ...course,

    studentXp: totalXpEarned._sum.xpEarned ?? 0,

    isEnrolled: course.enrollments.length > 0,
    isFastLearner,
  };
}

// =========================================
// LESSON DETAILS
// =========================================

export async function getLessonWithContentsAction(lessonId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const studentId = session.user.id;

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },

    include: {
      contents: {
        orderBy: {
          sortOrder: "asc",
        },
      },

      module: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },

      progress: {
        where: {
          studentId,
        },
      },
    },
  });

  return lesson;
}

// =========================================
// SUBMIT INPUT
// =========================================

export type SubmitLessonInput = {
  lessonId: string;

  score: number;

  timeTakenSeconds?: number;
};

// =========================================
// LEVEL SYSTEM
// =========================================

function calculateLevel(xp: number) {
  return Math.floor(xp / 1000) + 1;
}

// =========================================
// SUBMIT LESSON PROGRESS
// =========================================

export async function submitLessonProgressAction(input: SubmitLessonInput) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const studentId = session.user.id;

  const { lessonId, score } = input;

  // =========================================
  // LESSON
  // =========================================

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },

    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // =========================================
  // USER
  // =========================================

  const user = await prisma.user.findUnique({
    where: {
      id: studentId,
    },

    select: {
      id: true,

      xp: true,

      coins: true,

      streak: true,

      currentLevel: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // =========================================
  // GAME RESULT
  // =========================================

  const completed = score >= lesson.minScore;

  // STARS

  let stars = 0;

  if (score >= 95) {
    stars = 3;
  } else if (score >= 80) {
    stars = 2;
  } else if (score >= lesson.minScore) {
    stars = 1;
  }

  // XP

  const xpEarned = completed ? Math.round(lesson.xpReward * (score / 100)) : 0;

  // =========================================
  // EXISTING PROGRESS
  // =========================================

  const existing = await prisma.progress.findUnique({
    where: {
      studentId_lessonId: {
        studentId,

        lessonId,
      },
    },
  });

  const shouldUpdateScore = !existing || score > existing.score;

  // =========================================
  // UPSERT PROGRESS
  // =========================================

  const progress = await prisma.progress.upsert({
    where: {
      studentId_lessonId: {
        studentId,

        lessonId,
      },
    },

    create: {
      studentId,

      lessonId,

      completed,

      score,

      stars,

      xpEarned,

      attempts: 1,
    },

    update: {
      completed: existing?.completed || completed,

      score: shouldUpdateScore ? score : existing!.score,

      stars: Math.max(existing?.stars ?? 0, stars),

      xpEarned: shouldUpdateScore ? xpEarned : existing!.xpEarned,

      attempts: {
        increment: 1,
      },
    },
  });

  // =========================================
  // XP + COINS + LEVEL
  // =========================================

  let xpDifference = 0;

  let coinsDifference = 0;

  let didLevelUp = false;

  let newLevel = user.currentLevel;

  if (shouldUpdateScore) {
    xpDifference = xpEarned - (existing?.xpEarned ?? 0);

    coinsDifference = Math.floor(xpDifference / 2);

    if (xpDifference > 0) {
      const newXp = user.xp + xpDifference;

      newLevel = calculateLevel(newXp);

      didLevelUp = newLevel > user.currentLevel;

      await prisma.user.update({
        where: {
          id: studentId,
        },

        data: {
          xp: {
            increment: xpDifference,
          },

          coins: {
            increment: coinsDifference,
          },

          currentLevel: newLevel,

          ...(completed && {
            streak: {
              increment: 1,
            },
          }),
        },
      });
    }
  }

  // =========================================
  // LEADERBOARD
  // =========================================

  const updatedUser = await prisma.user.findUnique({
    where: {
      id: studentId,
    },

    select: {
      xp: true,

      role: true,
    },
  });

  // ONLY STUDENTS
  if (updatedUser?.role === "STUDENT") {
    await prisma.leaderboard.upsert({
      where: {
        studentId,
      },

      create: {
        studentId,

        score: updatedUser.xp,
      },

      update: {
        score: updatedUser.xp,
      },
    });
  }

  // =========================================
  // REVALIDATE
  // =========================================

  revalidatePath(`/student/courses/${lesson.module.courseId}`);

  revalidatePath(
    `/student/courses/${lesson.module.courseId}/learn/${lessonId}`,
  );

  revalidatePath("/leaderboard");

  revalidatePath("/student");

  // =========================================
  // RESPONSE
  // =========================================

  return {
    success: true,

    completed,

    score,

    stars,

    xpEarned,

    coinsEarned: coinsDifference,

    isImprovement: shouldUpdateScore && !!existing,

    isFirstCompletion: !existing?.completed && completed,

    previousScore: existing?.score ?? null,

    didLevelUp,

    newLevel,

    progress,
  };
}

// =========================================
// LEADERBOARD
// =========================================

export async function getLeaderboardAction() {
  const entries = await prisma.leaderboard.findMany({
    take: 20,

    orderBy: {
      score: "desc",
    },

    include: {
      student: {
        select: {
          id: true,

          name: true,

          image: true,

          role: true,

          currentLevel: true,

          xp: true,
        },
      },
    },
  });

  // ONLY STUDENTS

  return entries.filter((entry) => entry.student.role === "STUDENT");
}

// =========================================
// STUDENT STATS
// =========================================

export async function getStudentStatsAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const studentId = session.user.id;

  const stats = await prisma.progress.aggregate({
    where: {
      studentId,
    },

    _sum: {
      xpEarned: true,

      stars: true,
    },

    _count: {
      completed: true,
    },
  });

  const completedCount = await prisma.progress.count({
    where: {
      studentId,

      completed: true,
    },
  });

  return {
    totalXp: stats._sum.xpEarned ?? 0,

    totalStars: stats._sum.stars ?? 0,

    completedLessons: completedCount,
  };
}
