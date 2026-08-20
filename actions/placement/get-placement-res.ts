"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getPlacementResult(
  studentId: string,
  resultId: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "يجب تسجيل الدخول أولًا.",
      };
    }

    const currentUserId = session.user.id;
    const currentUserRole = session.user.role;

    // =========================================
    // Student
    // =========================================

    const student = await prisma.user.findUnique({
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

    if (currentUserRole === "ADMIN") {
      // Admin can view any student.
    } else if (currentUserRole === "TEACHER") {
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
            "ليس لديك صلاحية لعرض اختبار هذا الطالب.",
        };
      }
    } else {
      return {
        success: false,
        message:
          "ليس لديك صلاحية لعرض اختبارات الطلاب.",
      };
    }

    // =========================================
    // Placement Result
    // =========================================

    const result =
      await prisma.placementResult.findFirst({
        where: {
          id: resultId,
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
      });

    if (!result) {
      return {
        success: false,
        message:
          "نتيجة الاختبار غير موجودة.",
      };
    }

    return {
      success: true,

      data: {
        student,
        result,
      },
    };
  } catch (error) {
    console.error(
      "GET_PLACEMENT_RESULT_ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "حدث خطأ أثناء جلب تفاصيل الاختبار.",
    };
  }
}