// app/teacher/lesson/[lessonId]/content/page.tsx

import { notFound } from "next/navigation";

import {
  BookOpen,
  Brain,
  Clock3,
  Layers3,
  MessageCircle,
  PenSquare,
  Plus,
  Sparkles,
  Swords,
  Trophy,
  Star,
  Edit3,
  FileQuestion,
} from "lucide-react";

import { getTeacherLesson } from "@/actions/teacher/lesson";

import LessonContentForm from "@/components/teacher/lesson-content-form";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

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

const levelColors = {
  BEGINNER:
    "bg-emerald-100 text-emerald-700 border-emerald-200",

  INTERMEDIATE:
    "bg-amber-100 text-amber-700 border-amber-200",

  ADVANCED:
    "bg-red-100 text-red-700 border-red-200",
};

export default async function LessonContentPage({
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

      <div className="container mx-auto max-w-7xl px-4 py-10">
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
                    <BookOpen className="ml-2 h-4 w-4" />
                    إدارة المحتوى
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

              {/* STATS */}
              <div className="grid grid-cols-2 gap-4">
                {/* CONTENTS */}
                <div className="rounded-3xl border border-border/60 bg-muted/20 p-5 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <FileQuestion className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="text-3xl font-black">
                    {
                      lesson.contentsCount
                    }
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    عنصر محتوى
                  </div>
                </div>

                {/* XP */}
                <div className="rounded-3xl border border-border/60 bg-muted/20 p-5 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Sparkles className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="text-3xl font-black">
                    {lesson.xpReward}
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    نقاط الخبرة
                  </div>
                </div>
              </div>
            </div>

            {/* MODULE INFO */}
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
                    {
                      lesson.module
                        .requiredXp
                    }{" "}
                    نقاط الخبرة المطلوبة
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =====================================
            ADD NEW CONTENT
        ===================================== */}

        <Card className="mb-8 overflow-hidden rounded-[32px] border-border/60 bg-white shadow-sm">
          {/* HEADER */}
          <div className="border-b border-border/60 p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Plus className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  إضافة محتوى جديد
                </h2>

                <p className="mt-1 text-muted-foreground">
                  أضف سؤالًا أو عنصرًا
                  تفاعليًا جديدًا داخل
                  الدرس.
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <CardContent className="p-8">
            <LessonContentForm
              lesson={lesson}
            />
          </CardContent>
        </Card>

        {/* =====================================
            CONTENTS LIST
        ===================================== */}

        <Card className="overflow-hidden rounded-[32px] border-border/60 bg-white shadow-sm">
          {/* HEADER */}
          <div className="border-b border-border/60 p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <Edit3 className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    عناصر المحتوى
                  </h2>

                  <p className="mt-1 text-muted-foreground">
                    عرض وتعديل جميع
                    عناصر المحتوى داخل
                    نفس الصفحة.
                  </p>
                </div>
              </div>

              <Badge className="w-fit rounded-full px-5 py-2">
                {
                  lesson.contentsCount
                }{" "}
                عنصر
              </Badge>
            </div>
          </div>

          {/* EMPTY */}
          {lesson.contents
            .length === 0 ? (
            <CardContent className="flex flex-col items-center px-6 py-24 text-center">
              <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileQuestion className="h-14 w-14" />
              </div>

              <h2 className="text-4xl font-black">
                لا يوجد محتوى بعد
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                ابدأ بإضافة أول عنصر
                تفاعلي داخل هذا
                الدرس.
              </p>
            </CardContent>
          ) : (
            <CardContent className="p-6">
              <Accordion
                type="multiple"
                className="space-y-5"
              >
                {lesson.contents.map(
                  (
                    content,
                    index,
                  ) => (
                    <AccordionItem
                      key={
                        content.id
                      }
                      value={
                        content.id
                      }
                      className="
                        overflow-hidden
                        rounded-3xl
                        border border-border/60
                        bg-muted/10
                        px-0
                        transition-all duration-300
                        hover:border-primary/20
                        hover:bg-primary/5
                      "
                    >
                      {/* =====================================
                          HEADER
                      ===================================== */}

                      <AccordionTrigger className="px-6 py-5 hover:no-underline">
                        <div className="flex flex-1 flex-col gap-4 text-right lg:flex-row lg:items-center lg:justify-between">
                          {/* LEFT */}
                          <div className="flex items-start gap-4">
                            {/* NUMBER */}
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-black text-primary">
                              {index + 1}
                            </div>

                            {/* CONTENT */}
                            <div>
                              <div className="mb-2 flex flex-wrap gap-2">
                                <Badge variant="secondary">
                                  عنصر #
                                  {
                                    content.sortOrder
                                  }
                                </Badge>

                                <Badge variant="outline">
                                  {
                                    gameLabels[
                                      lesson
                                        .gameType
                                    ]
                                  }
                                </Badge>
                              </div>

                              <h3 className="line-clamp-2 text-lg font-black">
                                {
                                  content.question
                                }
                              </h3>

                              {/* ANSWER PREVIEW */}
                              {content.answer && (
                                <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                                  الإجابة:{" "}
                                  {
                                    content.answer
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          {/* RIGHT */}
                          <div className="flex items-center gap-3">
                            <Badge className="rounded-full px-4 py-2">
                              تعديل مباشر
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>

                      {/* =====================================
                          CONTENT
                      ===================================== */}

                      <AccordionContent>
                        <Separator />

                        <div className="bg-white p-6">
                          <LessonContentForm
                            lesson={
                              lesson
                            }
                            content={
                              content
                            }
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ),
                )}
              </Accordion>
            </CardContent>
          )}
        </Card>
      </div>
    </main>
  );
}