// actions/student/battle.ts

"use server";

import {
  prisma,
} from "@/lib/prisma";
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
  answer: string;
  responseTime: number;
}

// =========================================
// GET STUDENT BATTLE
// =========================================

export async function getStudentBattleAction(
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
        data: null,
      };
    }

    if (session.user.role !== "STUDENT") {
      return {
        success: false as const,
        error: "غير مصرح لك بالوصول إلى التحدي",
        data: null,
      };
    }

    const studentId = session.user.id;

    // =========================================
    // VALIDATE ID
    // =========================================

    if (!battleId) {
      return {
        success: false as const,
        error: "معرف التحدي غير صالح",
        data: null,
      };
    }

    // =========================================
    // GET BATTLE
    // =========================================

    const battle =
      await prisma.battleRoom.findFirst({
        where: {
          id: battleId,

          // الطالب لازم يكون مدعوًا
          invitations: {
            some: {
              studentId,
            },
          },
        },

        include: {
          // =====================================
          // QUESTIONS
          // =====================================

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

          // =====================================
          // MY INVITATION
          // =====================================

          invitations: {
            where: {
              studentId,
            },

            select: {
              id: true,
              team: true,
              status: true,
            },
          },

          // =====================================
          // PARTICIPANTS
          // =====================================

          participants: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  level: true,
                },
              },
            },

            orderBy: {
              joinedAt: "asc",
            },
          },
        },
      });

    // =========================================
    // NOT FOUND
    // =========================================

    if (!battle) {
      return {
        success: false as const,
        error:
          "التحدي غير موجود أو غير متاح لك",
        data: null,
      };
    }

    // =========================================
    // MY INVITATION
    // =========================================

    const myInvitation =
      battle.invitations[0] ?? null;

    // =========================================
    // MY PARTICIPATION
    // =========================================

    const myParticipant =
      battle.participants.find(
        (participant) =>
          participant.studentId ===
          studentId,
      ) ?? null;

    // =========================================
    // SUCCESS
    // =========================================

    return {
  success: true as const,

  data: {
    id: battle.id,
    title: battle.title,
    code: battle.code,

    status: battle.status,

    currentQuestion:
      battle.currentQuestion,

    // =====================================
    // MY DATA
    // =====================================

    team:
      myInvitation?.team ??
      myParticipant?.team ??
      null,

    invitationStatus:
      myInvitation?.status ??
      null,

    participant:
      myParticipant
        ? {
            id: myParticipant.id,
            score: myParticipant.score,
            joinedAt:
              myParticipant.joinedAt,
          }
        : null,

    // =====================================
    // PLAYERS
    // =====================================

    players:
      battle.participants.map(
        (participant) => ({
          id: participant.id,

          studentId:
            participant.studentId,

          team: participant.team,

          score: participant.score,

          joinedAt:
            participant.joinedAt,

          student:
            participant.student,
        }),
      ),

    // =====================================
    // QUESTIONS
    // =====================================

    questions:
      battle.questions,
  },
};
  } catch (error) {
    console.error(
      "GET_STUDENT_BATTLE_ERROR:",
      error,
    );

    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحميل التحدي",
      data: null,
    };
  }
}
// =========================================
// SUBMIT ANSWER
// =========================================

export async function submitBattleAnswerAction(
  data: SubmitBattleAnswerInput,
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

    if (session.user.role !== "STUDENT") {
      return {
        success: false as const,
        error: "غير مصرح لك بإرسال إجابة",
      };
    }

    const studentId = session.user.id;

    // =========================================
    // VALIDATION
    // =========================================

    if (!data.roomId) {
      return {
        success: false as const,
        error: "معرف التحدي غير صالح",
      };
    }

    if (!data.questionId) {
      return {
        success: false as const,
        error: "معرف السؤال غير صالح",
      };
    }

    if (!data.answer) {
      return {
        success: false as const,
        error: "يجب اختيار إجابة",
      };
    }

    if (data.responseTime < 0) {
      return {
        success: false as const,
        error: "وقت الإجابة غير صالح",
      };
    }

    // =========================================
    // PARTICIPANT
    // =========================================

    const participant =
      await prisma.battleParticipant.findFirst({
        where: {
          roomId: data.roomId,
          studentId,
        },
      });

    if (!participant) {
      return {
        success: false as const,
        error:
          "أنت لست مشاركًا في هذا التحدي",
      };
    }

    // =========================================
    // BATTLE
    // =========================================

    const battle =
      await prisma.battleRoom.findUnique({
        where: {
          id: data.roomId,
        },

        select: {
          id: true,
          status: true,
          currentQuestion: true,
        },
      });

    if (!battle) {
      return {
        success: false as const,
        error: "التحدي غير موجود",
      };
    }

    if (battle.status !== "LIVE") {
      return {
        success: false as const,
        error:
          "التحدي غير متاح للإجابة حاليًا",
      };
    }

    // =========================================
    // QUESTION
    // =========================================

    const question =
      await prisma.battleQuestion.findFirst({
        where: {
          id: data.questionId,
          roomId: data.roomId,
        },

        select: {
          id: true,
          order: true,
          answer: true,
          points: true,
        },
      });

    if (!question) {
      return {
        success: false as const,
        error: "السؤال غير موجود",
      };
    }

    // =========================================
    // CURRENT QUESTION CHECK
    // =========================================

    if (
      question.order !==
      battle.currentQuestion
    ) {
      return {
        success: false as const,
        error:
          "هذا السؤال لم يعد السؤال الحالي",
      };
    }

    // =========================================
    // PREVENT DUPLICATE ANSWER
    // =========================================

    const existingAnswer =
      await prisma.battleAnswer.findFirst({
        where: {
          id: data.roomId,
          questionId: data.questionId,
          studentId,
        },
      });

    if (existingAnswer) {
      return {
        success: false as const,
        error:
          "تم تسجيل إجابتك بالفعل",
      };
    }

    // =========================================
    // GRADING
    // =========================================

    const isCorrect =
      data.answer === question.answer;

    const earnedPoints =
      isCorrect
        ? question.points
        : 0;

    // =========================================
    // SAVE ANSWER + UPDATE SCORE
    // =========================================

    await prisma.$transaction(
      async (tx) => {
        await tx.battleAnswer.create({
          data: {
            id: data.roomId,
            questionId: data.questionId,
            studentId,

            answer: data.answer,

            isCorrect,


            responseTime:
              data.responseTime,
          },
        });

        if (earnedPoints > 0) {
          await tx.battleParticipant.update({
            where: {
              id: participant.id,
            },

            data: {
              score: {
                increment:
                  earnedPoints,
              },
            },
          });
        }
      },
    );

    // =========================================
    // SUCCESS
    // =========================================

    return {
      success: true as const,

      data: {
        isCorrect,
        points: earnedPoints,
      },
    };
  } catch (error) {
    console.error(
      "SUBMIT_BATTLE_ANSWER_ERROR:",
      error,
    );

    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تسجيل الإجابة",
    };
  }
}