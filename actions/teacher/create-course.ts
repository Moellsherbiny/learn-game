"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type CreateCourseInput = {
  title: string;
  description?: string;
  thumbnail?: string;
};

export async function createCourse({
  title,
  description,
  thumbnail,
}: CreateCourseInput) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("يجب تسجيل الدخول أولاً.");
  }

  // التأكد أن المستخدم مدرس
  if (session.user.role !== UserRole.TEACHER) {
    throw new Error("غير مصرح لك بإنشاء الكورسات.");
  }

  const cleanTitle = title.trim();
  const cleanDescription = description?.trim() || null;
  const cleanThumbnail = thumbnail?.trim() || null;

  if (!cleanTitle) {
    throw new Error("عنوان الكورس مطلوب.");
  }

  if (cleanTitle.length < 3) {
    throw new Error("عنوان الكورس يجب أن يكون 3 أحرف على الأقل.");
  }

  const course = await prisma.course.create({
    data: {
      title: cleanTitle,
      description: cleanDescription,
      thumbnail: cleanThumbnail,
      teacherId: session.user.id,
    },
  });

  revalidatePath("/teacher");
  revalidatePath("/courses");
  
  redirect(`/teacher/courses/${course.id}`);
}