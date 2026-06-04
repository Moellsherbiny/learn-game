"use client";

import {
  PlayCircle,
  RotateCcw,
  Clock3,
  Star,
  Trophy,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Rocket,
} from "lucide-react";

import { getGameTypeLabel } from "@/lib/game-utils";

import { LessonData } from "./GameEngine";

import { cn } from "@/lib/utils";

interface ExistingProgress {
  completed: boolean;
  score: number;
  stars: number;
  attempts: number;
}

interface LessonIntroProps {
  lesson: LessonData;
  existingProgress: ExistingProgress | null;
  onStart: () => void;
}

function IconBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary">
      {children}
    </div>
  );
}

export function LessonIntro({
  lesson,
  existingProgress,
  onStart,
}: LessonIntroProps) {
  const label = getGameTypeLabel(
    lesson.gameType,
  );

  const alreadyCompleted =
    existingProgress?.completed ?? false;

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-4 py-10">
      {/* SOFT BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.03),transparent_45%)]" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* TOP BADGE */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-5 py-2 text-sm font-medium text-primary shadow-sm">
            <Sparkles className="h-4 w-4" />

            <span>{label}</span>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="overflow-hidden rounded-[32px] border border-border/60 bg-white shadow-sm">
          {/* HEADER */}
          <div className="border-b border-border/60 bg-muted/30 px-6 py-8 text-center sm:px-10">
            <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[32px] border border-primary/10 bg-primary/10 text-primary shadow-sm">
              <BookOpen className="h-14 w-14" />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {lesson.title}
            </h1>

            {lesson.description && (
              <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted-foreground">
                {lesson.description}
              </p>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-6 sm:p-8">
            {/* STATS */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* QUESTIONS */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-center">
                <div className="mb-3 flex justify-center">
                  <IconBox>
                    <BookOpen className="h-5 w-5" />
                  </IconBox>
                </div>

                <div className="text-3xl font-black">
                  {lesson.contents.length}
                </div>

                <div className="mt-1 text-sm text-muted-foreground">
                  سؤال
                </div>
              </div>

              {/* XP */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-center">
                <div className="mb-3 flex justify-center">
                  <IconBox>
                    <Sparkles className="h-5 w-5" />
                  </IconBox>
                </div>

                <div className="text-3xl font-black text-primary">
                  {lesson.xpReward}
                </div>

                <div className="mt-1 text-sm text-muted-foreground">
                  XP
                </div>
              </div>

              {/* TIME */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-center">
                <div className="mb-3 flex justify-center">
                  <IconBox>
                    <Clock3 className="h-5 w-5" />
                  </IconBox>
                </div>

                <div className="text-2xl font-black">
                  {lesson.timeLimit
                    ? `${Math.floor(
                        lesson.timeLimit / 60,
                      )} د`
                    : "مفتوح"}
                </div>

                <div className="mt-1 text-sm text-muted-foreground">
                  الوقت
                </div>
              </div>
            </div>

            {/* INFO BOX */}
            <div className="mt-6 rounded-2xl border border-border/60 bg-muted/20 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* SCORE */}
                <div className="flex items-center gap-3">
                  <IconBox>
                    <Trophy className="h-5 w-5" />
                  </IconBox>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      نسبة النجاح المطلوبة
                    </p>

                    <p className="text-xl font-black">
                      {lesson.minScore}%
                    </p>
                  </div>
                </div>

                {/* STARS */}
                <div className="flex items-center gap-3">
                  <IconBox>
                    <Star className="h-5 w-5" />
                  </IconBox>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      عدد النجوم
                    </p>

                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({
                        length:
                          lesson.maxStars,
                      }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PREVIOUS PROGRESS */}
            {existingProgress && (
              <div
                className={cn(
                  "mt-6 rounded-2xl border p-5",

                  alreadyCompleted
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-orange-200 bg-orange-50",
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl",

                        alreadyCompleted
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-orange-100 text-orange-600",
                      )}
                    >
                      {alreadyCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Rocket className="h-6 w-6" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold">
                        {alreadyCompleted
                          ? "لقد أكملت هذا الدرس"
                          : "لديك محاولة سابقة"}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        عدد المحاولات:
                        {" "}
                        {
                          existingProgress.attempts
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        النتيجة
                      </p>

                      <p className="text-xl font-black">
                        {Math.round(
                          existingProgress.score,
                        )}
                        %
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        النجوم
                      </p>

                      <div className="mt-1 flex items-center gap-1">
                        {Array.from({
                          length:
                            lesson.maxStars,
                        }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",

                              i <
                                existingProgress.stars
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* START BUTTON */}
            <button
              onClick={onStart}
              className="
                mt-8
                flex w-full items-center justify-center gap-3
                rounded-2xl
                bg-primary
                px-6 py-4
                text-lg font-bold text-white
                shadow-sm
                transition-all duration-300
                hover:scale-[1.01]
                hover:bg-primary/90
                active:scale-[0.98]
              "
            >
              {alreadyCompleted ? (
                <>
                  <RotateCcw className="h-5 w-5" />
                  العب مجددًا
                </>
              ) : (
                <>
                  <PlayCircle className="h-5 w-5" />
                  ابدأ الآن
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}