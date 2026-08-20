"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getMessages(
  conversationId: string,
) {
  try {
    // =========================================
    // Authentication
    // =========================================

    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "يجب تسجيل الدخول.",
      };
    }

    const userId = session.user.id;

    // =========================================
    // Get conversation
    // =========================================

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },

        include: {
          student: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },

          teacher: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },

          admin: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
        },
      });

    if (!conversation) {
      return {
        success: false,
        message: "المحادثة غير موجودة.",
      };
    }

    // =========================================
    // Authorization
    // =========================================

    const isParticipant =
      conversation.studentId === userId ||
      conversation.teacherId === userId ||
      conversation.adminId === userId;

    if (!isParticipant) {
      return {
        success: false,
        message:
          "ليس لديك صلاحية للوصول إلى هذه المحادثة.",
      };
    }

    // =========================================
    // Get messages
    // =========================================

    const messages =
      await prisma.message.findMany({
        where: {
          conversationId,
        },

        orderBy: {
          createdAt: "asc",
        },

        select: {
          id: true,
          senderId: true,
          content: true,
          createdAt: true,
        },
      });

    return {
      success: true,

      data: {
        conversation,
        messages,
      },
    };
  } catch (error) {
    console.error(
      "GET_MESSAGES_ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "حدث خطأ أثناء جلب الرسائل.",
    };
  }
}