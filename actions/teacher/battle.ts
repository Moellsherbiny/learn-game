
"use server";

import { auth } from "@/auth";

import { prisma } from "@/lib/prisma";

import { realtimeDb } from "@/lib/firebase";

import { ref, set, update, remove } from "firebase/database";

import { revalidatePath } from "next/cache";

import { GameType, TeamType } from "@/lib/generated/prisma/client";

// =========================================
// HELPERS
// =========================================

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

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// =========================================
// CREATE ROOM
// =========================================

interface CreateBattleRoomInput {
  title: string;
}

export async function createBattleRoomAction(data: CreateBattleRoomInput) {
  const teacherId = await requireTeacher();

  let code = generateRoomCode();

  let existing = await prisma.battleRoom.findUnique({
    where: {
      code,
    },
  });

  while (existing) {
    code = generateRoomCode();

    existing = await prisma.battleRoom.findUnique({
      where: {
        code,
      },
    });
  }

  const room = await prisma.battleRoom.create({
    data: {
      title: data.title.trim(),

      teacherId,

      code,

      status: "WAITING",

      currentQuestion: 0,
    },
  });

  // =========================================
  // FIREBASE ROOM
  // =========================================

  await set(
    ref(realtimeDb, `battleRooms/${room.id}`),

    {
      roomId: room.id,

      title: room.title,

      status: "WAITING",

      currentQuestion: 0,

      teams: {
        TEAM_A: {
          score: 0,
        },

        TEAM_B: {
          score: 0,
        },
      },
    },
  );

  revalidatePath("/teacher/battles");

  return room;
}

// =========================================
// UPDATE ROOM
// =========================================

interface UpdateBattleRoomInput {
  roomId: string;

  title: string;
}

// =========================================
// DELETE ROOM
// =========================================

export async function deleteBattleRoomAction(roomId: string) {
  const teacherId = await requireTeacher();

  const room = await prisma.battleRoom.findFirst({
    where: {
      id: roomId,

      teacherId,
    },
  });

  if (!room) {
    throw new Error("الغرفة غير موجودة");
  }

  await prisma.battleRoom.delete({
    where: {
      id: roomId,
    },
  });

  // =========================================
  // FIREBASE
  // =========================================

  await remove(ref(realtimeDb, `battleRooms/${roomId}`));

  revalidatePath("/teacher/battles");

  return {
    success: true,
  };
}

// =========================================
// ADD QUESTION
// =========================================

interface AddBattleQuestionInput {
  roomId: string;

  question: string;

  type: GameType;

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

export async function addBattleQuestionAction(data: AddBattleQuestionInput) {
  const teacherId = await requireTeacher();

  const room = await prisma.battleRoom.findFirst({
    where: {
      id: data.roomId,

      teacherId,
    },

    include: {
      questions: true,
    },
  });

  if (!room) {
    throw new Error("الغرفة غير موجودة");
  }

  const question = await prisma.battleQuestion.create({
    data: {
      roomId: room.id,

      question: data.question.trim(),

      type: data.type,

      answer: data.answer,

      optionA: data.optionA,

      optionB: data.optionB,

      optionC: data.optionC,

      optionD: data.optionD,

      leftText: data.leftText,

      rightText: data.rightText,

      points: data.points ?? 100,

      timeLimit: data.timeLimit ?? 20,

      order: room.questions.length + 1,
    },
  });

  revalidatePath(`/teacher/battles/${room.id}`);

  return question;
}

// =========================================
// UPDATE QUESTION
// =========================================

interface UpdateBattleQuestionInput {
  questionId: string;

  question: string;

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

export async function updateBattleQuestionAction(
  data: UpdateBattleQuestionInput,
) {
  const teacherId = await requireTeacher();

  const question = await prisma.battleQuestion.findFirst({
    where: {
      id: data.questionId,

      room: {
        teacherId,
      },
    },

    include: {
      room: true,
    },
  });

  if (!question) {
    throw new Error("السؤال غير موجود");
  }

  const updatedQuestion = await prisma.battleQuestion.update({
    where: {
      id: question.id,
    },

    data: {
      question: data.question.trim(),

      answer: data.answer,

      optionA: data.optionA,

      optionB: data.optionB,

      optionC: data.optionC,

      optionD: data.optionD,

      leftText: data.leftText,

      rightText: data.rightText,

      points: data.points,

      timeLimit: data.timeLimit,
    },
  });

  revalidatePath(`/teacher/battles/${question.room.id}`);

  return updatedQuestion;
}

// =========================================
// ADD STUDENT TO TEAM
// =========================================

interface AddStudentToBattleInput {
  roomId: string;

  studentId: string;

  team: TeamType;
}

// =========================================
// REMOVE STUDENT
// =========================================

// =========================================
// START BATTLE
// =========================================

export async function startBattleAction(roomId: string) {
  const teacherId = await requireTeacher();

  const room = await prisma.battleRoom.findFirst({
    where: {
      id: roomId,

      teacherId,
    },
  });

  if (!room) {
    throw new Error("الغرفة غير موجودة");
  }

  const updatedRoom = await prisma.battleRoom.update({
    where: {
      id: room.id,
    },

    data: {
      status: "LIVE",

      currentQuestion: 0,
    },
  });

  // =========================================
  // FIREBASE
  // =========================================

  await update(
    ref(realtimeDb, `battleRooms/${room.id}`),

    {
      status: "LIVE",

      currentQuestion: 0,
    },
  );

  revalidatePath(`/teacher/battles/${room.id}`);

  return updatedRoom;
}

// =========================================
// NEXT QUESTION
// =========================================

export async function nextBattleQuestionAction(roomId: string) {
  const teacherId = await requireTeacher();

  const room = await prisma.battleRoom.findFirst({
    where: {
      id: roomId,

      teacherId,
    },

    include: {
      questions: true,
    },
  });

  if (!room) {
    throw new Error("الغرفة غير موجودة");
  }

  const nextIndex = room.currentQuestion + 1;

  if (nextIndex >= room.questions.length) {
    await prisma.battleRoom.update({
      where: {
        id: room.id,
      },

      data: {
        status: "FINISHED",
      },
    });

    await update(
      ref(realtimeDb, `battleRooms/${room.id}`),

      {
        status: "FINISHED",
      },
    );

    return {
      finished: true,
    };
  }

  const updatedRoom = await prisma.battleRoom.update({
    where: {
      id: room.id,
    },

    data: {
      currentQuestion: nextIndex,
    },
  });

  // =========================================
  // FIREBASE
  // =========================================

  await update(
    ref(realtimeDb, `battleRooms/${room.id}`),

    {
      currentQuestion: nextIndex,
    },
  );

  return updatedRoom;
}

// =========================================
// UPDATE BATTLE ROOM
// =========================================

interface UpdateBattleRoomInput {
  roomId: string;

  title: string;
}

export async function updateBattleRoomAction(data: UpdateBattleRoomInput) {
  const teacherId = await requireTeacher();

  // =========================================
  // VALIDATE ROOM
  // =========================================

  const room = await prisma.battleRoom.findFirst({
    where: {
      id: data.roomId,

      teacherId,
    },
  });

  if (!room) {
    throw new Error("الغرفة غير موجودة");
  }

  // =========================================
  // UPDATE ROOM
  // =========================================

  const updatedRoom = await prisma.battleRoom.update({
    where: {
      id: room.id,
    },

    data: {
      title: data.title.trim(),
    },
  });

  // =========================================
  // FIREBASE
  // =========================================

  await update(
    ref(realtimeDb, `battleRooms/${room.id}`),

    {
      title: updatedRoom.title,
    },
  );

  // =========================================
  // REVALIDATE
  // =========================================

  revalidatePath(`/teacher/battles/${room.id}`);

  revalidatePath(`/teacher/battles/${room.id}/edit`);

  return updatedRoom;
}

// =========================================
// DELETE QUESTION
// =========================================

export async function deleteBattleQuestionAction(questionId: string) {
  const teacherId = await requireTeacher();

  // =========================================
  // FIND QUESTION
  // =========================================

  const question = await prisma.battleQuestion.findFirst({
    where: {
      id: questionId,

      room: {
        teacherId,
      },
    },

    include: {
      room: true,
    },
  });

  if (!question) {
    throw new Error("السؤال غير موجود");
  }

  // =========================================
  // DELETE
  // =========================================

  await prisma.battleQuestion.delete({
    where: {
      id: question.id,
    },
  });

  // =========================================
  // REVALIDATE
  // =========================================

  revalidatePath(`/teacher/battles/${question.room.id}`);

  revalidatePath(`/teacher/battles/${question.room.id}/edit`);

  return {
    success: true,
  };
}

// =========================================
// GET BATTLE ROOM
// =========================================
// =========================================
// GET BATTLE ROOM
// =========================================

export async function getBattleRoomAction(
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

  const battle =
    await prisma.battleRoom.findUnique(
      {
        where: {
          id: battleId,
        },
      },
    );

  if (!battle) {
    return null;
  }

  // =========================================
  // SECURITY
  // =========================================

  if (
    battle.teacherId !==
    teacherId
  ) {
    throw new Error(
      "غير مصرح لك",
    );
  }

  // =========================================
  // PARTICIPANTS
  // =========================================

  const participants =
    await prisma.battleParticipant.findMany(
      {
        where: {
          roomId:
            battle.id,
        },

        include: {
          student: {
            select: {
              id: true,

              name: true,

              image: true,

              xp: true,

              level: true,
            },
          },
        },

        orderBy: {
          score: "desc",
        },
      },
    );

  // =========================================
  // QUESTIONS
  // =========================================

  const questions =
    await prisma.battleQuestion.findMany(
      {
        where: {
          roomId:
            battle.id,
        },

        include: {
          answers: {
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
              createdAt:
                "asc",
            },
          },
        },

        orderBy: {
          order: "asc",
        },
      },
    );

  // =========================================
  // ACTIVE QUESTION
  // =========================================

  const activeQuestion =
    questions[
      battle.currentQuestion
    ] ?? null;

  // =========================================
  // TEAMS
  // =========================================

  const teamA =
    participants.filter(
      (participant) =>
        participant.team ===
        "TEAM_A",
    );

  const teamB =
    participants.filter(
      (participant) =>
        participant.team ===
        "TEAM_B",
    );

  // =========================================
  // TEAM SCORES
  // =========================================

  const teamAScore =
    teamA.reduce(
      (
        total,
        participant,
      ) =>
        total +
        participant.score,
      0,
    );

  const teamBScore =
    teamB.reduce(
      (
        total,
        participant,
      ) =>
        total +
        participant.score,
      0,
    );

  // =========================================
  // TOTAL ANSWERS
  // =========================================

  const totalAnswers =
    questions.reduce(
      (
        total,
        question,
      ) =>
        total +
        question.answers
          .length,
      0,
    );

  // =========================================
  // RETURN
  // =========================================

  return {
    ...battle,

    participants,

    questions,

    activeQuestion,

    totalAnswers,

    teamA,

    teamB,

    teamAScore,

    teamBScore,
  };
}

// =========================================
// ADD STUDENT TO BATTLE
// =========================================

interface AddStudentToBattleInput {
  roomId: string;

  studentId: string;

  team: "TEAM_A" | "TEAM_B";
}

export async function addStudentToBattleAction(data: AddStudentToBattleInput) {
  const teacherId = await requireTeacher();

  // =========================================
  // ROOM
  // =========================================

  const room = await prisma.battleRoom.findUnique({
    where: {
      id: data.roomId,
    },
  });

  if (!room) {
    throw new Error("الغرفة غير موجودة");
  }

  if (room.teacherId !== teacherId) {
    throw new Error("غير مصرح لك");
  }

  if (!room) {
    throw new Error("الغرفة غير موجودة");
  }

  // =========================================
  // STUDENT
  // =========================================

  const student = await prisma.user.findFirst({
    where: {
      id: data.studentId,

      role: "STUDENT",
    },
  });

  if (!student) {
    throw new Error("الطالب غير موجود");
  }

  // =========================================
  // EXISTING
  // =========================================

  const existing = await prisma.battleParticipant.findFirst({
    where: {
      roomId: room.id,

      studentId: student.id,
    },
  });

  if (existing) {
    throw new Error("الطالب موجود بالفعل");
  }

  // =========================================
  // CREATE
  // =========================================

  const participant = await prisma.battleParticipant.create({
    data: {
      roomId: room.id,

      studentId: student.id,

      team: data.team,
    },

    include: {
      student: {
        select: {
          id: true,

          name: true,

          image: true,

          xp: true,

          level: true,
        },
      },
    },
  });

  // =========================================
  // FIREBASE
  // =========================================

  await set(
    ref(realtimeDb, `battleRooms/${room.id}/participants/${participant.id}`),

    {
      participantId: participant.id,

      studentId: student.id,

      name: student.name,

      image: student.image,

      team: data.team,

      score: 0,
    },
  );

  // =========================================
  // REVALIDATE
  // =========================================

  revalidatePath(`/teacher/battles/${room.id}`);

  revalidatePath(`/teacher/battles/${room.id}/edit`);

  return participant;
}

// =========================================
// REMOVE STUDENT
// =========================================

export async function removeStudentFromBattleAction(participantId: string) {
  const teacherId = await requireTeacher();

  // =========================================
  // FIND PARTICIPANT
  // =========================================

  const participant = await prisma.battleParticipant.findFirst({
    where: {
      id: participantId,

      room: {
        teacherId,
      },
    },

    include: {
      room: true,
    },
  });

  if (!participant) {
    throw new Error("المشارك غير موجود");
  }

  // =========================================
  // DELETE
  // =========================================

  await prisma.battleParticipant.delete({
    where: {
      id: participant.id,
    },
  });

  // =========================================
  // FIREBASE
  // =========================================

  await remove(
    ref(
      realtimeDb,
      `battleRooms/${participant.room.id}/participants/${participant.id}`,
    ),
  );

  // =========================================
  // REVALIDATE
  // =========================================

  revalidatePath(`/teacher/battles/${participant.room.id}`);

  revalidatePath(`/teacher/battles/${participant.room.id}/edit`);

  return {
    success: true,
  };
}

// =========================================
// GET STUDENTS
// =========================================

export async function getStudentsAction() {
  await requireTeacher();

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
    },

    select: {
      id: true,

      name: true,

      image: true,

      xp: true,

      level: true,
    },

    orderBy: {
      name: "asc",
    },
  });

  return students;
}
