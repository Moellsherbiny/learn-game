"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCourseById(courseId: string) {
  const session = await auth();
  const studentId = session?.user?.id;

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
      enrollments: studentId
        ? {
            where: {
              studentId,
            },
            select: {
              id: true,
            },
          }
        : false,
    },
  });

  if (!course) {
    return null;
  }

  return {
    ...course,
    isEnrolled:
      Array.isArray(course.enrollments) &&
      course.enrollments.length > 0,
  };
}