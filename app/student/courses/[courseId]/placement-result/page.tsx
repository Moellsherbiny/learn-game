import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { PlacementResultView } from "./placement-result-view";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function PlacementResultPage({
  params,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { courseId } = await params;

  const result =
    await prisma.placementResult.findUnique({
      where: {
        studentId_courseId: {
          studentId:
            session.user.id,
          courseId,
        },
      },
    });

  if (!result) {
    notFound();
  }

  return (
    <PlacementResultView
      courseId={courseId}
      result={result}
    />
  );
}