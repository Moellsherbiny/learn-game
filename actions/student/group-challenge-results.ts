"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GroupChallengeStatus, UserRole } from "@/lib/generated/prisma/client";

async function requireStudent() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("يجب تسجيل الدخول أولاً.");
  if (session.user.role !== UserRole.STUDENT) throw new Error("هذه العملية متاحة للطلاب فقط.");
  return session.user.id;
}

export async function getStudentGroupChallengeResultsAction(challengeId: string) {
  const studentId = await requireStudent();
  if (!challengeId?.trim()) throw new Error("معرف التحدي غير صحيح.");

  const participant = await prisma.challengeParticipant.findUnique({
    where: { challengeId_studentId: { challengeId, studentId } },
    select: {
      id: true,
      team: true,
      score: true,
      answers: {
        select: {
          challengeQuestionId: true,
          answer: true,
          answerData: true,
          isCorrect: true,
          responseTime: true,
        },
      },
      challenge: {
        select: {
          id: true,
          title: true,
          status: true,
          startedAt: true,
          finishedAt: true,
          questions: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              question: true,
              answer: true,
              gameType: true,
              order: true,
              challengeQuestionItems: {
                select: { leftText: true, rightText: true },
              },
            },
          },
          participants: {
            orderBy: [{ score: "desc" }, { joinedAt: "asc" }],
            select: {
              id: true,
              team: true,
              score: true,
              student: { select: { id: true, name: true, image: true } },
            },
          },
        },
      },
    },
  });

  if (!participant) throw new Error("أنت غير منضم إلى هذا التحدي.");
  const challenge = participant.challenge;
  if (challenge.status !== GroupChallengeStatus.FINISHED) {
    throw new Error("النتائج ستكون متاحة بعد انتهاء التحدي.");
  }

  const teamA = challenge.participants.filter((item) => item.team === "TEAM_A");
  const teamB = challenge.participants.filter((item) => item.team === "TEAM_B");
  const teamAStats = {
    score: teamA.reduce((sum, item) => sum + item.score, 0),
    participants: teamA,
  };
  const teamBStats = {
    score: teamB.reduce((sum, item) => sum + item.score, 0),
    participants: teamB,
  };
  const winner =
    teamAStats.score === teamBStats.score
      ? "DRAW"
      : teamAStats.score > teamBStats.score
        ? "TEAM_A"
        : "TEAM_B";

  const answerByQuestionId = new Map(
    participant.answers.map((answer) => [answer.challengeQuestionId, answer])
  );

  const questions = challenge.questions.map((question) => {
    const submitted = answerByQuestionId.get(question.id);
    return {
      questionId: question.id,
      question: question.question,
      gameType: question.gameType,
      order: question.order,
      correctAnswer: question.answer,
      submittedAnswer: submitted?.answer ?? null,
      submittedAnswerData: submitted?.answerData ?? null,
      correctPairs:
        question.gameType === "MATCHING" ? question.challengeQuestionItems : [],
      isCorrect: submitted?.isCorrect ?? false,
      responseTime: submitted?.responseTime ?? null,
    };
  });

  return {
    success: true,
    challenge: {
      id: challenge.id,
      title: challenge.title,
      status: challenge.status,
      startedAt: challenge.startedAt,
      finishedAt: challenge.finishedAt,
    },
    participant: {
      id: participant.id,
      team: participant.team,
      score: participant.score,
      rank: challenge.participants.findIndex((item) => item.id === participant.id) + 1,
    },
    teams: { teamA: teamAStats, teamB: teamBStats, winner },
    questions,
    totalQuestions: questions.length,
    correctAnswers: questions.filter((item) => item.isCorrect).length,
  };
}
