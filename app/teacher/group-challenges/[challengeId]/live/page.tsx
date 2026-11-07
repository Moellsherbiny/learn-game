
import { getGroupChallengeControlStateAction } from "@/actions/teacher/group-challenge-control";
import { GroupChallengeLiveControl } from "@/components/teacher/group-challenges/group-challenge-live-control";

export const metadata = {
  title: "إدارة التحدي المباشر | لوحة المعلم",
  description: "إدارة التحدي الجماعي ومتابعة الفرق والطلاب.",
};

export default async function GroupChallengeLivePage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;

  const initialData =
    await getGroupChallengeControlStateAction(challengeId);

  return (
    <div className="container mx-auto px-4 py-8">
      <GroupChallengeLiveControl
        challengeId={challengeId}
        initialData={initialData}
      />
    </div>
  );
}
