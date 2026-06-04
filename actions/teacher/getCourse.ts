// actions/teacher/teacher.ts

"use server";

import { auth } from "@/auth";

import { prisma } from "@/lib/prisma";

import { UserRole } from "@/lib/generated/prisma/client";

// =========================================
// GET TEACHER COURSES
// =========================================

export async function getTeacherCourses() {
  // =========================================
  // SESSION
  // =========================================

  const session =
    await auth();

  if (
    !session?.user?.id
  ) {
    throw new Error(
      "Unauthorized",
    );
  }

  // =========================================
  // ROLE
  // =========================================

  if (
    session.user.role !==
      UserRole.TEACHER &&
    session.user.role !==
      UserRole.ADMIN
  ) {
    throw new Error(
      "غير مصرح لك",
    );
  }

  // =========================================
  // COURSES
  // =========================================

  const courses =
    await prisma.course.findMany(
      {
        where:
          session.user
            .role ===
          UserRole.ADMIN
            ? undefined
            : {
                teacherId:
                  session
                    .user
                    .id,
              },

        include: {
          _count: {
            select: {
              modules: true,

              enrollments: true,
            },
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },
      },
    );

  return courses;
}