"use client";

import { useEffect, useState } from "react";

import { onValue, type Unsubscribe } from "firebase/database";

import { getBattleRoomRef } from "@/lib/battle/room";

// =========================================================
// TYPES
// =========================================================

export interface BattleRealtimePlayer {
  team: "TEAM_A" | "TEAM_B";
  ready: boolean;
  connected: boolean;
}

export interface BattleRealtimeState {
  status: "WAITING" | "LIVE" | "FINISHED";

  currentQuestion: number;

  startedAt: number | null;

  questionStartedAt: number | null;

  players: Record<
    string,
    BattleRealtimePlayer
  >;
}

// =========================================================
// HOOK
// =========================================================

export function useBattleRealtime(battleId: string) {
  const [state, setState] = useState<BattleRealtimeState | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!battleId) {
      setLoading(false);
      return;
    }

    // =====================================================
    // FIREBASE REF
    // =====================================================

    const battleRef = getBattleRoomRef(battleId);

    let unsubscribe: Unsubscribe | undefined;

    // =====================================================
    // LISTENER
    // =====================================================

    try {
      unsubscribe = onValue(
        battleRef,
        (snapshot) => {
          const data = snapshot.val();

          // ===============================================
          // ROOM DOES NOT EXIST
          // ===============================================

          if (!data) {
            setState(null);
            setLoading(false);
            return;
          }

          // ===============================================
          // NORMALIZE STATE
          // ===============================================

          const normalizedState: BattleRealtimeState = {
            status: data.status ?? "WAITING",
            questionStartedAt:
              typeof data.questionStartedAt === "number"
                ? data.questionStartedAt
                : null,
            currentQuestion:
              typeof data.currentQuestion === "number"
                ? data.currentQuestion
                : 0,

            startedAt:
              typeof data.startedAt === "number" ? data.startedAt : null,

            players: data.players ?? {},
          };

          setState(normalizedState);

          setLoading(false);
          setError(null);
        },
        (firebaseError) => {
          console.error("BATTLE_REALTIME_ERROR:", firebaseError);

          setError("تعذر الاتصال بالتحدي");

          setLoading(false);
        },
      );
    } catch (error) {
      console.error("BATTLE_REALTIME_SETUP_ERROR:", error);

      setError("حدث خطأ أثناء الاتصال بالتحدي");

      setLoading(false);
    }

    // =====================================================
    // CLEANUP
    // =====================================================

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [battleId]);

  // =======================================================
  // RETURN
  // =======================================================

  return {
    state,
    loading,
    error,
  };
}
