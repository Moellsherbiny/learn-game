"use server";

import jwt from "jsonwebtoken";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// import { sendTeacherInviteEmail } from "@/lib/mail";

const sendTeacherInviteSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(3, "الاسم قصير جداً"),

    email: z
      .email(
        "البريد الإلكتروني غير صحيح",
      ),
  });

type SendTeacherInviteInput =
  z.infer<
    typeof sendTeacherInviteSchema
  >;

export async function sendTeacherInvite(
  data: SendTeacherInviteInput,
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message:
          "يجب تسجيل الدخول أولاً",
      };
    }

    if (
      session.user.role !== "ADMIN"
    ) {
      return {
        success: false,
        message:
          "غير مصرح لك بتنفيذ هذا الإجراء",
      };
    }

    const validation =
      sendTeacherInviteSchema.safeParse(
        data,
      );

    if (!validation.success) {
      return {
        success: false,
        message:
          validation.error.issues[0]
            ?.message ??
          "البيانات غير صحيحة",
      };
    }

    const {
      name,
      email,
    } = validation.data;

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return {
        success: false,
        message:
          "هذا البريد الإلكتروني مستخدم بالفعل",
      };
    }

    const token = jwt.sign(
      {
        name,
        email,
        role: "TEACHER",
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );

    const inviteUrl =
      `${process.env.NEXTAUTH_URL}` +
      `/auth/teacher/setup?token=${token}`;

    // await sendTeacherInviteEmail({
    //   name,
    //   email,
    //   inviteUrl,
    // });

    return {
      success: true,
      message:
        "تم إرسال الدعوة بنجاح",
    };
  } catch (error) {
    console.error(
      "[SEND_TEACHER_INVITE]",
      error,
    );

    return {
      success: false,
      message:
        "حدث خطأ أثناء إرسال الدعوة",
    };
  }
}