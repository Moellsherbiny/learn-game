"use client";

import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  CheckCircle2,
  XCircle,
  Flame,
  Zap,
  Keyboard,
  Trophy,
} from "lucide-react";

import {
  LessonContent,
  GameResult,
} from "./GameEngine";

import { cn } from "@/lib/utils";

interface QuizGameProps {
  contents: LessonContent[];
  onComplete: (
    result: GameResult,
  ) => void;

  timeLeft?: number | null;
}

type AnswerState =
  | "idle"
  | "correct"
  | "wrong";

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
        "flex h-10 w-10 items-center justify-center rounded-2xl border",
        "border-primary/10 bg-primary/10 text-primary",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function QuizGame({
  contents,
  onComplete,
}: QuizGameProps) {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);

  const [answerState, setAnswerState] =
    useState<AnswerState>("idle");

  const [correctCount, setCorrectCount] =
    useState(0);

  const [showFeedback, setShowFeedback] =
    useState(false);

  const [streakCount, setStreakCount] =
    useState(0);

  const [combo, setCombo] =
    useState(0);

  const current =
    contents[currentIndex];

  const progress =
    (currentIndex /
      contents.length) *
    100;

  const accuracy =
    currentIndex === 0
      ? 100
      : Math.round(
          (correctCount /
            currentIndex) *
            100,
        );

  const options = [
    {
      key: "A",
      value: current?.optionA,
    },
    {
      key: "B",
      value: current?.optionB,
    },
    {
      key: "C",
      value: current?.optionC,
    },
    {
      key: "D",
      value: current?.optionD,
    },
  ].filter(
    (o) => !!o.value,
  ) as {
    key: string;
    value: string;
  }[];

  const handleAnswer =
    useCallback(
      (answer: string) => {
        if (
          answerState !== "idle"
        ) {
          return;
        }

        setSelectedAnswer(answer);

        const isCorrect =
          answer.toLowerCase() ===
          (
            current.answer ?? ""
          ).toLowerCase();

        setAnswerState(
          isCorrect
            ? "correct"
            : "wrong",
        );

        setShowFeedback(true);

        if (isCorrect) {
          setCorrectCount(
            (c) => c + 1,
          );

          setStreakCount(
            (s) => s + 1,
          );

          setCombo((c) =>
            Math.min(c + 1, 5),
          );
        } else {
          setStreakCount(0);

          setCombo(0);
        }

        setTimeout(() => {
          setShowFeedback(false);

          setSelectedAnswer(
            null,
          );

          setAnswerState("idle");

          if (
            currentIndex + 1 >=
            contents.length
          ) {
            const finalCorrect =
              isCorrect
                ? correctCount + 1
                : correctCount;

            const score =
              Math.round(
                (finalCorrect /
                  contents.length) *
                  100,
              );

            onComplete({
              score,
              correctAnswers:
                finalCorrect,
              totalQuestions:
                contents.length,
            });
          } else {
            setCurrentIndex(
              (i) => i + 1,
            );
          }
        }, 1200);
      },
      [
        answerState,
        current,
        correctCount,
        currentIndex,
        contents.length,
        onComplete,
      ],
    );

  // KEYBOARD
  useEffect(() => {
    if (
      options.length === 0
    ) {
      return;
    }

    const map: Record<
      string,
      number
    > = {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 3,
    };

    const handler = (
      e: KeyboardEvent,
    ) => {
      const idx =
        map[e.key];

      if (
        idx !== undefined &&
        options[idx]
      ) {
        handleAnswer(
          options[idx].value,
        );
      }
    };

    window.addEventListener(
      "keydown",
      handler,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handler,
      );
  }, [options, handleAnswer]);

  if (!current) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6">
      {/* TOP BAR */}
      <div className="rounded-3xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* QUESTION INFO */}
          <div>
            <p className="text-sm text-muted-foreground">
              السؤال{" "}
              {currentIndex + 1} من{" "}
              {contents.length}
            </p>

            <h2 className="mt-1 text-xl font-black">
              أكمل التحدي 🎯
            </h2>
          </div>

          {/* STATS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* ACCURACY */}
            <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-3 py-2">
              <IconBox className="h-8 w-8 rounded-xl">
                <Trophy className="h-4 w-4" />
              </IconBox>

              <div>
                <p className="text-[10px] text-muted-foreground">
                  الدقة
                </p>

                <p className="text-sm font-bold">
                  {accuracy}%
                </p>
              </div>
            </div>

            {/* COMBO */}
            {combo > 1 && (
              <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-orange-600">
                <Flame className="h-4 w-4" />

                <span className="text-sm font-bold">
                  ×{combo}
                </span>
              </div>
            )}

            {/* STREAK */}
            {streakCount >
              0 && (
              <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 text-primary">
                <Zap className="h-4 w-4" />

                <span className="text-sm font-bold">
                  {streakCount} متتالية
                </span>
              </div>
            )}
          </div>
        </div>

        {/* PROGRESS */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              التقدم
            </span>

            <span className="font-bold">
              {Math.round(
                progress,
              )}
              %
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-white shadow-sm">
        {/* FEEDBACK OVERLAY */}
        {showFeedback && (
          <div
            className={cn(
              "absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm transition-all duration-300",

              answerState ===
                "correct"
                ? "bg-emerald-500/10"
                : "bg-red-500/10",
            )}
          >
            <div
              className={cn(
                "flex h-28 w-28 animate-bounce items-center justify-center rounded-full shadow-lg",

                answerState ===
                  "correct"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600",
              )}
            >
              {answerState ===
              "correct" ? (
                <CheckCircle2 className="h-14 w-14" />
              ) : (
                <XCircle className="h-14 w-14" />
              )}
            </div>
          </div>
        )}

        {/* QUESTION */}
        <div className="p-8 sm:p-12">
          <div className="mb-6 flex justify-center">
            <IconBox className="h-16 w-16 rounded-3xl">
              <Trophy className="h-8 w-8" />
            </IconBox>
          </div>

          <h1 className="text-center text-2xl font-black leading-relaxed text-foreground sm:text-3xl">
            {current.question}
          </h1>
        </div>
      </div>

      {/* OPTIONS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map(
          (
            { key, value },
            idx,
          ) => {
            const isSelected =
              selectedAnswer ===
              value;

            const isCorrectOption =
              value.toLowerCase() ===
              (
                current.answer ??
                ""
              ).toLowerCase();

            const showCorrect =
              showFeedback &&
              isCorrectOption;

            const showWrong =
              showFeedback &&
              isSelected &&
              !isCorrectOption;

            return (
              <button
                key={key}
                onClick={() =>
                  handleAnswer(
                    value,
                  )
                }
                disabled={
                  answerState !==
                  "idle"
                }
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-5 text-right transition-all duration-200",

                  "disabled:cursor-not-allowed",

                  showCorrect
                    ? "border-emerald-300 bg-emerald-50 shadow-sm"
                    : showWrong
                      ? "border-red-300 bg-red-50"
                      : answerState ===
                          "idle"
                        ? "border-border/60 bg-white hover:-translate-y-1 hover:border-primary/20 hover:shadow-md"
                        : "border-border/40 bg-muted/20 opacity-70",
                )}
              >
                <div className="flex items-start gap-4">
                  {/* NUMBER */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black transition-all",

                      showCorrect
                        ? "border-emerald-200 bg-emerald-100 text-emerald-600"
                        : showWrong
                          ? "border-red-200 bg-red-100 text-red-600"
                          : "border-border bg-muted/40 text-muted-foreground group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary",
                    )}
                  >
                    {idx + 1}
                  </div>

                  {/* TEXT */}
                  <div className="flex-1">
                    <p className="text-base font-medium leading-7 text-foreground">
                      {value}
                    </p>
                  </div>

                  {/* STATUS */}
                  {showCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}

                  {showWrong && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </button>
            );
          },
        )}
      </div>

      {/* KEYBOARD HINT */}
      <div className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
        <Keyboard className="h-4 w-4" />

        <span>
          يمكنك استخدام الأرقام 1-4 للإجابة السريعة
        </span>
      </div>
    </div>
  );
}