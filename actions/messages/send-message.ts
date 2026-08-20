"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendMessage(
  conversationId: string,
  content: string,
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

    const userId = session.user.id;

    // =========================================
    // Validate message
    // =========================================

    const text = content.trim();

    if (!text) {
      return {
        success: false,
        message: "لا يمكن إرسال رسالة فارغة.",
      };
    }

    if (text.length > 2000) {
      return {
        success: false,
        message:
          "الرسالة يجب ألا تتجاوز 2000 حرف.",
      };
    }

    // =========================================
    // Get conversation
    // =========================================

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },

        select: {
          id: true,
          type: true,

          studentId: true,
          teacherId: true,
          adminId: true,
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
          "ليس لديك صلاحية لإرسال رسائل في هذه المحادثة.",
      };
    }

    // =========================================
    // Create message
    // =========================================

    const message =
      await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: text,
        },

        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          createdAt: true,
        },
      });

    // =========================================
    // Update conversation
    // =========================================

    await prisma.conversation.update({
      where: {
        id: conversationId,
      },

      data: {
        updatedAt: new Date(),
      },
    });

    // =========================================
    // Revalidate
    // =========================================

    revalidatePath("/messages");

    revalidatePath(
      `/messages/${conversationId}`,
    );

    return {
      success: true,
      data: message,
    };
  } catch (error) {
    console.error(
      "SEND_MESSAGE_ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "حدث خطأ أثناء إرسال الرسالة.",
    };
  }
}