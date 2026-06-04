"use client";

import {
  useState,
  useCallback,
  useRef,
} from "react";

import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Lightbulb,
  Keyboard,
  Trophy,
} from "lucide-react";

import {
  LessonContent,
  GameResult,
} from "./GameEngine";

import { cn } from "@/lib/utils";

interface FillBlanksGameProps {
  contents: LessonContent[];

  onComplete: (
    result: GameResult,
  ) => void;
}

type QuestionState =
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

export function FillBlanksGame({
  contents,
  onComplete,
}: FillBlanksGameProps) {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [inputValue, setInputValue] =
    useState("");

  const [questionState, setQuestionState] =
    useState<QuestionState>("idle");

  const [correctCount, setCorrectCount] =
    useState(0);

  const [hint, setHint] =
    useState(false);

  const inputRef =
    useRef<HTMLInputElement>(null);

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

  const checkAnswer =
    useCallback(() => {
      if (
        questionState !== "idle" ||
        !inputValue.trim()
      ) {
        return;
      }

      const userAnswer =
        inputValue
          .trim()
          .toLowerCase();

      const correctAnswer =
        (
          current.answer ?? ""
        )
          .toLowerCase()
          .trim();

      const isCorrect =
        userAnswer ===
        correctAnswer;

      setQuestionState(
        isCorrect
          ? "correct"
          : "wrong",
      );

      if (isCorrect) {
        setCorrectCount(
          (c) => c + 1,
        );
      }

      setTimeout(() => {
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

          setInputValue("");

          setQuestionState(
            "idle",
          );

          setHint(false);

          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }
      }, 1400);
    }, [
      questionState,
      inputValue,
      current,
      currentIndex,
      contents.length,
      correctCount,
      onComplete,
    ]);

  const handleKeyDown = (
    e: React.KeyboardEvent,
  ) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  };

  const questionParts =
    current?.question.split(
      "___",
    ) ?? ["", ""];

  const hintText =
    current?.answer
      ? `${current.answer[0]}${"_".repeat(
          current.answer.length -
            1,
        )}`
      : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      {/* TOP BAR */}
      <div className="rounded-3xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT */}
          <div>
            <p className="text-sm text-muted-foreground">
              السؤال{" "}
              {currentIndex + 1} من{" "}
              {contents.length}
            </p>

            <h2 className="mt-1 text-xl font-black">
              أكمل الفراغ ✍️
            </h2>
          </div>

          {/* STATS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* CORRECT */}
            <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 text-primary">
              <Sparkles className="h-4 w-4" />

              <span className="text-sm font-bold">
                {correctCount} صحيح
              </span>
            </div>

            {/* ACCURACY */}
            <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-3 py-2">
              <Trophy className="h-4 w-4 text-primary" />

              <span className="text-sm font-bold">
                {accuracy}%
              </span>
            </div>
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
      <div
        className={cn(
          "overflow-hidden rounded-[32px] border bg-white shadow-sm transition-all duration-300",

          questionState ===
            "correct"
            ? "border-emerald-200 bg-emerald-50/40"
            : questionState ===
                "wrong"
              ? "border-red-200 bg-red-50/40"
              : "border-border/60",
        )}
      >
        <div className="p-6 sm:p-10">
          {/* ICON */}
          <div className="mb-6 flex justify-center">
            <IconBox className="h-16 w-16 rounded-3xl">
              <Keyboard className="h-8 w-8" />
            </IconBox>
          </div>

          {/* QUESTION */}
          <div className="text-center">
            <p className="text-xl font-bold leading-loose text-foreground sm:text-3xl">
              {questionParts.length >
              1 ? (
                <>
                  {
                    questionParts[0]
                  }

                  <span
                    className={cn(
                      "mx-2 inline-flex min-w-28 items-center justify-center rounded-xl border-b-4 px-4 py-1 text-center font-black transition-all",

                      questionState ===
                        "correct"
                        ? "border-emerald-400 bg-emerald-100 text-emerald-600"

                        : questionState ===
                            "wrong"
                          ? "border-red-400 bg-red-100 text-red-500"

                          : "border-primary bg-primary/10 text-primary",
                    )}
                  >
                    {questionState !==
                    "idle"
                      ? current.answer
                      : inputValue ||
                        "____"}
                  </span>

                  {
                    questionParts[1]
                  }
                </>
              ) : (
                current.question
              )}
            </p>
          </div>

          {/* FEEDBACK */}
          {questionState ===
            "correct" && (
            <div className="mt-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <h3 className="text-2xl font-black text-emerald-600">
                إجابة صحيحة!
              </h3>
            </div>
          )}

          {questionState ===
            "wrong" && (
            <div className="mt-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500">
                <XCircle className="h-10 w-10" />
              </div>

              <h3 className="text-2xl font-black text-red-500">
                إجابة خاطئة
              </h3>

              <p className="mt-3 text-muted-foreground">
                الإجابة الصحيحة:
              </p>

              <p className="mt-2 rounded-xl bg-emerald-100 px-4 py-2 text-lg font-black text-emerald-600">
                {
                  current.answer
                }
              </p>
            </div>
          )}

          {/* INPUT */}
          {questionState ===
            "idle" && (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) =>
                  setInputValue(
                    e.target.value,
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                autoFocus
                placeholder="اكتب إجابتك هنا..."
                className="
                  flex-1
                  rounded-2xl
                  border border-border/60
                  bg-white
                  px-5 py-4
                  text-right text-base font-medium text-foreground
                  placeholder:text-muted-foreground
                  shadow-sm
                  transition-all duration-300
                  focus:border-primary/20
                  focus:outline-none
                  focus:ring-4
                  focus:ring-primary/10
                "
              />

              <button
                onClick={
                  checkAnswer
                }
                disabled={
                  !inputValue.trim()
                }
                className="
                  flex items-center justify-center gap-2
                  rounded-2xl
                  bg-primary
                  px-8 py-4
                  font-bold text-white
                  shadow-sm
                  transition-all duration-300
                  hover:scale-[1.01]
                  hover:bg-primary/90
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  disabled:hover:scale-100
                "
              >
                <CheckCircle2 className="h-5 w-5" />

                تحقق
              </button>
            </div>
          )}
        </div>
      </div>

      {/* HINT */}
      {questionState ===
        "idle" &&
        current.answer && (
          <div className="flex justify-center">
            <button
              onClick={() =>
                setHint(true)
              }
              className="
                flex items-center gap-2
                rounded-2xl
                border border-border/60
                bg-white
                px-4 py-3
                text-sm text-muted-foreground
                shadow-sm
                transition-all duration-300
                hover:border-primary/20
                hover:bg-primary/5
                hover:text-primary
              "
            >
              <Lightbulb className="h-4 w-4" />

              {hint
                ? `تلميح: "${hintText}"`
                : "إظهار تلميح"}
            </button>
          </div>
        )}
    </div>
  );
}