"use server";

import { prisma } from "@/lib/prisma";

export async function getStudents(search?: string) {
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",

      ...(search?.trim()
        ? {
            OR: [
              {
                name: {
                  contains: search.trim(),
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search.trim(),
                  mode: "insensitive",
                },
              },
              {
                school: {
                  contains: search.trim(),
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      school: true,
      level: true,
      currentLevel: true,
      xp: true,
      streak: true,
      coins: true,
      createdAt: true,
    },
  });

  return students;
}