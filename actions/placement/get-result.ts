"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getPlacementResultAction(
  courseId: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return prisma.placementResult.findUnique({
    where: {
      studentId_courseId: {
        studentId: session.user.id,
        courseId,
      },
    },
  });
}