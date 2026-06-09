"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function enrollInCourse(courseId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("يجب تسجيل الدخول أولاً.");
  }

  const studentId = session.user.id;

  // التحقق من وجود تسجيل سابق
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId,
        studentId,
      },
    },
  });

  if (existingEnrollment) {
    return {
      success: true,
      message: "أنت مسجل بالفعل في هذه الدورة.",
    };
  }

  // إنشاء التسجيل الجديد
  await prisma.enrollment.create({
    data: {
      courseId,
      studentId,
    },
  });

  // تحديث الكاش
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/courses");

  return {
    success: true,
    message: "تم التسجيل في الدورة بنجاح.",
  };
}