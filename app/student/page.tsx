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
        "flex h-10 w-10 items-center justify-center rounded-xl",
        "bg-primary/10 text-primary",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ElementType;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />

      <h2 className="text-xl font-semibold md:text-2xl">
        {title}
      </h2>
    </div>
  );
}

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
      title: "إجمالي نقاط الخبرة",
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

  const currentCourse = student.courses.find(
    (course) =>
      course.progress > 0 &&
      course.progress < 100,
  );

  const missions = [
    {
      title: "أكمل درساً جديداً",
      progress: 70,
      reward: "+50 نقاط خبرة",
      icon: BookOpen,
    },

    {
      title: "اربح تحدياً تعليمياً",
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

  const statusMap = {
    completed: {
      label: "مكتمل",
      className:
        "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
    },

    in_progress: {
      label: "جاري",
      className:
        "bg-orange-100 text-orange-700",
      icon: Rocket,
    },

    not_started: {
      label:
        "bg-muted text-muted-foreground",
      icon: Star,
    },
  };

  return (
    <main className="min-h-screen bg-background">

      {/* HEADER */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-6 md:py-8">

          <div className="flex flex-col gap-6">

            <div>
              <h1 className="text-3xl font-bold md:text-4xl">
                أهلاً،
                {" "}
                {student.name || "أيها البطل"}
              </h1>

              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                تابع تقدمك واستكمل رحلتك التعليمية.
              </p>
            </div>

            {/* LEVEL CARD */}
            <Card className="rounded-2xl">
              <CardContent className="p-5">

                <div className="mb-4 flex items-center justify-between">

                  <div>
                    <p className="text-xs text-muted-foreground">
                      المستوى الحالي
                    </p>

                    <h2 className="text-xl font-bold">
                      المستوى {student.level}
                    </h2>
                  </div>

                  <IconBox>
                    <Crown className="h-5 w-5" />
                  </IconBox>
                </div>

                <Progress
                  value={student.levelProgress}
                  className="h-2"
                />

                <div className="mt-3 flex justify-between text-xs text-muted-foreground">

                  <span>
                    {student.currentLevelXp} نقاط خبرة
                  </span>

                  <span>
                    {student.nextLevelXp} نقاط خبرة
                  </span>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  متبقي
                  {" "}
                  <span className="font-semibold text-primary">
                    {student.nextLevelXp -
                      student.currentLevelXp} نقاط خبرة
                  </span>
                  {" "}
                  للوصول للمستوى التالي
                </p>

              </CardContent>
            </Card>

            {/* ACTIONS */}
            <div className="flex flex-col gap-3 sm:flex-row">

              <Button
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/student/courses">
                  استمر في التعلم
                  <ChevronLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="secondary"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/student/battles">
                  ساحات التحدي
                  <Sword className="mr-2 h-4 w-4" />
                </Link>
              </Button>

            </div>

          </div>

        </div>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-4 py-6">

        {/* STATS */}
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">

          {stats.map((item, index) => (
            <Card
              key={index}
              className="rounded-2xl"
            >
              <CardContent className="p-4">

                <div className="flex items-center gap-3">

                  <IconBox>
                    <item.icon className="h-5 w-5" />
                  </IconBox>

                  <div>

                    <p className="text-lg font-bold">
                      {item.value}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {item.title}
                    </p>

                  </div>

                </div>

              </CardContent>
            </Card>
          ))}

        </div>
                {/* CONTINUE LEARNING */}
        {currentCourse && (
          <Card className="mb-8 rounded-2xl border-primary/20 bg-primary/5">
            <CardContent className="p-5">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex-1">

                  <p className="mb-1 text-xs text-primary">
                    استكمل رحلتك التعليمية
                  </p>

                  <h2 className="text-lg font-semibold md:text-xl">
                    {currentCourse.title}
                  </h2>

                  <div className="mt-4">

                    <Progress
                      value={currentCourse.progress}
                      className="h-2"
                    />

                    <p className="mt-2 text-xs text-muted-foreground">
                      {currentCourse.progress}% مكتمل
                    </p>

                  </div>

                </div>

                <Button asChild>
                  <Link
                    href={`/student/courses/${currentCourse.id}`}
                  >
                    متابعة التعلم
                    <PlayCircle className="mr-2 h-4 w-4" />
                  </Link>
                </Button>

              </div>

            </CardContent>
          </Card>
        )}

        {/* DASHBOARD GRID */}
        <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">

          {/* RIGHT COLUMN */}
          <div className="space-y-8">

            {/* MISSIONS */}
            <div>

              <SectionTitle
                title="المهام اليومية"
                icon={Zap}
              />

              <div className="grid gap-4">

                {missions.map((mission, index) => (
                  <Card
                    key={index}
                    className="rounded-2xl"
                  >
                    <CardContent className="p-4">

                      <div className="flex items-start justify-between">

                        <div className="flex items-center gap-3">

                          <IconBox>
                            <mission.icon className="h-5 w-5" />
                          </IconBox>

                          <div>

                            <h3 className="text-sm font-semibold">
                              {mission.title}
                            </h3>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {mission.reward}
                            </p>

                          </div>

                        </div>

                        <Badge variant="secondary">
                          {mission.progress}%
                        </Badge>

                      </div>

                      <Progress
                        value={mission.progress}
                        className="mt-4 h-2"
                      />

                    </CardContent>
                  </Card>
                ))}

              </div>

            </div>

            {/* BATTLES */}
            <div>

              <SectionTitle
                title="ساحات التحدي"
                icon={Sword}
              />

              {student.pendingInvitations.length ===
              0 ? (
                <Card className="rounded-2xl border-dashed">

                  <CardContent className="p-8 text-center">

                    <Sword className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

                    <h3 className="font-semibold">
                      لا توجد تحديات حالياً
                    </h3>

                    <p className="mt-2 text-sm text-muted-foreground">
                      عندما تصلك دعوة لتحدٍ
                      تعليمي ستظهر هنا.
                    </p>

                  </CardContent>

                </Card>
              ) : (
                <div className="space-y-4">

                  {student.pendingInvitations.map(
                    (room) => (
                      <Card
                        key={room.id}
                        className="rounded-2xl"
                      >
                        <CardContent className="p-4">

                          <div className="flex flex-col gap-4">

                            <div>

                              <h3 className="font-semibold">
                                {room.title}
                              </h3>

                              <p className="mt-1 text-xs text-muted-foreground">
                                كود الغرفة:
                                {" "}
                                {room.code}
                              </p>

                            </div>

                            <Button
                              asChild
                              className="w-full"
                            >
                              <Link
                                href={`/student/battle/${room.id}`}
                              >
                                دخول التحدي
                              </Link>
                            </Button>

                          </div>

                        </CardContent>
                      </Card>
                    ),
                  )}

                </div>
              )}

            </div>

          </div>

          {/* LEFT COLUMN */}
          <div>
                        <SectionTitle
              title="الدورات الخاصة بك"
              icon={BookOpen}
            />

            {student.courses.length === 0 ? (
              <Card className="rounded-2xl">

                <CardContent className="flex flex-col items-center p-10 text-center">

                  <BookOpen className="mb-4 h-12 w-12 text-primary" />

                  <h3 className="text-xl font-semibold">
                    ابدأ أول رحلة تعليمية
                  </h3>

                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    استكشف الدورات المتاحة
                    وابدأ التعلم خطوة بخطوة.
                  </p>

                  <Button
                    asChild
                    className="mt-6"
                  >
                    <Link href="/courses">
                      استكشف الدورات
                    </Link>
                  </Button>

                </CardContent>

              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">

                {student.courses.map((course) => {
                  const status =
                    statusMap[course.status];

                  return (
                    <Card
                      key={course.id}
                      className="
                        rounded-2xl
                        transition-all
                        hover:border-primary/20
                        hover:shadow-md
                      "
                    >
                      <CardContent className="p-4">

                        {/* TOP */}
                        <div className="flex items-center justify-between">

                          <Badge
                           
                          >
                            <status.icon className="ml-1 h-3 w-3" />
                            {status.label}
                          </Badge>

                          <IconBox>
                            <BookOpen className="h-4 w-4" />
                          </IconBox>

                        </div>

                        {/* TITLE */}
                        <h3 className="mt-4 line-clamp-1 text-lg font-semibold">
                          {course.title}
                        </h3>

                        {/* DESCRIPTION */}
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {course.description ||
                            "رحلة تعليمية ممتعة مليئة بالمحتوى والتحديات."}
                        </p>

                        {/* META */}
                        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">

                          <span>
                            {course.totalLessons} درس
                          </span>

                          <span>
                            {
                              course._count
                                .enrollments
                            }{" "}
                            طالب
                          </span>

                        </div>

                        {/* PROGRESS */}
                        <div className="mt-5">

                          <div className="mb-2 flex items-center justify-between text-xs">

                            <span>
                              التقدم
                            </span>

                            <span>
                              {course.progress}%
                            </span>

                          </div>

                          <Progress
                            value={course.progress}
                            className="h-2"
                          />

                        </div>

                        {/* ACTION */}
                        <Button
                          asChild
                          className="mt-5 w-full"
                          variant={
                            course.progress > 0
                              ? "default"
                              : "outline"
                          }
                        >
                          <Link
                            href={`/student/courses/${course.id}`}
                          >
                            {course.progress >
                            0
                              ? "متابعة التعلم"
                              : "بدء الدورة التعليمية"}

                            <ChevronLeft className="mr-2 h-4 w-4" />
                          </Link>
                        </Button>

                      </CardContent>
                    </Card>
                  );
                })}

              </div>
            )}

          </div>
        </div>
      </section>
    </main>
  );
}