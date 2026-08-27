"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  Swords,
  Trophy,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useBattleRealtime } from "@/hooks/use-battle-realtime";
import { submitBattleAnswerAction } from "@/actions/student/battle";

interface BattleQuestion {
  id: string;
  question: string;
  type: string;

  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;

  leftText: string | null;
  rightText: string | null;

  points: number;
  timeLimit: number;
  order: number;
}

interface StudentBattle {
  id: string;
  title: string;
  code: string;

  status: "WAITING" | "LIVE" | "FINISHED";

  currentQuestion: number;

  team: "TEAM_A" | "TEAM_B";

  invitationStatus: "PENDING" | "ACCEPTED" | "DECLINED";

  questions: BattleQuestion[];
}

interface StudentBattleClientProps {
  battle: StudentBattle;
}

export function StudentBattleClient({ battle }: StudentBattleClientProps) {
  const {
    state: realtimeState,
    loading: realtimeLoading,
    error: realtimeError,
  } = useBattleRealtime(battle.id);

  const isLive =
  realtimeState?.status === "LIVE";
    const currentQuestionIndex =
    realtimeState?.currentQuestion ?? 0;

  const currentQuestion =
    battle.questions[currentQuestionIndex] ?? null;
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [remainingTime, setRemainingTime] = useState(0);

  // =====================================================
  // REALTIME STATUS
  // =====================================================

  const status = realtimeState?.status ?? battle.status;

  

  
  // =====================================================
  // OPTIONS
  // =====================================================

  const options = useMemo(() => {
    if (!currentQuestion) {
      return [];
    }

    return [
      {
        key: "A",
        text: currentQuestion.optionA,
      },
      {
        key: "B",
        text: currentQuestion.optionB,
      },
      {
        key: "C",
        text: currentQuestion.optionC,
      },
      {
        key: "D",
        text: currentQuestion.optionD,
      },
    ].filter((option) => option.text);
  }, [currentQuestion]);

  // =====================================================
  // TIMER
  // =====================================================

  useEffect(() => {
    if (status !== "LIVE" || !currentQuestion || !realtimeState?.startedAt) {
      return;
    }

    /*
     * في الـ realtime state الحالي
     * startedAt هو وقت بداية التحدي.
     *
     * لو لاحقًا أضفنا questionStartedAt
     * هنستخدمه هنا بدل startedAt.
     */

    const startTime =
  realtimeState?.questionStartedAt ?? realtimeState?.startedAt;

    const duration = currentQuestion.timeLimit * 1000;

    const endTime = startTime + duration;

    const updateTimer = () => {
      const diff = Math.max(0, endTime - Date.now());

      setRemainingTime(Math.ceil(diff / 1000));
    };

    updateTimer();

    const timer = setInterval(updateTimer, 250);

    return () => {
      clearInterval(timer);
    };
  }, [status, currentQuestion, realtimeState?.startedAt]);

  // =====================================================
  // RESET QUESTION
  // =====================================================

  useEffect(() => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setSubmitting(false);
  }, [currentQuestionIndex]);

  // =====================================================
  // SUBMIT ANSWER
  // =====================================================

  async function handleSubmit() {
    if (
      !currentQuestion ||
      !selectedAnswer ||
      submitted ||
      submitting ||
      remainingTime <= 0
    ) {
      return;
    }
    const responseTime = currentQuestion.timeLimit - remainingTime;
    setSubmitting(true);

    const result = await submitBattleAnswerAction({
      roomId: battle.id,
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      responseTime,
    });

    if (result.success) {
      setSubmitted(true);
    }

    setSubmitting(false);
  }

  // =====================================================
  // WAITING
  // =====================================================

  if (status === "WAITING") {
    return (
      <main dir="rtl" className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-8">
          <div className="w-full">
            {/* Header */}

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Swords className="h-5 w-5" />
                </div>

                <div>
                  <h1 className="font-black">{battle.title}</h1>

                  <p className="text-sm text-muted-foreground">
                    التحدي الجماعي
                  </p>
                </div>
              </div>

              <Badge variant="secondary" className="rounded-full px-3 py-1">
                في الانتظار
              </Badge>
            </div>

            {/* Lobby */}

            <div className="overflow-hidden rounded-[2rem] border bg-card shadow-sm">
              <div className="border-b px-6 py-8 text-center sm:px-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <Users className="h-9 w-9" />
                </div>

                <h2 className="mt-6 text-2xl font-black">أنت جاهز للتحدي</h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  انتظر حتى يبدأ المدرس التحدي. سيظهر السؤال الأول تلقائيًا.
                </p>
              </div>

              {/* Team */}

              <div className="p-6 sm:p-8">
                <div className="rounded-2xl border bg-muted/30 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">فريقك</p>

                      <p className="mt-1 text-lg font-black">
                        {battle.team === "TEAM_A"
                          ? "الفريق الأول"
                          : "الفريق الثاني"}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background">
                      <Swords className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Waiting */}

                <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl border border-dashed px-5 py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />

                  <span className="text-sm font-semibold">
                    في انتظار بدء التحدي...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // FINISHED
  // =====================================================

  if (status === "FINISHED") {
    return (
      <main dir="rtl" className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
          <div className="w-full rounded-[2rem] border bg-card p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Trophy className="h-10 w-10" />
            </div>

            <h1 className="mt-7 text-3xl font-black">انتهى التحدي</h1>

            <p className="mt-3 text-muted-foreground">
              أحسنت! تم الانتهاء من جميع أسئلة التحدي.
            </p>

            <div className="mt-8 rounded-2xl bg-muted/40 p-5">
              <p className="text-sm text-muted-foreground">التحدي</p>

              <p className="mt-1 font-bold">{battle.title}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (realtimeLoading || !currentQuestion) {
    return (
      <main dir="rtl" className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>

            <p className="mt-4 text-sm font-semibold">جاري تجهيز السؤال...</p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // REALTIME ERROR
  // =====================================================

  if (realtimeError) {
    return (
      <main dir="rtl" className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="rounded-2xl border bg-card p-6 text-center">
            <XCircle className="mx-auto h-8 w-8 text-destructive" />

            <p className="mt-4 font-bold">{realtimeError}</p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // TIMER PROGRESS
  // =====================================================

  const timeProgress =
    currentQuestion.timeLimit > 0
      ? (remainingTime / currentQuestion.timeLimit) * 100
      : 0;

  // =====================================================
  // LIVE UI
  // =====================================================

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {/* ================================================= */}
        {/* TOP BAR */}
        {/* ================================================= */}

        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Swords className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate font-black">{battle.title}</h1>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {battle.team === "TEAM_A" ? "الفريق الأول" : "الفريق الثاني"}
                </p>
              </div>
            </div>
          </div>

          <Badge
            variant="destructive"
            className="shrink-0 rounded-full px-3 py-1"
          >
            LIVE
          </Badge>
        </header>

        {/* ================================================= */}
        {/* QUESTION META */}
        {/* ================================================= */}

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              السؤال
            </p>

            <p className="mt-1 text-lg font-black">
              {currentQuestionIndex + 1}
              <span className="mx-1 text-muted-foreground">/</span>
              {battle.questions.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={[
                "flex h-11 min-w-20 items-center justify-center gap-2 rounded-xl border px-3",
                remainingTime <= 5
                  ? "border-destructive/30 bg-destructive/5 text-destructive"
                  : "bg-card",
              ].join(" ")}
            >
              <Clock3 className="h-4 w-4" />

              <span className="font-mono text-lg font-black">
                {remainingTime}
              </span>

              <span className="text-[10px] text-muted-foreground">ث</span>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* TIMER */}
        {/* ================================================= */}

        <Progress value={timeProgress} className="mb-6 h-1.5" />

        {/* ================================================= */}
        {/* QUESTION CARD */}
        {/* ================================================= */}

        <section className="rounded-[2rem] border bg-card shadow-sm">
          {/* Question */}

          <div className="border-b p-6 sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <Badge variant="secondary" className="rounded-full">
                {currentQuestion.points} نقطة
              </Badge>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" />
                تحدي مباشر
              </div>
            </div>

            <h2 className="text-xl font-black leading-[1.8] sm:text-2xl">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answers */}

          <div className="p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {options.map((option) => {
                const selected = selectedAnswer === option.key;

                const disabled = submitted || submitting || remainingTime <= 0;

                return (
                  <button
                    key={option.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedAnswer(option.key)}
                    className={[
                      "group relative rounded-2xl border p-4 text-right transition-all duration-200",

                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                        : "hover:border-primary/40 hover:bg-muted/40",

                      disabled ? "cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={[
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-colors",

                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted group-hover:bg-primary/10",
                        ].join(" ")}
                      >
                        {option.key}
                      </div>

                      <span
                        className={[
                          "text-sm font-semibold leading-6",
                          selected
                            ? "text-foreground"
                            : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {option.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ================================================= */}
            {/* SUBMIT */}
            {/* ================================================= */}

            <div className="mt-6">
              {submitted ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 px-5 py-4 text-sm font-bold text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  تم تسجيل إجابتك
                </div>
              ) : remainingTime <= 0 ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-muted px-5 py-4 text-sm font-bold text-muted-foreground">
                  <Clock3 className="h-5 w-5" />
                  انتهى وقت السؤال
                </div>
              ) : (
                <Button
                  size="lg"
                  disabled={!selectedAnswer || submitting}
                  onClick={handleSubmit}
                  className="h-12 w-full rounded-2xl font-bold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري تسجيل الإجابة...
                    </>
                  ) : (
                    <>
                      <Send className="ml-2 h-4 w-4" />
                      إرسال الإجابة
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FOOTER INFO */}
        {/* ================================================= */}

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>اختر إجابة واحدة ثم أرسلها</span>

          <span>•</span>

          <span>سيتم الانتقال تلقائيًا للسؤال التالي</span>
        </div>
      </div>
    </main>
  );
}
