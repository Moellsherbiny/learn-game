// actions/student/battle.ts

"use server";

import {
  prisma,
} from "@/lib/prisma";

import {
  realtimeDb,
} from "@/lib/firebase";

import {
  ref,
  update,
  get,
} from "firebase/database";

import {
  revalidatePath,
} from "next/cache";
import { auth } from "@/auth";


async function requireStudent() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("يجب تسجيل الدخول أولاً");
  }

  if (session.user.role !== "STUDENT") {
    throw new Error("غير مصرح لك");
  }

  return session.user.id;
}

// =========================================
// TYPES
// =========================================

interface SubmitBattleAnswerInput {
  roomId: string;

  questionId: string;

  studentId: string;

  answer: string;

  responseTime: number;
}

// =========================================
// SUBMIT ANSWER
// =========================================

export async function submitBattleAnswerAction(
  data: SubmitBattleAnswerInput,
) {
  // =========================================
  // AUTH
  // =========================================

  const currentStudentId =
    await requireStudent();

  if (
    currentStudentId !==
    data.studentId
  ) {
    throw new Error(
      "غير مصرح لك",
    );
  }

  // =========================================
  // ROOM
  // =========================================

  const room =
    await prisma.battleRoom.findUnique(
      {
        where: {
          id: data.roomId,
        },

        include: {
          participants: true,

          questions: true,
        },
      },
    );

  if (!room) {
    throw new Error(
      "الغرفة غير موجودة",
    );
  }

  // =========================================
  // STATUS
  // =========================================

  if (
    room.status !==
    "LIVE"
  ) {
    throw new Error(
      "التحدي غير نشط",
    );
  }

  // =========================================
  // PARTICIPANT
  // =========================================

  const participant =
    room.participants.find(
      (p) =>
        p.studentId ===
        data.studentId,
    );

  if (!participant) {
    throw new Error(
      "أنت غير مشارك في هذا التحدي",
    );
  }

  // =========================================
  // QUESTION
  // =========================================

  const question =
    room.questions.find(
      (q) =>
        q.id ===
        data.questionId,
    );

  if (!question) {
    throw new Error(
      "السؤال غير موجود",
    );
  }

  // =========================================
  // FIREBASE PARTICIPANT
  // =========================================

const participantRef = ref(
  realtimeDb,
  `battles/${data.roomId}/participants/${data.studentId}`,
);

  const participantSnapshot =
    await get(
      participantRef,
    );

  const participantData =
    participantSnapshot.val();

  if (
    participantData
      ?.answered
  ) {
    throw new Error(
      "لقد أجبت بالفعل",
    );
  }

  // =========================================
  // CHECK ANSWER
  // =========================================

  const normalize =
    (
      text?: string | null,
    ) =>
      text
        ?.trim()
        .toLowerCase();

  const isCorrect =
    normalize(
      data.answer,
    ) ===
    normalize(
      question.answer,
    );

  // =========================================
  // POINTS
  // =========================================

  let earnedPoints = 0;

  if (isCorrect) {
    earnedPoints =
      Math.max(
        10,
        question.points -
          data.responseTime,
      );
  }

  // =========================================
  // SAVE ANSWER
  // =========================================

  await prisma.battleAnswer.create(
    {
      data: {
        questionId:
          question.id,

        studentId:
          data.studentId,

        answer:
          data.answer,

        isCorrect,

        responseTime:
          data.responseTime,
      },
    },
  );

  // =========================================
  // UPDATE PARTICIPANT SCORE
  // =========================================

  const updatedParticipant =
    await prisma.battleParticipant.update(
      {
        where: {
          id:
            participant.id,
        },

        data: {
          score: {
            increment:
              earnedPoints,
          },
        },
      },
    );

  // =========================================
  // FIREBASE UPDATE
  // =========================================

  await update(
    participantRef,

    {
      answered: true,

      lastAnswer:
        data.answer,

      score:
        updatedParticipant.score,
    },
  );

  // =========================================
  // CHECK IF ALL ANSWERED
  // =========================================

const roomRef = ref(
  realtimeDb,
  `battles/${data.roomId}`,
);

  const roomSnapshot =
    await get(roomRef);

  const roomData =
    roomSnapshot.val();

  const participants =
    Object.values(
      roomData
        ?.participants ??
        {},
    ) as any[];

  const allAnswered =
    participants.every(
      (participant) =>
        participant.answered,
    );

  // =========================================
  // AUTO NEXT QUESTION
  // =========================================

  if (
    allAnswered
  ) {
    const nextIndex =
      (
        roomData?.currentQuestionIndex ??
        0
      ) + 1;

    // =========================================
    // FINISHED
    // =========================================

    if (
      nextIndex >=
      room.questions.length
    ) {
      // DB

      await prisma.battleRoom.update(
        {
          where: {
            id: room.id,
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
        },
      );
    }

    // =========================================
    // NEXT QUESTION
    // =========================================

    else {
      const nextQuestion =
        room.questions[
          nextIndex
        ];

      // RESET ANSWERS

      const updates: Record<
        string,
        any
      > = {};

      participants.forEach(
        (
          participant: any,
        ) => {
          updates[
            `participants/${participant.studentId}/answered`
          ] = false;
        },
      );

      // UPDATE ROOM

      updates[
        "currentQuestionIndex"
      ] = nextIndex;

      updates[
        "questionStartedAt"
      ] = Date.now();

      updates[
        "questionEndsAt"
      ] =
        Date.now() +
        nextQuestion.timeLimit *
          1000;

      // FIREBASE UPDATE

      await update(
        roomRef,
        updates,
      );
    }
  }

  // =========================================
  // REVALIDATE
  // =========================================

  revalidatePath(
    `/student/battles/${room.id}`,
  );

  revalidatePath(
    `/teacher/battles/${room.id}`,
  );

  revalidatePath(
    `/teacher/battles/${room.id}/live`,
  );

  // =========================================
  // RETURN
  // =========================================

  return {
    success: true,

    isCorrect,

    earnedPoints,
  };
}