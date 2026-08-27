import { ref, update } from "firebase/database";

import { realtimeDb } from "@/lib/firebase";

// =========================================================
// BATTLE ROOM PATH
// =========================================================

export function getBattleRoomPath(
  battleId: string,
) {
  return `battleRooms/${battleId}`;
}

// =========================================================
// BATTLE ROOM REF
// =========================================================

export function getBattleRoomRef(
  battleId: string,
) {
  return ref(
    realtimeDb,
    getBattleRoomPath(battleId),
  );
}

// =========================================================
// PLAYER PATH
// =========================================================

export function getBattlePlayerPath(
  battleId: string,
  studentId: string,
) {
  return `${getBattleRoomPath(
    battleId,
  )}/players/${studentId}`;
}

// =========================================================
// PLAYER REF
// =========================================================

export function getBattlePlayerRef(
  battleId: string,
  studentId: string,
) {
  return ref(
    realtimeDb,
    getBattlePlayerPath(
      battleId,
      studentId,
    ),
  );
}

// =========================================================
// TYPES
// =========================================================

export interface CreateBattleRealtimePlayer {
  studentId: string;
  team: "TEAM_A" | "TEAM_B";
}

// =========================================================
// INITIALIZE BATTLE ROOM
// =========================================================

export async function createBattleRealtimeRoom(
  battleId: string,
  players: CreateBattleRealtimePlayer[],
) {
  const playerState: Record<
    string,
    {
      team:
        | "TEAM_A"
        | "TEAM_B";

      ready: boolean;
      connected: boolean;
    }
  > = {};

  for (const player of players) {
    playerState[
      player.studentId
    ] = {
      team: player.team,
      ready: false,
      connected: false,
    };
  }

  await update(
    getBattleRoomRef(battleId),
    {
      status: "WAITING",
      currentQuestion: 0,
      startedAt: null,
      players: playerState,
    },
  );
}