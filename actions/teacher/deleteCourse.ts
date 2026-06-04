// actions/teacher/deleteCourse.ts

"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";

import { prisma } from "@/lib/prisma";

import { UserRole } from "@/lib/generated/prisma/client";

// =========================================
// DELETE COURSE
// =========================================

export async function deleteCourse(
  courseId: string,
) {
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
  // COURSE
  // =========================================

  const course =
    await prisma.course.findUnique(
      {
        where: {
          id: courseId,
        },

        include: {
          modules: true,

          enrollments:
            true,
        },
      },
    );

  if (!course) {
    throw new Error(
      "الكورس غير موجود",
    );
  }

  // =========================================
  // OWNER CHECK
  // =========================================

  if (
    session.user.role !==
      UserRole.ADMIN &&
    course.teacherId !==
      session.user.id
  ) {
    throw new Error(
      "ليس لديك صلاحية حذف هذا الكورس",
    );
  }

  // =========================================
  // DELETE COURSE
  // =========================================

  await prisma.course.delete(
    {
      where: {
        id: courseId,
      },
    },
  );

  // =========================================
  // REVALIDATE
  // =========================================

  revalidatePath(
    "/teacher/courses",
  );

  revalidatePath(
    `/teacher/courses/${courseId}`,
  );

  return {
    success: true,
  };
}