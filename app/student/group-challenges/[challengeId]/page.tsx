import { getStudentGroupChallengeAction } from "@/actions/student/group-challenge";
import { StudentGroupChallengeLobby } from "@/components/student/group-challenges/student-group-challenge-lobby";

export default async function StudentGroupChallengePage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;

  const data = await getStudentGroupChallengeAction(challengeId);

  return (
    <StudentGroupChallengeLobby
      challengeId={challengeId}
      initialData={data}
    />
  );
}