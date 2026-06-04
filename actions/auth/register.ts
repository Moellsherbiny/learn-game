"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { UserRole } from "@/lib/generated/prisma/client";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

type RegisterResult = {
  success: boolean;
  message: string;
};

export async function register({
  name,
  email,
  password,
  role,
}: RegisterInput): Promise<RegisterResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  // Validation
  if (!trimmedName) {
    throw new Error("الاسم مطلوب.");
  }

  if (!normalizedEmail) {
    throw new Error("البريد الإلكتروني مطلوب.");
  }

  if (password.length < 6) {
    throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new Error("هذا البريد الإلكتروني مستخدم بالفعل.");
  }

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Create user
  await prisma.user.create({
    data: {
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role,

      // قيم ابتدائية لنظام التلعيب
      xp: 0,
      currentLevel: 1,
      coins: 0,
      streak: 0,
    },
  });

  return {
    success: true,
    message: "تم إنشاء الحساب بنجاح.",
  };
}