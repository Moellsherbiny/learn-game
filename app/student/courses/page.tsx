import { redirect } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Layers3,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

import { auth } from "@/auth";
import { getMyCoursesAction } from "@/actions/student/my-courses";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { MyCoursesClient } from "@/components/game/MyCoursesClient";

export default async function MyCoursesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { courses, stats } = await getMyCoursesAction();

  /*
   * ============================================================
   * COURSE STATS
   * ============================================================
   */

  const totalCourses =
    stats.totalCourses ?? courses.length;

  const completedCourses = courses.filter(
    (course) =>
      course.totalLessons > 0 &&
      course.completedLessons >=
        course.totalLessons,
  ).length;

  const inProgressCourses = courses.filter(
    (course) =>
      course.completedLessons > 0 &&
      course.completedLessons <
        course.totalLessons,
  ).length;

  const notStartedCourses = courses.filter(
    (course) =>
      course.completedLessons === 0,
  ).length;

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-background"
    >
      {/* ======================================================
          PAGE HEADER
      ======================================================= */}
      <section className="border-b bg-linear-to-b from-primary/[0.035] to-background">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col gap-6">
            {/* TITLE */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>

                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1"
                >
                  رحلتك التعليمية
                </Badge>
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                دوراتي
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                تابع تقدمك، واستكمل دروسك، وواصل
                رحلتك التعليمية من حيث توقفت.
              </p>
            </div>

            {/* ==================================================
                QUICK STATS
            =================================================== */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {/* TOTAL */}
              <Card className="rounded-2xl border-border/60 bg-background/80 shadow-none">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Layers3 className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-lg font-black leading-none">
                      {totalCourses}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      إجمالي الدورات
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* IN PROGRESS */}
              <Card className="rounded-2xl border-border/60 bg-background/80 shadow-none">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                    <Clock3 className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-lg font-black leading-none">
                      {inProgressCourses}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      قيد التعلم
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* COMPLETED */}
              <Card className="rounded-2xl border-border/60 bg-background/80 shadow-none">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-lg font-black leading-none">
                      {completedCourses}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      مكتملة
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* NOT STARTED */}
              <Card className="rounded-2xl border-border/60 bg-background/80 shadow-none">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-500/10 text-slate-600">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-lg font-black leading-none">
                      {notStartedCourses}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      لم تبدأ
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          COURSES CONTENT
      ======================================================= */}
      <section className="container mx-auto px-4 py-8 md:py-10">
        {/* SECTION HEADER */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />

              <h2 className="text-xl font-black md:text-2xl">
                دوراتك التعليمية
              </h2>
            </div>

            <p className="mt-1.5 text-sm text-muted-foreground">
              اختر دورة واستكمل التعلم من حيث توقفت.
            </p>
          </div>

          {courses.length > 0 && (
            <Badge
              variant="outline"
              className="hidden rounded-full px-3 py-1.5 sm:flex"
            >
              {courses.length} دورة
            </Badge>
          )}
        </div>

        {/* ====================================================
            COURSE CLIENT
        ===================================================== */}
        <MyCoursesClient
          courses={courses}
          stats={stats}
          studentName={
            session.user.name ?? "طالب"
          }
          studentImage={
            session.user.image ?? null
          }
        />
      </section>
    </main>
  );
}
