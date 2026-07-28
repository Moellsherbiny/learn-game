// app/page.tsx

import Link from "next/link";

import {
  ArrowBigUp,
  ArrowLeft,
  ArrowUpRight,
  Brain,
  Crown,
  Flame,
  Gamepad2,
  GraduationCap,
  Rocket,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import { auth } from "@/auth";

import { prisma } from "@/lib/prisma";

import Navbar from "@/components/sections/Navbar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/sections/Footer";

// =========================================
// PAGE
// =========================================

export default async function HomePage() {
  // =========================================
  // SESSION
  // =========================================

  const session = await auth();

  // =========================================
  // REAL STATS
  // =========================================

  const [
    studentsCount,
    teachersCount,
    coursesCount,
    battlesCount,
    leaderboard,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: "STUDENT",
      },
    }),

    prisma.user.count({
      where: {
        role: "TEACHER",
      },
    }),

    prisma.course.count(),

    prisma.battleRoom.count(),

    prisma.user.findMany({
      where: {
        role: "STUDENT",
      },

      orderBy: {
        xp: "desc",
      },

      take: 5,

      select: {
        id: true,

        name: true,

        image: true,

        xp: true,

        currentLevel: true,
      },
    }),
  ]);

  // =========================================
  // HERO BUTTON
  // =========================================

  const dashboardHref =
    session?.user.role === "TEACHER"
      ? "teacher"
      : session?.user.role === "ADMIN"
        ? "admin"
        : "student";

  // =========================================
  // UI
  // =========================================

  return (
    <main
      dir="rtl"
      className="
    min-h-screen
    overflow-x-hidden
    bg-background
    text-foreground
  "
    >
      {/* NAVBAR */}

      <Navbar />

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-60 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl md:h-125 md:w-225" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl md:h-100 md:w-100" />
        <div className="absolute right-0 top-1/2 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl md:h-75 md:w-75" />
      </div>

      {/* HERO */}

      <section className="relative">
        <div className="container mx-auto px-4 pt-24 pb-16 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-5xl text-center">
            <Badge className="mb-6 rounded-full px-4 py-1.5 text-xs sm:px-5 sm:py-2 sm:text-sm">
              <Sparkles className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              منصة تعليمية تفاعلية
            </Badge>

            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              حوّل التعليم إلى
              <span className="block mt-2 bg-linear-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">
                لعبة تنافسية ممتعة
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl px-2 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-9">
              أنشئ دورات تعليمية تفاعلية، نظّم تحديات جماعية مباشرة، تابع تقدم
              الطلاب، واجعل التعلم أكثر متعة وتحفيزًا.
            </p>

            {/* ACTIONS */}

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              {session?.user ? (
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full sm:w-auto rounded-2xl px-8 text-lg font-black shadow-2xl"
                >
                  <Link href={dashboardHref}>
                    الذهاب للوحة التحكم <ArrowLeft className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-12 w-full sm:w-auto rounded-2xl px-8 text-lg font-black shadow-2xl"
                  >
                    <Link href="/auth/register">
                      <Rocket className="ml-2 h-5 w-5" /> ابدأ مجانًا
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 w-full sm:w-auto rounded-2xl px-8 text-lg font-black"
                  >
                    <Link href="/auth/login">تسجيل الدخول</Link>
                  </Button>
                </>
              )}
            </div>

            {/* STATS */}

            <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* STUDENTS */}

              <Card className="rounded-[2rem] border-border/50 bg-card/80 backdrop-blur-xl">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Users className="h-8 w-8" />
                  </div>

                  <div className="mt-5 text-4xl font-black">
                    {studentsCount}
                  </div>

                  <p className="mt-2 text-muted-foreground">طالب</p>
                </CardContent>
              </Card>

              {/* TEACHERS */}

              <Card className="rounded-[2rem] border-border/50 bg-card/80 backdrop-blur-xl">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                    <GraduationCap className="h-8 w-8" />
                  </div>

                  <div className="mt-5 text-4xl font-black">
                    {teachersCount}
                  </div>

                  <p className="mt-2 text-muted-foreground">مدرس</p>
                </CardContent>
              </Card>

              {/* COURSES */}

              <Card className="rounded-[2rem] border-border/50 bg-card/80 backdrop-blur-xl">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-500">
                    <Brain className="h-8 w-8" />
                  </div>

                  <div className="mt-5 text-4xl font-black">{coursesCount}</div>

                  <p className="mt-2 text-muted-foreground">دورة</p>
                </CardContent>
              </Card>

              {/* BATTLES */}

              <Card className="rounded-[2rem] border-border/50 bg-card/80 backdrop-blur-xl">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500">
                    <Swords className="h-8 w-8" />
                  </div>

                  <div className="mt-5 text-4xl font-black">{battlesCount}</div>

                  <p className="mt-2 text-muted-foreground">تحدي</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}

      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center">
          <Badge className="rounded-full px-4 py-2">المميزات</Badge>

          <h2 className="mt-6 text-4xl font-black">لماذا Learn Game؟</h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* FEATURE */}

          <Card className="rounded-[2rem] border-border/50 bg-card/80 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Gamepad2 className="h-8 w-8" />
              </div>

              <h3 className="mt-6 text-2xl font-black">تعليم ممتع</h3>

              <p className="mt-4 leading-8 text-muted-foreground">
                حوّل الدروس إلى تجربة تفاعلية ممتعة تشبه الألعاب.
              </p>
            </CardContent>
          </Card>

          {/* FEATURE */}

          <Card className="rounded-[2rem] border-border/50 bg-card/80 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-500">
                <Swords className="h-8 w-8" />
              </div>

              <h3 className="mt-6 text-2xl font-black">تحديات مباشرة</h3>

              <p className="mt-4 leading-8 text-muted-foreground">
                أنشئ تحديات جماعية مباشرة بين الطلاب في الوقت الحقيقي.
              </p>
            </CardContent>
          </Card>

          {/* FEATURE */}

          <Card className="rounded-[2rem] border-border/50 bg-card/80 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500">
                <Trophy className="h-8 w-8" />
              </div>

              <h3 className="mt-6 text-2xl font-black">نقاط الخبرة</h3>

              <p className="mt-4 leading-8 text-muted-foreground">
                اجمع النقاط والعملات وارتقِ بالمستويات التعليمية.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* LIVE BATTLE */}

      <section id="battle" className="container mx-auto px-4 py-20">
        <div
          className="
            overflow-hidden
            rounded-[3rem]
            border
            border-primary/20
            bg-linear-to-br
            from-primary/10
            to-fuchsia-500/10
            p-10
            shadow-2xl
          "
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* LEFT */}

            <div>
              <Badge className="rounded-full px-4 py-2">تحديات مباشرة</Badge>

              <h2 className="mt-6 text-5xl font-black leading-[1.4]">
                معارك تعليمية في الوقت الحقيقي ⚔️
              </h2>

              <p className="mt-6 text-lg leading-9 text-muted-foreground">
                الطلاب يتنافسون مباشرة، النتائج تظهر لحظيًا، والـ scoreboard
                يتحدث في الوقت الفعلي.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-2xl border bg-background/80 px-5 py-3">
                  <Zap className="h-5 w-5 text-yellow-500" />

                  <span className="font-bold">Real-time</span>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border bg-background/80 px-5 py-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />

                  <span className="font-bold">Anti Cheat</span>
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <div className="rounded-[2rem] border border-border/50 bg-background/80 p-8 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-5xl font-black text-blue-500">540</div>

                  <p className="mt-2 text-sm text-muted-foreground">TEAM A</p>
                </div>

                <div className="rounded-full bg-primary px-6 py-3 font-black text-primary-foreground">
                  LIVE
                </div>

                <div className="text-center">
                  <div className="text-5xl font-black text-fuchsia-500">
                    480
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">TEAM B</p>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border bg-card p-6 text-center">
                <h3 className="text-2xl font-black leading-[1.8]">
                  ما هي لغة البرمجة المستخدمة في تطوير React؟
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERBOARD */}

      <section id="leaderboard" className="container mx-auto px-4 py-20">
        <div className="text-center">
          <Badge className="rounded-full px-4 py-2">لوحة الصدارة</Badge>

          <h2 className="mt-6 text-4xl font-black">أفضل الطلاب</h2>
        </div>

        <div className="mx-auto mt-14 max-w-4xl space-y-5">
          {leaderboard.map((student, index) => (
            <Card
              key={student.id}
              className="rounded-[2rem] border-border/50 bg-card/80 backdrop-blur-xl"
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-5">
                  <div
                    className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-primary/10
                        text-2xl
                        font-black
                        text-primary
                      "
                  >
                    {index + 1}
                  </div>

                  <Avatar className="h-14 w-14 border">
                    <AvatarImage src={student.image || ""} />

                    <AvatarFallback>{student.name?.[0]}</AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="text-xl font-black">{student.name}</h3>

                    <p className="text-muted-foreground">
                      Level {student.currentLevel}
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-2 text-3xl font-black text-yellow-500">
                    <Crown className="h-7 w-7" />

                    {student.xp}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">نقاط الخبرة</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}

      <section className="container mx-auto px-4 py-24">
        <div
          className="
            overflow-hidden
            rounded-[3rem]
            border
            border-primary/20
            bg-linear-to-r
            from-primary
            to-fuchsia-500
            p-12
            text-center
            text-white
            shadow-2xl
          "
        >
          <h2 className="text-5xl font-black leading-normal">
            ابدأ رحلتك التعليمية الآن{" "}
            <ArrowUpRight className="ml-2 inline-block h-8 w-8 animate-bounce" />
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-white/80">
            انضم إلى منصة Learn Game وابدأ في إنشاء تجربة تعليمية تفاعلية مختلفة
            بالكامل.
          </p>

          <Button
            asChild
            size="lg"
            variant="secondary"
            className="
              mt-10
              h-14
              rounded-2xl
              px-8
              text-lg
              font-black
            "
          >
            <Link href="/auth/register">
              ابدأ مجانًا الآن
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
      <Footer />
    </main>
  );
}
