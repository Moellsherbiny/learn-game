import { getMyGroupChallengesAction } from "@/actions/student/group-challenge";
import { StudentGroupChallenges } from "@/components/student/group-challenges/student-group-challenges";

export default async function StudentGroupChallengesPage() {
  const challenges = await getMyGroupChallengesAction();

  return <StudentGroupChallenges challenges={challenges} />;
}