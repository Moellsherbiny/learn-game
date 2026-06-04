"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  prisma,
} from "@/lib/prisma";

import {
  realtimeDb,
} from "@/lib/firebase";

import {
  ref,
  update,
} from "firebase/database";
import { auth } from "@/auth";

async function requireTeacher() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("يجب تسجيل الدخول أولاً");
  }

  if (session.user.role !== "TEACHER") {
    throw new Error("غير مصرح لك");
  }

  return session.user.id;
}

// =========================================
// START BATTLE
// =========================================

export async function startBattleAction(
  battleId: string,
) {
  // =========================================
  // AUTH
  // =========================================

  const teacherId =
    await requireTeacher();

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
              order: "asc",
            },

            select: {
              id: true,

              question: true,

              type: true,

              optionA: true,

              optionB: true,

              optionC: true,

              optionD: true,

              leftText: true,

              rightText: true,

              points: true,

              timeLimit: true,

              order: true,
            },
          },

          participants: {
            include: {
              student: {
                select: {
                  id: true,

                  name: true,

                  image: true,
                },
              },
            },
          },
        },
      },
    );

  // =========================================
  // EXISTS
  // =========================================

  if (!room) {
    throw new Error(
      "الغرفة غير موجودة",
    );
  }

  // =========================================
  // SECURITY
  // =========================================

  if (
    room.teacherId !==
    teacherId
  ) {
    throw new Error(
      "غير مصرح لك",
    );
  }

  // =========================================
  // QUESTIONS
  // =========================================

  if (
    room.questions
      .length === 0
  ) {
    throw new Error(
      "يجب إضافة سؤال واحد على الأقل",
    );
  }

  // =========================================
  // PARTICIPANTS
  // =========================================

  if (
    room.participants
      .length === 0
  ) {
    throw new Error(
      "يجب إضافة طلاب أولًا",
    );
  }

  // =========================================
  // UPDATE DATABASE
  // =========================================

  const battle =
    await prisma.battleRoom.update(
      {
        where: {
          id: room.id,
        },

        data: {
          status:
            "LIVE",

          currentQuestion: 0,
        },
      },
    );

  // =========================================
  // FIRST QUESTION
  // =========================================

  const firstQuestion =
    room.questions[0];

  // =========================================
  // FIREBASE REALTIME
  // =========================================

  await update(
    ref(
      realtimeDb,
      `battleRooms/${battle.id}`,
    ),

    {
      id: battle.id,

      title:
        room.title,

      code:
        room.code,

      status: "LIVE",

      currentQuestion: 0,

      currentQuestionData:
        firstQuestion,

      participants:
        room.participants.map(
          (
            participant,
          ) => ({
            id:
              participant.id,

            studentId:
              participant.studentId,

            name:
              participant
                .student
                .name,

            image:
              participant
                .student
                .image,

            score:
              participant.score,

            team:
              participant.team,

            isReady:
              participant.isReady,
          }),
        ),

      startedAt:
        Date.now(),
    },
  );

  // =========================================
  // REVALIDATE
  // =========================================

  revalidatePath(
    `/teacher/battles`,
  );

  revalidatePath(
    `/teacher/battles/${battle.id}`,
  );

  revalidatePath(
    `/teacher/battles/${battle.id}/edit`,
  );

  // =========================================
  // RETURN
  // =========================================

  return {
    success: true,

    battleId:
      battle.id,
  };
}