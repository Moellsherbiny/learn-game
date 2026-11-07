import { getStudentGroupChallengeLiveAction } from "@/actions/student/group-challenge";
import { StudentGroupChallengeLive } from "@/components/student/group-challenges/student-group-challenge-live";

export default async function StudentGroupChallengeLivePage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;
  const data = await getStudentGroupChallengeLiveAction(challengeId);

  return (
    <StudentGroupChallengeLive
      challengeId={challengeId}
      initialData={data}
    />
  );
}