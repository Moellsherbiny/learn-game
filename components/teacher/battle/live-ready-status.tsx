"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ref,
  onValue,
} from "firebase/database";

import {
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { realtimeDb } from "@/lib/firebase";

interface Participant {
  id: string;

  studentId: string;

  student: {
    name: string | null;
  };

  team: "TEAM_A" | "TEAM_B";
}

interface Props {
  battleId: string;

  participants: Participant[];
}

export default function LiveReadyStatus({
  battleId,
  participants,
}: Props) {
  // =========================================
  // STATE
  // =========================================

  const [
    readyMap,
    setReadyMap,
  ] = useState<
    Record<
      string,
      boolean
    >
  >({});

  // =========================================
  // FIREBASE
  // =========================================

  useEffect(() => {
    const readyRef =
      ref(
        realtimeDb,
        `battles/${battleId}/ready`,
      );

    const unsubscribe =
      onValue(
        readyRef,
        (
          snapshot,
        ) => {
          setReadyMap(
            snapshot.val() ||
              {},
          );
        },
      );

    return () =>
      unsubscribe();
  }, [battleId]);

  // =========================================
  // COUNTS
  // =========================================

  const teamAReady =
    participants.filter(
      (participant) =>
        participant.team ===
          "TEAM_A" &&
        readyMap[
          participant
            .studentId
        ],
    ).length;

  const teamBReady =
    participants.filter(
      (participant) =>
        participant.team ===
          "TEAM_B" &&
        readyMap[
          participant
            .studentId
        ],
    ).length;

  // =========================================
  // UI
  // =========================================

  return (
    <div className="space-y-8">

      {/* STATUS */}

      <div
        className="
          rounded-3xl
          border
          bg-card
          p-6
        "
      >

        <h2 className="mb-5 text-2xl font-black">

          حالة الجاهزية
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">

          <div
            className="
              rounded-2xl
              border
              p-5
            "
          >

            <p className="text-sm text-muted-foreground">

              الفريق A
            </p>

            <h3 className="mt-2 text-4xl font-black text-red-500">

              {teamAReady}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">

              جاهز
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border
              p-5
            "
          >

            <p className="text-sm text-muted-foreground">

              الفريق B
            </p>

            <h3 className="mt-2 text-4xl font-black text-blue-500">

              {teamBReady}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">

              جاهز
            </p>
          </div>
        </div>
      </div>

      {/* PLAYERS */}

      <div className="space-y-4">

        {participants.map(
          (
            participant,
          ) => {
            const isReady =
              readyMap[
                participant
                  .studentId
              ];

            return (
              <div
                key={
                  participant.id
                }
                className="
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  p-4
                "
              >

                <div>

                  <p className="font-bold">

                    {
                      participant
                        .student
                        .name
                    }
                  </p>

                  <p className="text-sm text-muted-foreground">

                    {
                      participant.team
                    }
                  </p>
                </div>

                {isReady ? (
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-emerald-500
                    "
                  >

                    <CheckCircle2 className="h-5 w-5" />

                    جاهز
                  </div>
                ) : (
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-muted-foreground
                    "
                  >

                    <XCircle className="h-5 w-5" />

                    ينتظر
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}