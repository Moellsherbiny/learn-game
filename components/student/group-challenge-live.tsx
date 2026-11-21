
"use client";

import { useGroupChallengeRealtime } from "@/hooks/use-group-challenge-realtime";

type Props = {
  challengeId: string;
};

export function GroupChallengeLive({ challengeId }: Props) {
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
      <section>
        <h2>انتهى التحدي</h2>
        <p>يمكنك الآن مشاهدة النتائج النهائية.</p>
      </section>
    );
  }

  if (challenge.status === "WAITING") {
    return (
      <section>
        <h2>{challenge.title}</h2>
        <p>في انتظار بدء التحدي...</p>

        <p>
          الطلاب الجاهزون: {statistics.readyCount}
        </p>

        <p>
          إجمالي الطلاب: {statistics.totalParticipants}
        </p>

        <button onClick={() => void refresh()}>
          تحديث الحالة
        </button>

        {error && <p role="alert">{error}</p>}
      </section>
    );
  }

  return (
    <main>
      <header>
        <h2>{challenge.title}</h2>
        <p>{challenge.course.title}</p>
      </header>

      <section>
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
      </section>

      {currentQuestion ? (
        <section>
          <header>
            <h3>
              Question {currentQuestion.order}
            </h3>

            <p>
              Time remaining:{" "}
              {data.remainingSeconds ?? "--"} seconds
            </p>
          </header>

          <p>{currentQuestion.question}</p>

          <p>
            Question type: {currentQuestion.gameType}
          </p>

          {data.hasAnswered ? (
            <p role="status">
              تم تسجيل إجابتك.
            </p>
          ) : (
            <p>
              يمكنك الآن إرسال إجابتك.
            </p>
          )}

          {currentQuestion.gameType === "QUIZ" && (
            <div>
              <h4>الاختيارات</h4>

              {[ 
                currentQuestion.optionA,
                currentQuestion.optionB,
                currentQuestion.optionC,
                currentQuestion.optionD,
              ]
                .filter(
                  (option): option is string =>
                    Boolean(option)
                )
                .map((option, index) => (
                  <div key={`${index}-${option}`}>
                    {option}
                  </div>
                ))}
            </div>
          )}

          {currentQuestion.gameType === "MATCHING" && (
            <div>
              <h4>المطابقة</h4>

              <p>العناصر الأولى</p>

              {currentQuestion.matchingOptions?.left.map(
                (item) => (
                  <div key={item.id}>
                    {item.text}
                  </div>
                )
              )}

              <p>العناصر الثانية</p>

              {currentQuestion.matchingOptions?.right.map(
                (item) => (
                  <div key={item.id}>
                    {item.text}
                  </div>
                )
              )}
            </div>
          )}

          {currentQuestion.gameType === "FILL_BLANKS" && (
            <div>
              <h4>أكمل الإجابة</h4>
              <p>
                سيتم عرض حقل الإجابة في واجهة السؤال.
              </p>
            </div>
          )}
        </section>
      ) : (
        <p>في انتظار السؤال التالي...</p>
      )}

      {error && (
        <p role="alert">{error}</p>
      )}

      <button onClick={() => void refresh()}>
        تحديث الحالة
      </button>
    </main>
  );
}
