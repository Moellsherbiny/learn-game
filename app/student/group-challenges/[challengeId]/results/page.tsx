import { getStudentGroupChallengeResultsAction } from "@/actions/student/group-challenge";
import { StudentGroupChallengeResults } from "@/components/student/group-challenges/student-group-challenge-results";

export default async function StudentGroupChallengeResultsPage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;

  const data = await getStudentGroupChallengeResultsAction(challengeId);

  return <StudentGroupChallengeResults data={data} />;
}