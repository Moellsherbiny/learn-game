"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type UpdateCourseInput = {
  courseId: string;
  title: string;
  description?: string;
  thumbnail?: string;
};

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

export async function getTeacherCourse(courseId: string) {
  const teacherId = await requireTeacher();

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      teacherId,
    },
    include: {
      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },

      enrollments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              xp: true,
              currentLevel: true,
            },
          },
        },
      },

      modules: {
        orderBy: {
          order: "asc",
        },
        include: {
          _count: {
            select: {
              lessons: true,
            },
          },
          lessons: {
            orderBy: {
              order: "asc",
            },
            select: {
              id: true,
              title: true,
              gameType: true,
              order: true,
              xpReward: true,
              minScore: true,
              contents: true,
              _count: {
                select: {
                  contents: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return course;
}

export async function updateCourse(data: UpdateCourseInput) {
  const teacherId = await requireTeacher();

  const title = data.title.trim();

  if (!title) {
    throw new Error("عنوان الكورس مطلوب.");
  }

  const course = await prisma.course.findFirst({
    where: {
      id: data.courseId,
      teacherId,
    },
  });

  if (!course) {
    throw new Error("الكورس غير موجود.");
  }

  await prisma.course.update({
    where: {
      id: data.courseId,
    },
    data: {
      title,
      description: data.description?.trim() || null,
      thumbnail: data.thumbnail?.trim() || null,
    },
  });

  revalidatePath("/teacher");
  revalidatePath("/courses");
  revalidatePath(`/teacher/courses/${data.courseId}`);
}

export async function deleteCourse(courseId: string) {
  const teacherId = await requireTeacher();

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      teacherId,
    },
  });

  if (!course) {
    throw new Error("الكورس غير موجود.");
  }

  await prisma.course.delete({
    where: {
      id: courseId,
    },
  });

  revalidatePath("/teacher");
  revalidatePath("/courses");

  redirect("/teacher");
}
