"use server";

import { prisma } from "@/lib/prisma";
export type GetCoursesResult = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  createdAt: Date;

  lessonsCount: number;

  levels: string[];

  teacher: {
    id: string;
    name: string | null;
    image: string | null;
  };

  _count: {
    modules: number;
    enrollments: number;
  };
};

export async function getCourses( search?: string): Promise<GetCoursesResult[]> {
  const courses = await prisma.course.findMany({
    where: search ? {
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    } : {},
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },

      modules: {
        select: {
          level: true,

          lessons: {
            select: {
              id: true,
            },
          },
        },
      },

      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return courses.map((course) => ({
    id: course.id,

    title: course.title,

    description: course.description,

    thumbnail: course.thumbnail,

    createdAt: course.createdAt,

    lessonsCount: course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    ),

    levels: [...new Set(course.modules.map((m) => m.level))],

    teacher: course.teacher,

    _count: course._count,
  }));
}