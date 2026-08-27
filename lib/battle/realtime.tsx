import {
  ref,
  set,
  update,
  remove,
} from "firebase/database";

import { realtimeDb } from "@/lib/firebase";

/* =========================================================
   TYPES
========================================================= */

export type BattleRealtimeStatus =
  | "WAITING"
  | "LIVE"
  | "FINISHED";

export interface BattleRealtimePlayer {
  team: "TEAM_A" | "TEAM_B";
  ready: boolean;
  connected: boolean;
}

export interface BattleRealtimeRoom {
  status: BattleRealtimeStatus;
  currentQuestion: number;
  startedAt: number | null;

  players: Record<
    string,
    BattleRealtimePlayer
  >;
}

/* =========================================================
   CREATE BATTLE ROOM
========================================================= */

export async function createBattleRealtimeRoom(
  battleId: string,
  players: Array<{
    studentId: string;
    team: "TEAM_A" | "TEAM_B";
  }>,
) {
  const roomRef = ref(
    realtimeDb,
    `battleRooms/${battleId}`,
  );

  const playerState: Record<
    string,
    BattleRealtimePlayer
  > = {};

  for (const player of players) {
    playerState[player.studentId] = {
      team: player.team,
      ready: false,
      connected: false,
    };
  }

  const room: BattleRealtimeRoom = {
    status: "WAITING",
    currentQuestion: 0,
    startedAt: null,
    players: playerState,
  };

  await set(roomRef, room);

  return room;
}

/* =========================================================
   UPDATE PLAYER
========================================================= */

export async function updateBattlePlayer(
  battleId: string,
  studentId: string,
  data: Partial<BattleRealtimePlayer>,
) {
  const playerRef = ref(
    realtimeDb,
    `battleRooms/${battleId}/players/${studentId}`,
  );

  await update(playerRef, data);
}

/* =========================================================
   SET PLAYER READY
========================================================= */

export async function setBattlePlayerReady(
  battleId: string,
  studentId: string,
  ready: boolean,
) {
  await updateBattlePlayer(
    battleId,
    studentId,
    {
      ready,
    },
  );
}

/* =========================================================
   SET PLAYER CONNECTION
========================================================= */

export async function setBattlePlayerConnected(
  battleId: string,
  studentId: string,
  connected: boolean,
) {
  await updateBattlePlayer(
    battleId,
    studentId,
    {
      connected,
    },
  );
}

/* =========================================================
   UPDATE BATTLE STATUS
========================================================= */

export async function updateBattleRealtimeStatus(
  battleId: string,
  status: BattleRealtimeStatus,
) {
  const battleRef = ref(
    realtimeDb,
    `battleRooms/${battleId}`,
  );

  await update(battleRef, {
    status,
  });
}

/* =========================================================
   UPDATE CURRENT QUESTION
========================================================= */

export async function updateBattleCurrentQuestion(
  battleId: string,
  currentQuestion: number,
) {
  const battleRef = ref(
    realtimeDb,
    `battleRooms/${battleId}`,
  );

  await update(battleRef, {
    currentQuestion,
  });
}

/* =========================================================
   START BATTLE
========================================================= */

export async function startBattleRealtime(
  battleId: string,
  startedAt = Date.now(),
) {
  const battleRef = ref(
    realtimeDb,
    `battleRooms/${battleId}`,
  );

  await update(battleRef, {
    status: "LIVE",
    currentQuestion: 0,
    startedAt,
  });
}

/* =========================================================
   FINISH BATTLE
========================================================= */

export async function finishBattleRealtime(
  battleId: string,
) {
  const battleRef = ref(
    realtimeDb,
    `battleRooms/${battleId}`,
  );

  await update(battleRef, {
    status: "FINISHED",
  });
}

/* =========================================================
   DELETE BATTLE REALTIME ROOM
========================================================= */

export async function deleteBattleRealtimeRoom(
  battleId: string,
) {
  const battleRef = ref(
    realtimeDb,
    `battleRooms/${battleId}`,
  );

  await remove(battleRef);
}