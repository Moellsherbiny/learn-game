// app/page.tsx

import Link from "next/link";

import {
  ArrowLeft,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  Crown,
  Gamepad2,
  GraduationCap,
  Rocket,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

// =========================================
// PAGE
// =========================================

export default async function HomePage() {
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
  // DASHBOARD
  // =========================================

  const dashboardHref =
    session?.user.role === "TEACHER"
      ? "/teacher"
      : session?.user.role === "ADMIN"
        ? "/admin"
        : "/student";

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
      {/* =========================================
          NAVBAR
      ========================================= */}

      <Navbar />

      {/* =========================================
          HERO
      ========================================= */}

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pb-20 lg:px-8 lg:pt-36">
          <div className="mx-auto max-w-3xl text-center">

            <Badge
              variant="secondary"
              className="
                mb-5
                rounded-full
                px-3
                py-1
                text-xs
                font-medium
              "
            >
              منصة تعليمية تفاعلية
            </Badge>

            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                leading-[1.6]
                sm:text-4xl
                lg:text-5xl
              "
            >
              منصة تعليمية
              <span className="text-primary">
                {" "}قائمة على التلعيب
              </span>
            </h1>

            <p
              className="
                mx-auto
                mt-5
                max-w-2xl
                text-sm
                leading-loose
                text-muted-foreground
                sm:text-base
              "
            >
              نظام تعليمي تفاعلي يجمع بين المحتوى
              التعليمي، التقييم، التحديات الجماعية،
              وتتبع تقدم الطلاب.
            </p>

            {/* ACTIONS */}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {session?.user ? (
                <Button
                  asChild
                  size="lg"
                  className="
                    h-11
                    rounded-xl
                    px-6
                    text-sm
                    font-semibold
                  "
                >
                  <Link href={dashboardHref}>
                    لوحة التحكم
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="
                      h-11
                      rounded-xl
                      px-6
                      text-sm
                      font-semibold
                    "
                  >
                    <Link href="/auth/register">
                      <Rocket className="ml-2 h-4 w-4" />
                      ابدأ مجانًا
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="
                      h-11
                      rounded-xl
                      px-6
                      text-sm
                      font-medium
                    "
                  >
                    <Link href="/auth/login">
                      تسجيل الدخول
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* =========================================
              STATS
          ========================================= */}

          <div
            className="
              mx-auto
              mt-14
              grid
              max-w-5xl
              grid-cols-2
              gap-3
              sm:grid-cols-4
            "
          >
            <StatCard
              icon={<Users className="h-5 w-5" />}
              value={studentsCount}
              label="طالب"
            />

            <StatCard
              icon={<GraduationCap className="h-5 w-5" />}
              value={teachersCount}
              label="مدرس"
            />

            <StatCard
              icon={<Brain className="h-5 w-5" />}
              value={coursesCount}
              label="دورة"
            />

            <StatCard
              icon={<Swords className="h-5 w-5" />}
              value={battlesCount}
              label="تحدي"
            />
          </div>
        </div>
      </section>

      {/* =========================================
          FEATURES
      ========================================= */}

      <section
        id="features"
        className="border-b border-border/60"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="إمكانيات النظام"
            title="مكونات تعليمية متكاملة"
            description="مجموعة من الأدوات المصممة لدعم تجربة تعلم تفاعلية ومتابعة تقدم الطالب."
          />

          <div
            className="
              mt-10
              grid
              gap-4
              md:grid-cols-2
              lg:grid-cols-3
            "
          >
            <FeatureCard
              icon={<Gamepad2 className="h-5 w-5" />}
              title="التعلم التفاعلي"
              description="تحويل المحتوى التعليمي إلى أنشطة وأسئلة تفاعلية تساعد على زيادة مشاركة الطالب."
            />

            <FeatureCard
              icon={<Swords className="h-5 w-5" />}
              title="التحديات الجماعية"
              description="تنظيم تحديات تعليمية بين الطلاب مع عرض النتائج والنقاط أثناء التحدي."
            />

            <FeatureCard
              icon={<Trophy className="h-5 w-5" />}
              title="نظام التقدم"
              description="متابعة مستوى الطالب ونقاط الخبرة والإنجازات والتقدم داخل المقررات."
            />
          </div>
        </div>
      </section>

      {/* =========================================
          BATTLE
      ========================================= */}

      <section
        id="battle"
        className="border-b border-border/60"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">

            {/* TEXT */}

            <div>
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-xs"
              >
                التحديات الجماعية
              </Badge>

              <h2
                className="
                  mt-4
                  text-2xl
                  font-bold
                  leading-[1.6]
                  tracking-tight
                  sm:text-3xl
                "
              >
                بيئة تنافسية لدعم التعلم
              </h2>

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-loose
                  text-muted-foreground
                  sm:text-base
                "
              >
                يتيح النظام للطلاب المشاركة في تحديات
                جماعية والإجابة عن الأسئلة ومتابعة
                النتائج بصورة مباشرة.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <FeaturePill
                  icon={<Zap className="h-4 w-4" />}
                  text="نتائج مباشرة"
                />

                <FeaturePill
                  icon={<ShieldCheck className="h-4 w-4" />}
                  text="إدارة التحدي"
                />

                <FeaturePill
                  icon={<Trophy className="h-4 w-4" />}
                  text="نظام نقاط"
                />
              </div>
            </div>

            {/* BATTLE PREVIEW */}

            <Card className="overflow-hidden rounded-2xl">
              <CardContent className="p-0">

                <div className="border-b bg-muted/30 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      تحدي مباشر
                    </span>

                    <Badge
                      variant="secondary"
                      className="rounded-full text-xs"
                    >
                      مباشر
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3">

                    <TeamScore
                      label="الفريق A"
                      score={540}
                    />

                    <TeamScore
                      label="الفريق B"
                      score={480}
                    />

                  </div>

                  <div className="mt-4 rounded-xl border bg-muted/20 p-5">
                    <p className="text-xs text-muted-foreground">
                      سؤال تجريبي
                    </p>

                    <h3
                      className="
                        mt-3
                        text-base
                        font-semibold
                        leading-loose
                      "
                    >
                      تعد ............ من أشهر لغات البرمجة
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================================
          LEADERBOARD
      ========================================= */}

      <section
        id="leaderboard"
        className="border-b border-border/60"
      >
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">

          <SectionHeader
            eyebrow="لوحة الصدارة"
            title="تقدم الطلاب"
            description="عرض مختصر للطلاب الأعلى في نقاط الخبرة."
          />

          <div className="mt-10 overflow-hidden rounded-2xl border">
            {leaderboard.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                لا توجد بيانات متاحة حاليًا.
              </div>
            ) : (
              leaderboard.map((student, index) => (
                <LeaderboardRow
                  key={student.id}
                  student={student}
                  index={index}
                  isLast={
                    index ===
                    leaderboard.length - 1
                  }
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* =========================================
          CTA
      ========================================= */}

      {!session?.user && (
        <section>
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col items-center justify-between gap-6 p-8 text-center sm:flex-row sm:text-right">

                <div>
                  <h2
                    className="
                      text-xl
                      font-bold
                      leading-[1.7]
                    "
                  >
                    ابدأ باستخدام المنصة
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-xl
                      text-sm
                      leading-loose
                      text-muted-foreground
                    "
                  >
                    أنشئ حسابًا وابدأ في استكشاف
                    المحتوى والتحديات التعليمية.
                  </p>
                </div>

                <Button
                  asChild
                  className="
                    shrink-0
                    rounded-xl
                    px-6
                    font-semibold
                  "
                >
                  <Link href="/auth/register">
                    إنشاء حساب
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>

              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

// =========================================
// STAT CARD
// =========================================

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Card className="rounded-xl">
      <CardContent className="flex items-center gap-3 p-4">

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-primary/10
            text-primary
          "
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-lg font-bold">
            {value}
          </div>

          <p className="text-xs text-muted-foreground">
            {label}
          </p>
        </div>

      </CardContent>
    </Card>
  );
}

// =========================================
// SECTION HEADER
// =========================================

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">

      <Badge
        variant="secondary"
        className="rounded-full px-3 py-1 text-xs font-medium"
      >
        {eyebrow}
      </Badge>

      <h2
        className="
          mt-4
          text-2xl
          font-bold
          leading-[1.6]
          tracking-tight
          sm:text-3xl
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-3
          text-sm
          leading-loose
          text-muted-foreground
          sm:text-base
        "
      >
        {description}
      </p>

    </div>
  );
}

// =========================================
// FEATURE CARD
// =========================================

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-2xl transition-colors hover:border-primary/40">
      <CardContent className="p-6">

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            bg-primary/10
            text-primary
          "
        >
          {icon}
        </div>

        <h3
          className="
            mt-5
            text-base
            font-bold
            leading-[1.7]
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-2
            text-sm
            leading-loose
            text-muted-foreground
          "
        >
          {description}
        </p>

      </CardContent>
    </Card>
  );
}

// =========================================
// FEATURE PILL
// =========================================

function FeaturePill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-lg
        border
        bg-muted/20
        px-3
        py-2
        text-xs
        font-medium
      "
    >
      <span className="text-primary">
        {icon}
      </span>

      {text}
    </div>
  );
}

// =========================================
// TEAM SCORE
// =========================================

function TeamScore({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4 text-center">

      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {score}
      </p>

      <p className="mt-1 text-[11px] text-muted-foreground">
        نقطة
      </p>

    </div>
  );
}

// =========================================
// LEADERBOARD ROW
// =========================================

function LeaderboardRow({
  student,
  index,
  isLast,
}: {
  student: {
    id: string;
    name: string | null;
    image: string | null;
    xp: number;
    currentLevel: number;
  };
  index: number;
  isLast: boolean;
}) {
  return (
    <div
      className={`
        flex
        items-center
        justify-between
        gap-4
        px-4
        py-4
        sm:px-5
        ${!isLast ? "border-b" : ""}
      `}
    >
      <div className="flex min-w-0 items-center gap-3">

        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-muted
            text-xs
            font-bold
          "
        >
          {index + 1}
        </div>

        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage
            src={student.image || ""}
            alt={student.name || "Student"}
          />

          <AvatarFallback>
            {student.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {student.name || "بدون اسم"}
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            المستوى {student.currentLevel}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Crown className="h-4 w-4 text-muted-foreground" />

        <div className="text-left">
          <p className="text-sm font-bold">
            {student.xp}
          </p>

          <p className="text-[11px] text-muted-foreground">
            XP
          </p>
        </div>
      </div>
    </div>
  );
}