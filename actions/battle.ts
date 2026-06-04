"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// =========================================
// GET TEACHER BATTLE ROOMS
// =========================================

export async function getTeacherBattleRoomsAction() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error(
      "يجب تسجيل الدخول أولاً",
    );
  }

  if (
    session.user.role !==
    "TEACHER"
  ) {
    throw new Error(
      "غير مصرح لك",
    );
  }

  const teacherId =
    session.user.id;

  const rooms =
    await prisma.battleRoom.findMany(
      {
        where: {
          teacherId,
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          participants: {
            select: {
              id: true,
            },
          },

          questions: {
            select: {
              id: true,
            },
          },
        },
      },
    );

  return rooms;
}

// =========================================
// CREATE BATTLE ROOM
// =========================================

interface CreateBattleRoomInput {
  title: string;
}

function generateRoomCode() {
  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
}

export async function createBattleRoomAction(
  data: CreateBattleRoomInput,
) {
  const session =
    await auth();

  if (
    !session?.user?.id
  ) {
    throw new Error(
      "يجب تسجيل الدخول أولاً",
    );
  }

  if (
    session.user.role !==
    "TEACHER"
  ) {
    throw new Error(
      "غير مصرح لك",
    );
  }

  const teacherId =
    session.user.id;

  const room =
    await prisma.battleRoom.create(
      {
        data: {
          title:
            data.title.trim(),

          code:
            generateRoomCode(),

          teacherId,
        },
      },
    );

  return room;
}

// =========================================
// GET SINGLE BATTLE ROOM
// =========================================

export async function getBattleRoomAction(
  roomId: string,
) {
  const session =
    await auth();

  if (
    !session?.user?.id
  ) {
    throw new Error(
      "يجب تسجيل الدخول أولاً",
    );
  }

  const room =
    await prisma.battleRoom.findUnique(
      {
        where: {
          id: roomId,
        },

        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              image: true,
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

            orderBy: {
              joinedAt:
                "asc",
            },
          },

          questions: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    );

  return room;
}

// =========================================
// ADD QUESTION
// =========================================

interface AddBattleQuestionInput {
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

  points?: number;

  timeLimit?: number;
}

export async function addBattleQuestionAction(
  data: AddBattleQuestionInput,
) {
  const session =
    await auth();

  if (
    !session?.user?.id
  ) {
    throw new Error(
      "يجب تسجيل الدخول أولاً",
    );
  }

  const room =
    await prisma.battleRoom.findUnique(
      {
        where: {
          id: data.roomId,
        },

        include: {
          questions: true,
        },
      },
    );

  if (!room) {
    throw new Error(
      "الغرفة غير موجودة",
    );
  }

  if (
    room.teacherId !==
    session.user.id
  ) {
    throw new Error(
      "غير مصرح لك",
    );
  }

  const question =
    await prisma.battleQuestion.create(
      {
        data: {
          roomId:
            data.roomId,

          question:
            data.question.trim(),

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
            data.points ??
            100,

          timeLimit:
            data.timeLimit ??
            20,

          order:
            room.questions
              .length + 1,
        },
      },
    );

  return question;
}

// =========================================
// JOIN ROOM
// =========================================

interface JoinBattleRoomInput {
  roomCode: string;
}

export async function joinBattleRoomAction(
  data: JoinBattleRoomInput,
) {
  const session =
    await auth();

  if (
    !session?.user?.id
  ) {
    throw new Error(
      "يجب تسجيل الدخول أولاً",
    );
  }

  const studentId =
    session.user.id;

  const room =
    await prisma.battleRoom.findUnique(
      {
        where: {
          code: data.roomCode,
        },

        include: {
          participants: true,
        },
      },
    );

  if (!room) {
    throw new Error(
      "الغرفة غير موجودة",
    );
  }

  const existing =
    room.participants.find(
      (participant) =>
        participant.studentId ===
        studentId,
    );

  if (existing) {
    return room;
  }

  const teamA =
    room.participants.filter(
      (participant) =>
        participant.team ===
        "TEAM_A",
    ).length;

  const teamB =
    room.participants.filter(
      (participant) =>
        participant.team ===
        "TEAM_B",
    ).length;

  const assignedTeam =
    teamA <= teamB
      ? "TEAM_A"
      : "TEAM_B";

  await prisma.battleParticipant.create(
    {
      data: {
        roomId: room.id,

        studentId,

        team: assignedTeam,
      },
    },
  );

  return room;
}

// =========================================
// START BATTLE
// =========================================

export async function startBattleAction(
  roomId: string,
) {
  const session =
    await auth();

  if (
    !session?.user?.id
  ) {
    throw new Error(
      "يجب تسجيل الدخول أولاً",
    );
  }

  const room =
    await prisma.battleRoom.findUnique(
      {
        where: {
          id: roomId,
        },
      },
    );

  if (!room) {
    throw new Error(
      "الغرفة غير موجودة",
    );
  }

  if (
    room.teacherId !==
    session.user.id
  ) {
    throw new Error(
      "غير مصرح لك",
    );
  }

  const updatedRoom =
    await prisma.battleRoom.update(
      {
        where: {
          id: roomId,
        },

        data: {
          status: "LIVE",

          currentQuestion: 0,
        },
      },
    );

  return updatedRoom;
}

// =========================================
// SUBMIT ANSWER
// =========================================

interface SubmitBattleAnswerInput {
  questionId: string;

  answer: string;

  responseTime: number;
}

export async function submitBattleAnswerAction(
  data: SubmitBattleAnswerInput,
) {
  const session =
    await auth();

  if (
    !session?.user?.id
  ) {
    throw new Error(
      "يجب تسجيل الدخول أولاً",
    );
  }

  const studentId =
    session.user.id;

  const question =
    await prisma.battleQuestion.findUnique(
      {
        where: {
          id: data.questionId,
        },

        include: {
          room: {
            include: {
              participants: true,
            },
          },
        },
      },
    );

  if (!question) {
    throw new Error(
      "السؤال غير موجود",
    );
  }

  const existingAnswer =
    await prisma.battleAnswer.findFirst(
      {
        where: {
          questionId:
            data.questionId,

          studentId,
        },
      },
    );

  if (existingAnswer) {
    throw new Error(
      "لقد أجبت بالفعل",
    );
  }

  const participant =
    question.room.participants.find(
      (participant) =>
        participant.studentId ===
        studentId,
    );

  if (!participant) {
    throw new Error(
      "أنت لست مشاركاً",
    );
  }

  const isCorrect =
    question.answer
      ?.trim()
      .toLowerCase() ===
    data.answer
      .trim()
      .toLowerCase();

  await prisma.battleAnswer.create(
    {
      data: {
        questionId:
          question.id,

        studentId,

        answer:
          data.answer,

        isCorrect,

        responseTime:
          data.responseTime,
      },
    },
  );

  if (isCorrect) {
    await prisma.battleParticipant.update(
      {
        where: {
          id: participant.id,
        },

        data: {
          score: {
            increment:
              question.points,
          },
        },
      },
    );
  }

  return {
    correct: isCorrect,

    points: isCorrect
      ? question.points
      : 0,
  };
}