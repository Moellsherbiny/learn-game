// app/profile/page.tsx

import { redirect } from "next/navigation";

import {
  BookOpen,
  Brain,
  Crown,
  Flame,
  Gamepad2,
  GraduationCap,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";

import { auth } from "@/auth";

import { prisma } from "@/lib/prisma";

import {
  StudentLevel,
  UserRole,
} from "@/lib/generated/prisma/client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Progress,
} from "@/components/ui/progress";
import DashboardNavbar from "@/components/layout/navbar";

// =========================================
// PAGE
// =========================================

export default async function ProfilePage() {
  // =========================================
  // SESSION
  // =========================================

  const session =
    await auth();

  if (!session?.user?.id) {
    redirect(
      "/auth/login",
    );
  }

  // =========================================
  // USER
  // =========================================

  const user =
    await prisma.user.findUnique(
      {
        where: {
          id:
            session.user.id,
        },

        include: {
          coursesTeaching:
            true,

          enrollments:
            true,

          teacherBattleRooms:
            true,

          battleParticipants:
            true,
        },
      },
    );

  if (!user) {
    redirect(
      "/auth/login",
    );
  }

  // =========================================
  // ROLE
  // =========================================

  const isTeacher =
    user.role ===
    UserRole.TEACHER;

  const isAdmin =
    user.role ===
    UserRole.ADMIN;

  // =========================================
  // INITIALS
  // =========================================

  const initials =
    user.name
      ?.split(" ")
      .map(
        (part) =>
          part[0],
      )
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    "LG";

  // =========================================
  // LEVEL
  // =========================================

  const levelMap = {
    [StudentLevel.BEGINNER]:
      1,

    [StudentLevel.INTERMEDIATE]:
      2,

    [StudentLevel.ADVANCED]:
      3,
  };

  const numericLevel =
    levelMap[
      user.level
    ] ?? 1;

  const xp =
    user.xp ?? 0;

  const nextLevelXP =
    numericLevel *
    1000;

  const progress =
    Math.min(
      (xp /
        nextLevelXP) *
        100,

      100,
    );

  // =========================================
  // STATS
  // =========================================

  const teacherStats = {
    courses:
      user
        .coursesTeaching
        ?.length ?? 0,

    battles:
      user
        .teacherBattleRooms
        ?.length ?? 0,
  };

  const studentStats = {
    courses:
      user
        .enrollments
        ?.length ?? 0,

    battles:
      user
        .battleParticipants
        ?.length ?? 0,
  };

  // =========================================
  // LEVEL LABEL
  // =========================================

  const levelLabel = {
    BEGINNER:
      "مبتدئ",

    INTERMEDIATE:
      "متوسط",

    ADVANCED:
      "متقدم",
  };

  // =========================================
  // UI
  // =========================================

  return (
<main className="min-h-screen bg-background text-foreground">

  <DashboardNavbar />

  <div
    className="
      pointer-events-none
      absolute
      inset-0
      -z-10
      bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.10),transparent_30%),radial-gradient(circle_at_bottom,rgba(217,70,239,0.08),transparent_30%)]
    "
  />

  {/* CONTENT */}

  <div className="relative z-10 container mx-auto max-w-7xl px-4 py-10">

    {/* HERO */}

    <div
      className="
        relative
        overflow-hidden
        rounded-[2rem]
        border
        border-border/50
        bg-card/80
        p-8
        shadow-2xl
        backdrop-blur-xl
      "
    >

      {/* GLOW */}

      <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-52 w-52 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        {/* LEFT */}

        <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-right">

          {/* AVATAR */}

          <div className="relative">

            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />

            <Avatar
              className="
                relative
                h-32
                w-32
                border-4
                border-background
                shadow-2xl
              "
            >

              <AvatarImage
                src={user.image || ""}
                alt={user.name || "User"}
              />

              <AvatarFallback
                className="
                  bg-primary/10
                  text-4xl
                  font-black
                  text-primary
                "
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* INFO */}

          <div>

            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">

              <h1
                className="
                  text-4xl
                  sm:text-5xl
                  font-black
                  leading-[1.7]
                  tracking-normal
                "
                style={{
                  wordSpacing: "4px",
                }}
              >
                {user.name}
              </h1>

              <Badge
                className="
                  rounded-xl
                  px-4
                  py-2
                  text-sm
                "
              >

                {isTeacher ? (
                  <>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    مدرس
                  </>
                ) : isAdmin ? (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    مدير
                  </>
                ) : (
                  <>
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    طالب
                  </>
                )}
              </Badge>
            </div>

            <p className="mt-3 text-lg text-muted-foreground">

              {user.email}
            </p>

            {/* LEVEL */}

            {!isTeacher && !isAdmin && (

              <div className="mt-6 max-w-xl">

                <div className="mb-2 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <Crown className="h-5 w-5 text-yellow-500" />

                    <span className="font-bold">

                      {
                        levelLabel[
                          user.level
                        ]
                      }
                    </span>
                  </div>

                  <span className="text-sm text-muted-foreground">

                    {xp} / {nextLevelXP} نقاط خبرة
                  </span>
                </div>

                <Progress
                  value={progress}
                  className="h-4 rounded-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 gap-4">

          {/* XP */}

          <div
            className="
              rounded-3xl
              border
              border-border/50
              bg-background/60
              p-5
              text-center
              shadow-lg
              backdrop-blur-xl
            "
          >

            <Zap className="mx-auto h-8 w-8 text-primary" />

            <div className="mt-3 text-4xl font-black">

              {xp}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">

              نقاط خبرة
            </p>
          </div>

          {/* STREAK */}

          <div
            className="
              rounded-3xl
              border
              border-border/50
              bg-background/60
              p-5
              text-center
              shadow-lg
              backdrop-blur-xl
            "
          >

            <Flame className="mx-auto h-8 w-8 text-orange-500" />

            <div className="mt-3 text-4xl font-black">

              {user.streak}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">

              سلسلة
            </p>
          </div>

          {/* COINS */}

          <div
            className="
              rounded-3xl
              border
              border-border/50
              bg-background/60
              p-5
              text-center
              shadow-lg
              backdrop-blur-xl
            "
          >

            <Sparkles className="mx-auto h-8 w-8 text-yellow-500" />

            <div className="mt-3 text-4xl font-black">

              {user.coins}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">

              Coins
            </p>
          </div>

          {/* LEVEL */}

          <div
            className="
              rounded-3xl
              border
              border-border/50
              bg-background/60
              p-5
              text-center
              shadow-lg
              backdrop-blur-xl
            "
          >

            <Trophy className="mx-auto h-8 w-8 text-fuchsia-500" />

            <div className="mt-3 text-4xl font-black">

              {user.currentLevel}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">

              المستوى
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* GRID */}

    <div className="mt-8 grid gap-6 lg:grid-cols-3">

      {/* MAIN */}

      <div className="space-y-6 lg:col-span-2">

        {/* ROLE PANEL */}

        <Card
          className="
            rounded-[2rem]
            border
            border-border/50
            bg-card/80
            shadow-xl
            backdrop-blur-xl
          "
        >

          <CardHeader>

            <CardTitle className="flex items-center gap-3 text-2xl font-black">

              {isTeacher ? (
                <GraduationCap className="h-7 w-7 text-primary" />
              ) : (
                <Gamepad2 className="h-7 w-7 text-primary" />
              )}

              {isTeacher
                ? "إحصائيات المدرس"
                : "إحصائيات الطالب"}
            </CardTitle>
          </CardHeader>

          <CardContent>

            {isTeacher ? (

              <div className="grid gap-5 sm:grid-cols-2">

                <div className="rounded-3xl bg-blue-500/10 p-6">

                  <BookOpen className="h-10 w-10 text-blue-500" />

                  <div className="mt-4 text-5xl font-black">

                    {teacherStats.courses}
                  </div>

                  <p className="mt-2 text-muted-foreground">

                    الدورات التعليمية
                  </p>
                </div>

                <div className="rounded-3xl bg-fuchsia-500/10 p-6">

                  <Swords className="h-10 w-10 text-fuchsia-500" />

                  <div className="mt-4 text-5xl font-black">

                    {teacherStats.battles}
                  </div>

                  <p className="mt-2 text-muted-foreground">

                    التحديات
                  </p>
                </div>
              </div>

            ) : (

              <div className="grid gap-5 sm:grid-cols-2">

                <div className="rounded-3xl bg-primary/10 p-6">

                  <Brain className="h-10 w-10 text-primary" />

                  <div className="mt-4 text-5xl font-black">

                    {studentStats.courses}
                  </div>

                  <p className="mt-2 text-muted-foreground">

                    الدورات المشتركة
                  </p>
                </div>

                <div className="rounded-3xl bg-yellow-500/10 p-6">

                  <Swords className="h-10 w-10 text-yellow-500" />

                  <div className="mt-4 text-5xl font-black">

                    {studentStats.battles}
                  </div>

                  <p className="mt-2 text-muted-foreground">

                    التحديات
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* POWER */}

        <Card
          className="
            overflow-hidden
            rounded-[2rem]
            border
            border-primary/20
            bg-linear-to-br
            from-primary/10
            to-fuchsia-500/10
            shadow-2xl
          "
        >

          <CardContent className="p-8">

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-primary/10
                "
              >

                <Zap className="h-7 w-7 text-yellow-500" />
              </div>

              <div>

                <h3 className="text-2xl font-black">

                  قوة الحساب
                </h3>

                <p className="text-muted-foreground">

                  استمر في التقدم 🚀
                </p>
              </div>
            </div>

            <div className="mt-8">

              <div className="mb-2 flex justify-between text-sm">

                <span>
                  التقدم
                </span>

                <span>
                  {Math.round(progress)}%
                </span>
              </div>

              <Progress
                value={progress}
                className="h-4"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SIDEBAR */}

      <div className="space-y-6">

        <Card
          className="
            rounded-[2rem]
            border
            border-border/50
            bg-card/80
            shadow-xl
            backdrop-blur-xl
          "
        >

          <CardHeader>

            <CardTitle className="text-2xl font-black">

              معلومات الحساب
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            <div>

              <p className="text-sm text-muted-foreground">

                البريد الإلكتروني
              </p>

              <p className="mt-1 font-semibold">

                {user.email}
              </p>
            </div>

            <div>

              <p className="text-sm text-muted-foreground">

                نوع الحساب
              </p>

              <p className="mt-1 font-semibold">

                {user.role}
              </p>
            </div>

            <div>

              <p className="text-sm text-muted-foreground">

                تاريخ الإنضمام
              </p>

              <p className="mt-1 font-semibold">

                {new Date(
                  user.createdAt,
                ).toLocaleDateString("ar-EG")}
              </p>
            </div>

            <div>

              <p className="text-sm text-muted-foreground">

                سلسلة الإنجازات
              </p>

              <p className="mt-1 font-semibold">

                {user.streak} يوم
              </p>
            </div>

            <div>

              <p className="text-sm text-muted-foreground">

                العملات
              </p>

              <p className="mt-1 font-semibold">

                {user.coins}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</main>
  );
}