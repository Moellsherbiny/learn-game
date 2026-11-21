"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, GroupChallengeStatus, UserRole } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { GROUP_CHALLENGE_QUESTION_DURATION_SECONDS } from "@/lib/group-challenge-constants";
import { getMatchingOptionId } from "@/lib/group-challenge-matching";

type MatchingSelection = { leftId: string; rightId: string };
type SubmitInput = {
  challengeId: string;
  answer?: string;
  answerData?: { pairs: MatchingSelection[] };
};

async function requireStudent() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("يجب تسجيل الدخول أولاً.");
  if (session.user.role !== UserRole.STUDENT) throw new Error("هذه العملية متاحة للطلاب فقط.");
  return session.user.id;
}

function normalizeAnswer(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function assertSupportedGameType(type: string) {
  if (type !== "QUIZ" && type !== "MATCHING" && type !== "FILL_BLANKS") {
    throw new Error("نوع السؤال غير مدعوم في التحديات الجماعية.");
  }
}

export async function getCurrentGroupChallengeQuestionAction(challengeId: string) {
  const studentId = await requireStudent();
  if (!challengeId?.trim()) throw new Error("معرف التحدي غير صحيح.");

  const participant = await prisma.challengeParticipant.findUnique({
    where: { challengeId_studentId: { challengeId, studentId } },
    select: {
      id: true,
      challenge: { select: { status: true, currentQuestionIndex: true } },
    },
  });
  if (!participant) throw new Error("أنت غير منضم إلى هذا التحدي.");
  if (participant.challenge.status !== GroupChallengeStatus.LIVE) {
    throw new Error("التحدي ليس قيد التشغيل حالياً.");
  }

  const question = await prisma.challengeQuestion.findFirst({
    where: { challengeId, order: participant.challenge.currentQuestionIndex + 1 },
    select: {
      id: true, question: true, gameType: true,
      optionA: true, optionB: true, optionC: true, optionD: true, order: true,
      challengeQuestionItems: { select: { id: true, leftText: true, rightText: true } },
    },
  });
  if (!question) throw new Error("السؤال الحالي غير موجود.");
  assertSupportedGameType(String(question.gameType));

  const matchingOptions = question.gameType === "MATCHING"
    ? {
        left: question.challengeQuestionItems.map((item) => ({
          id: getMatchingOptionId(question.id, "left", item.id),
          text: item.leftText,
        })),
        right: question.challengeQuestionItems.map((item) => ({
          id: getMatchingOptionId(question.id, "right", item.id),
          text: item.rightText,
        })),
      }
    : null;

  const previousAnswer = await prisma.challengeAnswer.findUnique({
    where: {
      challengeQuestionId_participantId: {
        challengeQuestionId: question.id,
        participantId: participant.id,
      },
    },
    select: { id: true, isCorrect: true, responseTime: true },
  });

  return {
    success: true,
    question: {
      id: question.id,
      question: question.question,
      gameType: question.gameType,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      order: question.order,
    },
    matchingOptions,
    hasAnswered: Boolean(previousAnswer),
    previousAnswer,
  };
}

export async function submitGroupChallengeAnswerAction(data: SubmitInput) {
  const studentId = await requireStudent();
  const challengeId = data?.challengeId?.trim();
  if (!challengeId) throw new Error("معرف التحدي غير صحيح.");

  const result = await prisma.$transaction(async (tx) => {
    // Serialize submissions with the expiry transition helper.
    const locked = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "GroupChallenge" WHERE "id" = ${challengeId} FOR UPDATE
    `;
    if (locked.length === 0) throw new Error("التحدي غير موجود.");

    const participant = await tx.challengeParticipant.findUnique({
      where: { challengeId_studentId: { challengeId, studentId } },
      select: {
        id: true,
        challenge: {
          select: {
            status: true,
            currentQuestionIndex: true,
            currentQuestionStartedAt: true,
            pointsPerQuestion: true,
          },
        },
      },
    });
    if (!participant) throw new Error("أنت غير منضم إلى هذا التحدي.");

    const challenge = participant.challenge;
    if (challenge.status !== GroupChallengeStatus.LIVE) throw new Error("التحدي ليس قيد التشغيل.");
    if (!challenge.currentQuestionStartedAt) throw new Error("لم يتم تسجيل بداية السؤال الحالي.");

    const question = await tx.challengeQuestion.findFirst({
      where: { challengeId, order: challenge.currentQuestionIndex + 1 },
      select: {
        id: true, gameType: true, answer: true,
        challengeQuestionItems: { select: { id: true, leftText: true, rightText: true } },
      },
    });
    if (!question) throw new Error("السؤال الحالي غير موجود.");
    assertSupportedGameType(String(question.gameType));

    const responseTime = Math.max(0, Date.now() - challenge.currentQuestionStartedAt.getTime());
    if (responseTime >= GROUP_CHALLENGE_QUESTION_DURATION_SECONDS * 1000) {
      throw new Error("انتهى وقت الإجابة على هذا السؤال.");
    }

    const previous = await tx.challengeAnswer.findUnique({
      where: {
        challengeQuestionId_participantId: {
          challengeQuestionId: question.id,
          participantId: participant.id,
        },
      },
      select: { id: true },
    });
    if (previous) throw new Error("لقد أرسلت إجابتك بالفعل.");

    let isCorrect = false;
    let answer = "";
    let answerData: Prisma.InputJsonValue | undefined;

    if (question.gameType === "MATCHING") {
      const pairs = data.answerData?.pairs;
      if (!Array.isArray(pairs) || pairs.length !== question.challengeQuestionItems.length || pairs.length === 0) {
        throw new Error("أكمل جميع أزواج المطابقة أولاً.");
      }

      const leftMap = new Map(question.challengeQuestionItems.map((item) => [
        getMatchingOptionId(question.id, "left", item.id), item,
      ]));
      const rightMap = new Map(question.challengeQuestionItems.map((item) => [
        getMatchingOptionId(question.id, "right", item.id), item,
      ]));
      const usedLeft = new Set<string>();
      const usedRight = new Set<string>();
      const textPairs: Array<{ left: string; right: string }> = [];
      let allPairsCorrect = true;

      for (const pair of pairs) {
        if (
          !pair ||
          typeof pair.leftId !== "string" ||
          typeof pair.rightId !== "string" ||
          usedLeft.has(pair.leftId) ||
          usedRight.has(pair.rightId)
        ) throw new Error("بيانات المطابقة غير صحيحة.");

        const leftItem = leftMap.get(pair.leftId);
        const rightItem = rightMap.get(pair.rightId);
        if (!leftItem || !rightItem) throw new Error("أحد اختيارات المطابقة غير صالح.");

        usedLeft.add(pair.leftId);
        usedRight.add(pair.rightId);
        if (leftItem.id !== rightItem.id) allPairsCorrect = false;
        textPairs.push({ left: leftItem.leftText, right: rightItem.rightText });
      }

      isCorrect = allPairsCorrect;
      answer = JSON.stringify(textPairs);
      answerData = { pairs: textPairs };
    } else {
      const textAnswer = data.answer?.trim();
      if (!textAnswer) throw new Error("يجب إدخال الإجابة أولاً.");
      if (textAnswer.length > 2000) throw new Error("الإجابة طويلة جداً.");
      if (!question.answer?.trim()) throw new Error("لم يتم تحديد الإجابة الصحيحة لهذا السؤال.");
      answer = textAnswer;
      isCorrect = normalizeAnswer(textAnswer) === normalizeAnswer(question.answer);
    }

    const pointsAwarded = isCorrect ? challenge.pointsPerQuestion : 0;
    const savedAnswer = await tx.challengeAnswer.create({
      data: {
        challengeQuestionId: question.id,
        participantId: participant.id,
        answer,
        ...(answerData ? { answerData } : {}),
        isCorrect,
        responseTime,
      },
      select: {
        id: true, answer: true, answerData: true, isCorrect: true,
        responseTime: true, submittedAt: true,
      },
    });

    const updatedParticipant = await tx.challengeParticipant.update({
      where: { id: participant.id },
      data: { score: { increment: pointsAwarded } },
      select: { id: true, team: true, score: true },
    });

    return { answer: savedAnswer, participant: updatedParticipant, isCorrect, pointsAwarded, responseTime };
  }, { isolationLevel: "Serializable" });

  revalidatePath(`/student/group-challenges/${challengeId}`);
  revalidatePath(`/student/group-challenges/${challengeId}/live`);
  revalidatePath("/teacher/group-challenges");

  return {
    success: true,
    message: result.isCorrect ? "إجابة صحيحة! أحسنت." : "إجابة غير صحيحة.",
    ...result,
  };
}
