import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  Brain,
  Layers3,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";

import LessonForm from "@/components/teacher/lesson-form";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface PageProps {
  params: Promise<{
    courseId: string;

    moduleId: string;
  }>;
}

export default async function NewLessonPage({
  params,
}: PageProps) {
  const {
    courseId,
    moduleId,
  } = await params;

  return (
    <main
      className="min-h-screen bg-background"
      dir="rtl"
    >
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.03),transparent_40%)]" />

      <div className="container mx-auto max-w-5xl px-4 py-10">
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
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة درس جديد
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="rounded-full px-4 py-2"
                  >
                    <Sparkles className="ml-2 h-4 w-4" />
                    Gamified Lesson
                  </Badge>
                </div>

                {/* TITLE */}
                <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                  إنشاء درس تفاعلي
                </h1>

                {/* DESCRIPTION */}
                <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                  قم بإنشاء درس جديد
                  يحتوي على ألعاب
                  تعليمية، نقاط XP،
                  ومستويات تفاعلية
                  لتحفيز الطلاب على
                  التعلم.
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
                    href={`/teacher/courses/${courseId}/modules/${moduleId}`}
                  >
                    <ArrowLeft className="ml-2 h-5 w-5" />
                    العودة للمستوى
                  </Link>
                </Button>
              </div>
            </div>

            {/* INFO BOXES */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {/* LESSON */}
              <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="h-7 w-7" />
                </div>

                <h3 className="text-lg font-black">
                  درس تفاعلي
                </h3>

                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  أضف شرحًا وأسئلة
                  تعليمية تفاعلية
                  داخل الدرس.
                </p>
              </div>

              {/* GAME */}
              <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Brain className="h-7 w-7" />
                </div>

                <h3 className="text-lg font-black">
                  Gamification
                </h3>

                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  اختر نوع اللعبة
                  التعليمية المناسبة
                  للدرس.
                </p>
              </div>

              {/* XP */}
              <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Trophy className="h-7 w-7" />
                </div>

                <h3 className="text-lg font-black">
                  XP Rewards
                </h3>

                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  حدد نقاط الخبرة
                  التي سيحصل عليها
                  الطالب بعد النجاح.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =====================================
            FORM
        ===================================== */}

        <Card className="overflow-hidden rounded-[32px] border-border/60 bg-white shadow-sm">
          {/* HEADER */}
          <div className="border-b border-border/60 p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Layers3 className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  بيانات الدرس
                </h2>

                <p className="mt-1 text-muted-foreground">
                  أدخل جميع تفاصيل
                  الدرس التفاعلي.
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <CardContent className="p-8">
            <LessonForm
              courseId={courseId}
              moduleId={moduleId}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}