import { notFound, redirect } from "next/navigation";

import Link from "next/link";

import {
  ChevronLeft,
  BookOpen,
  Trophy,
  Sparkles,
  Lock,
  Crown,
  CheckCircle2,
  Flame,
  Star,
} from "lucide-react";

import { auth } from "@/auth";

import { getCourseWithModulesAction } from "@/actions/student/progress";

import { ModuleCard } from "@/components/game/ModuleCard";
import { StudentHUD } from "@/components/game/StudentHUD";

import { getXpForLevel } from "@/lib/game-utils";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { getPlacementResultAction } from "@/actions/placement/get-result";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseMapPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { courseId } = await params;

  const course = await getCourseWithModulesAction(courseId);

  if (!course) {
    notFound();
  }

  if (!course.isEnrolled) {
    redirect(`/student/courses/${courseId}/enroll`);
  }

  const placement = await getPlacementResultAction(courseId);
  if (!placement) {
    redirect(`/student/courses/${courseId}/placement-test`);
  }
  const levelOrder = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
  };
  const studentLevel = placement.level;

  const visibleModules = [
    ...course.modules.filter((m) => m.level === studentLevel),

    ...course.modules.filter(
      (m) => m.level === "INTERMEDIATE" && studentLevel !== "INTERMEDIATE",
    ),

    ...course.modules.filter(
      (m) => m.level === "BEGINNER" && studentLevel !== "BEGINNER",
    ),

    ...course.modules.filter(
      (m) => m.level === "ADVANCED" && studentLevel !== "ADVANCED",
    ),
  ];

  const recommendedModule = visibleModules[0];

  const startIndex = 0;
  const xpInfo = getXpForLevel(course.studentXp);

  // =========================
  // LESSONS COMPLETION
  // =========================

  const allLessonsCompleted = new Set<string>();

  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (lesson.progress[0]?.completed) {
        allLessonsCompleted.add(lesson.id);
      }
    }
  }

  // =========================
  // TOTAL PROGRESS
  // =========================

  const totalLessons = course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0,
  );

  const completedLessons = course.modules.reduce(
    (sum, module) =>
      sum +
      module.lessons.filter((lesson) => lesson.progress[0]?.completed).length,
    0,
  );

  const overallProgress =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  const completedModules = visibleModules.filter((module) => {
    const lessons = module.lessons;

    return (
      lessons.length > 0 &&
      lessons.every((lesson) => lesson.progress[0]?.completed)
    );
  }).length;

  const nextLesson = visibleModules
    .flatMap((module) => module.lessons)
    .find((lesson) => !lesson.progress[0]?.completed);
  return (
    <main dir="rtl" className="min-h-screen bg-background text-foreground">
      {/* BACKGROUND */}

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.04),transparent_45%)]" />

      {/* HUD */}

      <StudentHUD
        studentXp={course.studentXp}
        xpInfo={xpInfo}
        courseName={course.title}
      />

      {/* CONTENT */}

      <div className="relative z-10">
        {/* =====================================
            HERO
        ===================================== */}

        <section className="border-b border-border/60 bg-background">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
            {/* Breadcrumb */}
            <div className="mb-7 flex items-center gap-2 text-sm">
              <Link
                href="/student/courses"
                className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
              >
                الدورات
                <ChevronLeft className="h-4 w-4" />
              </Link>

              <span className="text-muted-foreground">/</span>

              <span className="truncate font-medium">{course.title}</span>
            </div>

            {/* HERO */}
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
              <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
                {/* COURSE INFO */}
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="max-w-3xl">
                    <h1 className="text-3xl font-bold leading-normal tracking-tight md:text-4xl">
                      {course.title}
                    </h1>

                    {course.description && (
                      <p className="mt-3 max-w-2xl text-base leading-8 text-muted-foreground">
                        {course.description}
                      </p>
                    )}

                    {/* XP + Level */}
                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-primary" />

                        <span className="text-muted-foreground">
                          نقاط الخبرة
                        </span>

                        <span className="font-semibold">
                          {course.studentXp} XP
                        </span>
                      </div>

                      <div className="h-4 w-px bg-border" />

                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-500" />

                        <span className="text-muted-foreground">المستوى</span>

                        <span className="font-semibold">{xpInfo.level}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-8 max-w-3xl">
                      <div className="mb-3 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">
                            تقدمك في الدورة
                          </p>

                          <p className="mt-1 text-xs leading-6 text-muted-foreground">
                            {completedLessons} من {totalLessons} درس مكتمل
                          </p>
                        </div>

                        <span className="text-2xl font-bold tracking-tight text-primary">
                          {overallProgress}%
                        </span>
                      </div>

                      <Progress
                        value={overallProgress}
                        className="
    h-2.5
    bg-primary/10
    [&>div]:bg-primary
  "
                      />

                      {nextLesson && (
                        <Link
                          href={`/student/courses/${courseId}/learn/${nextLesson.id}`}
                          className="
      mt-6 inline-flex items-center gap-2
      rounded-lg bg-primary px-4 py-2.5
      text-sm font-semibold text-primary-foreground
      transition-colors
      hover:bg-primary/90
    "
                        >
                          متابعة التعلم
                          <ChevronLeft className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* PLACEMENT */}
                <div className="relative overflow-hidden border-t border-border/60 bg-primary/[0.035] lg:border-r lg:border-t-0">
                  {/* Decorative background */}
                  <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

                  <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                      مستواك الحالي
                    </span>

                    <div className="mt-3">
                      <p className="text-4xl font-black tracking-tight text-primary">
                        {placement.level === "ADVANCED"
                          ? "متقدم"
                          : placement.level === "INTERMEDIATE"
                            ? "متوسط"
                            : "مبتدئ"}
                      </p>
                    </div>

                    <div className="mt-4 h-1 w-8 rounded-full bg-primary/40" />

                    <p className="mt-4 max-w-47.5 text-xs leading-6 text-muted-foreground">
                      تم تحديد مستواك بناءً على اختبار تحديد المستوى.
                    </p>

                    <Link
                      href={`/student/courses/${courseId}/placement-result`}
                      className="
                group mt-6 inline-flex items-center gap-2
                rounded-lg border border-border/70
                bg-background px-4 py-2.5
                text-sm font-semibold
                transition-all
                hover:border-primary/40
                hover:bg-primary/5
                hover:text-primary
              "
                    >
                      عرض نتيجة الاختبار
                      <ChevronLeft
                        className="
                  h-4 w-4
                  transition-transform
                  group-hover:-translate-x-1
                "
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            MODULES
        ===================================== */}

        <section className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          {/* Section Header */}
          <div className="mb-10">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-primary">
                  مسار التعلم
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  وحدات الدورة
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                  تقدم عبر الوحدات خطوة بخطوة وأكمل دروسك للوصول إلى الوحدة
                  التالية.
                </p>
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-2xl font-bold tracking-tight">
                  {completedModules}/{visibleModules.length}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  وحدات مكتملة
                </p>
              </div>
            </div>
          </div>

          {/* Learning Path */}
          <div className="relative">
            <div className="space-y-8">
              {visibleModules.map((module, index) => {
                const isUnlocked =
                  index <= startIndex || course.studentXp >= module.requiredXp;

                const isCurrent = module.id === recommendedModule?.id;

                const isLast = index === visibleModules.length - 1;

                return (
                  <div
                    key={module.id}
                    className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-4 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-6"
                  >
                    {/* Timeline */}
                    <div className="relative flex justify-center">
                      {/* Line */}
                      {!isLast && (
                        <div
                          className={cn(
                            "absolute top-10 -bottom-8 w-px",
                            isUnlocked ? "bg-primary/30" : "bg-border",
                          )}
                        />
                      )}

                      {/* Node */}
                      <div
                        className={cn(
                          `
                    relative z-10
                    flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-full
                    border-4 border-background
                    text-xs font-bold
                    transition-all duration-300
                    sm:h-12 sm:w-12
                  `,
                          isCurrent
                            ? "bg-primary text-primary-foreground ring-8 ring-primary/10"
                            : isUnlocked
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {isCurrent ? (
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : isUnlocked ? (
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>
                    </div>

                    {/* Module */}
                    <div className="min-w-0">
                      {/* Current indicator */}
                      {isCurrent && (
                        <div className="mb-2 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />

                          <span className="text-xs font-semibold text-primary">
                            ابدأ من هنا
                          </span>
                        </div>
                      )}

                      <ModuleCard
                        module={module}
                        courseId={courseId}
                        isUnlocked={isUnlocked}
                        studentXp={course.studentXp}
                        allLessonsCompleted={allLessonsCompleted}
                        moduleIndex={index}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
