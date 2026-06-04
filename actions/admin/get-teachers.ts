"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getTeachers() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return prisma.user.findMany({
    where: {
      role: "TEACHER",
    },

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,

      _count: {
        select: {
          coursesTeaching: true,
        },
      },
    },
  });
}