import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  ArrowRight,
  Copy,
  FileQuestion,
  Swords,
} from "lucide-react";

import { auth } from "@/auth";

import { getTeacherBattleAction } from "@/actions/teacher/battle-controle";

import { TeacherBattleRealtime } from "@/components/battle/teacher-battle-realtime";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    battleId: string;
  }>;
}

export default async function TeacherBattlePage({
  params,
}: PageProps) {
  // =========================================================
  // AUTH
  // =========================================================

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "TEACHER") {
    redirect("/");
  }

  // =========================================================
  // DATA
  // =========================================================

  const { battleId } = await params;

  const result =
    await getTeacherBattleAction(
      battleId,
    );

  if (!result.success) {
    notFound();
  }

  const battle = result.data;

  // =========================================================
  // STATUS
  // =========================================================

  const status =
    battle.status === "LIVE"
      ? {
          label: "مباشر الآن",
          icon: "●",
        }
      : battle.status === "WAITING"
        ? {
            label: "غرفة الانتظار",
            icon: "◷",
          }
        : {
            label: "انتهى",
            icon: "✓",
          };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-background/50 py-10"
    >
      <div className="mx-auto max-w-375 px-4 py-5 sm:px-6 lg:px-8">

        {/* ================================================= */}
        {/* TOP NAVIGATION */}
        {/* ================================================= */}

        <div className="mb-5 flex items-center justify-between">

          <Link
            href="/teacher/battles"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />

            جميع التحديات
          </Link>

          {/* STATUS */}

          <div className="flex items-center gap-2">

            <span className="relative flex h-2.5 w-2.5">

              {battle.status === "LIVE" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}

              <span
                className={[
                  "relative inline-flex h-2.5 w-2.5 rounded-full",

                  battle.status === "LIVE"
                    ? "bg-emerald-500"
                    : battle.status ===
                        "WAITING"
                      ? "bg-amber-500"
                      : "bg-muted-foreground",
                ].join(" ")}
              />

            </span>

            <span className="text-xs font-semibold text-muted-foreground">
              {status.label}
            </span>

          </div>

        </div>

        {/* ================================================= */}
        {/* BATTLE HEADER */}
        {/* ================================================= */}

        <section className="relative mb-5 overflow-hidden rounded-[28px] border bg-background shadow-sm">

          {/* Decorative background */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">

            <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

            <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-primary/4 blur-3xl" />

          </div>

          <div className="relative p-6 sm:p-8">

            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              {/* ================================================= */}
              {/* TITLE */}
              {/* ================================================= */}

              <div className="flex items-start gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-primary text-primary-foreground shadow-lg shadow-primary/20">

                  <Swords className="h-8 w-8" />

                </div>

                <div>

                  <div className="mb-2 flex flex-wrap items-center gap-2">

                    <Badge
                      variant="secondary"
                      className="rounded-lg px-2.5 py-1 text-[11px]"
                    >
                      تحدي جماعي
                    </Badge>

                    <span className="text-xs text-muted-foreground">
                      {battle.questions.length} سؤال
                    </span>

                  </div>

                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    {battle.title}
                  </h1>

                  <p className="mt-2 text-sm text-muted-foreground">
                    تحكم في غرفة التحدي وتابع جاهزية اللاعبين قبل البداية.
                  </p>

                </div>

              </div>

              {/* ================================================= */}
              {/* JOIN CODE */}
              {/* ================================================= */}

              <div className="rounded-2xl border bg-muted/30 p-4">

                <div className="flex items-center gap-5">

                  <div>

                    <p className="text-[11px] font-semibold text-muted-foreground">
                      كود التحدي
                    </p>

                    <p className="mt-1 font-mono text-2xl font-black tracking-[0.22em]">
                      {battle.code}
                    </p>

                  </div>

                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-10 w-10 rounded-xl"
                    title="نسخ الكود"
                    type="button"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* REALTIME LOBBY + TEAMS */}
        {/* ================================================= */}

        <TeacherBattleRealtime
          battleId={battle.id}
          invitations={battle.invitations}
          participants={battle.participants}
          initialStatus={battle.status}
        />

        {/* ================================================= */}
        {/* QUESTIONS */}
        {/* ================================================= */}

        <section className="mb-28 rounded-[28px] border bg-background shadow-sm">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b px-5 py-5 sm:px-6">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">

                  <FileQuestion className="h-4 w-4" />

                </div>

                <h2 className="font-black">
                  أسئلة التحدي
                </h2>

              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                ترتيب الأسئلة ووقت ونقاط كل سؤال.
              </p>

            </div>

            <Badge
              variant="secondary"
              className="rounded-xl"
            >
              {battle.questions.length}
            </Badge>

          </div>

          {/* QUESTIONS LIST */}

          <div className="divide-y">

            {battle.questions.map(
              (question, index) => {
                const isCurrent =
                  index ===
                  battle.currentQuestion;

                return (
                  <div
                    key={question.id}
                    className={[
                      "flex items-center gap-4 px-5 py-4 transition-colors sm:px-6",

                      isCurrent
                        ? "bg-primary/[0.035]"
                        : "",
                    ].join(" ")}
                  >

                    {/* QUESTION NUMBER */}

                    <div
                      className={[
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black",

                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {String(
                        index + 1,
                      ).padStart(2, "0")}
                    </div>

                    {/* QUESTION */}

                    <div className="min-w-0 flex-1">

                      <p className="line-clamp-2 text-sm font-semibold">
                        {question.question}
                      </p>

                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">

                        <span>
                          {question.points} نقطة
                        </span>

                        <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />

                        <span>
                          {question.timeLimit} ثانية
                        </span>

                      </div>

                    </div>

                    {/* CURRENT */}

                    {isCurrent && (
                      <Badge className="hidden rounded-lg sm:flex">
                        السؤال الحالي
                      </Badge>
                    )}

                  </div>
                );
              },
            )}

          </div>

        </section>

      </div>
    </main>
  );
}