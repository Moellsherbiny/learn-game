"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  getStudentGroupChallengeAction,
  getStudentGroupChallengeLiveAction,
  submitGroupChallengeAnswerAction,
} from "@/actions/student/group-challenge";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type LiveData = Awaited<
  ReturnType<typeof getStudentGroupChallengeLiveAction>
>;

export function StudentGroupChallengeLive({
  challengeId,
  initialData,
}: {
  challengeId: string;
  initialData: LiveData;
}) {
  const router = useRouter();

  const [data, setData] = useState(initialData);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isPending, startTransition] = useTransition();

  const question = data.currentQuestion;
  const existingAnswer = data.existingAnswer;

  useEffect(() => {
    const startedAt = data.challenge.currentQuestionStartedAt;

    if (!startedAt) return;

    const updateTimer = () => {
      const elapsed = Math.floor(
        (Date.now() - new Date(startedAt).getTime()) / 1000
      );

      setRemainingSeconds(
        Math.max(0, question.timeLimit - elapsed)
      );
    };

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [
    data.challenge.currentQuestionStartedAt,
    question.timeLimit,
  ]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const statusData = await getStudentGroupChallengeAction(challengeId);

        if (statusData.challenge.status === "FINISHED") {
          router.replace(
            `/student/group-challenges/${challengeId}/results`
          );
          return;
        }

        if (statusData.challenge.status !== "LIVE") return;

        const updated = await getStudentGroupChallengeLiveAction(
          challengeId
        );

        setData((previous) => {
          if (
            previous.currentQuestion.id !== updated.currentQuestion.id
          ) {
            setSelectedAnswer("");
          }

          return updated;
        });
      } catch {
        // Keep the current question visible if polling temporarily fails.
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [challengeId, router]);

  const options = [
    question.optionA,
    question.optionB,
    question.optionC,
    question.optionD,
  ].filter((option): option is string => Boolean(option));

  const handleSubmit = () => {
    if (!selectedAnswer) {
      toast.error("اختر إجابة أولاً.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitGroupChallengeAnswerAction(
          challengeId,
          selectedAnswer
        );

        toast.success(result.message);

        const updated = await getStudentGroupChallengeLiveAction(
          challengeId
        );

        setData(updated);
        setSelectedAnswer("");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "تعذر إرسال الإجابة."
        );
      }
    });
  };

  const progress =
    ((data.challenge.currentQuestionIndex + 1) /
      data.challenge.totalQuestions) *
    100;

  return (
    <main dir="rtl" className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge>التحدي مباشر</Badge>
          <h1 className="mt-2 text-2xl font-bold">
            {data.challenge.title}
          </h1>
        </div>

        <Badge variant="outline" className="gap-2 px-3 py-2">
          <Users className="h-4 w-4" />
          {data.participant.team === "TEAM_A" ? "الفريق A" : "الفريق B"}
        </Badge>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              السؤال {data.challenge.currentQuestionIndex + 1} من{" "}
              {data.challenge.totalQuestions}
            </span>

            <span className="font-semibold">
              {Math.round(progress)}%
            </span>
          </div>

          <Progress value={progress} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-xs text-muted-foreground">نقاطك</p>
            <p className="mt-1 text-xl font-bold">
              {data.participant.score}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-xs text-muted-foreground">الوقت المتبقي</p>
            <p className="mt-1 text-xl font-bold tabular-nums">
              {remainingSeconds}s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-xs text-muted-foreground">نقاط الفريقين</p>
            <p className="mt-1 text-xl font-bold tabular-nums">
              {data.teamScores.teamA} - {data.teamScores.teamB}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            السؤال الحالي
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <h2 className="text-xl font-semibold leading-relaxed">
            {question.question}
          </h2>

          {options.length > 0 ? (
            <div className="grid gap-3">
              {options.map((option, index) => {
                const selected = selectedAnswer === option;

                return (
                  <button
                    key={`${question.id}-${index}`}
                    type="button"
                    disabled={Boolean(existingAnswer) || remainingSeconds === 0}
                    onClick={() => setSelectedAnswer(option)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-right transition-colors ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "hover:bg-muted"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <span className="font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
          ) : question.leftText && question.rightText ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-4 text-center">
                {question.leftText}
              </div>
              <div className="rounded-xl border p-4 text-center">
                {question.rightText}
              </div>
            </div>
          ) : (
            <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              لا توجد اختيارات متاحة لهذا السؤال.
            </p>
          )}

          {existingAnswer ? (
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                تم تسجيل إجابتك
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                إجابتك: {existingAnswer.answer}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {existingAnswer.isCorrect
                  ? "إجابة صحيحة."
                  : "إجابة غير صحيحة."}
              </p>
            </div>
          ) : remainingSeconds === 0 ? (
            <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              انتهى وقت الإجابة. انتظر انتقال المدرس للسؤال التالي.
            </p>
          ) : (
            <Button
              className="h-12 w-full gap-2"
              onClick={handleSubmit}
              disabled={!selectedAnswer || isPending}
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
    </main>
  );
}