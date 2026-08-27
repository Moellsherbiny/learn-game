import { redirect, notFound } from "next/navigation";

import { auth } from "@/auth";
import { getStudentBattleAction } from "@/actions/student/battle";

import { StudentBattleClient } from "@/components/battle/student-battle-client";

interface PageProps {
  params: Promise<{
    battleId: string;
  }>;
}

export default async function StudentBattlePage({
  params,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/");
  }

  const { battleId } = await params;

  const result =
    await getStudentBattleAction(
      battleId,
    );

  if (!result.success) {
    notFound();
  }

  return (
    <StudentBattleClient
      battle={result.data}
    />
  );
}