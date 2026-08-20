"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getMessageUsers() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "يجب تسجيل الدخول.",
      };
    }

    const userId = session.user.id;
    const role = session.user.role;

    // =========================================
    // STUDENT
    // Student → Teachers + Admins
    // =========================================

    if (role === "STUDENT") {
      // Teachers from student's courses
      const enrollments =
        await prisma.enrollment.findMany({
          where: {
            studentId: userId,
          },

          select: {
            course: {
              select: {
                teacher: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    role: true,
                  },
                },
              },
            },
          },
        });

      const teachers = enrollments.map(
        (enrollment) =>
          enrollment.course.teacher,
      );

      // Admins
      const admins =
        await prisma.user.findMany({
          where: {
            role: "ADMIN",
          },

          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        });

      // Merge teachers + admins
      const users = [
        ...teachers,
        ...admins,
      ];

      // Remove duplicates
      const uniqueUsers = Array.from(
        new Map(
          users.map((user) => [
            user.id,
            user,
          ]),
        ).values(),
      );

      return {
        success: true,
        data: uniqueUsers,
      };
    }

    // =========================================
    // TEACHER
    // Teacher → Students + Admins
    // =========================================

    if (role === "TEACHER") {
      // Students enrolled in teacher courses
      const enrollments =
        await prisma.enrollment.findMany({
          where: {
            course: {
              teacherId: userId,
            },
          },

          select: {
            student: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
              },
            },
          },
        });

      const students = enrollments.map(
        (enrollment) =>
          enrollment.student,
      );

      // Admins
      const admins =
        await prisma.user.findMany({
          where: {
            role: "ADMIN",
          },

          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        });

      // Merge students + admins
      const users = [
        ...students,
        ...admins,
      ];

      // Remove duplicates
      const uniqueUsers = Array.from(
        new Map(
          users.map((user) => [
            user.id,
            user,
          ]),
        ).values(),
      );

      return {
        success: true,
        data: uniqueUsers,
      };
    }

    // =========================================
    // ADMIN
    // Admin → Students + Teachers
    // =========================================

    if (role === "ADMIN") {
      const users =
        await prisma.user.findMany({
          where: {
            role: {
              in: [
                "STUDENT",
                "TEACHER",
              ],
            },
          },

          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },

          orderBy: {
            name: "asc",
          },
        });

      return {
        success: true,
        data: users,
      };
    }

    // =========================================
    // Unsupported role
    // =========================================

    return {
      success: false,
      message:
        "لا يمكن لهذا المستخدم بدء محادثات.",
    };
  } catch (error) {
    console.error(
      "GET_MESSAGE_USERS_ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "حدث خطأ أثناء جلب المستخدمين.",
    };
  }
}