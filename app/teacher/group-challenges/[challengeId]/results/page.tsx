import { getGroupChallengeResultsAction } from "@/actions/teacher/group-challenge-results";
import { TeacherGroupChallengeResults } from "@/components/teacher/group-challenges/teacher-group-challenge-results";

export default async function TeacherGroupChallengeResultsPage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;

  const data = await getGroupChallengeResultsAction(challengeId);

  return <TeacherGroupChallengeResults data={data} />;
}