"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getAdminDashboard() {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (session.user.role !== "ADMIN") {
      throw new Error("Forbidden");
    }

    const [
      studentsCount,
      teachersCount,
      coursesCount,
      latestStudents,
      latestTeachers,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: "STUDENT",
        },
      }),

      prisma.user.count({
        where: {
          role: "TEACHER",
        },
      }),

      prisma.course.count(),

      prisma.user.findMany({
        where: {
          role: "STUDENT",
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 3,

        select: {
          id: true,
          name: true,
          email: true,
          school: true,
          createdAt: true,
        },
      }),

      prisma.user.findMany({
        where: {
          role: "TEACHER",
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 3,

        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,

          _count: {
            select: {
              coursesTeaching: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,

      data: {
        stats: {
          students: studentsCount,
          teachers: teachersCount,
          courses: coursesCount,
        },

        latestStudents,

        latestTeachers,
      },
    };
  } catch (error) {
    console.error(
      "[ADMIN_DASHBOARD_ERROR]",
      error,
    );

    return {
      success: false,
      message:
        "حدث خطأ أثناء تحميل لوحة التحكم",
    };
  }
}