"use server";

import { prisma } from "@/lib/prisma";

export async function verifyResetOTP(
  email: string,
  otp: string
) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
        otp: true,
        otp_expires_at: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "المستخدم غير موجود.",
      };
    }

    // لا يوجد كود محفوظ
    if (!user.otp) {
      return {
        success: false,
        message: "لم يتم طلب رمز تحقق.",
      };
    }

    // الكود غير صحيح
    if (user.otp !== otp) {
      return {
        success: false,
        message: "رمز التحقق غير صحيح.",
      };
    }

    // انتهت الصلاحية
    if (
      !user.otp_expires_at ||
      user.otp_expires_at.getTime() < Date.now()
    ) {
      return {
        success: false,
        message: "انتهت صلاحية رمز التحقق.",
      };
    }

    // تم التحقق بنجاح
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        is_otp_verified: true,
      },
    });

    return {
      success: true,
      message: "تم التحقق بنجاح.",
    };
  } catch (error) {
    console.error("VERIFY_RESET_OTP_ERROR:", error);

    return {
      success: false,
      message: "حدث خطأ أثناء التحقق من الرمز.",
    };
  }
}