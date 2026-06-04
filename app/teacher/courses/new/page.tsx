import {
  BookOpen,
  Sparkles,
  Trophy,
  Layers,
  ImageIcon,
  FileText,
  Wand2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import CourseForm from "@/components/teacher/course-form";

export default function NewCoursePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 bg-background" />
        <div className="absolute left-1/2 top-10 h-105 w-200 -translate-x-1/2 rounded-full bg-linear-to-r from-primary/15 via-accent/15 to-primary/10 blur-3xl" />

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <Badge className="mb-6 rounded-full px-4 py-1.5">
              <Sparkles className="ml-2 h-4 w-4" />
              إنشاء مسار تعليمي جديد
            </Badge>

            <h1
              className="
    text-3xl
    sm:text-4xl
    md:text-5xl
    lg:text-6xl
    font-black
    leading-[1.8]
    tracking-normal
    text-primary
    animate-in
    fade-in
    slide-in-from-bottom-4
    duration-700
  "
              style={{
                wordSpacing: "4px",
              }}
            >
              أنشئ دورة تعليمية تحول التعلم
              <br />
              إلى مغامرة تفاعلية
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              صمّم تجربة تعليمية تعتمد على المستويات، نقاط الخبرة، والألعاب
              التفاعلية لجعل التعلم أكثر متعة وفعالية.
            </p>

            {/* Feature Cards */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm">
                <BookOpen className="mb-3 h-6 w-6 text-primary" />
                <h3 className="font-bold">محتوى منظم</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  قسم الدورة التعليمية إلى مستويات ووحدات تعليمية.
                </p>
              </div>

              <div className="rounded-3xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm">
                <Layers className="mb-3 h-6 w-6 text-primary" />
                <h3 className="font-bold">مستويات متدرجة</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  افتح المراحل تدريجيًا مع تقدم الطلاب.
                </p>
              </div>

              <div className="rounded-3xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm">
                <Trophy className="mb-3 h-6 w-6 text-primary" />
                <h3 className="font-bold">XP ومكافآت</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  حفّز الطلاب بالنقاط والإنجازات.
                </p>
              </div>

              <div className="rounded-3xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm">
                <Wand2 className="mb-3 h-6 w-6 text-primary" />
                <h3 className="font-bold">تعلم بالتلعيب</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  حوّل كل درس إلى تحدٍ تفاعلي ممتع.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden rounded-3xl border-border/50 shadow-xl">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <BookOpen className="h-6 w-6 text-primary" />
                معلومات الدورة التعليمية
              </CardTitle>

              <CardDescription className="leading-7">
                أدخل البيانات الأساسية للدورة التعليمية. يمكنك إضافة المستويات
                والألعاب التعليمية لاحقًا.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
              {/* هذا هو الفورم الفعلي الذي ستقوم بإنشائه */}
              <CourseForm />
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <FileText className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-semibold">عنوان واضح</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                اختر عنوانًا يوضح الهدف التعليمي من الدورة التعليمية.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <ImageIcon className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-semibold">صورة جذابة</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                أضف صورة تعبر عن محتوى الدورة التعليمية وتجذب الطلاب.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <Sparkles className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-semibold">تعلم ممتع</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                ركز على تحويل المحتوى إلى مستويات وتحديات تفاعلية.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
