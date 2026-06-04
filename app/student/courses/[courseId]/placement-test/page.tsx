import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { getOrCreatePlacementTestAction } from "@/actions/placement/placement-test";

import { PlacementTestClient } from "./placement-test-client";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function PlacementTestPage({
  params,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { courseId } = await params;

  const test =
    await getOrCreatePlacementTestAction(
      courseId,
    );

  return (
    <PlacementTestClient
      courseId={courseId}
      test={test}
    />
  );
}