"use server";

import { hash } from "bcrypt";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma/client";

const registerStudentSchema = z.object({
  name: z.string().trim().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),

  email: z.email("البريد الإلكتروني غير صحيح"),

  phone: z.string().regex(/^01[0125][0-9]{8}$/, "رقم الهاتف غير صحيح"),

  school: z.string().trim().min(2, "اسم المدرسة مطلوب"),

  password: z
    .string()
    .min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف")
    .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير")
    .regex(/[a-z]/, "يجب أن تحتوي على حرف صغير")
    .regex(/[0-9]/, "يجب أن تحتوي على رقم")
    .regex(/[^A-Za-z0-9]/, "يجب أن تحتوي على رمز خاص"),
});

type RegisterStudentInput = z.infer<typeof registerStudentSchema>;

export async function registerStudent(data: RegisterStudentInput) {
  const result = registerStudentSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, school, password } = result.data;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return {
      success: false,
      errors: {
        email: ["هذا البريد الإلكتروني مستخدم بالفعل"],
      },
    };
  }

  const hashedPassword = await hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      school,
      password: hashedPassword,
      role: UserRole.STUDENT,
      xp: 0,
      currentLevel: 1,
      coins: 0,
      streak: 0,
    },
  });

  return {
    success: true,
  };
}
