
import { getTeacherGroupChallengesAction } from "@/actions/teacher/group-challenge";
import { GroupChallengesDashboard } from "@/components/teacher/group-challenges/group-challenges-dashboard";

export const metadata = {
  title: "التحديات الجماعية | لوحة المعلم",
  description: "إنشاء وإدارة التحديات الجماعية ومتابعة أداء الطلاب.",
};

export default async function GroupChallengesPage() {
  const challenges = await getTeacherGroupChallengesAction();

  const serializedChallenges = challenges.map((challenge) => ({
    id: challenge.id,
    title: challenge.title,
    code: challenge.code,
    status: challenge.status,
    createdAt: challenge.createdAt.toISOString(),
    course: challenge.course,
    counts: challenge._count,
  }));

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <GroupChallengesDashboard
        challenges={serializedChallenges}
      />
    </div>
  );
}
