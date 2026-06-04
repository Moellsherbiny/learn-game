// app/teacher/lesson/[lessonId]/content/page.tsx

import { notFound } from "next/navigation";

import {
  PlusCircle,
  BookOpen,
  Sparkles,
  Trophy,
  Layers3,
  Brain,
  Shuffle,
  PenSquare,
  MessageCircle,
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

import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

const gameTypeIcons = {
  QUIZ: Brain,

  MATCHING: Shuffle,

  FILL_BLANKS: PenSquare,

  CONVERSATION:
    MessageCircle,
};

const gameTypeLabels = {
  QUIZ: "اختبار",

  MATCHING: "مطابقة",

  FILL_BLANKS:
    "املأ الفراغ",

  CONVERSATION:
    "محادثة",
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
    gameTypeIcons[
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
        {/* ======================================
            HERO HEADER
           ====================================== */}

        <Card className="mb-8 overflow-hidden rounded-[32px] border-border/60 bg-white shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              {/* LEFT */}
              <div className="max-w-4xl">
                {/* BADGES */}
                <div className="mb-5 flex flex-wrap gap-3">
                  <Badge className="rounded-full px-4 py-2 text-sm">
                    <GameIcon className="ml-2 h-4 w-4" />

                    {
                      gameTypeLabels[
                        lesson
                          .gameType
                      ]
                    }
                  </Badge>

                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm",
                      levelColors[
                        lesson
                          .module
                          .level
                      ],
                    )}
                  >
                    المستوى{" "}
                    {
                      lesson.module
                        .level
                    }
                  </Badge>

                  <Badge
                    variant="outline"
                    className="rounded-full px-4 py-2 text-sm"
                  >
                    {
                      lesson.contents
                        .length
                    }{" "}
                    عنصر محتوى
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

              {/* RIGHT STATS */}
              <div className="grid grid-cols-2 gap-4 sm:w-fit">
                {/* XP */}
                <div className="rounded-3xl border border-border/60 bg-muted/20 p-6 text-center shadow-sm">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Sparkles className="h-7 w-7" />
                    </div>
                  </div>

                  <p className="text-3xl font-black text-primary">
                    {
                      lesson.xpReward
                    }
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    XP Reward
                  </p>
                </div>

                {/* MIN SCORE */}
                <div className="rounded-3xl border border-border/60 bg-muted/20 p-6 text-center shadow-sm">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Trophy className="h-7 w-7" />
                    </div>
                  </div>

                  <p className="text-3xl font-black text-primary">
                    {
                      lesson.minScore
                    }
                    %
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Minimum Score
                  </p>
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

                  {lesson.module
                    .description && (
                    <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                      {
                        lesson
                          .module
                          .description
                      }
                    </p>
                  )}
                </div>

                {/* RIGHT */}
                <div className="flex flex-wrap gap-3">
                  <Badge className="rounded-full px-5 py-2 text-sm">
                    <Layers3 className="ml-2 h-4 w-4" />

                    {
                      lesson.module
                        .level
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
                    XP
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="rounded-full px-5 py-2 text-sm"
                  >
                    الدرس #
                    {lesson.order}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ======================================
            ADD CONTENT
           ====================================== */}

        <div className="mb-8">
          <LessonContentForm
            lesson={lesson}
          />
        </div>

        {/* ======================================
            EXISTING CONTENTS
           ====================================== */}

        <Card className="overflow-hidden rounded-[32px] border-border/60 bg-white shadow-sm">
          {/* HEADER */}
          <div className="border-b border-border/60 p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BookOpen className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black">
                      المحتوى الحالي
                    </h2>

                    <p className="mt-1 text-muted-foreground">
                      إدارة وتعديل جميع
                      عناصر المحتوى الخاصة
                      بالدرس.
                    </p>
                  </div>
                </div>
              </div>

              <Badge className="w-fit rounded-full px-5 py-2">
                {
                  lesson.contents
                    .length
                }{" "}
                عنصر
              </Badge>
            </div>
          </div>

          {/* EMPTY STATE */}
          {lesson.contents
            .length === 0 ? (
            <div className="p-14 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
                <PlusCircle className="h-12 w-12" />
              </div>

              <h3 className="text-2xl font-black">
                لا يوجد محتوى حتى
                الآن
              </h3>

              <p className="mt-3 text-muted-foreground">
                ابدأ بإضافة أول عنصر
                تفاعلي للدرس.
              </p>
            </div>
          ) : (
            <div className="p-6">
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
                      <AccordionTrigger className="px-6 py-5 hover:no-underline">
                        <div className="flex flex-1 flex-col gap-4 text-right lg:flex-row lg:items-center lg:justify-between">
                          {/* LEFT */}
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              <GameIcon className="h-5 w-5" />
                            </div>

                            <div>
                              <h3 className="text-lg font-black">
                                العنصر #
                                {
                                  content.sortOrder
                                }
                              </h3>

                              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                {content.question?.slice(
                                  0,
                                  90,
                                ) ||
                                  "محتوى تفاعلي"}
                              </p>
                            </div>
                          </div>

                          {/* RIGHT */}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">
                              تعديل مباشر
                            </Badge>

                            <Badge variant="outline">
                              {
                                gameTypeLabels[
                                  lesson
                                    .gameType
                                ]
                              }
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="border-t border-border/50 bg-white px-6 py-6">
                        <LessonContentForm
                          lesson={lesson}
                          content={
                            content
                          }
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ),
                )}
              </Accordion>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}