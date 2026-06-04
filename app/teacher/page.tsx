// app/teacher/page.tsx

import Link from "next/link";

import { redirect } from "next/navigation";

import {
  ArrowLeft,
  FolderOpen,
  GraduationCap,
  Layers,
  Plus,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

import { auth } from "@/auth";

import {
  getTeacherDashboard,
  type TeacherDashboard,
} from "@/actions/teacher/dashboard";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// =========================================
// PAGE
// =========================================

export default async function TeacherPage() {
  // =========================================
  // AUTH
  // =========================================

  const session =
    await auth();

  if (
    !session?.user?.id
  ) {
    redirect(
      "/auth/login",
    );
  }

  // =========================================
  // DASHBOARD
  // =========================================

  const teacher:
    | TeacherDashboard
    | null =
    await getTeacherDashboard();

  if (!teacher) {
    redirect(
      "/auth/login",
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <main className="min-h-screen bg-background">

      {/* HERO */}

      <section className="relative overflow-hidden border-b">

        {/* BG */}

        <div className="absolute inset-0 -z-10 bg-background" />

        {/* GLOW */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-10
            -z-10
            h-105
            w-200
            -translate-x-1/2
            rounded-full
            bg-linear-to-r
            from-primary/15
            via-fuchsia-500/10
            to-primary/10
            blur-3xl
          "
        />

        <div className="container mx-auto px-4 py-16 md:py-24">

          {/* BADGE */}

          <Badge className="mb-6 rounded-full px-4 py-1.5 text-sm">

            <GraduationCap className="ml-2 h-4 w-4" />

            لوحة تحكم المعلم
          </Badge>

          {/* TITLE */}

          <h1
            className="
              text-4xl
              font-black
              tracking-tight
              sm:text-5xl
              md:text-6xl
              leading-normal
            "
          >

            أهلاً بك،

            <span
              className="
                block
                text-primary
                dark:text-primary/90
              "
            >

              {teacher.name ||
                "أيها المعلم"}
            </span>
          </h1>

          {/* DESC */}

          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">

            أنشئ الدورات التعليمية،
            تابع تقدم الطلاب،
            ونظم التحديات الجماعية
            التفاعلية.
          </p>

          {/* ACTIONS */}

          <div className="mt-10 flex flex-wrap gap-4">

            {/* CREATE COURSE */}

            <Button
              asChild
              size="lg"
              className="
                h-14
                rounded-2xl
                px-8
                text-lg
                font-black
                shadow-lg
                transition-all
                hover:scale-105
              "
            >

              <Link href="/teacher/courses/new">

                <Plus className="ml-2 h-5 w-5" />

                إنشاء دورة تعليمية جديدة
              </Link>
            </Button>

            {/* CREATE BATTLE */}

            <Button
              asChild
              variant="outline"
              size="lg"
              className="
                h-14
                rounded-2xl
                border-primary/20
                bg-background
                px-8
                text-lg
                font-black
                transition-all
                hover:scale-105
                hover:bg-primary/5
              "
            >

              <Link href="/teacher/battles/new">

                <Swords className="ml-2 h-5 w-5" />

                إنشاء تحدي
              </Link>
            </Button>

            {/* BATTLES */}

            <Button
              asChild
              variant="outline"
              size="lg"
              className="
                h-14
                rounded-2xl
                border-primary/20
                bg-background
                px-8
                text-lg
                font-black
                transition-all
                hover:scale-105
                hover:bg-primary/5
              "
            >

              <Link href="/teacher/battles">

                <Trophy className="ml-2 h-5 w-5" />

                عرض التحديات
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* COURSES */}

      <section className="container mx-auto px-4 py-12">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="text-3xl font-black tracking-tight">

              دوراتك التعليمية
            </h2>

            <p className="mt-2 text-muted-foreground">

              جميع الدورات التعليمية
              التي قمت بإنشائها.
            </p>
          </div>

          <Badge
            variant="outline"
            className="rounded-full px-4 py-2 text-sm"
          >

            {
              teacher
                .coursesTeaching
                .length
            }{" "}
            دورة تعليمية
          </Badge>
        </div>

        {/* EMPTY */}

        {teacher
          .coursesTeaching
          .length ===
          0 ? (
          <Card className="rounded-[2rem] border border-border/50 bg-card shadow-sm">

            <CardContent className="flex flex-col items-center px-6 py-16 text-center">

              <div className="mb-5 rounded-full bg-primary/10 p-6 text-primary">

                <FolderOpen className="h-12 w-12" />
              </div>

              <h3 className="text-3xl font-black">

                لا توجد دورات تعليمية
              </h3>

              <p className="mt-4 max-w-md leading-8 text-muted-foreground">

                ابدأ بإنشاء أول دورة تعليمية
                وحول التعلم إلى تجربة
                ممتعة وتفاعلية.
              </p>

              <Button
                asChild
                className="mt-8 rounded-2xl px-8"
              >

                <Link href="/teacher/courses/new">

                  <Plus className="ml-2 h-4 w-4" />

                  إنشاء أول دورة
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">

            {teacher.coursesTeaching.map(
              (
                course,
              ) => (
                <Card
                  key={
                    course.id
                  }
                  className="
                    overflow-hidden
                    rounded-[2rem]
                    border
                    border-border/50
                    bg-card
                    shadow-lg
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-2xl
                  "
                >

                  {/* HEADER */}

                  <CardHeader>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div>

                        <CardTitle className="text-3xl font-black">

                          {
                            course.title
                          }
                        </CardTitle>

                        <CardDescription className="mt-3 max-w-3xl text-base leading-8">

                          {course.description ||
                            "مسار تعليمي تفاعلي يعتمد على التلعيب."}
                        </CardDescription>
                      </div>

                      {/* ACTION */}

                      <Button
                        asChild
                        className="rounded-2xl px-6"
                      >

                        <Link
                          href={`/teacher/courses/${course.id}`}
                        >

                          إدارة الدورة

                          <ArrowLeft className="mr-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>

                  {/* CONTENT */}

                  <CardContent>

                    {/* STATS */}

                    <div className="mb-8 grid gap-4 sm:grid-cols-3">

                      {/* MODULES */}

                      <div className="rounded-3xl border border-border/50 bg-muted/40 p-5 text-center">

                        <Layers className="mx-auto mb-3 h-6 w-6 text-primary" />

                        <p className="text-4xl font-black">

                          {
                            course
                              ._count
                              .modules
                          }
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">

                          مستوى
                        </p>
                      </div>

                      {/* STUDENTS */}

                      <div className="rounded-3xl border border-border/50 bg-muted/40 p-5 text-center">

                        <Users className="mx-auto mb-3 h-6 w-6 text-primary" />

                        <p className="text-4xl font-black">

                          {
                            course
                              ._count
                              .enrollments
                          }
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">

                          طالب
                        </p>
                      </div>

                      {/* XP */}

                      <div className="rounded-3xl border border-border/50 bg-muted/40 p-5 text-center">

                        <Trophy className="mx-auto mb-3 h-6 w-6 text-yellow-500" />

                        <p className="text-4xl font-black">

                          {course
                            ._count
                            .modules *
                            250}
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">

                          XP
                        </p>
                      </div>
                    </div>

                    {/* STUDENTS */}

                    {course
                      .enrollments
                      .length >
                      0 && (
                      <div className="overflow-x-auto rounded-3xl border border-border/50">

                        <table className="w-full text-sm">

                          <thead className="bg-muted/50">

                            <tr>

                              <th className="p-4 text-right font-black">

                                الطالب
                              </th>

                              <th className="p-4 text-right font-black">

                                المستوى
                              </th>

                              <th className="p-4 text-right font-black">

                                XP
                              </th>

                              <th className="p-4 text-right font-black">

                                العملات
                              </th>

                              <th className="p-4 text-right font-black">

                                السلسلة
                              </th>
                            </tr>
                          </thead>

                          <tbody>

                            {course.enrollments.map(
                              (
                                enrollment,
                              ) => (
                                <tr
                                  key={
                                    enrollment.id
                                  }
                                  className="border-t"
                                >

                                  <td className="p-4 font-bold">

                                    {enrollment
                                      .student
                                      .name ||
                                      enrollment
                                        .student
                                        .email ||
                                      "طالب"}
                                  </td>

                                  <td className="p-4">

                                    {
                                      enrollment
                                        .student
                                        .currentLevel
                                    }
                                  </td>

                                  <td className="p-4">

                                    {enrollment
                                      .student
                                      .xp.toLocaleString()}
                                  </td>

                                  <td className="p-4">

                                    {
                                      enrollment
                                        .student
                                        .coins
                                    }
                                  </td>

                                  <td className="p-4">

                                    {
                                      enrollment
                                        .student
                                        .streak
                                    }
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}