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
  set,
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
// TYPES
// =========================================

interface CreateBattleQuestionInput {
  roomId: string;

  question: string;

  type:
    | "QUIZ"
    | "MATCHING"
    | "FILL_BLANKS"
    | "CONVERSATION";

  answer?: string;

  optionA?: string;

  optionB?: string;

  optionC?: string;

  optionD?: string;

  leftText?: string;

  rightText?: string;

  points: number;

  timeLimit: number;

  order: number;
}

// =========================================
// ACTION
// =========================================

export async function createBattleQuestionAction(
  data: CreateBattleQuestionInput,
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
          id: data.roomId,
        },
      },
    );

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
  // CREATE QUESTION
  // =========================================

  const question =
    await prisma.battleQuestion.create(
      {
        data: {
          roomId:
            room.id,

          question:
            data.question,

          type: data.type,

          answer:
            data.answer,

          optionA:
            data.optionA,

          optionB:
            data.optionB,

          optionC:
            data.optionC,

          optionD:
            data.optionD,

          leftText:
            data.leftText,

          rightText:
            data.rightText,

          points:
            data.points,

          timeLimit:
            data.timeLimit,

          order:
            data.order,
        },
      },
    );

  // =========================================
  // FIREBASE
  // =========================================

  await set(
    ref(
      realtimeDb,
      `battleRooms/${room.id}/questions/${question.id}`,
    ),

    {
      id: question.id,

      question:
        question.question,

      type: question.type,

      answer:
        question.answer,

      optionA:
        question.optionA,

      optionB:
        question.optionB,

      optionC:
        question.optionC,

      optionD:
        question.optionD,

      leftText:
        question.leftText,

      rightText:
        question.rightText,

      points:
        question.points,

      timeLimit:
        question.timeLimit,

      order:
        question.order,
    },
  );

  // =========================================
  // REVALIDATE
  // =========================================

  revalidatePath(
    `/teacher/battles/${room.id}`,
  );

  revalidatePath(
    `/teacher/battles/${room.id}/edit`,
  );

  revalidatePath(
    `/teacher/battles/${room.id}/questions/new`,
  );

  return question;
}

export async function getBattleQuestionAction(
  questionId: string,
) {
  // =========================================
  // AUTH
  // =========================================

  const teacherId =
    await requireTeacher();

  // =========================================
  // QUESTION
  // =========================================

  const question =
    await prisma.battleQuestion.findUnique(
      {
        where: {
          id: questionId,
        },

        include: {
          room: {
            select: {
              id: true,

              teacherId: true,

              title: true,

              code: true,
            },
          },
        },
      },
    );

  // =========================================
  // EXISTS
  // =========================================

  if (!question) {
    return null;
  }

  // =========================================
  // SECURITY
  // =========================================

  if (
    question.room
      .teacherId !==
    teacherId
  ) {
    throw new Error(
      "غير مصرح لك",
    );
  }

  // =========================================
  // RETURN
  // =========================================

  return question;
}