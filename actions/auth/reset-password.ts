"use server";

import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function resetPassword(
  email: string,
  newPassword: string
) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
        is_otp_verified: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "المستخدم غير موجود.",
      };
    }

    if (!user.is_otp_verified) {
      return {
        success: false,
        message: "يجب التحقق من رمز التحقق أولاً.",
      };
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // تحديث كلمة المرور ومسح بيانات الـ OTP
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        otp: null,
        otp_expires_at: null,
        is_otp_verified: false,
      },
    });

    return {
      success: true,
      message: "تم تغيير كلمة المرور بنجاح.",
    };
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);

    return {
      success: false,
      message: "حدث خطأ أثناء تغيير كلمة المرور.",
    };
  }
}