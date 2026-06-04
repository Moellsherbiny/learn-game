"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";

async function requireTeacher() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("يجب تسجيل الدخول أولاً.");
  }

  if (session.user.role !== UserRole.TEACHER) {
    throw new Error("غير مصرح لك.");
  }

  return session.user.id;
}

type CreateLessonContentInput = {
  lessonId: string;
  question: string;
  answer?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  leftText?: string;
  rightText?: string;
};

export async function createLessonContent(
  data: CreateLessonContentInput
) {
  const teacherId = await requireTeacher();

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: data.lessonId,
      module: {
        course: {
          teacherId,
        },
      },
    },
    include: {
      _count: {
        select: {
          contents: true,
        },
      },
      module: {
        select: {
          courseId: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new Error("الدرس غير موجود.");
  }

  await prisma.lessonContent.create({
    data: {
      lessonId: data.lessonId,
      question: data.question.trim(),
      answer: data.answer?.trim() || null,
      optionA: data.optionA?.trim() || null,
      optionB: data.optionB?.trim() || null,
      optionC: data.optionC?.trim() || null,
      optionD: data.optionD?.trim() || null,
      leftText: data.leftText?.trim() || null,
      rightText: data.rightText?.trim() || null,
      sortOrder: lesson._count.contents + 1,
    },
  });

  revalidatePath(`/teacher/lesson/${data.lessonId}/content`);
  revalidatePath(
    `/teacher/course/${lesson.module.courseId}/content`
  );
}

type UpdateLessonContentInput = {
  contentId: string;
  question: string;
  answer?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  leftText?: string;
  rightText?: string;
};

export async function updateLessonContent(
  data: UpdateLessonContentInput
) {
  const teacherId = await requireTeacher();

  // التأكد أن عنصر المحتوى تابع لدرس يملكه هذا المدرس
  const content = await prisma.lessonContent.findFirst({
    where: {
      id: data.contentId,
      lesson: {
        module: {
          course: {
            teacherId,
          },
        },
      },
    },
    select: {
      id: true,
      lessonId: true,
      lesson: {
        select: {
          module: {
            select: {
              courseId: true,
            },
          },
        },
      },
    },
  });

  if (!content) {
    throw new Error("عنصر المحتوى غير موجود.");
  }

  const question = data.question.trim();

  if (!question) {
    throw new Error("السؤال أو النص مطلوب.");
  }

  // تحديث البيانات
  await prisma.lessonContent.update({
    where: {
      id: data.contentId,
    },
    data: {
      question,
      answer: data.answer?.trim() || null,
      optionA: data.optionA?.trim() || null,
      optionB: data.optionB?.trim() || null,
      optionC: data.optionC?.trim() || null,
      optionD: data.optionD?.trim() || null,
      leftText: data.leftText?.trim() || null,
      rightText: data.rightText?.trim() || null,
    },
  });

  // إعادة تحديث الصفحات
  revalidatePath(
    `/teacher/lesson/${content.lessonId}/content`
  );

  revalidatePath(
    `/teacher/course/${content.lesson.module.courseId}/content`
  );
}