import { redirect, notFound } from "next/navigation";

import Link from "next/link";

import { ArrowLeft, Radio, Trophy, Users, Target, Clock3 } from "lucide-react";

import { auth } from "@/auth";

import { getBattleRoomAction } from "@/actions/teacher/battle";

import LiveBattleScoreboard from "@/components/teacher/battle/live-battle-scoreboard";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
import EndBattleButton from "@/components/teacher/battle/end-battle-button";
import NextQuestionButton from "@/components/teacher/battle/next-question-button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    battleId: string;
  }>;
}

export default async function BattleLivePage({ params }: PageProps) {
  // =========================================
  // AUTH
  // =========================================

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "TEACHER") {
    redirect("/");
  }

  // =========================================
  // PARAMS
  // =========================================

  const { battleId } = await params;

  // =========================================
  // DATA
  // =========================================

  const battle = await getBattleRoomAction(battleId);

  if (!battle) {
    notFound();
  }

  // =========================================
  // TEAMS SCORE
  // =========================================

  const teamAScore = battle.participants
    .filter((p) => p.team === "TEAM_A")
    .reduce((total, participant) => total + participant.score, 0);

  const teamBScore = battle.participants
    .filter((p) => p.team === "TEAM_B")
    .reduce((total, participant) => total + participant.score, 0);

  // =========================================
  // CURRENT QUESTION
  // =========================================

  const currentQuestion = battle.questions[battle.currentQuestion];

  // =========================================
  // UI
  // =========================================

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="mb-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge className="rounded-xl bg-red-500 px-4 py-1.5 text-white">
                <Radio className="mr-2 h-4 w-4 animate-pulse" />
                LIVE
              </Badge>

              <Badge variant="outline" className="rounded-xl px-4 py-1.5">
                {battle.code}
              </Badge>

              <Badge variant="outline" className="rounded-xl px-4 py-1.5">
                {battle.participants.length} لاعب
              </Badge>
            </div>

            <h1 className="text-5xl font-black">{battle.title}</h1>

            <p className="mt-3 text-lg text-muted-foreground">
              متابعة التحدي مباشرة
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <NextQuestionButton battleId={battle.id} />

            <EndBattleButton battleId={battle.id} />
          </div>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href={`/teacher/battles/${battle.id}`} prefetch={false}>
              <ArrowLeft className="mr-2 h-5 w-5" />
              العودة
            </Link>
          </Button>
        </div>

        {/* ========================================= */}
        {/* SCORE BOARD */}
        {/* ========================================= */}

        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          {/* TEAM A */}

          <Card className="overflow-hidden rounded-3xl border-0 bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-2xl">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">الفريق الأول</p>

                  <h2 className="mt-2 text-4xl font-black">TEAM A</h2>
                </div>

                <div className="rounded-3xl bg-white/20 p-4">
                  <Users className="h-10 w-10" />
                </div>
              </div>

              <div className="text-7xl font-black">{teamAScore}</div>

              <p className="mt-3 text-lg opacity-80">نقطة</p>
            </CardContent>
          </Card>

          {/* TEAM B */}

          <Card className="overflow-hidden rounded-3xl border-0 bg-linear-to-br from-purple-500 to-fuchsia-700 text-white shadow-2xl">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">الفريق الثاني</p>

                  <h2 className="mt-2 text-4xl font-black">TEAM B</h2>
                </div>

                <div className="rounded-3xl bg-white/20 p-4">
                  <Users className="h-10 w-10" />
                </div>
              </div>

              <div className="text-7xl font-black">{teamBScore}</div>

              <p className="mt-3 text-lg opacity-80">نقطة</p>
            </CardContent>
          </Card>
        </div>

        {/* ========================================= */}
        {/* CURRENT QUESTION */}
        {/* ========================================= */}

        {currentQuestion && (
          <Card className="mb-10 rounded-3xl border-0 shadow-2xl">
            <CardContent className="p-10">
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <Badge className="rounded-xl px-4 py-1.5 text-sm">
                  السؤال {battle.currentQuestion + 1}
                </Badge>

                <Badge
                  variant="outline"
                  className="rounded-xl px-4 py-1.5 text-sm"
                >
                  {currentQuestion.type}
                </Badge>

                <Badge
                  variant="outline"
                  className="rounded-xl px-4 py-1.5 text-sm"
                >
                  <Clock3 className="mr-2 h-4 w-4" />
                  {currentQuestion.timeLimit}s
                </Badge>

                <Badge
                  variant="outline"
                  className="rounded-xl px-4 py-1.5 text-sm"
                >
                  <Target className="mr-2 h-4 w-4" />
                  {currentQuestion.points} نقطة
                </Badge>
              </div>

              <h2 className="text-4xl font-black leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* QUIZ OPTIONS */}

              {currentQuestion.type === "QUIZ" && (
                <div className="mt-10 grid gap-5 md:grid-cols-2">
                  {[
                    currentQuestion.optionA,

                    currentQuestion.optionB,

                    currentQuestion.optionC,

                    currentQuestion.optionD,
                  ]
                    .filter(Boolean)
                    .map((option, index) => (
                      <div
                        key={index}
                        className="rounded-3xl border bg-muted/40 p-6 text-xl font-bold"
                      >
                        {option}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ========================================= */}
        {/* LIVE SCOREBOARD */}
        {/* ========================================= */}

        <LiveBattleScoreboard
          battleId={battle.id}
          participants={battle.participants}
        />

        {/* ========================================= */}
        {/* WINNER */}
        {/* ========================================= */}

        <Card className="mt-10 rounded-3xl border-0 bg-linear-to-r from-yellow-400 to-orange-500 text-white shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <div className="mb-5 rounded-full bg-white/20 p-5">
              <Trophy className="h-14 w-14" />
            </div>

            <h2 className="text-5xl font-black">
              {teamAScore > teamBScore
                ? "TEAM A"
                : teamBScore > teamAScore
                  ? "TEAM B"
                  : "تعادل"}
            </h2>

            <p className="mt-4 text-xl opacity-90">المتصدر الحالي</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
