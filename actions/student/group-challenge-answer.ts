
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  UserRole,
  GroupChallengeStatus,
} from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";

// ============================================
// Constants
// ============================================

const POINTS_PER_CORRECT_ANSWER = 100;

// ============================================
// Authentication
// ============================================

async function requireStudent() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("يجب تسجيل الدخول أولاً.");
  }

  if (session.user.role !== UserRole.STUDENT) {
    throw new Error("هذه العملية متاحة للطلاب فقط.");
  }

  return session.user.id;
}

// ============================================
// Helpers
// ============================================

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase();
}

// ============================================
// 1. Get Current Question
// ============================================

export async function getCurrentGroupChallengeQuestionAction(
  challengeId: string
) {
  const studentId = await requireStudent();

  if (!challengeId?.trim()) {
    throw new Error("معرف التحدي غير صحيح.");
  }

  const participant = await prisma.challengeParticipant.findUnique({
    where: {
      challengeId_studentId: {
        challengeId,
        studentId,
      },
    },

    select: {
      id: true,

      challenge: {
        select: {
          id: true,
          status: true,
          currentQuestionIndex: true,

          questions: {
            where: {
              order: {
                // currentQuestionIndex is zero-based
                equals: 1,
              },
            },
            select: {
              id: true,
              question: true,
              optionA: true,
              optionB: true,
              optionC: true,
              optionD: true,
              leftText: true,
              rightText: true,
              order: true,
              timeLimit: true,
            },
          },
        },
      },
    },
  });

  if (!participant) {
    throw new Error("أنت غير منضم إلى هذا التحدي.");
  }

  const challenge = participant.challenge;

  if (challenge.status !== GroupChallengeStatus.LIVE) {
    throw new Error("التحدي ليس قيد التشغيل حالياً.");
  }

  const questionOrder = challenge.currentQuestionIndex + 1;

  const currentQuestion = await prisma.challengeQuestion.findFirst({
    where: {
      challengeId,
      order: questionOrder,
    },

    select: {
      id: true,
      question: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      leftText: true,
      rightText: true,
      order: true,
      timeLimit: true,
    },
  });

  if (!currentQuestion) {
    throw new Error("السؤال الحالي غير موجود.");
  }

  const previousAnswer = await prisma.challengeAnswer.findUnique({
    where: {
      challengeQuestionId_participantId: {
        challengeQuestionId: currentQuestion.id,
        participantId: participant.id,
      },
    },

    select: {
      id: true,
      isCorrect: true,
      responseTime: true,
    },
  });

  return {
    success: true,
    question: currentQuestion,
    hasAnswered: Boolean(previousAnswer),
    previousAnswer,
  };
}

// ============================================
// 2. Submit Answer
// ============================================

export async function submitGroupChallengeAnswerAction(data: {
  challengeId: string;
  answer: string;
}) {
  const studentId = await requireStudent();

  const challengeId = data.challengeId?.trim();
  const answer = data.answer?.trim();

  if (!challengeId) {
    throw new Error("معرف التحدي غير صحيح.");
  }

  if (!answer) {
    throw new Error("يجب إدخال الإجابة أولاً.");
  }

  if (answer.length > 2000) {
    throw new Error("الإجابة طويلة جداً.");
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Find participant and challenge
        const participant = await tx.challengeParticipant.findUnique({
          where: {
            challengeId_studentId: {
              challengeId,
              studentId,
            },
          },

          select: {
            id: true,
            team: true,
            score: true,

            challenge: {
              select: {
                id: true,
                status: true,
                currentQuestionIndex: true,
                currentQuestionStartedAt: true,
              },
            },
          },
        });

        if (!participant) {
          throw new Error("أنت غير منضم إلى هذا التحدي.");
        }

        const challenge = participant.challenge;

        if (challenge.status !== GroupChallengeStatus.LIVE) {
          throw new Error("التحدي ليس قيد التشغيل.");
        }

        if (!challenge.currentQuestionStartedAt) {
          throw new Error("لم يتم تسجيل بداية السؤال الحالي.");
        }

        // Get current question
        const question = await tx.challengeQuestion.findFirst({
          where: {
            challengeId,
            order: challenge.currentQuestionIndex + 1,
          },

          select: {
            id: true,
            answer: true,
            timeLimit: true,
          },
        });

        if (!question) {
          throw new Error("السؤال الحالي غير موجود.");
        }

        if (!question.answer?.trim()) {
          throw new Error("لم يتم تحديد الإجابة الصحيحة لهذا السؤال.");
        }

        // Check server-side response time
        const responseTime = Math.max(
          0,
          Date.now() - challenge.currentQuestionStartedAt.getTime()
        );

        if (responseTime > question.timeLimit * 1000) {
          throw new Error("انتهى وقت الإجابة على هذا السؤال.");
        }

        // Prevent duplicate answers
        const existingAnswer = await tx.challengeAnswer.findUnique({
          where: {
            challengeQuestionId_participantId: {
              challengeQuestionId: question.id,
              participantId: participant.id,
            },
          },
        });

        if (existingAnswer) {
          throw new Error("لقد أرسلت إجابتك بالفعل.");
        }

        // Validate answer on the server
        const isCorrect =
          normalizeAnswer(answer) ===
          normalizeAnswer(question.answer);

        const pointsAwarded = isCorrect
          ? POINTS_PER_CORRECT_ANSWER
          : 0;

        // Save answer
        const savedAnswer = await tx.challengeAnswer.create({
          data: {
            challengeQuestionId: question.id,
            participantId: participant.id,
            answer,
            isCorrect,
            responseTime,
          },

          select: {
            id: true,
            answer: true,
            isCorrect: true,
            responseTime: true,
            submittedAt: true,
          },
        });

        // Update participant score atomically
        const updatedParticipant =
          await tx.challengeParticipant.update({
            where: {
              id: participant.id,
            },

            data: {
              score: {
                increment: pointsAwarded,
              },
            },

            select: {
              id: true,
              team: true,
              score: true,
            },
          });

        return {
          answer: savedAnswer,
          participant: updatedParticipant,
          isCorrect,
          pointsAwarded,
          responseTime,
        };
      },
      {
        isolationLevel: "Serializable",
      }
    );

    revalidatePath("/student/group-challenges");
    revalidatePath("/teacher/group-challenges");

    return {
      success: true,
      message: result.isCorrect
        ? "إجابة صحيحة! أحسنت."
        : "إجابة غير صحيحة.",
      ...result,
    };
  } catch (error) {
    // Handle duplicate submission race condition
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new Error("لقد أرسلت إجابتك بالفعل.");
    }

    throw error;
  }
}
