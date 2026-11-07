
"use client";

import { useGroupChallengeRealtime } from "@/hooks/use-group-challenge-realtime";

type Props = {
  challengeId: string;
};

export function GroupChallengeLive({
  challengeId,
}: Props) {
  const {
    data,
    isLoading,
    error,
    refresh,
  } = useGroupChallengeRealtime(challengeId);

  if (isLoading && !data) {
    return <p>جاري تحميل التحدي...</p>;
  }

  if (error && !data) {
    return <p>{error}</p>;
  }

  if (!data) {
    return <p>لا توجد بيانات للتحدي.</p>;
  }

  const { challenge, currentQuestion, statistics } = data;

  if (challenge.status === "FINISHED") {
    return (
      <div>
        <h2>انتهى التحدي</h2>
        <p>يمكنك الآن مشاهدة النتائج النهائية.</p>
      </div>
    );
  }

  if (challenge.status === "WAITING") {
    return (
      <div>
        <h2>{challenge.title}</h2>

        <p>في انتظار بدء التحدي...</p>

        <p>
          الطلاب الجاهزون: {statistics.readyCount}
        </p>

        <p>
          إجمالي الطلاب: {statistics.totalParticipants}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2>{challenge.title}</h2>

      <div>
        <h3>Team A</h3>
        <p>{statistics.teamA.score} points</p>
        <p>{statistics.teamA.participants} students</p>
      </div>

      <div>
        <h3>Team B</h3>
        <p>{statistics.teamB.score} points</p>
        <p>{statistics.teamB.participants} students</p>
      </div>

      {currentQuestion && (
        <div>
          <h3>
            Question {currentQuestion.order}
          </h3>

          <p>{currentQuestion.question}</p>

          <p>
            Time remaining: {data.remainingSeconds ?? "--"}
          </p>

          {data.hasAnswered ? (
            <p>تم تسجيل إجابتك.</p>
          ) : (
            <p>يمكنك الآن إرسال إجابتك.</p>
          )}
        </div>
      )}

      {error && <p>{error}</p>}

      <button onClick={() => void refresh()}>
        Refresh now
      </button>
    </div>
  );
}
