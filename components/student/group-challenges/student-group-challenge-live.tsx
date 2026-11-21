"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Loader2, Trophy, Users, X } from "lucide-react";
import { toast } from "sonner";

import { getStudentGroupChallengeLiveStateAction } from "@/actions/student/group-challenge-live";

import { submitGroupChallengeAnswerAction } from "@/actions/student/group-challenge-answer";

import { useGroupChallengeRealtime } from "@/hooks/use-group-challenge-realtime";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ============================================
// Types
// ============================================

type LiveData = Awaited<
  ReturnType<typeof getStudentGroupChallengeLiveStateAction>
>;

type Question = NonNullable<LiveData["currentQuestion"]>;

type MatchingPair = {
  leftId: string;
  rightId: string;
  left: string;
  right: string;
};

// ============================================
// Main Component
// ============================================

export function StudentGroupChallengeLive({
  challengeId,
}: {
  challengeId: string;
}) {
  const router = useRouter();

  const { data, isLoading, error, refresh } =
    useGroupChallengeRealtime(challengeId);

  useEffect(() => {
    if (data?.challenge.status === "FINISHED") {
      router.replace(`/student/group-challenges/${challengeId}/results`);
    }
  }, [data?.challenge.status, challengeId, router]);

  if (isLoading && !data) {
    return (
      <div className="flex min-h-75 items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p>جاري تحميل التحدي...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-12 text-center">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => void refresh()}>إعادة المحاولة</Button>
      </div>
    );
  }

  if (!data) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        لا توجد بيانات للتحدي.
      </p>
    );
  }

  const { challenge, currentQuestion, statistics } = data;

  if (challenge.status === "FINISHED") {
    return (
      <div className="py-12 text-center">
        <Trophy className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h2 className="text-2xl font-bold">انتهى التحدي</h2>
        <p className="mt-2 text-muted-foreground">
          جاري تحويلك إلى النتائج النهائية...
        </p>
      </div>
    );
  }

  if (challenge.status === "WAITING") {
    return (
      <main dir="rtl" className="container mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="space-y-5 p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-primary" />

            <h1 className="text-2xl font-bold">{challenge.title}</h1>

            <p className="text-muted-foreground">في انتظار بدء التحدي...</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">الطلاب الجاهزون</p>
                <p className="mt-1 text-2xl font-bold">
                  {statistics.readyCount}
                </p>
              </div>

              <div className="rounded-xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
                <p className="mt-1 text-2xl font-bold">
                  {statistics.totalParticipants}
                </p>
              </div>
            </div>

            <Button variant="outline" onClick={() => void refresh()}>
              تحديث الحالة
            </Button>
          </CardContent>
        </Card>

        {error && (
          <p className="mt-4 text-center text-sm text-destructive">{error}</p>
        )}
      </main>
    );
  }

  return (
    <main dir="rtl" className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge>التحدي مباشر</Badge>

          <h1 className="mt-2 text-2xl font-bold">{challenge.title}</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {challenge.course.title}
          </p>
        </div>

        <Badge variant="outline" className="gap-2 px-3 py-2">
          <Users className="h-4 w-4" />
          {data.participant.team === "TEAM_A" ? "الفريق A" : "الفريق B"}
        </Badge>
      </div>

      {/* Team Scores */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">نقاط الفريق A</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {statistics.teamA.score}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {statistics.teamA.participants} طلاب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">نقاط الفريق B</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {statistics.teamB.score}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {statistics.teamB.participants} طلاب
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Student Score and Timer */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-xs text-muted-foreground">نقاطك</p>
            <p className="mt-1 text-xl font-bold">{data.participant.score}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-xs text-muted-foreground">الوقت المتبقي</p>
            <p className="mt-1 text-xl font-bold tabular-nums">
              {data.remainingSeconds ?? "--"}s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Question */}
      {currentQuestion ? (
        <QuestionPanel
          key={currentQuestion.id}
          question={currentQuestion}
          hasAnswered={data.hasAnswered}
          remainingSeconds={data.remainingSeconds}
          challengeId={challengeId}
          onSubmitted={refresh}
        />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">في انتظار السؤال التالي...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={() => void refresh()}>
          تحديث الحالة
        </Button>
      </div>
    </main>
  );
}

// ============================================
// Question Panel
// ============================================

function QuestionPanel({
  question,
  hasAnswered,
  remainingSeconds,
  challengeId,
  onSubmitted,
}: {
  question: Question;
  hasAnswered: boolean;
  remainingSeconds: number | null;
  challengeId: string;
  onSubmitted: () => Promise<void>;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [fillAnswer, setFillAnswer] = useState("");
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const isTimeOver = remainingSeconds === 0;
  const isDisabled = hasAnswered || isTimeOver || isPending;

  const options = [
    question.optionA,
    question.optionB,
    question.optionC,
    question.optionD,
  ].filter((option): option is string => Boolean(option));

  const matchingOptions =
    "matchingOptions" in question ? question.matchingOptions : null;

  // ============================================
  // Matching Selection
  // ============================================

  const handleSelectLeft = (id: string) => {
    if (isDisabled) return;

    setSelectedLeftId((previous) => (previous === id ? null : id));
  };

  const handleSelectRight = (rightId: string) => {
    if (isDisabled || !selectedLeftId || !matchingOptions) {
      return;
    }

    const leftItem = matchingOptions.left.find(
      (item) => item.id === selectedLeftId,
    );

    const rightItem = matchingOptions.right.find((item) => item.id === rightId);

    if (!leftItem || !rightItem) return;

    const leftAlreadyUsed = matchingPairs.some(
      (pair) => pair.leftId === leftItem.id,
    );

    const rightAlreadyUsed = matchingPairs.some(
      (pair) => pair.rightId === rightItem.id,
    );

    if (leftAlreadyUsed || rightAlreadyUsed) return;

    setMatchingPairs((previous) => [
      ...previous,
      {
        leftId: leftItem.id,
        rightId: rightItem.id,
        left: leftItem.text,
        right: rightItem.text,
      },
    ]);

    setSelectedLeftId(null);
  };

  const removeMatchingPair = (leftId: string) => {
    if (isDisabled) return;

    setMatchingPairs((previous) =>
      previous.filter((pair) => pair.leftId !== leftId),
    );
  };

  // ============================================
  // Submit
  // ============================================

  const handleSubmit = () => {
    if (isDisabled) return;

    if (question.gameType === "QUIZ") {
      if (!selectedAnswer) {
        toast.error("اختر إجابة أولاً.");
        return;
      }
    }

    if (question.gameType === "FILL_BLANKS") {
      if (!fillAnswer.trim()) {
        toast.error("اكتب إجابتك أولاً.");
        return;
      }
    }

    if (question.gameType === "MATCHING") {
      if (
        !matchingOptions ||
        matchingPairs.length !== matchingOptions.left.length ||
        matchingPairs.length !== matchingOptions.right.length
      ) {
        toast.error("أكمل جميع أزواج المطابقة أولاً.");
        return;
      }
    }

    startTransition(async () => {
      try {
        const result = await submitGroupChallengeAnswerAction({
          challengeId,

          ...(question.gameType === "MATCHING"
            ? {
                answerData: {
                  pairs: matchingPairs.map((pair) => ({
                    leftId: pair.leftId,
                    rightId: pair.rightId,
                  })),
                },
              }
            : {
                answer:
                  question.gameType === "QUIZ" ? selectedAnswer : fillAnswer,
              }),
        });

        toast.success(result.message);

        await onSubmitted();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "تعذر إرسال الإجابة.",
        );
      }
    });
  };

  // ============================================
  // Render
  // ============================================

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">السؤال الحالي</CardTitle>

          <Badge variant="outline">
            {question.gameType === "QUIZ" && "اختيار من متعدد"}
            {question.gameType === "MATCHING" && "توصيل"}
            {question.gameType === "FILL_BLANKS" && "أكمل الفراغ"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            السؤال {question.order}
          </p>

          <h2 className="text-xl font-semibold leading-relaxed">
            {question.question}
          </h2>
        </div>

        {/* QUIZ */}
        {question.gameType === "QUIZ" && (
          <div className="grid gap-3">
            {options.map((option, index) => {
              const selected = selectedAnswer === option;

              return (
                <button
                  key={`${question.id}-${index}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setSelectedAnswer(option)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-right transition-colors ${
                    selected ? "border-primary bg-primary/10" : "hover:bg-muted"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="font-medium">{option}</span>

                  {selected && (
                    <CheckCircle2 className="mr-auto h-5 w-5 text-primary" />
                  )}
                </button>
              );
            })}

            {options.length === 0 && (
              <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                لا توجد اختيارات متاحة لهذا السؤال.
              </p>
            )}
          </div>
        )}

        {/* MATCHING */}
        {question.gameType === "MATCHING" && (
          <div className="space-y-5">
            {!matchingOptions ||
            matchingOptions.left.length === 0 ||
            matchingOptions.right.length === 0 ? (
              <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                لا توجد عناصر مطابقة متاحة لهذا السؤال.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  اختر عنصرًا من العمود الأول، ثم اختر العنصر المرتبط به من
                  العمود الثاني.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <p className="text-center text-sm font-semibold">
                      العمود الأول
                    </p>

                    {matchingOptions.left.map((item) => {
                      const used = matchingPairs.some(
                        (pair) => pair.leftId === item.id,
                      );

                      const selected = selectedLeftId === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={isDisabled || used}
                          onClick={() => handleSelectLeft(item.id)}
                          className={`min-h-16 w-full rounded-xl border p-3 text-sm transition-colors ${
                            selected
                              ? "border-primary bg-primary/10"
                              : used
                                ? "border-primary/40 bg-primary/5 opacity-70"
                                : "hover:bg-muted"
                          } disabled:cursor-not-allowed`}
                        >
                          {item.text}
                          {used && (
                            <CheckCircle2 className="mr-1 inline h-4 w-4 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <p className="text-center text-sm font-semibold">
                      العمود الثاني
                    </p>

                    {matchingOptions.right.map((item) => {
                      const used = matchingPairs.some(
                        (pair) => pair.rightId === item.id,
                      );

                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={isDisabled || used || !selectedLeftId}
                          onClick={() => handleSelectRight(item.id)}
                          className={`min-h-16 w-full rounded-xl border p-3 text-sm transition-colors ${
                            used
                              ? "border-primary/40 bg-primary/5 opacity-70"
                              : selectedLeftId
                                ? "hover:border-primary hover:bg-primary/5"
                                : "opacity-70"
                          } disabled:cursor-not-allowed`}
                        >
                          {item.text}
                          {used && (
                            <CheckCircle2 className="mr-1 inline h-4 w-4 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Pairs */}
                {matchingPairs.length > 0 && (
                  <div className="space-y-2 rounded-xl bg-muted/60 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">الأزواج المحددة</p>

                      <Badge variant="secondary">
                        {matchingPairs.length} / {matchingOptions.left.length}
                      </Badge>
                    </div>

                    {matchingPairs.map((pair) => (
                      <div
                        key={pair.leftId}
                        className="flex items-center gap-2 rounded-lg border bg-background p-3 text-sm"
                      >
                        <span className="flex-1">{pair.left}</span>

                        <span className="text-muted-foreground">↔</span>

                        <span className="flex-1">{pair.right}</span>

                        {!isDisabled && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0"
                            onClick={() => removeMatchingPair(pair.leftId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* FILL BLANKS */}
        {question.gameType === "FILL_BLANKS" && (
          <div className="space-y-3">
            <label
              htmlFor={`fill-answer-${question.id}`}
              className="text-sm font-medium"
            >
              اكتب إجابتك
            </label>

            <input
              id={`fill-answer-${question.id}`}
              type="text"
              value={fillAnswer}
              onChange={(event) => setFillAnswer(event.target.value)}
              disabled={isDisabled}
              maxLength={2000}
              placeholder="اكتب الإجابة هنا..."
              className="h-12 w-full rounded-xl border bg-background px-4 outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        )}

        {/* Answer Status */}
        {hasAnswered && (
          <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">تم تسجيل إجابتك</p>
              <p className="text-sm text-muted-foreground">
                انتظر السؤال التالي.
              </p>
            </div>
          </div>
        )}

        {!hasAnswered && isTimeOver && (
          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            انتهى وقت الإجابة. انتظر انتقال المدرس للسؤال التالي.
          </p>
        )}

        {/* Submit Button */}
        {!hasAnswered && !isTimeOver && (
          <Button
            className="h-12 w-full gap-2"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            إرسال الإجابة
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
