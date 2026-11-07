
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  UserRole,
} from "@/lib/generated/prisma/client";

// ============================================
// Authentication
// ============================================

async function requireTeacher() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("يجب تسجيل الدخول أولاً.");
  }

  if (session.user.role !== UserRole.TEACHER) {
    throw new Error("غير مصرح لك.");
  }

  return session.user.id;
}

// ============================================
// Get Teacher Challenge Results
// ============================================

export async function getGroupChallengeResultsAction(
  challengeId: string
) {
  const teacherId = await requireTeacher();

  if (!challengeId?.trim()) {
    throw new Error("معرف التحدي غير صحيح.");
  }

  const challenge = await prisma.groupChallenge.findFirst({
    where: {
      id: challengeId,
      teacherId,
    },

    select: {
      id: true,
      title: true,
      code: true,
      status: true,
      startedAt: true,
      finishedAt: true,

      course: {
        select: {
          id: true,
          title: true,
        },
      },

      participants: {
        orderBy: {
          score: "desc",
        },

        select: {
          id: true,
          team: true,
          score: true,
          joinedAt: true,

          student: {
            select: {
              id: true,
              name: true,
              image: true,
              level: true,
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
      },

      questions: {
        orderBy: {
          order: "asc",
        },

        select: {
          id: true,
          question: true,
          answer: true,
          order: true,
          timeLimit: true,

          answers: {
            select: {
              isCorrect: true,
              responseTime: true,

              participant: {
                select: {
                  team: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!challenge) {
    throw new Error("التحدي غير موجود أو غير مصرح لك.");
  }

  const participants = challenge.participants.map(
    (participant, index) => {
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

      return {
        rank: index + 1,
        id: participant.id,
        student: participant.student,
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
    }
  );

  const teamA = participants.filter(
    (participant) => participant.team === "TEAM_A"
  );

  const teamB = participants.filter(
    (participant) => participant.team === "TEAM_B"
  );

  const teamAStats = {
    name: "TEAM_A" as const,
    score: teamA.reduce(
      (total, participant) => total + participant.score,
      0
    ),
    participants: teamA.length,
    correctAnswers: teamA.reduce(
      (total, participant) => total + participant.correctAnswers,
      0
    ),
  };

  const teamBStats = {
    name: "TEAM_B" as const,
    score: teamB.reduce(
      (total, participant) => total + participant.score,
      0
    ),
    participants: teamB.length,
    correctAnswers: teamB.reduce(
      (total, participant) => total + participant.correctAnswers,
      0
    ),
  };

  let winningTeam: "TEAM_A" | "TEAM_B" | "DRAW" = "DRAW";

  if (teamAStats.score > teamBStats.score) {
    winningTeam = "TEAM_A";
  } else if (teamBStats.score > teamAStats.score) {
    winningTeam = "TEAM_B";
  }

  const questionStatistics = challenge.questions.map((question) => {
    const correctCount = question.answers.filter(
      (answer) => answer.isCorrect
    ).length;

    const wrongCount = question.answers.filter(
      (answer) => !answer.isCorrect
    ).length;

    const teamAAnswers = question.answers.filter(
      (answer) => answer.participant.team === "TEAM_A"
    );

    const teamBAnswers = question.answers.filter(
      (answer) => answer.participant.team === "TEAM_B"
    );

    return {
      id: question.id,
      question: question.question,
      order: question.order,
      timeLimit: question.timeLimit,
      totalAnswers: question.answers.length,
      correctCount,
      wrongCount,
      unansweredCount:
        challenge.participants.length - question.answers.length,

      teamA: {
        correct: teamAAnswers.filter(
          (answer) => answer.isCorrect
        ).length,
        wrong: teamAAnswers.filter(
          (answer) => !answer.isCorrect
        ).length,
      },

      teamB: {
        correct: teamBAnswers.filter(
          (answer) => answer.isCorrect
        ).length,
        wrong: teamBAnswers.filter(
          (answer) => !answer.isCorrect
        ).length,
      },
    };
  });

  return {
    success: true,

    challenge: {
      id: challenge.id,
      title: challenge.title,
      code: challenge.code,
      status: challenge.status,
      startedAt: challenge.startedAt,
      finishedAt: challenge.finishedAt,
      course: challenge.course,
    },

    summary: {
      totalParticipants: participants.length,
      totalQuestions: challenge.questions.length,

      totalAnswers: participants.reduce(
        (total, participant) =>
          total + participant.totalAnswers,
        0
      ),

      totalCorrectAnswers: participants.reduce(
        (total, participant) =>
          total + participant.correctAnswers,
        0
      ),

      totalWrongAnswers: participants.reduce(
        (total, participant) =>
          total + participant.wrongAnswers,
        0
      ),
    },

    teams: {
      teamA: teamAStats,
      teamB: teamBStats,
      winningTeam,
    },

    leaderboard: participants,
    questionStatistics,
  };
}
