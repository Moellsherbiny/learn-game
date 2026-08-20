"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ConversationType } from "@/lib/generated/prisma/client";

export async function getOrCreateConversation(
  otherUserId: string,
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

    const currentUserId = session.user.id;

    // =========================================
    // Prevent self conversation
    // =========================================

    if (currentUserId === otherUserId) {
      return {
        success: false,
        message: "لا يمكنك إنشاء محادثة مع نفسك.",
      };
    }

    // =========================================
    // Get users
    // =========================================

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: [currentUserId, otherUserId],
        },
      },

      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    const currentUser = users.find(
      (user) => user.id === currentUserId,
    );

    const otherUser = users.find(
      (user) => user.id === otherUserId,
    );

    if (!currentUser || !otherUser) {
      return {
        success: false,
        message: "المستخدم غير موجود.",
      };
    }

    // =========================================
    // ADMIN ↔ STUDENT
    // =========================================

    if (
      (currentUser.role === "ADMIN" &&
        otherUser.role === "STUDENT") ||
      (currentUser.role === "STUDENT" &&
        otherUser.role === "ADMIN")
    ) {
      const adminId =
        currentUser.role === "ADMIN"
          ? currentUserId
          : otherUserId;

      const studentId =
        currentUser.role === "STUDENT"
          ? currentUserId
          : otherUserId;

      let conversation =
        await prisma.conversation.findFirst({
          where: {
            type: ConversationType.ADMIN_STUDENT,
            adminId,
            studentId,
          },
        });

      if (!conversation) {
        conversation =
          await prisma.conversation.create({
            data: {
              type: ConversationType.ADMIN_STUDENT,
              adminId,
              studentId,
            },
          });
      }

      return {
        success: true,
        data: conversation,
      };
    }

    // =========================================
    // ADMIN ↔ TEACHER
    // =========================================

    if (
      (currentUser.role === "ADMIN" &&
        otherUser.role === "TEACHER") ||
      (currentUser.role === "TEACHER" &&
        otherUser.role === "ADMIN")
    ) {
      const adminId =
        currentUser.role === "ADMIN"
          ? currentUserId
          : otherUserId;

      const teacherId =
        currentUser.role === "TEACHER"
          ? currentUserId
          : otherUserId;

      let conversation =
        await prisma.conversation.findFirst({
          where: {
            type: ConversationType.ADMIN_TEACHER,
            adminId,
            teacherId,
          },
        });

      if (!conversation) {
        conversation =
          await prisma.conversation.create({
            data: {
              type: ConversationType.ADMIN_TEACHER,
              adminId,
              teacherId,
            },
          });
      }

      return {
        success: true,
        data: conversation,
      };
    }

    // =========================================
    // STUDENT ↔ TEACHER
    // =========================================

    if (
      (currentUser.role === "STUDENT" &&
        otherUser.role === "TEACHER") ||
      (currentUser.role === "TEACHER" &&
        otherUser.role === "STUDENT")
    ) {
      const studentId =
        currentUser.role === "STUDENT"
          ? currentUserId
          : otherUserId;

      const teacherId =
        currentUser.role === "TEACHER"
          ? currentUserId
          : otherUserId;

      // =========================================
      // Check enrollment
      // =========================================

      const enrollment =
        await prisma.enrollment.findFirst({
          where: {
            studentId,

            course: {
              teacherId,
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
            "الطالب غير مسجل في إحدى دورات هذا المدرس.",
        };
      }

      // =========================================
      // Find conversation
      // =========================================

      let conversation =
        await prisma.conversation.findFirst({
          where: {
            type: ConversationType.STUDENT_TEACHER,
            studentId,
            teacherId,
          },
        });

      // =========================================
      // Create conversation
      // =========================================

      if (!conversation) {
        conversation =
          await prisma.conversation.create({
            data: {
              type: ConversationType.STUDENT_TEACHER,
              studentId,
              teacherId,
            },
          });
      }

      return {
        success: true,
        data: conversation,
      };
    }

    // =========================================
    // Unsupported conversation
    // =========================================

    return {
      success: false,
      message:
        "لا يمكن إنشاء محادثة بين هذين المستخدمين.",
    };
  } catch (error) {
    console.error(
      "GET_OR_CREATE_CONVERSATION_ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "حدث خطأ أثناء إنشاء المحادثة.",
    };
  }
}