
import {
  notFound,
  redirect,
} from "next/navigation";

import Link from "next/link";

import {
  Trophy,
  Medal,
  Crown,
  ArrowLeft,
  Users,
  Target,
  Sparkles,
} from "lucide-react";

import { auth } from "@/auth";

import {
  getBattleRoomAction,
} from "@/actions/teacher/battle";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export const dynamic =
  "force-dynamic";

interface PageProps {
  params: Promise<{
    battleId: string;
  }>;
}

export default async function BattleResultsPage({
  params,
}: PageProps) {
  // =========================================
  // AUTH
  // =========================================

  const session =
    await auth();

  if (
    !session?.user?.id
  ) {
    redirect("/login");
  }

  if (
    session.user.role !==
    "TEACHER"
  ) {
    redirect("/");
  }

  // =========================================
  // PARAMS
  // =========================================

  const {
    battleId,
  } = await params;

  // =========================================
  // DATA
  // =========================================

  const battle =
    await getBattleRoomAction(
      battleId,
    );

  if (!battle) {
    notFound();
  }

  // =========================================
  // SORT PLAYERS
  // =========================================

  const sortedPlayers =
    [
      ...battle.participants,
    ].sort(
      (a, b) =>
        b.score -
        a.score,
    );

  // =========================================
  // TEAMS SCORE
  // =========================================

  const teamAScore =
    battle.participants
      .filter(
        (p) =>
          p.team ===
          "TEAM_A",
      )
      .reduce(
        (
          total,
          player,
        ) =>
          total +
          player.score,
        0,
      );

  const teamBScore =
    battle.participants
      .filter(
        (p) =>
          p.team ===
          "TEAM_B",
      )
      .reduce(
        (
          total,
          player,
        ) =>
          total +
          player.score,
        0,
      );

  // =========================================
  // WINNER
  // =========================================

  const winner =
    teamAScore >
    teamBScore
      ? "TEAM A"
      : teamBScore >
          teamAScore
        ? "TEAM B"
        : "DRAW";

  const topPlayer =
    sortedPlayers[0];

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

              <Badge className="rounded-xl bg-green-600 px-4 py-1.5 text-white">

                FINISHED
              </Badge>

              <Badge
                variant="outline"
                className="rounded-xl px-4 py-1.5"
              >
                {battle.code}
              </Badge>
            </div>

            <h1 className="text-5xl font-black">

              نتائج التحدي
            </h1>

            <p className="mt-3 text-lg text-muted-foreground">

              {battle.title}
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="rounded-2xl"
          >

            <Link
              href={`/teacher/battles/${battle.id}`}
              prefetch={false}
            >

              <ArrowLeft className="mr-2 h-5 w-5" />

              العودة
            </Link>
          </Button>
        </div>

        {/* ========================================= */}
        {/* WINNER CARD */}
        {/* ========================================= */}

        <Card className="mb-10 overflow-hidden rounded-[2rem] border-0 bg-linear-to-r from-yellow-400 via-orange-500 to-amber-600 text-white shadow-2xl">

          <CardContent className="flex flex-col items-center justify-center p-14 text-center">

            <div className="mb-6 rounded-full bg-white/20 p-6">

              <Trophy className="h-16 w-16" />
            </div>

            <p className="text-xl opacity-90">

              الفائز بالتحدي
            </p>

            <h2 className="mt-4 text-7xl font-black">

              {winner}
            </h2>

            <p className="mt-6 text-lg opacity-80">

              مجموع النقاط الأعلى
            </p>
          </CardContent>
        </Card>

        {/* ========================================= */}
        {/* TEAM SCORE */}
        {/* ========================================= */}

        <div className="mb-10 grid gap-6 lg:grid-cols-2">

          {/* TEAM A */}

          <Card className="rounded-3xl border-0 bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-xl">

            <CardContent className="p-8">

              <div className="flex items-center justify-between">

                <div>

                  <p className="opacity-80">

                    الفريق الأول
                  </p>

                  <h2 className="mt-2 text-4xl font-black">

                    TEAM A
                  </h2>
                </div>

                <Users className="h-12 w-12" />
              </div>

              <div className="mt-8 text-7xl font-black">

                {teamAScore}
              </div>

              <p className="mt-3 opacity-80">

                نقطة
              </p>
            </CardContent>
          </Card>

          {/* TEAM B */}

          <Card className="rounded-3xl border-0 bg-linear-to-br from-fuchsia-500 to-purple-700 text-white shadow-xl">

            <CardContent className="p-8">

              <div className="flex items-center justify-between">

                <div>

                  <p className="opacity-80">

                    الفريق الثاني
                  </p>

                  <h2 className="mt-2 text-4xl font-black">

                    TEAM B
                  </h2>
                </div>

                <Users className="h-12 w-12" />
              </div>

              <div className="mt-8 text-7xl font-black">

                {teamBScore}
              </div>

              <p className="mt-3 opacity-80">

                نقطة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ========================================= */}
        {/* TOP PLAYER */}
        {/* ========================================= */}

        {topPlayer && (
          <Card className="mb-10 overflow-hidden rounded-[2rem] border-0 bg-linear-to-r from-violet-600 to-indigo-700 text-white shadow-2xl">

            <CardContent className="flex flex-col items-center justify-center p-12 text-center">

              <div className="mb-5 rounded-full bg-white/20 p-5">

                <Crown className="h-14 w-14" />
              </div>

              <Avatar className="mb-6 h-28 w-28 border-4 border-white">

                <AvatarImage
                  src={
                    topPlayer
                      .student
                      .image ??
                    ""
                  }
                />

                <AvatarFallback className="text-3xl font-black text-black">

                  {topPlayer.student.name?.charAt(
                    0,
                  ) ?? "S"}
                </AvatarFallback>
              </Avatar>

              <p className="text-xl opacity-80">

                أفضل لاعب
              </p>

              <h2 className="mt-3 text-5xl font-black">

                {
                  topPlayer
                    .student
                    .name
                }
              </h2>

              <div className="mt-6 flex items-center gap-3 rounded-full bg-white/20 px-6 py-3">

                <Sparkles className="h-5 w-5" />

                <span className="text-2xl font-black">

                  {
                    topPlayer.score
                  }{" "}
                  نقطة
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================= */}
        {/* PLAYERS */}
        {/* ========================================= */}

        <div className="grid gap-5">

          {sortedPlayers.map(
            (
              player,
              index,
            ) => (
              <Card
                key={
                  player.id
                }
                className="rounded-3xl border-0 shadow-lg transition-all hover:shadow-2xl"
              >

                <CardContent className="p-6">

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* LEFT */}

                    <div className="flex items-center gap-5">

                      {/* RANK */}

                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-3xl font-black text-primary">

                        {index ===
                        0 ? (
                          <Crown className="h-8 w-8" />
                        ) : index ===
                          1 ? (
                          <Medal className="h-8 w-8" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* AVATAR */}

                      <Avatar className="h-16 w-16">

                        <AvatarImage
                          src={
                            player
                              .student
                              .image ??
                            ""
                          }
                        />

                        <AvatarFallback>

                          {player.student.name?.charAt(
                            0,
                          ) ?? "S"}
                        </AvatarFallback>
                      </Avatar>

                      {/* INFO */}

                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="text-2xl font-black">

                            {
                              player
                                .student
                                .name
                            }
                          </h3>

                          <Badge
                            className={`rounded-xl ${
                              player.team ===
                              "TEAM_A"
                                ? "bg-blue-600"
                                : "bg-fuchsia-600"
                            } text-white`}
                          >

                            {
                              player.team
                            }
                          </Badge>
                        </div>

                        <div className="mt-3 flex items-center gap-3 text-muted-foreground">

                          <Target className="h-4 w-4" />

                          مركز رقم{" "}
                          {index + 1}
                        </div>
                      </div>
                    </div>

                    {/* SCORE */}

                    <div className="text-center">

                      <div className="text-6xl font-black">

                        {
                          player.score
                        }
                      </div>

                      <p className="mt-2 text-muted-foreground">

                        نقطة
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      </div>
    </main>
  );
}