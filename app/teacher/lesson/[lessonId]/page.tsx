// app/teacher/lesson/[lessonId]/page.tsx

import Link from "next/link";

import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Brain,
  Clock3,
  Edit3,
  Layers3,
  Save,
  Sparkles,
  Star,
  Trophy,
  BookOpen,
  PenSquare,
  MessageCircle,
  Swords,
} from "lucide-react";

import { getTeacherLesson } from "@/actions/teacher/lesson";

import LessonSettingsForm from "@/components/teacher/lesson-setting-form";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    lessonId: string;
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

const gameLabels = {
  QUIZ: "Quiz Game",

  MATCHING:
    "Matching Game",

  FILL_BLANKS:
    "Fill Blanks",

  CONVERSATION:
    "Conversation",
};

export default async function LessonPage({
  params,
}: PageProps) {
  const { lessonId } =
    await params;

  const lesson =
    await getTeacherLesson(
      lessonId,
    );

  if (!lesson) {
    notFound();
  }

  const GameIcon =
    gameIcons[
      lesson.gameType
    ];

  return (
    <main
      className="min-h-screen bg-background"
      dir="rtl"
    >
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.03),transparent_40%)]" />

      <div className="container mx-auto max-w-6xl px-4 py-10">
        {/* =====================================
            HERO
        ===================================== */}

        <Card className="mb-8 overflow-hidden rounded-[32px] border-border/60 bg-white shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
              {/* LEFT */}
              <div className="max-w-4xl">
                {/* BADGES */}
                <div className="mb-5 flex flex-wrap gap-3">
                  <Badge className="rounded-full px-4 py-2">
                    <Edit3 className="ml-2 h-4 w-4" />
                    إعدادات الدرس
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="rounded-full px-4 py-2"
                  >
                    <GameIcon className="ml-2 h-4 w-4" />

                    {
                      gameLabels[
                        lesson
                          .gameType
                      ]
                    }
                  </Badge>

                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full border px-4 py-2",
                      levelColors[
                        lesson
                          .module
                          .level
                      ],
                    )}
                  >
                    {
                      lesson.module
                        .level
                    }
                  </Badge>
                </div>

                {/* TITLE */}
                <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                  {lesson.title}
                </h1>

                {/* DESCRIPTION */}
                {lesson.description && (
                  <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                    {
                      lesson.description
                    }
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
                  <Link
                    href={`/teacher/courses/${lesson.course.id}/modules/${lesson.module.id}`}
                  >
                    <ArrowLeft className="ml-2 h-5 w-5" />
                    العودة للمستوى
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl"
                >
                  <Link
                    href={`/teacher/lesson/${lesson.id}/content`}
                  >
                    <BookOpen className="ml-2 h-5 w-5" />
                    إدارة المحتوى
                  </Link>
                </Button>
              </div>
            </div>

            {/* =====================================
                STATS
            ===================================== */}

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {/* XP */}
              <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-7 w-7" />
                </div>

                <div className="text-3xl font-black">
                  {lesson.xpReward}
                </div>

                <div className="mt-1 text-sm text-muted-foreground">
                  نقاط الخبرة
                </div>
              </div>

              {/* SCORE */}
              <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Trophy className="h-7 w-7" />
                </div>

                <div className="text-3xl font-black">
                  {
                    lesson.minScore
                  }
                  %
                </div>

                <div className="mt-1 text-sm text-muted-foreground">
                  Minimum Score
                </div>
              </div>

              {/* STARS */}
              <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Star className="h-7 w-7" />
                </div>

                <div className="text-3xl font-black">
                  {
                    lesson.maxStars
                  }
                </div>

                <div className="mt-1 text-sm text-muted-foreground">
                  Max Stars
                </div>
              </div>

              {/* TIME */}
              <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Clock3 className="h-7 w-7" />
                </div>

                <div className="text-3xl font-black">
                  {lesson.timeLimit
                    ? `${lesson.timeLimit}s`
                    : "∞"}
                </div>

                <div className="mt-1 text-sm text-muted-foreground">
                  Time Limit
                </div>
              </div>
            </div>

            {/* =====================================
                MODULE INFO
            ===================================== */}

            <div className="mt-8 rounded-[28px] border border-primary/10 bg-primary/5 p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* LEFT */}
                <div>
                  <p className="mb-2 text-sm text-primary">
                    الوحدة التعليمية
                  </p>

                  <h2 className="text-2xl font-black">
                    {
                      lesson.module
                        .title
                    }
                  </h2>

                  <p className="mt-2 text-muted-foreground">
                    {
                      lesson.course
                        .title
                    }
                  </p>
                </div>

                {/* RIGHT */}
                <div className="flex flex-wrap gap-3">
                  <Badge className="rounded-full px-5 py-2 text-sm">
                    <Layers3 className="ml-2 h-4 w-4" />

                    المستوى #
                    {
                      lesson.module
                        .order
                    }
                  </Badge>

                  <Badge
                    variant="outline"
                    className="rounded-full px-5 py-2 text-sm"
                  >
                    يتطلب{" "}
                    {
                      lesson.module
                        .requiredXp
                    }{" "}
                    نقاط خبرة
                  </Badge>
                </div>
              </div>

              {/* PROGRESS */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    محتوى الدرس
                  </span>

                  <span className="font-bold text-primary">
                    {
                      lesson.contentsCount
                    }{" "}
                    عنصر
                  </span>
                </div>

                <Progress
                  value={
                    lesson.contentsCount >
                    0
                      ? 100
                      : 10
                  }
                  className="h-3 rounded-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =====================================
            SETTINGS FORM
        ===================================== */}

        <Card className="overflow-hidden rounded-[32px] border-border/60 bg-white shadow-sm">
          {/* HEADER */}
          <div className="border-b border-border/60 p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Save className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  إعدادات الدرس
                </h2>

                <p className="mt-1 text-muted-foreground">
                  قم بتعديل بيانات
                  الدرس التعليمية
                  والتفاعلية.
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <CardContent className="p-8">
            <LessonSettingsForm
              lesson={{
                id: lesson.id,

                title:
                  lesson.title,

                description:
                  lesson.description,

                gameType:
                  lesson.gameType,

                xpReward:
                  lesson.xpReward,

                minScore:
                  lesson.minScore,

                maxStars:
                  lesson.maxStars,

                timeLimit:
                  lesson.timeLimit,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}