"use server";

import { auth } from "@/auth";

import { prisma } from "@/lib/prisma";

import { GameType } from "@/lib/generated/prisma/client";

import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

async function requireTeacher() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error(
      "يجب تسجيل الدخول أولاً.",
    );
  }

  if (
    session.user.role !==
    "TEACHER"
  ) {
    throw new Error(
      "غير مصرح لك.",
    );
  }

  return session.user.id;
}

/* ======================================================
   CREATE LESSON
====================================================== */

type CreateLessonInput = {
  courseId: string;

  moduleId: string;

  title: string;

  description?: string;

  gameType: GameType;

  xpReward: number;

  minScore: number;

  maxStars: number;

  timeLimit?: number;
};

export async function createLesson(
  data: CreateLessonInput,
) {
  const teacherId =
    await requireTeacher();

  const module =
    await prisma.module.findFirst(
      {
        where: {
          id: data.moduleId,

          courseId:
            data.courseId,

          course: {
            teacherId,
          },
        },

        include: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
    );

  if (!module) {
    throw new Error(
      "المستوى غير موجود.",
    );
  }

  await prisma.lesson.create({
    data: {
      title:
        data.title.trim(),

      description:
        data.description?.trim() ||
        null,

      moduleId:
        data.moduleId,

      gameType:
        data.gameType,

      xpReward:
        data.xpReward,

      minScore:
        data.minScore,

      maxStars:
        data.maxStars,

      timeLimit:
        data.timeLimit ||
        null,

      order:
        module._count
          .lessons + 1,
    },
  });

  revalidatePath(
    `/teacher/courses/${data.courseId}/content`,
  );

  redirect(
    `/teacher/courses/${data.courseId}/content`,
  );
}

/* ======================================================
   GET TEACHER LESSON
====================================================== */

export async function getTeacherLesson(
  lessonId: string,
) {
  const teacherId =
    await requireTeacher();

  const lesson =
    await prisma.lesson.findFirst(
      {
        where: {
          id: lessonId,

          module: {
            course: {
              teacherId,
            },
          },
        },

        include: {
          /* =====================================
             MODULE + COURSE
          ===================================== */

          module: {
            include: {
              course: {
                select: {
                  id: true,

                  title: true,

                  description: true,
                },
              },

              lessons: {
                orderBy: {
                  order: "asc",
                },

                include: {
                  _count: {
                    select: {
                      contents: true,
                    },
                  },
                },
              },
            },
          },

          /* =====================================
             CONTENTS
          ===================================== */

          contents: {
            orderBy: {
              sortOrder:
                "asc",
            },

            select: {
              id: true,

              question: true,

              answer: true,

              optionA: true,

              optionB: true,

              optionC: true,

              optionD: true,

              leftText: true,

              rightText: true,

              sortOrder: true,

              createdAt: true,

              updatedAt: true,
            },
          },

          /* =====================================
             COUNTS
          ===================================== */

          _count: {
            select: {
              contents: true,
            },
          },
        },
      },
    );

  if (!lesson) {
    return null;
  }

  /* =====================================
     PREVIOUS LESSONS
  ===================================== */

  const previousLessons =
    lesson.module.lessons.filter(
      (l) =>
        l.order <
        lesson.order,
    );

  /* =====================================
     LEVEL STATS
  ===================================== */

  const totalLessons =
    lesson.module.lessons
      .length;

  const totalContents =
    lesson.module.lessons.reduce(
      (sum, l) =>
        sum +
        l._count.contents,
      0,
    );

  /* =====================================
     GROUP CONTENTS BY LESSON
  ===================================== */

  const moduleLessons =
    lesson.module.lessons.map(
      (l) => ({
        id: l.id,

        title: l.title,

        description:
          l.description,

        order: l.order,

        gameType:
          l.gameType,

        xpReward:
          l.xpReward,

        minScore:
          l.minScore,

        maxStars:
          l.maxStars,

        timeLimit:
          l.timeLimit,

        contentsCount:
          l._count.contents,

        isCurrent:
          l.id === lesson.id,
      }),
    );

  return {
    /* =====================================
       CURRENT LESSON
    ===================================== */

    id: lesson.id,

    title: lesson.title,

    description:
      lesson.description,

    gameType:
      lesson.gameType,

    xpReward:
      lesson.xpReward,

    minScore:
      lesson.minScore,

    maxStars:
      lesson.maxStars,

    timeLimit:
      lesson.timeLimit,

    order: lesson.order,

    createdAt:
      lesson.createdAt,

    updatedAt:
      lesson.updatedAt,

    /* =====================================
       MODULE
    ===================================== */

    module: {
      id: lesson.module.id,

      title:
        lesson.module.title,

      courseId:
        lesson.module.courseId,
      description:
        lesson.module
          .description,

      level:
        lesson.module.level,

      requiredXp:
        lesson.module
          .requiredXp,

      order:
        lesson.module.order,

      totalLessons,

      totalContents,

      lessons:
        moduleLessons,
    },

    /* =====================================
       COURSE
    ===================================== */

    course: {
      id: lesson.module.course.id,

      title:
        lesson.module.course
          .title,

      description:
        lesson.module.course
          .description,
    },

    /* =====================================
       CURRENT LESSON CONTENTS
    ===================================== */

    contents:
      lesson.contents,

    contentsCount:
      lesson._count.contents,

    /* =====================================
       PREVIOUS LESSONS
    ===================================== */

    previousLessons:
      previousLessons.map(
        (l) => ({
          id: l.id,

          title: l.title,

          order: l.order,

          gameType:
            l.gameType,
        }),
      ),
  };
}

/* ======================================================
   UPDATE LESSON
====================================================== */

type UpdateLessonInput = {
  lessonId: string;

  title: string;

  description?: string;

  gameType:
    | "QUIZ"
    | "MATCHING"
    | "FILL_BLANKS"
    | "CONVERSATION";

  xpReward: number;

  minScore: number;

  maxStars: number;

  timeLimit?: number;
};

export async function updateLesson(
  data: UpdateLessonInput,
) {
  const teacherId =
    await requireTeacher();

  const lesson =
    await prisma.lesson.findFirst(
      {
        where: {
          id: data.lessonId,

          module: {
            course: {
              teacherId,
            },
          },
        },

        select: {
          id: true,

          module: {
            select: {
              id: true,

              courseId: true,
            },
          },
        },
      },
    );

  if (!lesson) {
    throw new Error(
      "الدرس غير موجود.",
    );
  }

  await prisma.lesson.update({
    where: {
      id: data.lessonId,
    },

    data: {
      title:
        data.title.trim(),

      description:
        data.description?.trim() ||
        null,

      gameType:
        data.gameType as any,

      xpReward:
        data.xpReward,

      minScore:
        data.minScore,

      maxStars:
        data.maxStars,

      timeLimit:
        data.timeLimit ||
        null,
    },
  });

  revalidatePath(
    `/teacher/courses/${lesson.module.courseId}/content`,
  );

  revalidatePath(
    `/teacher/lesson/${data.lessonId}/content`,
  );
}

/* ======================================================
   DELETE LESSON
====================================================== */

export async function deleteLesson(
  lessonId: string,
) {
  const teacherId =
    await requireTeacher();

  const lesson =
    await prisma.lesson.findFirst(
      {
        where: {
          id: lessonId,

          module: {
            course: {
              teacherId,
            },
          },
        },

        select: {
          id: true,

          module: {
            select: {
              id: true,

              courseId: true,
            },
          },
        },
      },
    );

  if (!lesson) {
    throw new Error(
      "الدرس غير موجود.",
    );
  }

  await prisma.lesson.delete({
    where: {
      id: lessonId,
    },
  });

  revalidatePath(
    `/teacher/courses/${lesson.module.courseId}/content`,
  );

  redirect(
    `/teacher/courses/${lesson.module.courseId}/content`,
  );
}