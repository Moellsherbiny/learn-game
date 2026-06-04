"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CourseStatus =
  | "completed"
  | "in_progress"
  | "not_started";

function calculateLevel(xp: number) {
  const level = Math.floor(xp / 1000) + 1;

  const currentLevelXp = xp % 1000;

  const nextLevelXp = 1000;

  const progress = Math.min(
    100,
    (currentLevelXp / nextLevelXp) * 100,
  );

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progress,
  };
}

export async function getStudentDashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const studentId = session.user.id;

  const student = await prisma.user.findUnique({
    where: {
      id: studentId,
    },

    select: {
      id: true,
      name: true,
      image: true,

      xp: true,
      coins: true,
      streak: true,

      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnail: true,

              teacher: {
                select: {
                  name: true,
                },
              },

              modules: {
                select: {
                  id: true,

                  lessons: {
                    select: {
                      id: true,
                    },
                  },
                },
              },

              _count: {
                select: {
                  enrollments: true,
                  modules: true,
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      progress: {
        where: {
          completed: true,
        },

        select: {
          lessonId: true,
        },
      },

      battleParticipants: {
        where: {
          room: {
            status: "WAITING",
          },
        },

        select: {
          room: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  const completedLessonsIds = new Set(
    student.progress.map((p) => p.lessonId),
  );

  const courses = student.enrollments.map((enrollment) => {
    const course = enrollment.course;

    const allLessons = course.modules.flatMap(
      (module) => module.lessons,
    );

    const totalLessons = allLessons.length;

    const completedLessons = allLessons.filter(
      (lesson) => completedLessonsIds.has(lesson.id),
    ).length;

    const progress =
      totalLessons === 0
        ? 0
        : Math.round(
            (completedLessons / totalLessons) * 100,
          );

    const status: CourseStatus =
      progress === 100
        ? "completed"
        : progress > 0
          ? "in_progress"
          : "not_started";

    return {
      ...course,

      totalLessons,
      completedLessons,
      progress,
      status,
    };
  });

  const level = calculateLevel(student.xp);

  return {
    id: student.id,
    name: student.name,
    image: student.image,

    xp: student.xp,
    coins: student.coins,
    streak: student.streak,

    level: level.level,
    currentLevelXp: level.currentLevelXp,
    nextLevelXp: level.nextLevelXp,
    levelProgress: level.progress,

    totalCourses: courses.length,

    completedCourses: courses.filter(
      (c) => c.status === "completed",
    ).length,

    inProgressCourses: courses.filter(
      (c) => c.status === "in_progress",
    ).length,

    courses,

    pendingInvitations: student.battleParticipants.map(
      (participant) => participant.room,
    ),
  };
}