"use server";

import { prisma } from "@/lib/prisma";
import { sendResetCodeEmail } from "@/lib/mail";

export async function sendResetCode(email: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
        email: true,
      },
    });

    // لا نكشف إذا كان الإيميل موجودًا
    if (!user) {
      return {
        success: true,
        message:
          "إذا كان البريد الإلكتروني مسجلًا لدينا فسيتم إرسال رمز التحقق.",
      };
    }

    // إنشاء OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // ينتهي بعد 10 دقائق
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // حفظ الكود
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        otp,
        otp_expires_at: expiresAt,
        is_otp_verified: false,
      },
    });

    // إرسال الإيميل
    await sendResetCodeEmail(user.email, otp);

    return {
      success: true,
      message: "تم إرسال رمز التحقق.",
    };
  } catch (error) {
    console.error("SEND_RESET_CODE_ERROR:", error);

    return {
      success: false,
      message: "حدث خطأ أثناء إرسال رمز التحقق.",
    };
  }
}