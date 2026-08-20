"use server";

import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function generateTemporaryPassword() {
  return randomBytes(6)
    .toString("base64url")
    .slice(0, 10);
}

export async function resetUserPassword(
  userId: string,
) {
  try {
    // =====================================================
    // Authentication
    // =====================================================

    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "يجب تسجيل الدخول أولًا.",
      };
    }

    // =====================================================
    // Authorization
    // =====================================================

    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        message:
          "ليس لديك صلاحية لإعادة تعيين كلمات المرور.",
      };
    }

    // =====================================================
    // Get user
    // =====================================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "المستخدم غير موجود.",
      };
    }

    // لا نسمح بتغيير كلمة مرور Admin آخر
    if (user.role === "ADMIN") {
      return {
        success: false,
        message:
          "لا يمكن إعادة تعيين كلمة مرور حساب مدير من هنا.",
      };
    }

    // =====================================================
    // Generate temporary password
    // =====================================================

    const temporaryPassword =
      generateTemporaryPassword();

    // =====================================================
    // Hash password
    // =====================================================

    const hashedPassword = await bcrypt.hash(
      temporaryPassword,
      10,
    );

    // =====================================================
    // Update password
    // =====================================================

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        password: hashedPassword,

        // بما أن الـ Admin قام بإعادة تعيين
        // كلمة المرور، نعتبر الحساب verified
        is_otp_verified: true,
      },
    });

    // =====================================================
    // Revalidate
    // =====================================================

    revalidatePath(
      `/admin/users/${user.id}`,
    );

    revalidatePath("/admin/students");
    revalidatePath("/admin/teachers");
    revalidatePath("/admin");

    // =====================================================
    // Return temporary password
    // =====================================================

    return {
      success: true,
      message:
        "تمت إعادة تعيين كلمة المرور بنجاح.",

      temporaryPassword,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error(
      "RESET_USER_PASSWORD_ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "حدث خطأ أثناء إعادة تعيين كلمة المرور.",
    };
  }
}