"use client";

import Link from "next/link";

import {
  Lock,
  CheckCircle2,
  Sparkles,
  Trophy,
  BookOpen,
  PlayCircle,
  Crown,
  Star,
  Rocket,
} from "lucide-react";

import { getLevelColor, getLevelLabel } from "@/lib/game-utils";

import { cn } from "@/lib/utils";

type StudentLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface LessonProgress {
  completed: boolean;
  score: number;
  stars: number;
}

interface Lesson {
  id: string;

  title: string;

  gameType: "QUIZ" | "MATCHING" | "FILL_BLANKS" | "CONVERSATION";

  xpReward: number;

  order: number;

  progress: LessonProgress[];
}

interface Module {
  id: string;

  title: string;

  description?: string | null;

  level: StudentLevel;

  requiredXp: number;

  order: number;

  lessons: Lesson[];

  showAdaptiveLessons: boolean;
}

interface ModuleCardProps {
  module: Module;

  courseId: string;

  isUnlocked: boolean;

  studentXp: number;

  allLessonsCompleted: Set<string>;

  moduleIndex: number;
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

function StarDisplay({
  stars,
  max = 3,
}: {
  stars: number;

  max?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({
        length: max,
      }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",

            i < stars ? "fill-yellow-400 text-yellow-400" : "text-muted",
          )}
        />
      ))}
    </div>
  );
}

export function ModuleCard({
  module,
  courseId,
  isUnlocked,
  studentXp,
  allLessonsCompleted,
  moduleIndex,
}: ModuleCardProps) {
  const visibleLessons = module.lessons.filter((lesson) => {
    if (lesson.order <= 2) {
      return true;
    }

    return module.showAdaptiveLessons;
  });
  const completedLessons = visibleLessons.filter(
    (lesson) => lesson.progress[0]?.completed,
  ).length;

  const totalLessons = visibleLessons.length;

  const moduleProgress =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);
  const isComplete = totalLessons === 4 && completedLessons === totalLessons;

  return (
    <div className="relative">
      {!isUnlocked ? (
        /* ================= LOCKED MODULE ================= */
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
          {/* subtle accent */}
          <div className="absolute inset-y-0 right-0 w-1 bg-border" />

          <div className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-start gap-3">
              {/* Module Number */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-xs font-bold text-muted-foreground">
                {String(moduleIndex + 1).padStart(2, "0")}
              </div>

              {/* Title */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-base font-bold leading-7 text-foreground/75 sm:text-xl">
                    {module.title}
                  </h3>

                  {/* Lock */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                </div>

                {module.description && (
                  <p className="mt-1.5 line-clamp-2 text-sm leading-7 text-muted-foreground/75">
                    {module.description}
                  </p>
                )}
              </div>
            </div>

            {/* Unlock Area */}
            <div className="mt-6 rounded-xl border border-border/50 bg-background/70 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    متطلبات فتح الوحدة
                  </p>

                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tracking-tight">
                      {module.requiredXp}
                    </span>

                    <span className="text-sm font-medium text-muted-foreground">
                      XP
                    </span>
                  </div>
                </div>

                <div className="sm:text-left">
                  <p className="text-xs text-muted-foreground">رصيدك الحالي</p>

                  <p className="mt-1 text-sm font-bold">{studentXp} XP</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (studentXp / module.requiredXp) * 100,
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-muted-foreground">
                    التقدم نحو فتح الوحدة
                  </span>

                  <span className="text-xs font-semibold text-primary">
                    {Math.max(module.requiredXp - studentXp, 0)} XP متبقية
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Hint */}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary/70" />

              <span>اجمع نقاط الخبرة من الدروس والأنشطة لفتحها.</span>
            </div>
          </div>
        </div>
      ) : (
        /* ================= UNLOCKED MODULE ================= */
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300",
            "border-border/60 hover:border-primary/25 hover:shadow-sm",
            isComplete && "border-emerald-200 bg-emerald-50/40",
          )}
        >
          {/* HEADER */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold",
                  isComplete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-primary/10 bg-primary/5 text-primary",
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  moduleIndex + 1
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-bold leading-7 sm:text-xl">
                  {module.title}
                </h3>

                {module.description && (
                  <p className="mt-1.5 max-w-2xl text-sm leading-7 text-muted-foreground">
                    {module.description}
                  </p>
                )}
              </div>
            </div>

            <div
              className={cn(
                "shrink-0 rounded-lg border px-2.5 py-1 text-xs font-semibold",
                getLevelColor(module.level),
              )}
            >
              {getLevelLabel(module.level)}
            </div>
          </div>

          {/* PROGRESS */}
          {totalLessons > 0 && (
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">التقدم</span>

                <span className="font-bold">
                  {completedLessons}/{totalLessons} درس
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    isComplete ? "bg-emerald-500" : "bg-primary",
                  )}
                  style={{
                    width: `${moduleProgress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* LESSONS */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleLessons.map((lesson, lessonIdx) => {
              const progress = lesson.progress[0];

              const isLessonLocked =
                lessonIdx === 1
                  ? !allLessonsCompleted.has(module.lessons[0].id)
                  : false;

              const isCompleted = progress?.completed ?? false;

              const isInProgress = !isCompleted && (progress?.score ?? 0) > 0;

              return (
                <LessonNode
                  key={lesson.id}
                  lesson={lesson}
                  courseId={courseId}
                  isLocked={isLessonLocked}
                  isCompleted={isCompleted}
                  isInProgress={isInProgress}
                  stars={progress?.stars ?? 0}
                  score={progress?.score ?? 0}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LessonNode({
  lesson,
  courseId,
  isLocked,
  isCompleted,
  isInProgress,
  stars,
  score,
}: {
  lesson: Lesson;

  courseId: string;

  isLocked: boolean;

  isCompleted: boolean;

  isInProgress: boolean;

  stars: number;

  score: number;
}) {
  const content = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300",

        isLocked
          ? "border-border/40 bg-muted/20 opacity-60"
          : isCompleted
            ? "border-emerald-200 bg-emerald-50 hover:shadow-md"
            : isInProgress
              ? "border-orange-200 bg-orange-50 hover:shadow-md"
              : "border-border/60 bg-white hover:-translate-y-1 hover:border-primary/20 hover:shadow-md",
      )}
    >
      {/* TOP */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <IconBox
          className={cn(
            isCompleted && "border-emerald-200 bg-emerald-100 text-emerald-600",

            isInProgress && "border-orange-200 bg-orange-100 text-orange-600",

            isLocked && "border-border bg-muted text-muted-foreground",
          )}
        >
          {isLocked ? (
            <Lock className="h-5 w-5" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : isInProgress ? (
            <Rocket className="h-5 w-5" />
          ) : (
            <PlayCircle className="h-5 w-5" />
          )}
        </IconBox>

        {/* XP */}
        <div className="flex items-center gap-2">
          {/* XP */}
          {!isLocked && (
            <div className="flex items-center gap-1 rounded-xl bg-primary/5 px-2 py-1 text-primary">
              <Sparkles className="h-3 w-3" />

              <span className="text-xs font-bold">{lesson.xpReward}</span>
            </div>
          )}

          {/* COMPLETED */}
          {isCompleted && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Trophy className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>

      {/* TITLE */}
      <h4
        className={cn(
          "line-clamp-2 text-sm font-bold leading-6",

          isLocked ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {lesson.title}
      </h4>

      {/* FOOTER */}
      <div className="mt-5 flex items-center justify-between">
        {/* STARS */}
        {isCompleted ? (
          <StarDisplay stars={stars} />
        ) : (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />

            <span>درس تفاعلي</span>
          </div>
        )}

        {/* SCORE */}
        {isInProgress && (
          <div className="rounded-lg bg-orange-100 px-2 py-1 text-xs font-bold text-orange-600">
            {Math.round(score)}%
          </div>
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return content;
  }

  return (
    <Link href={`/student/courses/${courseId}/learn/${lesson.id}`}>
      {content}
    </Link>
  );
}
