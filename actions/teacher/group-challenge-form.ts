"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma/client";

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
// 1. Get Teacher Courses
// ============================================

export async function getTeacherCoursesForChallengeAction() {
  const teacherId = await requireTeacher();

  const courses = await prisma.course.findMany({
    where: {
      teacherId,
    },

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      title: true,
      description: true,

      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
    },
  });

  return courses;
}

// ============================================
// 2. Get Course Questions
// ============================================

export async function getCourseChallengeQuestionsAction(courseId: string) {
  const teacherId = await requireTeacher();

  if (!courseId?.trim()) {
    throw new Error("يجب تحديد الكورس.");
  }

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      teacherId,
    },

    select: {
      id: true,
      title: true,
    },
  });

  if (!course) {
    throw new Error("الكورس غير موجود أو غير مصرح لك.");
  }

  const modules = await prisma.module.findMany({
    where: {
      courseId,
    },

    orderBy: {
      order: "asc",
    },

    select: {
      id: true,
      title: true,
      order: true,

      lessons: {
        orderBy: {
          order: "asc",
        },

        select: {
          id: true,
          title: true,
          order: true,
          gameType: true,

          contents: {
            orderBy: {
              sortOrder: "asc",
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
              sortOrder: true,
            },
          },
        },
      },
    },
  });

  return {
    course,
    modules,
  };
}
