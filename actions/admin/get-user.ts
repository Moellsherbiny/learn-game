"use server";

import { auth } from "@/auth";
import {prisma} from "@/lib/prisma";

export async function getUser(userId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "غير مصرح لك بالوصول.",
      };
    }

    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        message: "ليس لديك صلاحية للوصول إلى هذه الصفحة.",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        coursesTeaching: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },

        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },

        _count: {
          select: {
            coursesTeaching: true,
            enrollments: true,
            progress: true,
            battleParticipants: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: "المستخدم غير موجود.",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("GET_USER_ERROR:", error);

    return {
      success: false,
      message: "حدث خطأ أثناء جلب بيانات المستخدم.",
    };
  }
}