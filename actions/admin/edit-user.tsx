"use server";

import { auth } from "@/auth";
import {prisma} from "@/lib/prisma";

import { z } from "zod";

import { revalidatePath } from "next/cache";

const updateUserSchema = z.object({
  userId: z
    .string()
    .min(1, "معرف المستخدم غير صالح."),

  name: z
    .string()
    .trim()
    .min(2, "الاسم يجب أن يحتوي على حرفين على الأقل.")
    .max(100, "الاسم طويل جدًا."),

  email: z
    .string()
    .trim()
    .email("البريد الإلكتروني غير صالح.")
    .max(255, "البريد الإلكتروني طويل جدًا."),

  phone: z
    .string()
    .trim()
    .max(30, "رقم الهاتف طويل جدًا.")
    .nullable()
    .optional(),

  school: z
    .string()
    .trim()
    .max(150, "اسم المدرسة طويل جدًا.")
    .nullable()
    .optional(),

  level: z
    .enum([
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
    ])
    .optional(),
});

type UpdateUserInput = z.infer<
  typeof updateUserSchema
>;

export async function updateUser(
  input: UpdateUserInput,
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
          "ليس لديك صلاحية لتعديل بيانات المستخدمين.",
      };
    }

    // =====================================================
    // Validation
    // =====================================================

    const validation =
      updateUserSchema.safeParse(input);

    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message ??
        "البيانات المدخلة غير صالحة.";

      return {
        success: false,
        message: firstError,
      };
    }

    const data = validation.data;

    // =====================================================
    // Get existing user
    // =====================================================

    const existingUser =
      await prisma.user.findUnique({
        where: {
          id: data.userId,
        },
        select: {
          id: true,
          role: true,
          email: true,
        },
      });

    if (!existingUser) {
      return {
        success: false,
        message: "المستخدم غير موجود.",
      };
    }

    // =====================================================
    // Prevent changing ADMIN account through this action
    // =====================================================

    if (existingUser.role === "ADMIN") {
      return {
        success: false,
        message:
          "لا يمكن تعديل بيانات حساب المدير من خلال هذه العملية.",
      };
    }

    // =====================================================
    // Prevent duplicate email
    // =====================================================

    const normalizedEmail =
      data.email.toLowerCase();

    if (
      normalizedEmail !==
      existingUser.email.toLowerCase()
    ) {
      const emailOwner =
        await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
          select: {
            id: true,
          },
        });

      if (
        emailOwner &&
        emailOwner.id !== existingUser.id
      ) {
        return {
          success: false,
          message:
            "هذا البريد الإلكتروني مستخدم بالفعل.",
        };
      }
    }

    // =====================================================
    // Build update data
    // =====================================================

    const updateData: {
      name: string;
      email: string;
      phone: string | null;
      school: string | null;
      level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    } = {
      name: data.name,
      email: normalizedEmail,
      phone: data.phone || null,
      school: data.school || null,
    };

    // =====================================================
    // Update academic level for students only
    // =====================================================

    if (
      existingUser.role === "STUDENT" &&
      data.level
    ) {
      updateData.level = data.level;
    }

    // =====================================================
    // Update user
    // =====================================================

    const updatedUser =
      await prisma.user.update({
        where: {
          id: existingUser.id,
        },

        data: updateData,

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          school: true,
          role: true,
          level: true,
          updatedAt: true,
        },
      });

    // =====================================================
    // Revalidate Admin pages
    // =====================================================

    revalidatePath(
      `/admin/users/${updatedUser.id}`,
    );

    revalidatePath("/admin/students");
    revalidatePath("/admin/teachers");
    revalidatePath("/admin");

    // =====================================================
    // Success
    // =====================================================

    return {
      success: true,
      message:
        "تم تحديث بيانات المستخدم بنجاح.",
      data: updatedUser,
    };
  } catch (error) {
    console.error(
      "UPDATE_USER_ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "حدث خطأ غير متوقع أثناء تحديث بيانات المستخدم.",
    };
  }
}