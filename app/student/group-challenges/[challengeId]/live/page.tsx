import { redirect } from "next/navigation";

import {
  getStudentGroupChallengeAction,
  getStudentGroupChallengeLiveAction,
} from "@/actions/student/group-challenge";

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

  if (statusData.challenge.status !== "LIVE") {
    redirect(`/student/group-challenges/${challengeId}`);
  }

  const data = await getStudentGroupChallengeLiveAction(challengeId);

  return (
    <StudentGroupChallengeLive
      challengeId={challengeId}
      initialData={data}
    />
  );
}