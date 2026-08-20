"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getStudentPlacementTests(
  studentId: string,
) {
  try {
    // =========================================
    // Authentication
    // =========================================

    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "يجب تسجيل الدخول أولًا.",
      };
    }

    const currentUserId =
      session.user.id;

    const currentUserRole =
      session.user.role;

    // =========================================
    // Validate student
    // =========================================

    const student =
      await prisma.user.findUnique({
        where: {
          id: studentId,
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
        },
      });

    if (!student) {
      return {
        success: false,
        message: "الطالب غير موجود.",
      };
    }

    // =========================================
    // Authorization
    // =========================================

    // -----------------------------------------
    // ADMIN
    // -----------------------------------------

    if (currentUserRole === "ADMIN") {
      // Admin can view any student.
    }

    // -----------------------------------------
    // TEACHER
    // -----------------------------------------

    else if (
      currentUserRole === "TEACHER"
    ) {
      const enrollment =
        await prisma.enrollment.findFirst({
          where: {
            studentId,

            course: {
              teacherId: currentUserId,
            },
          },

          select: {
            id: true,
          },
        });

      if (!enrollment) {
        return {
          success: false,
          message:
            "ليس لديك صلاحية لعرض اختبارات هذا الطالب.",
        };
      }
    }

    // -----------------------------------------
    // Other roles
    // -----------------------------------------

    else {
      return {
        success: false,
        message:
          "ليس لديك صلاحية لعرض اختبارات الطلاب.",
      };
    }

    // =========================================
    // Get Placement Results
    // =========================================

    const results =
      await prisma.placementResult.findMany({
        where: {
          studentId,
        },

        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,

              placementTest: {
                select: {
                  id: true,
                  title: true,
                  questions: true,
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // =========================================
    // Return
    // =========================================

    return {
      success: true,

      data: {
        student,
        results,
      },
    };
  } catch (error) {
    console.error(
      "GET_STUDENT_PLACEMENT_TESTS_ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "حدث خطأ أثناء جلب اختبارات الطالب.",
    };
  }
}