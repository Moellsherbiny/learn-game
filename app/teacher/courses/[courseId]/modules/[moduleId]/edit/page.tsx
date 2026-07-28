// app/teacher/courses/[courseId]/modules/[moduleId]/edit/page.tsx

import Link from "next/link";

import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Edit3,
  Layers3,
  Save,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import { getTeacherModule } from "@/actions/teacher/module";

import ModuleSettingsForm from "@/components/teacher/module-settings-form";

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
    courseId: string;

    moduleId: string;
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

export default async function EditModulePage({
  params,
}: PageProps) {
  const {
    courseId,
    moduleId,
  } = await params;

  const module =
    await getTeacherModule(
      moduleId,
    );

  if (!module) {
    notFound();
  }

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
                    تعديل المستوى
                  </Badge>

                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-full border px-4 py-2",
                      levelColors[
                        module.level
                      ],
                    )}
                  >
                    {module.level}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="rounded-full px-4 py-2"
                  >
                    المستوى #
                    {module.order}
                  </Badge>
                </div>

                {/* TITLE */}
                <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                  {module.title}
                </h1>

                {/* DESCRIPTION */}
                {module.description && (
                  <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
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
                  size="lg"
                  className="rounded-2xl"
                >
                  <Link
                    href={`/teacher/courses/${courseId}/modules/${module.id}`}
                  >
                    <ArrowLeft className="ml-2 h-5 w-5" />
                    العودة للمستوى
                  </Link>
                </Button>
              </div>
            </div>

            {/* MODULE INFO */}
            <div className="mt-8 rounded-[28px] border border-primary/10 bg-primary/5 p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* LEFT */}
                <div>
                  <p className="mb-2 text-sm text-primary">
                    الدورة التعليمية
                  </p>

                  <h2 className="text-2xl font-black">
                    {
                      module.course
                        .title
                    }
                  </h2>

                  <p className="mt-2 text-muted-foreground">
                    {
                      module.stats
                        .totalLessons
                    }{" "}
                    درس داخل المستوى
                  </p>
                </div>

                {/* RIGHT */}
                <div className="flex flex-wrap gap-3">
                  <Badge className="rounded-full px-5 py-2 text-sm">
                    <Sparkles className="ml-2 h-4 w-4" />

                    {
                      module.requiredXp
                    }{" "}
                    نقاط الخبرة المطلوبة
                  </Badge>

                  <Badge
                    variant="outline"
                    className="rounded-full px-5 py-2 text-sm"
                  >
                    <Layers3 className="ml-2 h-4 w-4" />

                    {
                      module.stats
                        .totalLessons
                    }{" "}
                    درس
                  </Badge>
                </div>
              </div>

              {/* PROGRESS */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    اكتمال المستوى
                  </span>

                  <span className="font-bold text-primary">
                    {
                      module.stats
                        .totalContents
                    }{" "}
                    عنصر محتوى
                  </span>
                </div>

                <Progress
                  value={
                    module.stats
                      .totalLessons >
                    0
                      ? 100
                      : 0
                  }
                  className="h-3 rounded-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =====================================
            STATS
        ===================================== */}

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          {/* LESSONS */}
          <Card className="rounded-[28px] border-border/60 bg-white shadow-sm">
            <CardContent className="p-7 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Layers3 className="h-8 w-8" />
              </div>

              <div className="text-4xl font-black">
                {
                  module.stats
                    .totalLessons
                }
              </div>

              <div className="mt-2 text-muted-foreground">
                درس
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
                {
                  module.stats
                    .totalXp
                }
              </div>

              <div className="mt-2 text-muted-foreground">
                إجمالي نقاط الخبرة
              </div>
            </CardContent>
          </Card>

          {/* ORDER */}
          <Card className="rounded-[28px] border-border/60 bg-white shadow-sm">
            <CardContent className="p-7 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Star className="h-8 w-8" />
              </div>

              <div className="text-4xl font-black">
                {module.order}
              </div>

              <div className="mt-2 text-muted-foreground">
                ترتيب المستوى
              </div>
            </CardContent>
          </Card>
        </div>

        {/* =====================================
            FORM
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
                  إعدادات المستوى
                </h2>

                <p className="mt-1 text-muted-foreground">
                  قم بتعديل بيانات
                  المستوى التعليمية
                  ومتطلبات التقدم.
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <CardContent className="p-8">
            <ModuleSettingsForm
              module={{
                id: module.id,

                title:
                  module.title,

                description:
                  module.description,

                level:
                  module.level,

                requiredXp:
                  module.requiredXp,

                order:
                  module.order,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}