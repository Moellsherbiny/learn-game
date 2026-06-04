import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import {
  Swords,
  Users,
  Trophy,
  Play,
  Pencil,
  Plus,
  Clock3,
  CheckCircle2,
  XCircle,
  Crown,
  ArrowRight,
} from "lucide-react";

import { auth } from "@/auth";

import { getBattleRoomAction } from "@/actions/teacher/battle";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import StartBattleButton from "@/components/teacher/battle/start-battle-button";
import { Button } from "@/components/ui/button";
import LiveReadyStatus from "@/components/teacher/battle/live-ready-status";
export const dynamic = "force-dynamic";
interface PageProps {
  params: Promise<{
    battleId: string;
  }>;
}

export default async function BattleRoomPage({ params }: PageProps) {
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
  // TEAMS
  // =========================================

  const teamA = battle.participants.filter(
    (participant) => participant.team === "TEAM_A",
  );

  const teamB = battle.participants.filter(
    (participant) => participant.team === "TEAM_B",
  );

  // =========================================
  // UI
  // =========================================

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge
                variant={
                  battle.status === "LIVE"
                    ? "default"
                    : battle.status === "WAITING"
                      ? "secondary"
                      : "outline"
                }
                className="rounded-xl px-4 py-1.5"
              >
                {battle.status === "LIVE"
                  ? "🔥 مباشر الآن"
                  : battle.status === "WAITING"
                    ? "⏳ بانتظار البدء"
                    : "🏁 انتهى"}
              </Badge>

              <Badge variant="outline" className="rounded-xl px-4 py-1.5">
                كود الغرفة:
                <span className="ml-2 font-black text-primary">
                  {battle.code}
                </span>
              </Badge>
            </div>

            <h1 className="flex items-center gap-3 text-4xl font-black">
              <div className="rounded-3xl bg-primary/10 p-4 text-primary">
                <Swords className="h-8 w-8" />
              </div>

              {battle.title}
            </h1>

            <p className="mt-3 text-muted-foreground">
              إدارة التحدي ومتابعة الطلاب مباشرة
            </p>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-3">
            <StartBattleButton
              battleId={battle.id}
              status={battle.status}
              participants={battle.participants}
            />

            <Button asChild size="lg" variant="outline" className="rounded-2xl">
              <Link href={`/teacher/battles/${battle.id}/edit`}>
                <Pencil className="mr-2 h-5 w-5" />
                تعديل
              </Link>
            </Button>
          </div>
        </div>

        {/* ========================================= */}
        {/* STATS */}
        {/* ========================================= */}

        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-3xl">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                <Users className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">المشاركون</p>

                <h2 className="text-3xl font-black">
                  {battle.participants.length}
                </h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-amber-500/10 p-4 text-amber-500">
                <Trophy className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">الأسئلة</p>

                <h2 className="text-3xl font-black">
                  {battle.questions.length}
                </h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-blue-500/10 p-4 text-blue-500">
                <Clock3 className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">السؤال الحالي</p>

                <h2 className="text-3xl font-black">
                  {battle.activeQuestion
                    ? battle.activeQuestion.question
                    : "لا يوجد سؤال حالي"}
                </h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-500">
                <Crown className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">المتصدر</p>

                <h2 className="text-xl font-black">
                  {battle.teamAScore > battle.teamBScore
                    ? "الفريق A"
                    : battle.teamBScore > battle.teamAScore
                      ? "الفريق B"
                      : "تعادل"}
                </h2>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================= */}
        {/* CONTENT */}
        {/* ========================================= */}

        <div className="grid gap-8 xl:grid-cols-3">
          {/* ========================================= */}
          {/* QUESTIONS */}
          {/* ========================================= */}

          <div className="xl:col-span-2">
            <Card className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black">
                    أسئلة التحدي
                  </CardTitle>

                  <CardDescription className="mt-2">
                    إدارة جميع أسئلة التحدي
                  </CardDescription>
                </div>

                <Button asChild className="rounded-2xl">
                  <Link href={`/teacher/battles/${battle.id}/questions/new`}>
                    <Plus className="mr-2 h-5 w-5" />
                    إضافة سؤال
                  </Link>
                </Button>
              </CardHeader>

              <CardContent>
                {battle.questions.length === 0 ? (
                  <div className="rounded-3xl border border-dashed p-16 text-center">
                    <Trophy className="mx-auto mb-5 h-12 w-12 text-muted-foreground" />

                    <h3 className="text-2xl font-black">لا توجد أسئلة</h3>

                    <p className="mt-3 text-muted-foreground">
                      أضف أول سؤال للتحدي
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {battle.questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="rounded-3xl border bg-card p-6 transition-all hover:border-primary/40"
                      >
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 font-black text-primary">
                              {index + 1}
                            </div>

                            <div>
                              <h3 className="font-black">
                                {question.question}
                              </h3>

                              <div className="mt-2 flex gap-2">
                                <Badge className="rounded-xl">
                                  {question.type}
                                </Badge>

                                <Badge variant="outline" className="rounded-xl">
                                  {question.points} نقطة
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <Button
                            asChild
                            variant="outline"
                            className="rounded-2xl"
                          >
                            <Link
                              href={`/teacher/battles/questions/${question.id}`}
                            >
                              <ArrowRight className="h-5 w-5" />
                            </Link>
                          </Button>
                        </div>

                        {/* ANSWERS */}

                        {question.answers.length > 0 && (
                          <div className="space-y-3">
                            {question.answers.map((answer) => (
                              <div
                                key={answer.id}
                                className="flex items-center justify-between rounded-2xl border p-4"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                    {answer.student.name?.charAt(0)}
                                  </div>

                                  <div>
                                    <p className="font-semibold">
                                      {answer.student.name}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                      {answer.answer}
                                    </p>
                                  </div>
                                </div>

                                {answer.isCorrect ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ========================================= */}
          {/* TEAMS */}
          {/* ========================================= */}
          <LiveReadyStatus
            battleId={battle.id}
            participants={battle.participants}
          />
          <div className="space-y-8">
            {/* TEAM A */}

            <Card className="rounded-3xl border-red-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-black text-red-500">
                    🔴 الفريق A
                  </CardTitle>

                  <Badge className="rounded-xl bg-red-500">
                    {battle.teamAScore} نقطة
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {teamA.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
                    لا يوجد طلاب
                  </div>
                ) : (
                  teamA.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between rounded-2xl border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 font-black text-red-500">
                          {participant.student.name?.charAt(0)}
                        </div>

                        <div>
                          <p className="font-bold">
                            {participant.student.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {participant.score} نقطة
                          </p>
                        </div>
                      </div>

                      {participant.isReady ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* TEAM B */}

            <Card className="rounded-3xl border-blue-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-black text-blue-500">
                    🔵 الفريق B
                  </CardTitle>

                  <Badge className="rounded-xl bg-blue-500">
                    {battle.teamBScore} نقطة
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {teamB.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
                    لا يوجد طلاب
                  </div>
                ) : (
                  teamB.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between rounded-2xl border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/10 font-black text-blue-500">
                          {participant.student.name?.charAt(0)}
                        </div>

                        <div>
                          <p className="font-bold">
                            {participant.student.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {participant.score} نقطة
                          </p>
                        </div>
                      </div>

                      {participant.isReady ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
