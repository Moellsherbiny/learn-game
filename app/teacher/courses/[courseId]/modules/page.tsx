import Link from "next/link";

import { notFound } from "next/navigation";

import {
  Layers3,
  Plus,
  BookOpen,
  Gamepad2,
  ArrowLeft,
  Trophy,
  Sparkles,
  ChevronLeft,
  Brain,
  Swords,
  PenSquare,
  MessageCircle,
} from "lucide-react";

import { getTeacherCourse } from "@/actions/teacher/course";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

const levelColors = {
  BEGINNER:
    "bg-emerald-100 text-emerald-700 border-emerald-200",

  INTERMEDIATE:
    "bg-amber-100 text-amber-700 border-amber-200",

  ADVANCED:
    "bg-red-100 text-red-700 border-red-200",
};

const gameIcons = {
  QUIZ: Brain,

  MATCHING: Swords,

  FILL_BLANKS:
    PenSquare,

  CONVERSATION:
    MessageCircle,
};

export default async function CourseModulesPage({
  params,
}: PageProps) {
  const { courseId } =
    await params;

  const course =
    await getTeacherCourse(
      courseId,
    );

  if (!course) {
    notFound();
  }

  const totalLessons =
    course.modules.reduce(
      (sum, module) =>
        sum +
        module._count
          .lessons,
      0,
    );

  return (
    <main
      className="min-h-screen bg-background"
      dir="rtl"
    >
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
              <div className="max-w-3xl">
                {/* BADGES */}
                <div className="mb-5 flex flex-wrap gap-3">
                  <Badge className="rounded-full px-4 py-2">
                    <Layers3 className="ml-2 h-4 w-4" />
                    إدارة المستويات
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="rounded-full px-4 py-2"
                  >
                    <Sparkles className="ml-2 h-4 w-4" />
                    Gamified Learning
                  </Badge>
                </div>

                {/* TITLE */}
                <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                  {course.title}
                </h1>

                {/* DESCRIPTION */}
                <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                  قم بإنشاء مستويات
                  تعليمية منظمة وإضافة
                  الدروس والألعاب
                  التفاعلية داخل كل
                  مستوى.
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-2xl"
                >
                  <Link
                    href={`/teacher/courses/${course.id}`}
                  >
                    <ArrowLeft className="ml-2 h-5 w-5" />
                    إعدادات الدورة التعليمية
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl"
                >
                  <Link
                    href={`/teacher/courses/${course.id}/modules/new`}
                  >
                    <Plus className="ml-2 h-5 w-5" />
                    إضافة مستوى
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =====================================
            STATS
        ===================================== */}

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          {/* MODULES */}
          <Card className="rounded-[28px] border-border/60 bg-white shadow-sm">
            <CardContent className="p-7 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Layers3 className="h-8 w-8" />
              </div>

              <div className="text-4xl font-black">
                {
                  course.modules
                    .length
                }
              </div>

              <div className="mt-2 text-muted-foreground">
                مستوى تعليمي
              </div>
            </CardContent>
          </Card>

          {/* LESSONS */}
          <Card className="rounded-[28px] border-border/60 bg-white shadow-sm">
            <CardContent className="p-7 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <BookOpen className="h-8 w-8" />
              </div>

              <div className="text-4xl font-black">
                {totalLessons}
              </div>

              <div className="mt-2 text-muted-foreground">
                درس تفاعلي
              </div>
            </CardContent>
          </Card>

          {/* XP */}
          <Card className="rounded-[28px] border-border/60 bg-white shadow-sm">
            <CardContent className="p-7 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Trophy className="h-8 w-8" />
              </div>

              <div className="text-4xl font-black">
                {totalLessons *
                  100}
              </div>

              <div className="mt-2 text-muted-foreground">
                إجمالي نقاط الخبرة
              </div>
            </CardContent>
          </Card>
        </div>

        {/* =====================================
            EMPTY STATE
        ===================================== */}

        {course.modules
          .length === 0 && (
          <Card className="rounded-[32px] border-border/60 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center px-6 py-24 text-center">
              <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Layers3 className="h-14 w-14" />
              </div>

              <h2 className="text-4xl font-black">
                لا توجد مستويات
                بعد
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                ابدأ بإنشاء أول مستوى
                تعليمي داخل الدورة التعليمية،
                ثم أضف الدروس
                والألعاب التفاعلية.
              </p>

              <Button
                asChild
                size="lg"
                className="mt-10 rounded-2xl px-8"
              >
                <Link
                  href={`/teacher/courses/${course.id}/modules/new`}
                >
                  <Plus className="ml-2 h-5 w-5" />
                  إنشاء أول مستوى
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* =====================================
            MODULES LIST
        ===================================== */}

        {course.modules
          .length > 0 && (
          <div className="space-y-8">
            {course.modules.map(
              (module) => (
                <Card
                  key={module.id}
                  className="overflow-hidden rounded-[32px] border-border/60 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <CardContent className="p-8">
                    {/* HEADER */}
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      {/* LEFT */}
                      <div className="max-w-3xl">
                        <div className="mb-4 flex flex-wrap gap-3">
                          <Badge className="rounded-full px-4 py-2">
                            المستوى{" "}
                            {
                              module.order
                            }
                          </Badge>

                          <Badge
                            variant="secondary"
                            className={cn(
                              "rounded-full border px-4 py-2",
                              levelColors[
                                module
                                  .level
                              ],
                            )}
                          >
                            {
                              module.level
                            }
                          </Badge>

                          <Badge
                            variant="outline"
                            className="rounded-full px-4 py-2"
                          >
                            يتطلب{" "}
                            {
                              module.requiredXp
                            }{" "}
                            نقاط خبرة
                          </Badge>
                        </div>

                        <h2 className="text-3xl font-black">
                          {
                            module.title
                          }
                        </h2>

                        {module.description && (
                          <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
                            {
                              module.description
                            }
                          </p>
                        )}
                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-2xl"
                        >
                          <Link
                            href={`/teacher/courses/${course.id}/modules/${module.id}`}
                          >
                            إدارة المستوى
                          </Link>
                        </Button>

                        <Button
                          asChild
                          className="rounded-2xl"
                        >
                          <Link
                            href={`/teacher/courses/${course.id}/modules/${module.id}/lesson/new`}
                          >
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة درس
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* STATS */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      {/* LESSONS */}
                      <div className="rounded-3xl border border-border/60 bg-muted/20 p-5 text-center">
                        <BookOpen className="mx-auto mb-3 h-6 w-6 text-primary" />

                        <p className="text-3xl font-black">
                          {
                            module
                              ._count
                              .lessons
                          }
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          درس
                        </p>
                      </div>

                      {/* GAMES */}
                      <div className="rounded-3xl border border-border/60 bg-muted/20 p-5 text-center">
                        <Gamepad2 className="mx-auto mb-3 h-6 w-6 text-primary" />

                        <p className="text-3xl font-black">
                          {
                            module
                              ._count
                              .lessons
                          }
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          لعبة تعليمية
                        </p>
                      </div>

                      {/* ORDER */}
                      <div className="rounded-3xl border border-border/60 bg-muted/20 p-5 text-center">
                        <Layers3 className="mx-auto mb-3 h-6 w-6 text-primary" />

                        <p className="text-3xl font-black">
                          {
                            module.order
                          }
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          ترتيب المستوى
                        </p>
                      </div>
                    </div>

                    {/* LESSONS */}
                    {module.lessons
                      .length > 0 && (
                      <div className="mt-8">
                        <div className="mb-5 flex items-center justify-between">
                          <h3 className="text-xl font-black">
                            الدروس
                          </h3>

                          <Badge variant="outline">
                            {
                              module
                                .lessons
                                .length
                            }{" "}
                            درس
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          {module.lessons.map(
                            (
                              lesson,
                            ) => {
                              const Icon =
                                gameIcons[
                                  lesson
                                    .gameType
                                ];

                              return (
                                <div
                                  key={
                                    lesson.id
                                  }
                                  className="
                                    flex flex-col gap-5
                                    rounded-3xl border border-border/60
                                    bg-muted/10 p-5
                                    transition-all duration-300
                                    hover:border-primary/20
                                    hover:bg-primary/5
                                    lg:flex-row lg:items-center lg:justify-between
                                  "
                                >
                                  {/* LEFT */}
                                  <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                      <Icon className="h-6 w-6" />
                                    </div>

                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-lg font-black">
                                          {
                                            lesson.title
                                          }
                                        </h4>

                                        <Badge variant="secondary">
                                          {
                                            lesson.gameType
                                          }
                                        </Badge>
                                      </div>

                                      <p className="mt-2 text-sm text-muted-foreground">
                                        نقاط الخبرة
                                        {
                                          lesson.xpReward
                                        }
                                      </p>
                                    </div>
                                  </div>

                                  {/* RIGHT */}
                                  <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-2xl"
                                  >
                                    <Link
                                      href={`/teacher/lesson/${lesson.id}`}
                                    >
                                      تعديل
                                      <ChevronLeft className="mr-2 h-4 w-4" />
                                    </Link>
                                  </Button>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}