
"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";

import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Lightbulb,
  Keyboard,
  Trophy,
  ArrowLeft,
  RotateCcw,
  Target,
  CircleHelp,
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

const MAX_ATTEMPTS = 2;
const AUTO_NEXT_DELAY = 2500;

/**
 * Normalize Arabic text for educational answer matching.
 *
 * The normalization is intentionally conservative.
 *
 * It handles:
 * - Arabic diacritics
 * - Tatweel
 * - Alef variations
 * - Alef Maqsura / Ya
 * - Extra whitespace
 *
 * It intentionally does NOT convert:
 * - ة -> ه
 * - ؤ -> و
 * - ئ -> ي
 *
 * because those changes can hide real spelling differences.
 */
function normalizeArabic(text: string): string {
  return text
    .trim()
    // Remove Arabic diacritics
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Remove tatweel
    .replace(/ـ/g, "")
    // Normalize Alef variations
    .replace(/[إأآٱ]/g, "ا")
    // Normalize Alef Maqsura to Ya
    .replace(/ى/g, "ي")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * Convert the answer field into a list
 * of accepted normalized answers.
 *
 * Supported:
 *
 * "القصوى"
 *
 * "القصوى|القصوي"
 *
 * "القصوى، القصوي"
 *
 * "القصوى
 * القصوي"
 */
function getAcceptedAnswers(
  answer: string | null | undefined,
): string[] {
  if (!answer?.trim()) {
    return [];
  }

  return Array.from(
    new Set(
      answer
        .split(/[|،,\n]+/)
        .map((item) =>
          normalizeArabic(item),
        )
        .filter(Boolean),
    ),
  );
}

/**
 * Check if the student's answer matches
 * any accepted answer.
 */
function isAnswerCorrect(
  userAnswer: string,
  acceptedAnswers: string[],
): boolean {
  const normalizedUserAnswer =
    normalizeArabic(userAnswer);

  if (!normalizedUserAnswer) {
    return false;
  }

  return acceptedAnswers.includes(
    normalizedUserAnswer,
  );
}

/**
 * Generate a progressive hint.
 *
 * Example:
 *
 * الإجابة: القصوى
 *
 * level 1 -> ا_____
 * level 2 -> ال____
 * level 3 -> القص___
 *
 * The full answer is never revealed by
 * the hint itself.
 */
function getHintText(
  answer: string,
  hintLevel: number,
): string | null {
  const normalizedAnswer =
    normalizeArabic(answer);

  if (!normalizedAnswer) {
    return null;
  }

  const visibleCharacters = Math.min(
    hintLevel,
    Math.max(
      1,
      normalizedAnswer.length - 1,
    ),
  );

  return (
    normalizedAnswer.slice(
      0,
      visibleCharacters,
    ) +
    "_".repeat(
      Math.max(
        1,
        normalizedAnswer.length -
          visibleCharacters,
      ),
    )
  );
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

  /**
   * Number of questions answered correctly.
   */
  const [correctCount, setCorrectCount] =
    useState(0);

  /**
   * Attempts for the current question.
   */
  const [attempts, setAttempts] =
    useState(0);

  /**
   * Total attempts across the entire game.
   */
  const [totalAttempts, setTotalAttempts] =
    useState(0);

  /**
   * Number of questions that have been completed.
   */
  const [completedQuestions, setCompletedQuestions] =
    useState(0);

  /**
   * Progressive hint level.
   */
  const [hintLevel, setHintLevel] =
    useState(0);

  /**
   * Whether the student used a hint.
   */
  const [hasUsedHint, setHasUsedHint] =
    useState(false);

  const inputRef =
    useRef<HTMLInputElement>(null);

  const timeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  /**
   * Current question.
   */
  const current =
    contents[currentIndex];

  /**
   * Accepted answers are calculated only
   * when the current answer changes.
   */
  const acceptedAnswers =
    useMemo(
      () =>
        getAcceptedAnswers(
          current?.answer,
        ),
      [current?.answer],
    );

  /**
   * Primary answer is used for:
   * - hints
   * - displaying the answer
   *
   * Alternative answers are used only
   * for validation.
   */
  const primaryAnswer =
    acceptedAnswers[0] ?? "";

  const normalizedPrimaryAnswer =
    useMemo(
      () =>
        normalizeArabic(
          primaryAnswer,
        ),
      [primaryAnswer],
    );

  /**
   * Question progress.
   *
   * The current question is included so:
   *
   * Question 1 / 5 -> 20%
   * Question 5 / 5 -> 100%
   */
  const progress =
    contents.length === 0
      ? 0
      : Math.round(
          ((currentIndex + 1) /
            contents.length) *
            100,
        );

  /**
   * Overall accuracy.
   *
   * We use total attempts here rather than
   * current-question attempts.
   */
  const accuracy =
    totalAttempts === 0
      ? null
      : Math.round(
          (correctCount /
            completedQuestions) *
            100,
        );

  /**
   * Current question parts.
   */
  const questionParts =
    current?.question?.split("___") ?? [
      "",
      "",
    ];

  /**
   * Show accepted answers after a wrong
   * question is finalized.
   */
  const displayCorrectAnswer =
    acceptedAnswers.length > 0
      ? acceptedAnswers.join(" / ")
      : current?.answer ?? "";

  /**
   * Maximum useful hint level.
   *
   * We always keep at least one character
   * hidden.
   */
  const maxHintLevel =
    Math.max(
      0,
      normalizedPrimaryAnswer.length - 1,
    );

  /**
   * Current hint.
   */
  const hintText =
    hintLevel > 0
      ? getHintText(
          primaryAnswer,
          hintLevel,
        )
      : null;

  /**
   * Clear the auto-next timer.
   */
  const clearAutoNextTimer =
    useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current,
        );

        timeoutRef.current = null;
      }
    }, []);

  /**
   * Cleanup on unmount.
   */
  useEffect(() => {
    return () => {
      clearAutoNextTimer();
    };
  }, [clearAutoNextTimer]);

  /**
   * Focus input whenever a new question
   * becomes active.
   */
  useEffect(() => {
    if (questionState !== "idle") {
      return;
    }

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [
    currentIndex,
    questionState,
  ]);

  /**
   * Reset question-specific state.
   */
  const resetQuestionState =
    useCallback(() => {
      setInputValue("");
      setQuestionState("idle");
      setAttempts(0);
      setHintLevel(0);
      setHasUsedHint(false);
    }, []);

  /**
   * Complete the game.
   */
  const completeGame =
    useCallback(
      (finalCorrectCount: number) => {
        clearAutoNextTimer();

        const score =
          contents.length === 0
            ? 0
            : Math.round(
                (finalCorrectCount /
                  contents.length) *
                  100,
              );

        onComplete({
          score,
          correctAnswers:
            finalCorrectCount,
          totalQuestions:
            contents.length,
        });
      },
      [
        clearAutoNextTimer,
        contents.length,
        onComplete,
      ],
    );

  /**
   * Move to the next question.
   */
  const goToNextQuestion =
    useCallback(() => {
      clearAutoNextTimer();

      /**
       * Last question.
       */
      if (
        currentIndex + 1 >=
        contents.length
      ) {
        completeGame(correctCount);
        return;
      }

      setCurrentIndex(
        (index) => index + 1,
      );

      resetQuestionState();
    }, [
      clearAutoNextTimer,
      currentIndex,
      contents.length,
      correctCount,
      completeGame,
      resetQuestionState,
    ]);

  /**
   * Check student's answer.
   */
  const checkAnswer =
    useCallback(() => {
      if (
        questionState !== "idle" ||
        !inputValue.trim()
      ) {
        return;
      }

      const isCorrect =
        isAnswerCorrect(
          inputValue,
          acceptedAnswers,
        );

      const nextAttempts =
        attempts + 1;

      setAttempts(nextAttempts);

      setTotalAttempts(
        (count) => count + 1,
      );

      /**
       * Correct answer:
       *
       * The question is completed immediately.
       * We don't allow unnecessary extra attempts.
       */
      if (isCorrect) {
        setQuestionState("correct");

        setCorrectCount(
          (count) => count + 1,
        );

        setCompletedQuestions(
          (count) => count + 1,
        );

        /**
         * Automatically continue after feedback.
         */
        timeoutRef.current =
          setTimeout(() => {
            /**
             * Last question.
             */
            if (
              currentIndex + 1 >=
              contents.length
            ) {
              /**
               * Include this correct answer.
               */
              completeGame(
                correctCount + 1,
              );

              return;
            }

            setCurrentIndex(
              (index) => index + 1,
            );

            resetQuestionState();

            timeoutRef.current =
              null;
          }, AUTO_NEXT_DELAY);

        return;
      }

      /**
       * Wrong answer.
       *
       * Allow the student to retry until
       * MAX_ATTEMPTS is reached.
       */
      if (
        nextAttempts <
        MAX_ATTEMPTS
      ) {
        /**
         * Keep the question active.
         * We do not reveal the answer.
         */
        setQuestionState("idle");

        /**
         * Clear the input so the student
         * can enter another answer.
         */
        setInputValue("");

        /**
         * Automatically focus again.
         */
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);

        return;
      }

      /**
       * Maximum attempts reached.
       */
      setQuestionState("wrong");

      setCompletedQuestions(
        (count) => count + 1,
      );

      /**
       * Automatically continue after
       * showing the correct answer.
       */
      timeoutRef.current =
        setTimeout(() => {
          if (
            currentIndex + 1 >=
            contents.length
          ) {
            completeGame(
              correctCount,
            );

            return;
          }

          setCurrentIndex(
            (index) => index + 1,
          );

          resetQuestionState();

          timeoutRef.current =
            null;
        }, AUTO_NEXT_DELAY);
    }, [
      questionState,
      inputValue,
      acceptedAnswers,
      attempts,
      currentIndex,
      contents.length,
      correctCount,
      completeGame,
      resetQuestionState,
    ]);

  /**
   * Keyboard support.
   */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      e.key === "Enter" &&
      questionState === "idle"
    ) {
      e.preventDefault();
      checkAnswer();
    }
  };

  /**
   * Show a progressive hint.
   */
  const showHint = () => {
    if (
      maxHintLevel <= 0 ||
      hintLevel >= maxHintLevel
    ) {
      return;
    }

    setHintLevel(
      (level) =>
        Math.min(
          level + 1,
          maxHintLevel,
        ),
    );

    setHasUsedHint(true);
  };

  /**
   * Manual next button.
   */
  const handleNext = () => {
    goToNextQuestion();
  };

  /**
   * Empty state.
   */
  if (
    contents.length === 0 ||
    !current
  ) {
    return (
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-3xl border border-border/60 bg-white p-8 text-center shadow-sm">
          <IconBox className="mx-auto mb-5 h-16 w-16 rounded-3xl">
            <CircleHelp className="h-8 w-8" />
          </IconBox>

          <h2 className="text-2xl font-black">
            لا توجد أسئلة
          </h2>

          <p className="mt-2 text-muted-foreground">
            لا توجد أسئلة متاحة لهذه اللعبة حاليًا.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6"
      dir="rtl"
    >
      {/* =========================
          TOP BAR
      ========================== */}
      <div className="rounded-3xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* TITLE */}
          <div>
            <p className="text-sm text-muted-foreground">
              السؤال{" "}
              {currentIndex + 1} من{" "}
              {contents.length}
            </p>

            <h2 className="mt-1 flex items-center gap-2 text-xl font-black">
              <Keyboard className="h-5 w-5 text-primary" />
              أكمل الفراغ
            </h2>
          </div>

          {/* STATS */}
          <div className="flex flex-wrap items-center gap-2">
            {/* CORRECT */}
            <div
              className="
                flex items-center gap-2
                rounded-2xl
                border border-primary/20
                bg-primary/5
                px-3 py-2
                text-primary
              "
              title="عدد الإجابات الصحيحة"
            >
              <Sparkles className="h-4 w-4" />

              <span className="text-sm font-bold">
                {correctCount} صحيح
              </span>
            </div>

            {/* CURRENT ATTEMPTS */}
            <div
              className="
                flex items-center gap-2
                rounded-2xl
                border border-border/60
                bg-muted/30
                px-3 py-2
              "
              title="محاولات السؤال الحالي"
            >
              <RotateCcw className="h-4 w-4 text-muted-foreground" />

              <span className="text-sm font-bold">
                {attempts}/{MAX_ATTEMPTS}
              </span>
            </div>

            {/* ACCURACY */}
            <div
              className="
                flex items-center gap-2
                rounded-2xl
                border border-border/60
                bg-muted/30
                px-3 py-2
              "
              title="الدقة الحالية"
            >
              <Trophy className="h-4 w-4 text-primary" />

              <span className="text-sm font-bold">
                {accuracy === null
                  ? "—"
                  : `${accuracy}%`}
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
              {progress}%
            </span>
          </div>

          <div
            className="h-3 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="تقدم اللعبة"
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* =========================
          QUESTION CARD
      ========================== */}
      <div
        className={cn(
          "overflow-hidden rounded-[32px] border bg-white shadow-sm transition-all duration-300",
          questionState === "correct"
            ? "border-emerald-200 bg-emerald-50/40"
            : questionState === "wrong"
              ? "border-red-200 bg-red-50/40"
              : "border-border/60",
        )}
      >
        <div className="p-6 sm:p-10">
          {/* QUESTION ICON */}
          <div className="mb-7 flex justify-center">
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
                  {questionParts[0]}

                  <span
                    className={cn(
                      "mx-2 inline-flex min-w-28 items-center justify-center rounded-xl border-b-4 px-4 py-1 text-center font-black transition-all duration-300",
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
                      ? questionState ===
                        "wrong"
                        ? displayCorrectAnswer
                        : inputValue
                    : inputValue ||
                      "____"}
                  </span>

                  {questionParts[1]}
                </>
              ) : (
                current.question
              )}
            </p>
          </div>

          {/* =========================
              CORRECT FEEDBACK
          ========================== */}
          {questionState ===
            "correct" && (
            <div
              className="mt-8 flex flex-col items-center text-center"
              aria-live="polite"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <h3 className="text-2xl font-black text-emerald-600">
                إجابة صحيحة!
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {attempts === 1
                  ? "إجابة صحيحة من المحاولة الأولى."
                  : `إجابة صحيحة بعد ${attempts} محاولات.`}
              </p>

              {hasUsedHint && (
                <p className="mt-1 text-xs text-muted-foreground">
                  تم استخدام تلميح في هذا السؤال.
                </p>
              )}
            </div>
          )}

          {/* =========================
              WRONG FEEDBACK
          ========================== */}
          {questionState ===
            "wrong" && (
            <div
              className="mt-8 flex flex-col items-center text-center"
              aria-live="polite"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500">
                <XCircle className="h-10 w-10" />
              </div>

              <h3 className="text-2xl font-black text-red-500">
                لم تكن الإجابة صحيحة
              </h3>

              <p className="mt-3 text-muted-foreground">
                انتهت المحاولات المتاحة.
              </p>

              <p className="mt-4 text-sm text-muted-foreground">
                الإجابة الصحيحة:
              </p>

              <p
                className="mt-2 rounded-xl bg-emerald-100 px-5 py-2 text-lg font-black text-emerald-600"
              >
                {displayCorrectAnswer}
              </p>
            </div>
          )}

          {/* =========================
              INPUT
          ========================== */}
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
                dir="rtl"
                aria-label="إجابة السؤال"
                aria-describedby="answer-hint"
                autoComplete="off"
                spellCheck={false}
                placeholder="اكتب إجابتك هنا..."
                className="
                  flex-1
                  rounded-2xl
                  border border-border/60
                  bg-white
                  px-5 py-4
                  text-right text-base font-medium
                  text-foreground
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
                type="button"
                onClick={
                  checkAnswer
                }
                disabled={
                  !inputValue.trim()
                }
                className="
                  flex items-center
                  justify-center gap-2
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

          {/* =========================
              NEXT / FINISH
          ========================== */}
          {questionState !==
            "idle" && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={
                  handleNext
                }
                className="
                  flex items-center
                  justify-center gap-2
                  rounded-2xl
                  bg-primary
                  px-7 py-3.5
                  font-bold text-white
                  shadow-sm
                  transition-all duration-300
                  hover:scale-[1.01]
                  hover:bg-primary/90
                  active:scale-[0.98]
                "
              >
                {currentIndex + 1 >=
                contents.length
                  ? "إنهاء اللعبة"
                  : "السؤال التالي"}

                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================
          HINT
      ========================== */}
      {questionState ===
        "idle" &&
        current.answer &&
        maxHintLevel > 0 && (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={showHint}
              disabled={
                hintLevel >=
                maxHintLevel
              }
              aria-describedby="answer-hint"
              className="
                flex items-center gap-2
                rounded-2xl
                border border-border/60
                bg-white
                px-4 py-3
                text-sm
                text-muted-foreground
                shadow-sm
                transition-all duration-300
                hover:border-primary/20
                hover:bg-primary/5
                hover:text-primary
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Lightbulb className="h-4 w-4" />

              {hintLevel === 0
                ? "إظهار تلميح"
                : hintLevel >=
                    maxHintLevel
                  ? "تم الوصول لأقصى تلميح"
                  : "إظهار حرف إضافي"}
            </button>

            {hintText && (
              <div
                id="answer-hint"
                className="
                  rounded-2xl
                  border border-primary/10
                  bg-primary/5
                  px-6 py-3
                  text-center
                "
                aria-live="polite"
              >
                <div className="flex items-center justify-center gap-2">
                  <Target className="h-4 w-4 text-primary" />

                  <p className="text-xs font-bold text-muted-foreground">
                    تلميح
                  </p>
                </div>

                <p className="mt-1 text-xl font-black tracking-widest text-primary">
                  {hintText}
                </p>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
