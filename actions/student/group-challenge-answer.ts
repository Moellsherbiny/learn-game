"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Prisma,
  UserRole,
  GroupChallengeStatus,
} from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";

// ============================================
// Constants
// ============================================

const POINTS_PER_CORRECT_ANSWER = 100;
const MAX_TEXT_ANSWER_LENGTH = 2000;
const MAX_MATCHING_PAIRS = 100;
const MAX_MATCHING_PAYLOAD_LENGTH = 20_000;

type MatchingPair = {
  left: string;
  right: string;
};

type SubmitGroupChallengeAnswerInput = {
  challengeId: string;
  // QUIZ and FILL_BLANKS use answer.
  answer?: string;
  // MATCHING uses answerData.pairs.
  answerData?: {
    pairs: MatchingPair[];
  };
};

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
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function assertSupportedGameType(gameType: string) {
  if (
    gameType !== "QUIZ" &&
    gameType !== "MATCHING" &&
    gameType !== "FILL_BLANKS"
  ) {
    throw new Error(
      "نوع السؤال غير مدعوم في التحديات الجماعية.",
    );
  }
}

/**
 * Stable ordering keeps the matching options from jumping around
 * every time the student refreshes the question.
 *
 * Left and right sides are shuffled independently, so the UI does
 * not reveal the correct pairs through their original ordering.
 */
function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function stableShuffle<T>(
  items: T[],
  getKey: (item: T) => string,
  seed: string,
) {
  return [...items].sort((a, b) => {
    const hashA = stableHash(`${seed}:${getKey(a)}`);
    const hashB = stableHash(`${seed}:${getKey(b)}`);

    if (hashA !== hashB) return hashA - hashB;
    return getKey(a).localeCompare(getKey(b));
  });
}

function normalizeMatchingPairs(pairs: MatchingPair[]) {
  return pairs
    .map((pair) => ({
      left: normalizeAnswer(pair.left),
      right: normalizeAnswer(pair.right),
    }))
    .sort((a, b) => {
      const leftComparison = a.left.localeCompare(b.left);
      return leftComparison !== 0
        ? leftComparison
        : a.right.localeCompare(b.right);
    });
}

function isMatchingAnswerCorrect(
  submittedPairs: MatchingPair[],
  correctPairs: MatchingPair[],
) {
  if (
    submittedPairs.length === 0 ||
    submittedPairs.length !== correctPairs.length
  ) {
    return false;
  }

  const submitted = normalizeMatchingPairs(submittedPairs);
  const correct = normalizeMatchingPairs(correctPairs);

  // Duplicate pairs should not be accepted as a substitute for missing pairs.
  const submittedKeys = submitted.map(
    (pair) => `${pair.left}\u0000${pair.right}`,
  );
  if (new Set(submittedKeys).size !== submittedKeys.length) {
    return false;
  }

  return submitted.every(
    (pair, index) =>
      pair.left === correct[index]?.left &&
      pair.right === correct[index]?.right,
  );
}

function validateMatchingPayload(
  answerData: SubmitGroupChallengeAnswerInput["answerData"],
): MatchingPair[] {
  const pairs = answerData?.pairs;

  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new Error("يجب إرسال أزواج المطابقة أولاً.");
  }

  if (pairs.length > MAX_MATCHING_PAIRS) {
    throw new Error("عدد أزواج المطابقة أكبر من الحد المسموح.");
  }

  const validPairs = pairs.map((pair) => {
    if (
      !pair ||
      typeof pair.left !== "string" ||
      typeof pair.right !== "string" ||
      !pair.left.trim() ||
      !pair.right.trim()
    ) {
      throw new Error("بيانات المطابقة غير صحيحة.");
    }

    return {
      left: pair.left.trim(),
      right: pair.right.trim(),
    };
  });

  if (
    JSON.stringify(validPairs).length > MAX_MATCHING_PAYLOAD_LENGTH
  ) {
    throw new Error("بيانات المطابقة طويلة جداً.");
  }

  return validPairs;
}

// ============================================
// 1. Get Current Question
// ============================================

export async function getCurrentGroupChallengeQuestionAction(
  challengeId: string,
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

  // currentQuestionIndex is zero-based; question order is one-based.
  const questionOrder = challenge.currentQuestionIndex + 1;

  const question = await prisma.challengeQuestion.findFirst({
    where: {
      challengeId,
      order: questionOrder,
    },
    select: {
      id: true,
      question: true,
      gameType: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      leftText: true,
      rightText: true,
      order: true,
      timeLimit: true,
      challengeQuestionItems: {
        select: {
          id: true,
          leftText: true,
          rightText: true,
        },
      },
    },
  });

  if (!question) {
    throw new Error("السؤال الحالي غير موجود.");
  }

  assertSupportedGameType(String(question.gameType));

  // Do not expose correct matching pairs to the student.
  // Send two independently ordered lists instead.
  const matchingOptions =
    question.gameType === "MATCHING"
      ? {
          left: stableShuffle(
            question.challengeQuestionItems.map((item) => ({
              // Side-specific opaque IDs: never reuse the database pair ID
              // on both sides, because that would reveal the correct match.
              id: stableHash(`${question.id}:left:${item.id}`).toString(36),
              text: item.leftText,
            })),
            (item) => item.id,
            `${question.id}:left`,
          ),
          right: stableShuffle(
            question.challengeQuestionItems.map((item) => ({
              id: stableHash(`${question.id}:right:${item.id}`).toString(36),
              text: item.rightText,
            })),
            (item) => item.id,
            `${question.id}:right`,
          ),
        }
      : null;

  const previousAnswer = await prisma.challengeAnswer.findUnique({
    where: {
      challengeQuestionId_participantId: {
        challengeQuestionId: question.id,
        participantId: participant.id,
      },
    },
    select: {
      id: true,
      isCorrect: true,
      responseTime: true,
    },
  });

  const {
    challengeQuestionItems: _privateMatchingItems,
    ...questionWithoutMatchingItems
  } = question;

  const safeQuestion =
    question.gameType === "MATCHING"
      ? {
          ...questionWithoutMatchingItems,
          // Legacy single-pair fields are not needed for grouped matching.
          leftText: null,
          rightText: null,
        }
      : questionWithoutMatchingItems;

  return {
    success: true,
    question: safeQuestion,
    matchingOptions,
    hasAnswered: Boolean(previousAnswer),
    previousAnswer,
  };
}

// ============================================
// 2. Submit Answer
// ============================================

export async function submitGroupChallengeAnswerAction(
  data: SubmitGroupChallengeAnswerInput,
) {
  const studentId = await requireStudent();

  const challengeId = data?.challengeId?.trim();

  if (!challengeId) {
    throw new Error("معرف التحدي غير صحيح.");
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Find participant and challenge.
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

        // Get the active question and its correct answer only on the server.
        const question = await tx.challengeQuestion.findFirst({
          where: {
            challengeId,
            order: challenge.currentQuestionIndex + 1,
          },
          select: {
            id: true,
            gameType: true,
            answer: true,
            timeLimit: true,
            challengeQuestionItems: {
              select: {
                leftText: true,
                rightText: true,
              },
            },
          },
        });

        if (!question) {
          throw new Error("السؤال الحالي غير موجود.");
        }

        assertSupportedGameType(String(question.gameType));

        // Check server-side response time.
        const responseTime = Math.max(
          0,
          Date.now() - challenge.currentQuestionStartedAt.getTime(),
        );

        if (responseTime > question.timeLimit * 1000) {
          throw new Error("انتهى وقت الإجابة على هذا السؤال.");
        }

        // Prevent duplicate answers.
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

        let isCorrect = false;
        let answerToSave: string;
        let answerDataToSave: Prisma.InputJsonValue | undefined;

        if (question.gameType === "MATCHING") {
          const submittedPairs = validateMatchingPayload(data.answerData);

          if (question.challengeQuestionItems.length === 0) {
            throw new Error("لا توجد أزواج مطابقة معرفة لهذا السؤال.");
          }

          const correctPairs = question.challengeQuestionItems.map(
            (item) => ({
              left: item.leftText,
              right: item.rightText,
            }),
          );

          isCorrect = isMatchingAnswerCorrect(
            submittedPairs,
            correctPairs,
          );

          answerToSave = JSON.stringify(submittedPairs);
          answerDataToSave = {
            pairs: submittedPairs,
          };
        } else {
          const answer = data.answer?.trim();

          if (!answer) {
            throw new Error("يجب إدخال الإجابة أولاً.");
          }

          if (answer.length > MAX_TEXT_ANSWER_LENGTH) {
            throw new Error("الإجابة طويلة جداً.");
          }

          if (!question.answer?.trim()) {
            throw new Error("لم يتم تحديد الإجابة الصحيحة لهذا السؤال.");
          }

          // QUIZ and FILL_BLANKS are validated against the saved answer.
          isCorrect =
            normalizeAnswer(answer) ===
            normalizeAnswer(question.answer);

          answerToSave = answer;
        }

        const pointsAwarded = isCorrect
          ? POINTS_PER_CORRECT_ANSWER
          : 0;

        // Save answer. Matching stores its structured payload in answerData.
        const savedAnswer = await tx.challengeAnswer.create({
          data: {
            challengeQuestionId: question.id,
            participantId: participant.id,
            answer: answerToSave,
            ...(answerDataToSave
              ? { answerData: answerDataToSave }
              : {}),
            isCorrect,
            responseTime,
          },
          select: {
            id: true,
            answer: true,
            answerData: true,
            isCorrect: true,
            responseTime: true,
            submittedAt: true,
          },
        });

        // Update participant score atomically.
        const updatedParticipant = await tx.challengeParticipant.update({
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
      },
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
    // Handle duplicate submission race condition.
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
