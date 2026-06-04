"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma/client";

export type TeacherDashboard = {
  id: string;
  name: string | null;
  image: string | null;
  coursesTeaching: {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    createdAt: Date;
    _count: {
      modules: number;
      enrollments: number;
    };
    enrollments: {
      id: string;
      student: {
        id: string;
        name: string | null;
        email: string | null;
        xp: number;
        currentLevel: number;
        coins: number;
        streak: number;
      };
    }[];
  }[];
};

export async function getTeacherDashboard(): Promise<TeacherDashboard | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const teacherId = session.user.id;

  // استخدم findFirst لأننا نريد التحقق من id و role معًا
  const teacher = await prisma.user.findFirst({
    where: {
      id: teacherId,
      role: UserRole.TEACHER,
    },
    select: {
      id: true,
      name: true,
      image: true,

      // اسم العلاقة الصحيح في الـ schema
      coursesTeaching: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          createdAt: true,

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
            select: {
              id: true,
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  xp: true,
                  currentLevel: true,
                  coins: true,
                  streak: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return teacher;
}