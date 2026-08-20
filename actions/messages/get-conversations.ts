"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getConversations() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "يجب تسجيل الدخول.",
      };
    }

    const userId = session.user.id;

const conversations =
  await prisma.conversation.findMany({
    where: {
      OR: [
        {
          studentId: userId,
        },
        {
          teacherId: userId,
        },
        {
          adminId: userId,
        },
      ],
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

      messages: {
        orderBy: {
          createdAt: "desc",
        },

        take: 1,

        select: {
          id: true,
          content: true,
          senderId: true,
          createdAt: true,
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });

    return {
      success: true,
      data: conversations,
    };
  } catch (error) {
    console.error(
      "GET_CONVERSATIONS_ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "حدث خطأ أثناء جلب المحادثات.",
    };
  }
}