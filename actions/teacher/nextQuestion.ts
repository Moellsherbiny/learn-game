"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {realtimeDb} from "@/lib/firebase";

import {
  ref,
  update,
  serverTimestamp,
} from "firebase/database";

export async function nextBattleQuestionAction(
  battleId: string,
) {
  // =========================================
  // GET BATTLE
  // =========================================

  const battle =
    await prisma.battleRoom.findUnique({
      where: {
        id: battleId,
      },

      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

  if (!battle) {
    throw new Error(
      "التحدي غير موجود",
    );
  }

  // =========================================
  // NEXT QUESTION
  // =========================================

  const nextQuestion =
    battle.currentQuestion + 1;

  // =========================================
  // FINISH
  // =========================================

  if (
    nextQuestion >=
    battle.questions.length
  ) {
    await prisma.battleRoom.update({
      where: {
        id: battle.id,
      },

      data: {
        status: "FINISHED",
      },
    });

    // firebase

    await update(
      ref(
        realtimeDb,
        `battles/${battle.id}`,
      ),
      {
        phase: "finished",

        finishedAt:
          Date.now(),
      },
    );

    revalidatePath(
      `/teacher/battles/${battle.id}/live`,
    );

    return;
  }

  // =========================================
  // UPDATE PRISMA
  // =========================================

  await prisma.battleRoom.update({
    where: {
      id: battle.id,
    },

    data: {
      currentQuestion:
        nextQuestion,
    },
  });

  // =========================================
  // UPDATE FIREBASE
  // =========================================

  await update(
    ref(
      realtimeDb,
      `battles/${battle.id}`,
    ),
    {
      phase: "playing",

      currentQuestion:
        nextQuestion,

      questionStartedAt:
        serverTimestamp(),
    },
  );

  // =========================================
  // REVALIDATE
  // =========================================

  revalidatePath(
    `/teacher/battles/${battle.id}/live`,
  );
}