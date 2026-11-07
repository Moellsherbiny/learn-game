
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  UserRole,
  GroupChallengeStatus,
} from "@/lib/generated/prisma/client";

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
// Get Student Challenge Results
// ============================================

export async function getStudentGroupChallengeResultsAction(
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
      team: true,
      score: true,

      challenge: {
        select: {
          id: true,
          title: true,
          status: true,
          startedAt: true,
          finishedAt: true,

          participants: {
            orderBy: [
              {
                score: "desc",
              },
              {
                joinedAt: "asc",
              },
            ],

            select: {
              id: true,
              team: true,
              score: true,

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

      answers: {
        orderBy: {
          submittedAt: "asc",
        },

        select: {
          id: true,
          answer: true,
          isCorrect: true,
          responseTime: true,
          submittedAt: true,

          question: {
            select: {
              id: true,
              question: true,
              answer: true,
              order: true,
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

  if (challenge.status !== GroupChallengeStatus.FINISHED) {
    throw new Error("النتائج ستكون متاحة بعد انتهاء التحدي.");
  }

  // Build individual leaderboard
  const leaderboard = challenge.participants.map(
    (item, index) => ({
      rank: index + 1,
      student: item.student,
      team: item.team,
      score: item.score,
      isCurrentStudent: item.id === participant.id,
    })
  );

  const teamA = challenge.participants.filter(
    (item) => item.team === "TEAM_A"
  );

  const teamB = challenge.participants.filter(
    (item) => item.team === "TEAM_B"
  );

  const teamAStats = {
    score: teamA.reduce(
      (total, item) => total + item.score,
      0
    ),
    participants: teamA.length,
  };

  const teamBStats = {
    score: teamB.reduce(
      (total, item) => total + item.score,
      0
    ),
    participants: teamB.length,
  };

  let winningTeam: "TEAM_A" | "TEAM_B" | "DRAW" = "DRAW";

  if (teamAStats.score > teamBStats.score) {
    winningTeam = "TEAM_A";
  } else if (teamBStats.score > teamAStats.score) {
    winningTeam = "TEAM_B";
  }

  const correctAnswers = participant.answers.filter(
    (answer) => answer.isCorrect
  ).length;

  const wrongAnswers = participant.answers.filter(
    (answer) => !answer.isCorrect
  ).length;

  const totalResponseTime = participant.answers.reduce(
    (total, answer) => total + answer.responseTime,
    0
  );

  const myResult = {
    team: participant.team,
    score: participant.score,

    correctAnswers,
    wrongAnswers,
    totalAnswers: participant.answers.length,

    averageResponseTime:
      participant.answers.length > 0
        ? Math.round(
            totalResponseTime / participant.answers.length
          )
        : 0,

    answers: participant.answers,
  };

  return {
    success: true,

    challenge: {
      id: challenge.id,
      title: challenge.title,
      status: challenge.status,
      startedAt: challenge.startedAt,
      finishedAt: challenge.finishedAt,
    },

    myResult,

    teams: {
      teamA: teamAStats,
      teamB: teamBStats,
      winningTeam,
    },

    leaderboard,
  };
}
