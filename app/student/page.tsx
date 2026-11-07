import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Coins,
  Flame,
  Sword,
  Crown,
  Sparkles,
  BookOpen,
  Zap,
  CheckCircle2,
  Rocket,
  Star,
  ChevronLeft,
  PlayCircle,
  Target,
  ArrowLeft,
} from "lucide-react";

import { getStudentDashboard } from "@/actions/student/dashboard";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

import { cn } from "@/lib/utils";

function IconBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        "bg-primary/10 text-primary",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <IconBox className="h-10 w-10 rounded-xl">
          <Icon className="h-5 w-5" />
        </IconBox>

        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

const statusMap = {
  completed: {
    label: "مكتملة",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },

  in_progress: {
    label: "جارية",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    icon: Rocket,
  },

  not_started: {
    label: "لم تبدأ",
    className: "border-border bg-muted text-muted-foreground",
    icon: Star,
  },
} as const;

export default async function StudentPage() {
  const student = await getStudentDashboard();

  if (!student) {
    redirect("/auth/login");
  }

  const stats = [
    {
      title: "المستوى",
      value: student.level,
      icon: Crown,
    },
    {
      title: "نقاط الخبرة",
      value: student.xp.toLocaleString(),
      icon: Sparkles,
    },
    {
      title: "العملات",
      value: student.coins.toLocaleString(),
      icon: Coins,
    },
    {
      title: "الاستمرارية",
      value: `${student.streak} يوم`,
      icon: Flame,
    },
  ];

  const currentCourse =
    student.courses.find(
      (course) => course.progress > 0 && course.progress < 100,
    ) ?? student.courses[0];

  const missions = [
    {
      title: "أكمل درسًا جديدًا",
      progress: 70,
      reward: "+50 نقاط خبرة",
      icon: BookOpen,
    },
    {
      title: "اربح تحديًا تعليميًا",
      progress: 40,
      reward: "+100 نقاط خبرة",
      icon: Sword,
    },
    {
      title: "سجل دخول يومي",
      progress: 100,
      reward: "+25 Coins",
      icon: Zap,
    },
  ];

  const completedCourses = student.courses.filter(
    (course) => course.status === "completed",
  ).length;

  const inProgressCourses = student.courses.filter(
    (course) => course.status === "in_progress",
  ).length;

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="border-b bg-linear-to-b from-primary/4 to-background">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-center">
            {/* GREETING */}
            <div>
              <Badge
                variant="secondary"
                className="mb-4 rounded-full px-3 py-1"
              >
                <Sparkles className="ml-1.5 h-3.5 w-3.5" />
                لوحة التعلم
              </Badge>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl lg:text-5xl">
                أهلاً،{" "}
                <span className="text-primary">
                  {student.name || "أيها البطل"}
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
                تابع تقدمك، استكمل دوراتك، وواصل تطوير مهاراتك خطوة بخطوة.
              </p>

              {/* ACTIONS */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-xl">
                  <Link href="/student/courses">
                    استمر في التعلم
                    <ChevronLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  asChild
                  size="lg"
                  className="rounded-xl"
                >
                  <Link href="/student/group-challenges">
                    ساحات التحدي
                    <Sword className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* LEVEL */}
            <Card className="overflow-hidden rounded-3xl border-primary/10 bg-white shadow-sm">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      المستوى الحالي
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      المستوى {student.level}
                    </h2>
                  </div>

                  <IconBox className="h-12 w-12 rounded-2xl">
                    <Crown className="h-6 w-6" />
                  </IconBox>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">
                      تقدم المستوى
                    </span>

                    <span className="font-bold text-primary">
                      {student.levelProgress}%
                    </span>
                  </div>

                  <Progress value={student.levelProgress} className="h-2.5" />

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{student.currentLevelXp} XP</span>

                    <span>{student.nextLevelXp} XP</span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-primary/5 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    متبقي{" "}
                    <span className="font-bold text-primary">
                      {Math.max(
                        0,
                        student.nextLevelXp - student.currentLevelXp,
                      )}{" "}
                      XP
                    </span>{" "}
                    للوصول للمستوى التالي
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <section className="container mx-auto px-4 py-8 md:py-10">
        {/* =================================================
            QUICK STATS
        ================================================== */}
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((item) => (
            <Card
              key={item.title}
              className="rounded-2xl border-border/60 bg-white shadow-none"
            >
              <CardContent className="flex items-center gap-3 p-4 md:p-5">
                <IconBox>
                  <item.icon className="h-5 w-5" />
                </IconBox>

                <div className="min-w-0">
                  <p className="truncate text-lg font-black md:text-xl">
                    {item.value}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* =================================================
            CONTINUE LEARNING
        ================================================== */}
        {currentCourse && (
          <section className="mb-12">
            <SectionHeader
              title="استكمل تعلمك"
              description="تابع من حيث توقفت"
              icon={PlayCircle}
            />

            <Card className="overflow-hidden rounded-3xl border-primary/15 bg-primary/[0.035] shadow-sm">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
                      <BookOpen className="h-7 w-7" />
                    </div>

                    <div className="min-w-0">
                      <Badge
                        variant="outline"
                        className="mb-2 rounded-full border-primary/20 bg-primary/5 text-primary"
                      >
                        قيد التعلم
                      </Badge>

                      <h3 className="truncate text-xl font-black md:text-2xl">
                        {currentCourse.title}
                      </h3>

                      <div className="mt-4 flex items-center gap-3">
  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
    <div
      className="h-full rounded-full bg-primary transition-all duration-500"
      style={{
        width: `${Math.min(
          100,
          Math.max(0, currentCourse.progress),
        )}%`,
      }}
    />
  </div>

  <span className="shrink-0 text-sm font-bold text-primary">
    {currentCourse.progress}%
  </span>
</div>
                    </div>
                  </div>

                  <Button asChild size="lg" className="shrink-0 rounded-xl">
                    <Link href={`/student/courses/${currentCourse.id}`}>
                      متابعة التعلم
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* =================================================
            COURSES
        ================================================== */}
        <section className="mb-12">
          <SectionHeader
            title="الدورات الخاصة بك"
            description={
              student.courses.length > 0
                ? `${student.courses.length} دورة • ${inProgressCourses} قيد التعلم • ${completedCourses} مكتملة`
                : "ابدأ أول رحلة تعليمية لك"
            }
            icon={BookOpen}
            action={
              student.courses.length > 0 ? (
                <Button
                  variant="ghost"
                  asChild
                  className="hidden rounded-xl sm:flex"
                >
                  <Link href="/student/courses">
                    عرض الكل
                    <ChevronLeft className="mr-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : null
            }
          />

          {student.courses.length === 0 ? (
            <Card className="rounded-3xl border-dashed shadow-none">
              <CardContent className="flex flex-col items-center p-10 text-center md:p-14">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="h-8 w-8" />
                </div>

                <h3 className="text-xl font-black">ابدأ أول رحلة تعليمية</h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  استكشف الدورات المتاحة وابدأ التعلم خطوة بخطوة.
                </p>

                <Button asChild className="mt-6 rounded-xl">
                  <Link href="/courses">
                    استكشف الدورات
                    <ChevronLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {student.courses.map((course) => {
                const status =
                  statusMap[course.status as keyof typeof statusMap] ??
                  statusMap.not_started;

                const StatusIcon = status.icon;

                const isCompleted = course.progress >= 100;

                return (
                  <Card
                    key={course.id}
                    className="
                        group
                        flex h-full flex-col
                        overflow-hidden
                        rounded-3xl
                        border-border/60
                        bg-white
                        shadow-none
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:border-primary/20
                        hover:shadow-md
                      "
                  >
                    <CardContent className="flex h-full flex-col p-5">
                      {/* HEADER */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <IconBox className="h-11 w-11 rounded-2xl">
                            <BookOpen className="h-5 w-5" />
                          </IconBox>

                          <Badge
                            variant="outline"
                            className={cn("rounded-full", status.className)}
                          >
                            <StatusIcon className="ml-1.5 h-3.5 w-3.5" />
                            {status.label}
                          </Badge>
                        </div>
                      </div>

                      {/* TITLE */}
                      <h3 className="mt-5 line-clamp-2 min-h-14 text-lg font-black leading-7">
                        {course.title}
                      </h3>

                      {/* DESCRIPTION */}
                      <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
                        {course.description ||
                          "رحلة تعليمية ممتعة مليئة بالمحتوى والتحديات."}
                      </p>

                      {/* META */}
                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" />
                          {course.totalLessons} درس
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5" />
                          {course._count.enrollments} طالب
                        </span>
                      </div>

                      {/* PROGRESS */}
                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground">
                            التقدم
                          </span>

                          <span className="font-bold">{course.progress}%</span>
                        </div>

                        <div className="relative px-1 pt-1">
                          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, course.progress),
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* ACTION */}
                      <Button
                        asChild
                        variant={isCompleted ? "outline" : "default"}
                        className="mt-6 w-full rounded-xl"
                      >
                        <Link href={`/student/courses/${course.id}`}>
                          {isCompleted
                            ? "مراجعة الدورة"
                            : course.progress > 0
                              ? "متابعة التعلم"
                              : "بدء الدورة"}

                          <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* =================================================
            BOTTOM GRID
        ================================================== */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* =================================================
              MISSIONS
          ================================================== */}
          <section>
            <SectionHeader
              title="المهام اليومية"
              description="أنجز مهامك واحصل على المكافآت"
              icon={Zap}
            />

            <div className="space-y-3">
              {missions.map((mission) => (
                <Card
                  key={mission.title}
                  className="rounded-2xl border-border/60 shadow-none"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <IconBox>
                        <mission.icon className="h-5 w-5" />
                      </IconBox>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold">
                              {mission.title}
                            </h3>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {mission.reward}
                            </p>
                          </div>

                          <Badge
                            variant="secondary"
                            className="shrink-0 rounded-full"
                          >
                            {mission.progress}%
                          </Badge>
                        </div>

                        <Progress
                          value={mission.progress}
                          className="mt-4 h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

       
        </div>
      </section>
    </main>
  );
}
