import { redirect } from "next/navigation";
import { getStudentGroupChallengeAction } from "@/actions/student/group-challenge";
import { StudentGroupChallengeLive } from "@/components/student/group-challenges/student-group-challenge-live";

export default async function StudentGroupChallengeLivePage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;
  const statusData = await getStudentGroupChallengeAction(challengeId);

  if (statusData.challenge.status === "FINISHED") {
    redirect(`/student/group-challenges/${challengeId}/results`);
  }
  if (statusData.challenge.status === "WAITING") {
    redirect(`/student/group-challenges/${challengeId}`);
  }
  if (statusData.challenge.status !== "LIVE") {
    redirect("/student/group-challenges");
  }

  return <StudentGroupChallengeLive challengeId={challengeId} />;
}
