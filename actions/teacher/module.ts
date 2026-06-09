// actions/teacher/module.ts

"use server";

import { auth } from "@/auth";

import { prisma } from "@/lib/prisma";

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

/* =====================================================
   GET TEACHER MODULE
===================================================== */

export async function getTeacherModule(
  moduleId: string,
) {
  const teacherId =
    await requireTeacher();

  const module =
    await prisma.module.findFirst(
      {
        where: {
          id: moduleId,

          course: {
            teacherId,
          },
        },

        include: {
          /* ===================================
             COURSE
          =================================== */

          course: {
            select: {
              id: true,

              title: true,

              description: true,

              thumbnail: true,
            },
          },

          /* ===================================
             LESSONS
          =================================== */

          lessons: {
            orderBy: {
              order: "asc",
            },

            include: {
              _count: {
                select: {
                  contents: true,

                  progress: true,
                },
              },
            },
          },

          /* ===================================
             COUNTS
          =================================== */

          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
    );

  if (!module) {
    return null;
  }

  /* ===================================
     STATS
  =================================== */

  const totalXp =
    module.lessons.reduce(
      (sum, lesson) =>
        sum +
        lesson.xpReward,
      0,
    );

  const totalContents =
    module.lessons.reduce(
      (sum, lesson) =>
        sum +
        lesson._count
          .contents,
      0,
    );

  const totalPlayers =
    module.lessons.reduce(
      (sum, lesson) =>
        sum +
        lesson._count
          .progress,
      0,
    );

  /* ===================================
     FORMATTED LESSONS
  =================================== */

  const lessons =
    module.lessons.map(
      (lesson) => ({
        id: lesson.id,

        title:
          lesson.title,

        description:
          lesson.description,

        order:
          lesson.order,

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

        createdAt:
          lesson.createdAt,

        updatedAt:
          lesson.updatedAt,

        contentsCount:
          lesson._count
            .contents,

        playersCount:
          lesson._count
            .progress,
      }),
    );

  return {
    /* ===================================
       MODULE
    =================================== */

    id: module.id,

    title: module.title,

    description:
      module.description,

    level: module.level,

    requiredXp:
      module.requiredXp,

    order: module.order,

    createdAt:
      module.createdAt,

    updatedAt:
      module.updatedAt,

    /* ===================================
       COURSE
    =================================== */

    course: {
      id: module.course.id,

      title:
        module.course.title,

      description:
        module.course
          .description,

      thumbnail:
        module.course
          .thumbnail,
    },

    /* ===================================
       STATS
    =================================== */

    stats: {
      totalLessons:
        module._count
          .lessons,

      totalXp,

      totalContents,

      totalPlayers,
    },

    /* ===================================
       LESSONS
    =================================== */

    lessons,
  };
}

/* =====================================================
   CREATE MODULE
===================================================== */

type CreateModuleInput = {
  courseId: string;

  title: string;

  description?: string;

  level:
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED";

  requiredXp: number;
};

export async function createModule(
  data: CreateModuleInput,
) {
  const teacherId =
    await requireTeacher();

  const course =
    await prisma.course.findFirst(
      {
        where: {
          id: data.courseId,

          teacherId,
        },

        include: {
          _count: {
            select: {
              modules: true,
            },
          },
        },
      },
    );

  if (!course) {
    throw new Error(
      "الدورة التعليمية غير موجود.",
    );
  }

  await prisma.module.create({
    data: {
      title:
        data.title.trim(),

      description:
        data.description?.trim() ||
        null,

      level: data.level,

      requiredXp:
        data.requiredXp,

      order:
        course._count
          .modules + 1,

      courseId:
        data.courseId,
    },
  });

  revalidatePath(
    `/teacher/courses/${data.courseId}/modules`,
  );

  redirect(
    `/teacher/courses/${data.courseId}/modules`,
  );
}

/* =====================================================
   UPDATE MODULE
===================================================== */

type UpdateModuleInput = {
  moduleId: string;

  title: string;

  description?: string;

  level:
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED";

  requiredXp: number;
};

export async function updateModule(
  data: UpdateModuleInput,
) {
  const teacherId =
    await requireTeacher();

  const module =
    await prisma.module.findFirst(
      {
        where: {
          id: data.moduleId,

          course: {
            teacherId,
          },
        },

        select: {
          id: true,

          courseId: true,
        },
      },
    );

  if (!module) {
    throw new Error(
      "المستوى غير موجود.",
    );
  }

  await prisma.module.update({
    where: {
      id: data.moduleId,
    },

    data: {
      title:
        data.title.trim(),

      description:
        data.description?.trim() ||
        null,

      level: data.level,

      requiredXp:
        data.requiredXp,
    },
  });

  revalidatePath(
    `/teacher/courses/${module.courseId}/modules`,
  );

  revalidatePath(
    `/teacher/courses/${module.courseId}/modules/${module.id}`,
  );
}

/* =====================================================
   DELETE MODULE
===================================================== */

export async function deleteModule(
  moduleId: string,
) {
  const teacherId =
    await requireTeacher();

  const module =
    await prisma.module.findFirst(
      {
        where: {
          id: moduleId,

          course: {
            teacherId,
          },
        },

        select: {
          id: true,

          courseId: true,
        },
      },
    );

  if (!module) {
    throw new Error(
      "المستوى غير موجود.",
    );
  }

  await prisma.module.delete({
    where: {
      id: moduleId,
    },
  });

  revalidatePath(
    `/teacher/courses/${module.courseId}/modules`,
  );

  redirect(
    `/teacher/courses/${module.courseId}/modules`,
  );
}