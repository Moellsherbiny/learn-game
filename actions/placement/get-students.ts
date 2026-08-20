"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getPlacementStudents(
  search?: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "يجب تسجيل الدخول أولًا.",
      };
    }

    const userId = session.user.id;
    const role = session.user.role;

    const searchValue =
      search?.trim() || undefined;

    // =========================================
    // Common conditions
    // =========================================

    const searchCondition = searchValue
      ? {
          OR: [
            {
              name: {
                contains: searchValue,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: searchValue,
                mode: "insensitive" as const,
              },
            },
            {
              school: {
                contains: searchValue,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    // =========================================
    // ADMIN
    // Students who took placement test
    // =========================================

    if (role === "ADMIN") {
      const students =
        await prisma.user.findMany({
          where: {
            role: "STUDENT",

            // Must have at least one
            // placement result
            placementResults: {
              some: {},
            },

            ...searchCondition,
          },

          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            school: true,
            level: true,
            currentLevel: true,
            xp: true,

            _count: {
              select: {
                placementResults: true,
              },
            },
          },

          orderBy: {
            name: "asc",
          },
        });

      return {
        success: true,
        data: students,
      };
    }

    // =========================================
    // TEACHER
    // Students who:
    // 1. Are enrolled in teacher's course
    // 2. Took at least one placement test
    // =========================================

    if (role === "TEACHER") {
      const students =
        await prisma.user.findMany({
          where: {
            role: "STUDENT",

            // Took placement test
            placementResults: {
              some: {},
            },

            // Enrolled in at least one
            // course taught by this teacher
            enrollments: {
              some: {
                course: {
                  teacherId: userId,
                },
              },
            },

            ...searchCondition,
          },

          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            school: true,
            level: true,
            currentLevel: true,
            xp: true,

            _count: {
              select: {
                placementResults: true,
              },
            },
          },

          orderBy: {
            name: "asc",
          },
        });

      return {
        success: true,
        data: students,
      };
    }

    // =========================================
    // Other roles
    // =========================================

    return {
      success: false,
      message:
        "ليس لديك صلاحية لعرض اختبارات الطلاب.",
    };
  } catch (error) {
    console.error(
      "GET_PLACEMENT_STUDENTS_ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "حدث خطأ أثناء جلب الطلاب.",
    };
  }
}