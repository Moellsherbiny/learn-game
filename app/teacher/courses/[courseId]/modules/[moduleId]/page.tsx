// app/teacher/courses/[courseId]/modules/[moduleId]/page.tsx

import Link from "next/link";

import { notFound } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  Brain,
  ChevronLeft,
  Clock3,
  Gamepad2,
  Layers3,
  PenSquare,
  Plus,
  Sparkles,
  Swords,
  Trophy,
  MessageCircle,
  Star,
  Edit3,
} from "lucide-react";

import { getTeacherModule } from "@/actions/teacher/module";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    courseId: string;

    moduleId: string;
  }>;
}

const levelColors = {
  BEGINNER: "bg-emerald-100 text-emerald-700 border-emerald-200",

  INTERMEDIATE: "bg-amber-100 text-amber-700 border-amber-200",

  ADVANCED: "bg-red-100 text-red-700 border-red-200",
};

const gameIcons = {
  QUIZ: Brain,

  MATCHING: Swords,

  FILL_BLANKS: PenSquare,

  CONVERSATION: MessageCircle,
};

export default async function TeacherModulePage({ params }: PageProps) {
  const { courseId, moduleId } = await params;

  const module = await getTeacherModule(moduleId);

  if (!module) {
    notFound();
  }

  const totalLessons = module.lessons.length;

  const totalXp = module.lessons.reduce(
    (sum, lesson) => sum + lesson.xpReward,
    0,
  );

  const totalGames = module.lessons.length;

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.03),transparent_40%)]" />

      <div className="container mx-auto max-w-7xl px-4 py-10">
        {/* =====================================
            HERO
        ===================================== */}

        <Card className="mb-8 overflow-hidden rounded-[32px] border-border/60 bg-white shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              {/* LEFT */}
              <div className="max-w-4xl">
                {/* BADGES */}
                <div className="mb-5 flex flex-wrap gap-3">
                  <Badge className="rounded-full px-4 py-2">
                    <Layers3 className="ml-2 h-4 w-4" />
                    إدارة المستوى
                  </Badge>

                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-full border px-4 py-2",
                      levelColors[module.level],
                    )}
                  >
                    {module.level}
                  </Badge>

                  <Badge variant="outline" className="rounded-full px-4 py-2">
                    المستوى #{module.order}
                  </Badge>
                </div>

                {/* TITLE */}
                <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                  {module.title}
                </h1>

                {/* DESCRIPTION */}
                {module.description && (
                  <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                    {module.description}
                  </p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-2xl"
                >
                  <Link href={`/teacher/courses/${courseId}/modules`}>
                    <ArrowLeft className="ml-2 h-5 w-5" />
                    العودة للمستويات
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="
      rounded-2xl
      border border-border/60
      bg-white hover:bg-muted
    "
                >
                  <Link
                    href={`/teacher/courses/${courseId}/modules/${module.id}/edit`}
                  >
                    <Edit3 className="ml-2 h-5 w-5" />
                    تعديل المستوى
                  </Link>
                </Button>
                <Button asChild size="lg" className="rounded-2xl">
                  <Link
                    href={`/teacher/courses/${courseId}/modules/${module.id}/lesson/new`}
                  >
                    <Plus className="ml-2 h-5 w-5" />
                    إضافة درس
                  </Link>
                </Button>
              </div>
            </div>

            {/* MODULE XP */}
            <div className="mt-8 rounded-[28px] border border-primary/10 bg-primary/5 p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="mb-2 text-sm text-primary">نقاط الخبرة المطلوبة</p>

                  <h2 className="text-3xl font-black">
                    {module.requiredXp} نقاط خبرة
                  </h2>
                </div>

                <div className="w-full max-w-md">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">تقدم المستوى</span>

                    <span className="font-bold text-primary">
                      {totalLessons} درس
                    </span>
                  </div>

                  <Progress
                    value={totalLessons > 0 ? 100 : 0}
                    className="h-3 rounded-full"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =====================================
            STATS
        ===================================== */}

        <div className="mb-8 grid gap-5 md:grid-cols-4">
          {/* LESSONS */}
          <Card className="rounded-[28px] border-border/60 bg-white shadow-sm">
            <CardContent className="p-7 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <BookOpen className="h-8 w-8" />
              </div>

              <div className="text-4xl font-black">{totalLessons}</div>

              <div className="mt-2 text-muted-foreground">درس</div>
            </CardContent>
          </Card>

          {/* GAMES */}
          <Card className="rounded-[28px] border-border/60 bg-white shadow-sm">
            <CardContent className="p-7 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Gamepad2 className="h-8 w-8" />
              </div>

              <div className="text-4xl font-black">{totalGames}</div>

              <div className="mt-2 text-muted-foreground">لعبة تعليمية</div>
            </CardContent>
          </Card>

          {/* XP */}
          <Card className="rounded-[28px] border-border/60 bg-white shadow-sm">
            <CardContent className="p-7 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Trophy className="h-8 w-8" />
              </div>

              <div className="text-4xl font-black">{totalXp}</div>

              <div className="mt-2 text-muted-foreground">إجمالي نقاط الخبرة</div>
            </CardContent>
          </Card>

          {/* LEVEL */}
          <Card className="rounded-[28px] border-border/60 bg-white shadow-sm">
            <CardContent className="p-7 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Star className="h-8 w-8" />
              </div>

              <div className="text-4xl font-black">{module.order}</div>

              <div className="mt-2 text-muted-foreground">ترتيب المستوى</div>
            </CardContent>
          </Card>
        </div>

        {/* =====================================
            EMPTY STATE
        ===================================== */}

        {module.lessons.length === 0 && (
          <Card className="rounded-[32px] border-border/60 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center px-6 py-24 text-center">
              <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpen className="h-14 w-14" />
              </div>

              <h2 className="text-4xl font-black">لا توجد دروس بعد</h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                ابدأ بإضافة أول درس تفاعلي داخل هذا المستوى.
              </p>

              <Button asChild size="lg" className="mt-10 rounded-2xl px-8">
                <Link
                  href={`/teacher/courses/${courseId}/modules/${module.id}/lesson/new`}
                >
                  <Plus className="ml-2 h-5 w-5" />
                  إضافة أول درس
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* =====================================
            LESSONS LIST
        ===================================== */}

        {module.lessons.length > 0 && (
          <div className="space-y-6">
            {module.lessons.map((lesson) => {
              const Icon = gameIcons[lesson.gameType];

              return (
                <Card
                  key={lesson.id}
                  className="
                      overflow-hidden
                      rounded-[32px]
                      border-border/60
                      bg-white
                      shadow-sm
                      transition-all duration-300
                      hover:shadow-md
                    "
                >
                  <CardContent className="p-7">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                      {/* LEFT */}
                      <div className="flex items-start gap-5">
                        {/* ICON */}
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                          <Icon className="h-7 w-7" />
                        </div>

                        {/* CONTENT */}
                        <div>
                          <div className="mb-3 flex flex-wrap gap-2">
                            <Badge className="rounded-full px-3 py-1">
                              الدرس #{lesson.order}
                            </Badge>

                            <Badge variant="secondary">{lesson.gameType}</Badge>
                          </div>

                          <h2 className="text-2xl font-black">
                            {lesson.title}
                          </h2>

                          {lesson.description && (
                            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
                              {lesson.description}
                            </p>
                          )}

                          {/* META */}
                          <div className="mt-5 flex flex-wrap gap-4 text-sm">
                            {/* XP */}
                            <div className="flex items-center gap-2 rounded-2xl bg-primary/5 px-4 py-2 text-primary">
                              <Sparkles className="h-4 w-4" />

                              <span className="font-bold">
                                {lesson.xpReward} نقاط الخبرة
                              </span>
                            </div>

                            {/* SCORE */}
                            <div className="flex items-center gap-2 rounded-2xl bg-muted/40 px-4 py-2">
                              <Trophy className="h-4 w-4 text-primary" />

                              <span>النجاح {lesson.minScore}%</span>
                            </div>

                            {/* TIME */}
                            {lesson.timeLimit && (
                              <div className="flex items-center gap-2 rounded-2xl bg-muted/40 px-4 py-2">
                                <Clock3 className="h-4 w-4 text-primary" />

                                <span>{lesson.timeLimit} ثانية</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-2xl"
                        >
                          <Link href={`/teacher/lesson/${lesson.id}`}>
                            <Edit3 className="ml-2 h-4 w-4" />
                            تعديل
                          </Link>
                        </Button>

                        <Button asChild className="rounded-2xl">
                          <Link href={`/teacher/lesson/${lesson.id}/content`}>
                            إدارة المحتوى
                            <ChevronLeft className="mr-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
