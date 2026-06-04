
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Trophy,
  Crown,
  Zap,
  Target,
} from "lucide-react";

import {
  realtimeDb,
} from "@/lib/firebase";

import {
  onValue,
  ref,
} from "firebase/database";

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
} from "@/components/ui/card";

// =========================================
// TYPES
// =========================================

interface Participant {
  id: string;

  score: number;

  team:
    | "TEAM_A"
    | "TEAM_B";

  student: {
    id: string;

    name:
      | string
      | null;

    image:
      | string
      | null;
  };
}

interface FirebaseParticipant {
  id: string;

  score: number;

  team:
    | "TEAM_A"
    | "TEAM_B";

  name:
    | string
    | null;

  image:
    | string
    | null;
}

interface Props {
  battleId: string;

  participants: Participant[];
}

// =========================================
// COMPONENT
// =========================================

export default function LiveBattleScoreboard({
  battleId,
  participants,
}: Props) {
  // =========================================
  // STATE
  // =========================================

  const [
    liveParticipants,
    setLiveParticipants,
  ] = useState<
    FirebaseParticipant[]
  >(
    participants.map(
      (
        participant,
      ) => ({
        id:
          participant.student
            .id,

        score:
          participant.score,

        team:
          participant.team,

        name:
          participant
            .student
            .name,

        image:
          participant
            .student
            .image,
      }),
    ),
  );

  // =========================================
  // FIREBASE LISTENER
  // =========================================

  useEffect(() => {
    const battleRef =
      ref(
        realtimeDb,
        `battleRooms/${battleId}/participants`,
      );

    const unsubscribe =
      onValue(
        battleRef,
        (snapshot) => {
          const value =
            snapshot.val();

          if (!value) {
            return;
          }

          const parsed =
            Object.values(
              value,
            ) as FirebaseParticipant[];

          parsed.sort(
            (a, b) =>
              b.score -
              a.score,
          );

          setLiveParticipants(
            parsed,
          );
        },
      );

    return () =>
      unsubscribe();
  }, [battleId]);

  // =========================================
  // SORTED
  // =========================================

  const sortedParticipants =
    useMemo(() => {
      return [
        ...liveParticipants,
      ].sort(
        (a, b) =>
          b.score -
          a.score,
      );
    }, [liveParticipants]);

  // =========================================
  // TEAM SCORES
  // =========================================

  const teamAScore =
    sortedParticipants
      .filter(
        (player) =>
          player.team ===
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
    sortedParticipants
      .filter(
        (player) =>
          player.team ===
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
  // UI
  // =========================================

  return (
    <div className="space-y-8">

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-4xl font-black">

            Live Scoreboard
          </h2>

          <p className="mt-2 text-muted-foreground">

            تحديث مباشر لنتائج الطلاب
          </p>
        </div>

        <div className="flex items-center gap-4">

          <Badge className="rounded-xl bg-blue-600 px-5 py-2 text-white">

            TEAM A •{" "}
            {teamAScore}
          </Badge>

          <Badge className="rounded-xl bg-fuchsia-600 px-5 py-2 text-white">

            TEAM B •{" "}
            {teamBScore}
          </Badge>
        </div>
      </div>

      {/* ========================================= */}
      {/* PLAYERS */}
      {/* ========================================= */}

      <div className="grid gap-5">

        {sortedParticipants.map(
          (
            player,
            index,
          ) => {
            const isTopPlayer =
              index === 0;

            return (
              <Card
                key={
                  player.id
                }
                className={`overflow-hidden rounded-3xl border-0 shadow-xl transition-all ${
                  isTopPlayer
                    ? "bg-linear-to-r from-yellow-400 to-orange-500 text-white"
                    : ""
                }`}
              >

                <CardContent className="p-6">

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* LEFT */}

                    <div className="flex items-center gap-5">

                      {/* RANK */}

                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-3xl text-3xl font-black ${
                          isTopPlayer
                            ? "bg-white/20"
                            : "bg-primary/10 text-primary"
                        }`}
                      >

                        {index + 1}
                      </div>

                      {/* AVATAR */}

                      <Avatar className="h-16 w-16 border-4 border-background">

                        <AvatarImage
                          src={
                            player.image ??
                            ""
                          }
                        />

                        <AvatarFallback>

                          {player.name?.charAt(
                            0,
                          ) ?? "S"}
                        </AvatarFallback>
                      </Avatar>

                      {/* INFO */}

                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="text-2xl font-black">

                            {
                              player.name
                            }
                          </h3>

                          {isTopPlayer && (
                            <Badge className="rounded-xl bg-white/20 text-white">

                              <Crown className="mr-1 h-4 w-4" />

                              المتصدر
                            </Badge>
                          )}

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

                        <div className="mt-3 flex items-center gap-4 text-sm opacity-80">

                          <div className="flex items-center gap-2">

                            <Target className="h-4 w-4" />

                            إجابات مباشرة
                          </div>

                          <div className="flex items-center gap-2">

                            <Zap className="h-4 w-4" />

                            تفاعل حي
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}

                    <div className="flex items-center gap-6">

                      {isTopPlayer && (
                        <div className="rounded-3xl bg-white/20 p-4">

                          <Trophy className="h-10 w-10" />
                        </div>
                      )}

                      <div className="text-center">

                        <div className="text-6xl font-black">

                          {
                            player.score
                          }
                        </div>

                        <p className="mt-2 text-sm opacity-80">

                          نقطة
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          },
        )}
      </div>
    </div>
  );
}