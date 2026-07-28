"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Clock3,
  Trophy,
  Zap,
  Brain,
  Swords,
  PenSquare,
  MessageCircle,
} from "lucide-react";

import { submitLessonProgressAction } from "@/actions/student/progress";

import { QuizGame } from "@/components/game/QuizGame";
import { MatchingGame } from "@/components/game/MatchingGame";
import { FillBlanksGame } from "@/components/game/FillBlanksGame";
import { ConversationGame } from "@/components/game/ConversationGame";

import { ResultsScreen } from "./ResultsScreen";
import { LessonIntro } from "./LessonIntro";

import { cn } from "@/lib/utils";

export interface LessonContent {
  id: string;

  question: string;

  answer?: string | null;

  optionA?: string | null;
  optionB?: string | null;
  optionC?: string | null;
  optionD?: string | null;

  leftText?: string | null;
  rightText?: string | null;

  sortOrder: number;
}

export interface LessonData {
  id: string;

  title: string;

  description?: string;

  gameType: "QUIZ" | "MATCHING" | "FILL_BLANKS" | "CONVERSATION";

  xpReward: number;

  minScore: number;

  maxStars: number;

  timeLimit?: number;

  contents: LessonContent[];
}

interface ExistingProgress {
  completed: boolean;

  score: number;

  stars: number;

  attempts: number;
}

interface GameEngineProps {
  lesson: LessonData;

  courseId: string;

  moduleName: string;

  existingProgress: ExistingProgress | null;
}

export type GamePhase = "intro" | "playing" | "results";

export interface GameResult {
  score: number;

  correctAnswers: number;

  totalQuestions: number;

  timeTakenSeconds?: number;
}

interface MatchingGroup {
  question: string;

  pairs: LessonContent[];
}

function groupMatchingContents(contents: LessonContent[]): MatchingGroup[] {
  const groups = contents.reduce(
    (acc, item) => {
      const key = item.question;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(item);

      return acc;
    },
    {} as Record<string, LessonContent[]>,
  );

  return Object.entries(groups).map(([question, pairs]) => ({
    question,

    pairs,
  }));
}

function IconBox({
  children,
  danger,
}: {
  children: React.ReactNode;

  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-2xl border",

        danger
          ? "border-red-200 bg-red-50 text-red-500"
          : "border-primary/10 bg-primary/10 text-primary",
      )}
    >
      {children}
    </div>
  );
}

const gameTypeConfig = {
  QUIZ: {
    label: "Quiz Challenge",

    icon: Brain,
  },

  MATCHING: {
    label: "Matching Game",

    icon: Swords,
  },

  FILL_BLANKS: {
    label: "Fill Blanks",

    icon: PenSquare,
  },

  CONVERSATION: {
    label: "Conversation",

    icon: MessageCircle,
  },
};

export function GameEngine({
  lesson,
  courseId,
  moduleName,
  existingProgress,
}: GameEngineProps) {
  const router = useRouter();

  const [phase, setPhase] = useState<GamePhase>("intro");

  const [result, setResult] = useState<GameResult | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [submitResult, setSubmitResult] = useState<Awaited<
    ReturnType<typeof submitLessonProgressAction>
  > | null>(null);

  const [timeLeft, setTimeLeft] = useState<number | null>(
    lesson.timeLimit ?? null,
  );

  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  const matchingGroups = useMemo(() => {
    if (lesson.gameType !== "MATCHING") {
      return [];
    }

    return groupMatchingContents(lesson.contents);
  }, [lesson.contents, lesson.gameType]);

  const gameConfig = gameTypeConfig[lesson.gameType];

  const GameIcon = gameConfig.icon;

  // =========================
  // TIMER
  // =========================

  useEffect(() => {
    if (phase !== "playing" || !lesson.timeLimit || timeLeft === null) {
      return;
    }

    if (timeLeft <= 0) {
      handleGameComplete({
        score: 0,

        correctAnswers: 0,

        totalQuestions: lesson.contents.length,

        timeTakenSeconds: lesson.timeLimit,
      });

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => (prev ?? 1) - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  // =========================
  // START
  // =========================

  const handleStart = useCallback(() => {
    setPhase("playing");

    setTimeLeft(lesson.timeLimit ?? null);

    setGameStartTime(Date.now());
  }, [lesson.timeLimit]);

  // =========================
  // COMPLETE
  // =========================

  const handleGameComplete = useCallback(
    async (gameResult: GameResult) => {
      const timeTaken = gameStartTime
        ? Math.round((Date.now() - gameStartTime) / 1000)
        : undefined;

      const finalResult = {
        ...gameResult,

        timeTakenSeconds: timeTaken,
      };

      setResult(finalResult);

      setPhase("results");

      setSubmitting(true);

      try {
        const res = await submitLessonProgressAction({
          lessonId: lesson.id,

          score: finalResult.score,

          timeTakenSeconds: timeTaken,
        });

        setSubmitResult(res);
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    },
    [lesson.id, gameStartTime],
  );

  // =========================
  // RETRY
  // =========================

  const handleRetry = useCallback(() => {
    setPhase("intro");

    setResult(null);

    setSubmitResult(null);

    setTimeLeft(lesson.timeLimit ?? null);

    setGameStartTime(null);
  }, [lesson.timeLimit]);

  // =========================
  // NEXT
  // =========================

  const handleNext = useCallback(() => {
    router.push(`/student/courses/${courseId}`);
  }, [courseId, router]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-border/60 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          {/* LEFT */}

          <button
            onClick={() => router.push(`/student/courses/${courseId}`)}
            className="
              flex items-center gap-2
              text-sm font-medium
              text-muted-foreground
              transition-colors
              hover:text-foreground
            "
          >
            <ArrowRight className="h-4 w-4" />

            <span className="hidden sm:inline">{moduleName}</span>
          </button>

          {/* CENTER */}

          <div className="flex-1 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <IconBox>
                <GameIcon className="h-4 w-4" />
              </IconBox>

              <span className="text-xs font-bold text-primary">
                {gameConfig.label}
              </span>
            </div>

            <h1 className="line-clamp-1 text-sm font-black text-foreground sm:text-lg">
              {lesson.title}
            </h1>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2">
            {/* TIMER */}

            {phase === "playing" && timeLeft !== null && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-bold transition-all",

                  timeLeft <= 10
                    ? "border-red-200 bg-red-50 text-red-500"
                    : timeLeft <= 30
                      ? "border-orange-200 bg-orange-50 text-orange-500"
                      : "border-border bg-muted/40 text-foreground",
                )}
              >
                <Clock3 className="h-4 w-4" />

                <span>
                  {Math.floor(timeLeft / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}

            {/* XP */}

            {phase !== "playing" && (
              <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-bold text-primary">
                <Zap className="h-4 w-4" />

                <span>{lesson.xpReward} نقاط خبرة</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* INTRO */}

        {phase === "intro" && (
          <div className="space-y-6">
            {/* HERO */}

            <div className="rounded-[32px] border border-border/60 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <IconBox>
                  <Trophy className="h-5 w-5" />
                </IconBox>

                <div>
                  <p className="text-sm font-bold text-primary">تحدي تعليمي</p>

                  <h2 className="mt-2 text-4xl font-black">{lesson.title}</h2>

                  {lesson.description && (
                    <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
                      {lesson.description}
                    </p>
                  )}
                </div>
              </div>

              {/* STATS */}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
                  <p className="text-sm text-muted-foreground">عدد العناصر</p>

                  <p className="mt-2 text-3xl font-black">
                    {lesson.gameType === "MATCHING"
                      ? matchingGroups.length
                      : lesson.contents.length}
                  </p>
                </div>

                <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
                  <p className="text-sm text-muted-foreground">نقاط الخبرة</p>

                  <p className="mt-2 text-3xl font-black text-primary">
                    {lesson.xpReward}
                  </p>
                </div>

                <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
                  <p className="text-sm text-muted-foreground">النجاح من</p>

                  <p className="mt-2 text-3xl font-black">{lesson.minScore}%</p>
                </div>
              </div>
            </div>

            {/* INTRO SCREEN */}

            <LessonIntro
              lesson={lesson}
              existingProgress={existingProgress}
              onStart={handleStart}
            />
          </div>
        )}

        {/* =========================
            QUIZ
        ========================= */}

        {phase === "playing" && lesson.gameType === "QUIZ" && (
          <QuizGame
            contents={lesson.contents}
            onComplete={handleGameComplete}
            timeLeft={timeLeft}
          />
        )}

        {/* =========================
            MATCHING
        ========================= */}

        {phase === "playing" && lesson.gameType === "MATCHING" && (
          <MatchingGame
            groups={matchingGroups}
            onComplete={handleGameComplete}
          />
        )}

        {/* =========================
            FILL BLANKS
        ========================= */}

        {phase === "playing" && lesson.gameType === "FILL_BLANKS" && (
          <FillBlanksGame
            contents={lesson.contents}
            onComplete={handleGameComplete}
          />
        )}

        {/* =========================
            CONVERSATION
        ========================= */}

        {phase === "playing" && lesson.gameType === "CONVERSATION" && (
          <ConversationGame
            contents={lesson.contents}
            onComplete={handleGameComplete}
          />
        )}

        {/* =========================
            RESULTS
        ========================= */}

        {phase === "results" && result && (
          <ResultsScreen
            result={result}
            lesson={lesson}
            submitResult={submitResult}
            submitting={submitting}
            existingProgress={existingProgress}
            onRetry={handleRetry}
            onNext={handleNext}
          />
        )}
      </main>
    </div>
  );
}
