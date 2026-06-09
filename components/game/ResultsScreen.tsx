"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Trophy,
  Star,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle2,
  Rocket,
  XCircle,
} from "lucide-react";

import {
  GameResult,
  LessonData,
} from "./GameEngine";

import { submitLessonProgressAction } from "@/actions/student/progress";

import { cn } from "@/lib/utils";

interface ResultsScreenProps {
  result: GameResult;

  lesson: LessonData;

  submitResult:
    | Awaited<
        ReturnType<
          typeof submitLessonProgressAction
        >
      >
    | null;

  submitting: boolean;

  existingProgress: {
    completed: boolean;
    score: number;
    stars: number;
    attempts: number;
  } | null;

  onRetry: () => void;

  onNext: () => void;
}

function IconBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl border",
        className,
      )}
    >
      {children}
    </div>
  );
}

function StarAnimation({
  stars,
  max,
}: {
  stars: number;
  max: number;
}) {
  const [revealed, setRevealed] =
    useState(0);

  useEffect(() => {
    if (stars === 0) {
      return;
    }

    const timers: ReturnType<
      typeof setTimeout
    >[] = [];

    for (let i = 0; i < stars; i++) {
      timers.push(
        setTimeout(() => {
          setRevealed(i + 1);
        }, 400 + i * 250),
      );
    }

    return () =>
      timers.forEach(clearTimeout);
  }, [stars]);

  return (
    <div className="mt-5 flex justify-center gap-2">
      {Array.from({
        length: max,
      }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300",

            i < revealed
              ? "scale-110 border-yellow-200 bg-yellow-50"
              : "border-border bg-muted/30",
          )}
          style={{
            transitionDelay: `${i * 100}ms`,
          }}
        >
          <Star
            className={cn(
              "h-7 w-7 transition-all",

              i < revealed
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted",
            )}
          />
        </div>
      ))}
    </div>
  );
}

export function ResultsScreen({
  result,
  lesson,
  submitResult,
  submitting,
  existingProgress,
  onRetry,
  onNext,
}: ResultsScreenProps) {
  const passed =
    result.score >=
    lesson.minScore;

  const stars =
    submitResult?.stars ?? 0;

  const xpEarned =
    submitResult?.xpEarned ?? 0;

  const isImprovement =
    submitResult?.isImprovement ??
    false;

  const isFirstCompletion =
    submitResult?.isFirstCompletion ??
    false;

  const scoreColor =
    result.score >= 90
      ? "text-emerald-600"
      : result.score >=
          lesson.minScore
        ? "text-primary"
        : "text-red-500";

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-4 py-10">
      {/* SOFT BACKGROUND */}
      <div
        className={cn(
          "absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.03)_100%)]",

          passed
            ? "opacity-100"
            : "opacity-70",
        )}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* MAIN CARD */}
        <div className="overflow-hidden rounded-[32px] border border-border/60 bg-white shadow-sm">
          {/* HEADER */}
          <div className="border-b border-border/60 bg-muted/20 px-6 py-10 text-center sm:px-10">
            {/* RESULT ICON */}
            <div className="mb-6 flex justify-center">
              <div
                className={cn(
                  "flex h-28 w-28 items-center justify-center rounded-[32px] border shadow-sm",

                  passed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-red-200 bg-red-50 text-red-500",
                )}
              >
                {passed ? (
                  <Trophy className="h-14 w-14" />
                ) : (
                  <XCircle className="h-14 w-14" />
                )}
              </div>
            </div>

            {/* TITLE */}
            <h1
              className={cn(
                "text-3xl font-black tracking-tight sm:text-4xl",

                passed
                  ? "text-foreground"
                  : "text-red-500",
              )}
            >
              {passed
                ? isFirstCompletion
                  ? "أحسنت! أكملت الدرس 🎉"
                  : isImprovement
                    ? "تحسن رائع!"
                    : "تم إنهاء الدرس بنجاح"
                : "حاول مرة أخرى"}
            </h1>

            {/* SUBTITLE */}
            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-muted-foreground">
              {passed
                ? "أداء ممتاز! استمر في تطوير مهاراتك التعليمية."
                : `تحتاج إلى ${lesson.minScore}% لاجتياز هذا الدرس.`}
            </p>
          </div>

          {/* CONTENT */}
          <div className="p-6 sm:p-8">
            {/* SCORE CARD */}
            <div className="rounded-3xl border border-border/60 bg-muted/20 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                نتيجتك النهائية
              </p>

              <div
                className={cn(
                  "mt-3 text-6xl font-black tracking-tight",

                  scoreColor,
                )}
              >
                {Math.round(
                  result.score,
                )}
                %
              </div>

              <p className="mt-3 text-base text-muted-foreground">
                {
                  result.correctAnswers
                }
                {" / "}
                {
                  result.totalQuestions
                }
                {" "}
                إجابة صحيحة
              </p>

              {/* STARS */}
              {passed &&
                !submitting && (
                  <StarAnimation
                    stars={stars}
                    max={
                      lesson.maxStars
                    }
                  />
                )}
            </div>

            {/* XP REWARD */}
            {!submitting &&
              xpEarned > 0 && (
                <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
                    <IconBox className="border-primary/10 bg-primary/10 text-primary">
                      <Sparkles className="h-6 w-6" />
                    </IconBox>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        لقد حصلت على
                      </p>

                      <h3 className="mt-1 text-3xl font-black text-primary">
                        +{xpEarned} XP
                      </h3>
                    </div>
                  </div>
                </div>
              )}

            {/* LOADING */}
            {submitting && (
              <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />

                <span>
                  جاري حفظ النتيجة...
                </span>
              </div>
            )}

            {/* PREVIOUS SCORE */}
            {existingProgress &&
              isImprovement && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center gap-4">
                    <IconBox className="border-emerald-200 bg-emerald-100 text-emerald-600">
                      <Rocket className="h-5 w-5" />
                    </IconBox>

                    <div>
                      <h3 className="font-bold text-emerald-700">
                        تحسن رائع!
                      </h3>

                      <p className="mt-1 text-sm text-emerald-600">
                        النتيجة السابقة:
                        {" "}
                        {Math.round(
                          existingProgress.score,
                        )}
                        %
                        {" → "}
                        {Math.round(
                          result.score,
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* STATUS BOX */}
            <div
              className={cn(
                "mt-6 rounded-2xl border p-5",

                passed
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50",
              )}
            >
              <div className="flex items-center gap-4">
                <IconBox
                  className={cn(
                    passed
                      ? "border-emerald-200 bg-emerald-100 text-emerald-600"
                      : "border-red-200 bg-red-100 text-red-500",
                  )}
                >
                  {passed ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <XCircle className="h-6 w-6" />
                  )}
                </IconBox>

                <div>
                  <h3
                    className={cn(
                      "font-bold",

                      passed
                        ? "text-emerald-700"
                        : "text-red-600",
                    )}
                  >
                    {passed
                      ? "تم اجتياز الدرس"
                      : "لم يتم اجتياز الدرس"}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {passed
                      ? "يمكنك الآن الانتقال للتحدي التالي."
                      : "أعد المحاولة لتحسين مستواك."}
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              {/* RETRY */}
              <button
                onClick={onRetry}
                className="
                  flex flex-1 items-center justify-center gap-2
                  rounded-2xl
                  border border-border/60
                  bg-white
                  px-5 py-4
                  text-sm font-bold text-foreground
                  transition-all duration-300
                  hover:border-primary/20
                  hover:bg-muted/30
                "
              >
                <RotateCcw className="h-5 w-5" />

                حاول مجددًا
              </button>

              {/* NEXT */}
              <button
                onClick={onNext}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]",

                  passed
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-muted-foreground hover:bg-muted-foreground/90",
                )}
              >
                <ArrowLeft className="h-5 w-5" />

                {passed
                  ? "الدرس التالي"
                  : "العودة للدورة التعليمية"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}