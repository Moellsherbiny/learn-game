"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getStudents() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  const students =
    await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        school: true,
        xp: true,
        currentLevel: true,
        createdAt: true,
      },
    });

  return students;
}