"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { realtimeDb } from "@/lib/firebase";

import {
  ref,
  set,
} from "firebase/database";

export async function initializeBattleRealtimeAction(
  battleId: string,
) {
  try {
    // =========================================
    // AUTH
    // =========================================

    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false as const,
        error: "يجب تسجيل الدخول أولًا",
      };
    }

    if (session.user.role !== "TEACHER") {
      return {
        success: false as const,
        error: "غير مصرح لك",
      };
    }

    // =========================================
    // GET BATTLE
    // =========================================

    const battle =
      await prisma.battleRoom.findFirst({
        where: {
          id: battleId,
          teacherId: session.user.id,
        },

        include: {
          invitations: {
            select: {
              studentId: true,
              team: true,
              status: true,
            },
          },
        },
      });

    if (!battle) {
      return {
        success: false as const,
        error: "التحدي غير موجود",
      };
    }

    // =========================================
    // CREATE PLAYERS STATE
    // =========================================

    const players: Record<
      string,
      {
        team: string;
        ready: boolean;
        connected: boolean;
      }
    > = {};

    for (const invitation of battle.invitations) {
      players[invitation.studentId] = {
        team: invitation.team,
        ready: false,
        connected: false,
      };
    }

    // =========================================
    // FIREBASE
    // =========================================

    const battleRef = ref(
      realtimeDb,
      `battleRooms/${battle.id}`,
    );

    await set(battleRef, {
      status: battle.status,
      currentQuestion:
        battle.currentQuestion,
      startedAt: null,
      players,
    });

    // =========================================
    // SUCCESS
    // =========================================

    return {
      success: true as const,
    };
  } catch (error) {
    console.error(
      "INITIALIZE_BATTLE_REALTIME_ERROR:",
      error,
    );

    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تهيئة التحدي",
    };
  }
}