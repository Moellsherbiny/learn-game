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

  const startIndex = 0
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

  return (
    <main className="min-h-screen bg-background" dir="rtl">
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

        <section className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-10">
            {/* BREADCRUMB */}

            <div className="mb-6 flex items-center gap-2 text-sm">
              <Link
                href="/student/courses"
                className="
                  flex items-center gap-1
                  text-muted-foreground
                  transition-colors
                  hover:text-primary
                "
              >
                الدورات
                <ChevronLeft className="h-4 w-4" />
              </Link>

              <span className="text-muted-foreground">/</span>

              <span className="truncate font-medium">{course.title}</span>
            </div>

            {/* HEADER */}

            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              {/* LEFT */}

              <div className="max-w-4xl">
                <Badge className="mb-5 rounded-full px-5 py-2">
                  <Sparkles className="ml-2 h-4 w-4" />
                  رحلة تعليمية تفاعلية
                </Badge>

                <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                  {course.title}
                </h1>

                {course.description && (
                  <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                    {course.description}
                  </p>
                )}

                {/* XP STATUS */}

                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Flame className="h-5 w-5 text-primary" />

                      <div>
                        <p className="text-sm text-muted-foreground">
                          نقاط الخبرة
                        </p>

                        <p className="text-2xl font-black text-primary">
                          {course.studentXp} نقاط خبرة
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-white px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-amber-500" />

                      <div>
                        <p className="text-sm text-muted-foreground">المستوى</p>

                        <p className="text-2xl font-black">{xpInfo.level}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STATS */}

              <div className="grid grid-cols-2 gap-4 sm:w-fit">
                {/* TOTAL */}

                <div className="rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <BookOpen className="h-7 w-7" />
                  </div>

                  <p className="text-4xl font-black">{totalLessons}</p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    إجمالي الدروس
                  </p>
                </div>

                {/* COMPLETED */}

                <div className="rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>

                  <p className="text-4xl font-black text-emerald-600">
                    {completedLessons}
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">مكتمل</p>
                </div>
              </div>
            </div>

            {/* PROGRESS */}

            <div className="mt-10 rounded-[32px] border border-border/60 bg-white p-7 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Trophy className="h-7 w-7" />
                  </div>

                  <div>
                    <h2 className="text-xl font-black">تقدمك في الدورة التعليمية</h2>

                    <p className="text-sm text-muted-foreground">
                      استمر حتى الوصول إلى 100%
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <p className="text-4xl font-black text-primary">
                    {overallProgress}%
                  </p>

                  <p className="text-sm text-muted-foreground">مكتمل</p>
                </div>
              </div>

              <Progress value={overallProgress} className="h-5 rounded-full" />

              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>{completedLessons} مكتمل</span>

                <span>{totalLessons} درس</span>
              </div>
            </div>
          </div>
        </section>
        <Card className="mb-10 border-primary/20 bg-primary/5">
          <CardContent className="py-6">
            <h2 className="text-2xl font-black">المسار المخصص لك</h2>

            <p className="mt-2 text-muted-foreground">
              بناءً على اختبار تحديد المستوى، تم تخصيص رحلة تعلم تناسب مستواك.
            </p>

            <div className="mt-4">
              <Badge>
                {placement.level === "ADVANCED"
                  ? "متقدم"
                  : placement.level === "INTERMEDIATE"
                    ? "متوسط"
                    : "مبتدئ"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        {/* =====================================
            MODULES
        ===================================== */}

        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="relative">
            {/* TIMELINE */}

            <div className="absolute right-6 top-0 hidden h-full w-px bg-border md:block" />

            <div className="space-y-10">
              {visibleModules.map((module, index) => {
              const isUnlocked =
  index <= startIndex ||
  course.studentXp >= module.requiredXp;

                const isCurrent = module.id === recommendedModule?.id;

                return (
                  <div key={module.id} className="relative">
                    {/* TIMELINE DOT */}

                    <div
                      className={cn(
                        `
                          absolute right-2.5 top-14 z-10 hidden
                          h-7 w-7 rounded-full border-4 border-background
                          md:flex md:items-center md:justify-center
                        `,

                        isUnlocked ? "bg-primary" : "bg-muted",
                      )}
                    >
                      {isUnlocked ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>

                    {/* MODULE */}

                    <div className="md:mr-16">
                      <div className="relative">
                        {/* LOCKED OVERLAY */}

                        {!isUnlocked && (
                          <div
                            className="
                                absolute inset-0 z-30
                                flex flex-col items-center justify-center
                                rounded-[32px]
                                bg-white/80
                                backdrop-blur-sm
                              "
                          >
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Lock className="h-10 w-10" />
                            </div>

                            <h3 className="mt-5 text-2xl font-black">
                              مستوى مقفل
                            </h3>

                            <p className="mt-2 text-muted-foreground">
                              تحتاج{" "}
                              <span className="font-black text-primary">
                                {module.requiredXp}
                              </span>{" "}
                              نقاط خبرة
                            </p>

                            <div className="mt-5 w-72">
                              <Progress
                                value={Math.min(
                                  100,
                                  (course.studentXp / module.requiredXp) * 100,
                                )}
                                className="h-3"
                              />
                            </div>
                          </div>
                        )}

                        {/* CURRENT BADGE */}

                        {/* CARD */}

                        <div
                          className={cn(!isUnlocked && "opacity-60 grayscale")}
                        >
                          {module.id === recommendedModule?.id && (
                            <div className="absolute -top-3 left-6 z-20">
                              <Badge className="bg-emerald-500">
                                🚀 مستواك الحالي
                              </Badge>
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
