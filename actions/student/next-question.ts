// actions/student/next-question.ts

"use server";

import {
  prisma,
} from "@/lib/prisma";

import {
  realtimeDb,
} from "@/lib/firebase";

import {
  get,
  ref,
  update,
} from "firebase/database";

import {
  revalidatePath,
} from "next/cache";

// =========================================
// NEXT QUESTION
// =========================================

export async function nextBattleQuestionAction(
  battleId: string,
) {
  // =========================================
  // ROOM
  // =========================================

  const room =
    await prisma.battleRoom.findUnique(
      {
        where: {
          id: battleId,
        },

        include: {
          questions: {
            orderBy: {
              order:
                "asc",
            },
          },

          participants: true,
        },
      },
    );

  if (!room) {
    throw new Error(
      "التحدي غير موجود",
    );
  }

  // =========================================
  // FIREBASE
  // =========================================

  const roomRef =
    ref(
      realtimeDb,
      `battleRooms/${battleId}`,
    );

  const roomSnapshot =
    await get(roomRef);

  const roomState =
    roomSnapshot.val();

  if (!roomState) {
    throw new Error(
      "حالة التحدي غير موجودة",
    );
  }

  // =========================================
  // LOCK
  // =========================================

  if (
    roomState.transitioning
  ) {
    return;
  }

  // =========================================
  // ENABLE LOCK
  // =========================================

  await update(
    roomRef,

    {
      transitioning: true,
    },
  );

  try {
    // =========================================
    // CURRENT INDEX
    // =========================================

    const currentIndex =
      roomState.currentQuestionIndex ??
      0;

    const nextIndex =
      currentIndex + 1;

    // =========================================
    // FINISHED
    // =========================================

    if (
      nextIndex >=
      room.questions.length
    ) {
      // PRISMA

      await prisma.battleRoom.update(
        {
          where: {
            id: battleId,
          },

          data: {
            status:
              "FINISHED",
          },
        },
      );

      // FIREBASE

      await update(
        roomRef,

        {
          status:
            "FINISHED",

          questionStarted: false,

          transitioning: false,
        },
      );

      // REVALIDATE

      revalidatePath(
        `/student/battles/${battleId}`,
      );

      revalidatePath(
        `/teacher/battles/${battleId}`,
      );

      revalidatePath(
        `/teacher/battles/${battleId}/live`,
      );

      return;
    }

    // =========================================
    // NEXT QUESTION
    // =========================================

    const nextQuestion =
      room.questions[
        nextIndex
      ];

    if (!nextQuestion) {
      throw new Error(
        "السؤال التالي غير موجود",
      );
    }

    // =========================================
    // RESET ANSWERS
    // =========================================

    const updates: Record<
      string,
      any
    > = {};

    room.participants.forEach(
      (
        participant,
      ) => {
        updates[
          `participants/${participant.studentId}/answered`
        ] = false;

        updates[
          `participants/${participant.studentId}/lastAnswer`
        ] = null;
      },
    );

    // =========================================
    // QUESTION STATE
    // =========================================

    updates[
      "currentQuestionIndex"
    ] = nextIndex;

    updates[
      "questionStarted"
    ] = true;

    updates[
      "questionStartedAt"
    ] = Date.now();

    updates[
      "questionEndsAt"
    ] =
      Date.now() +
      nextQuestion.timeLimit *
        1000;

    updates[
      "transitioning"
    ] = false;

    // =========================================
    // UPDATE FIREBASE
    // =========================================

    await update(
      roomRef,
      updates,
    );

    // =========================================
    // REVALIDATE
    // =========================================

    revalidatePath(
      `/student/battles/${battleId}`,
    );

    revalidatePath(
      `/teacher/battles/${battleId}`,
    );

    revalidatePath(
      `/teacher/battles/${battleId}/live`,
    );

    return {
      success: true,
    };
  } catch (error) {
    // =========================================
    // UNLOCK ON ERROR
    // =========================================

    await update(
      roomRef,

      {
        transitioning: false,
      },
    );

    throw error;
  }
}