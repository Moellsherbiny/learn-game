"use server";

import { auth } from "@/auth";

import { prisma } from "@/lib/prisma";

import {

  UserRole,

  ChallengeTeam,

  GroupChallengeStatus,

} from "@/lib/generated/prisma/client";

import { revalidatePath } from "next/cache";

import { ChallengeInvitationStatus } from "@/lib/generated/prisma/client";

import { advanceGroupChallengeIfExpired } from "@/lib/group-challenge";
import {
  GROUP_CHALLENGE_QUESTION_DURATION_SECONDS,
} from "@/lib/group-challenge-constants";
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
// 1. Join Group Challenge
// ============================================

export async function joinGroupChallengeAction(code: string) {

  const studentId = await requireStudent();

  const normalizedCode = code?.trim().toUpperCase();

  if (!normalizedCode) {

    throw new Error("من فضلك أدخل كود التحدي.");

  }

  if (normalizedCode.length !== 8) {

    throw new Error("كود التحدي غير صحيح.");

  }

  const result = await prisma.$transaction(

    async (tx) => {
// Find challenge

      const challenge = await tx.groupChallenge.findUnique({

        where: {

          code: normalizedCode,

        },

        select: {

          id: true,

          title: true,

          code: true,

          courseId: true,

          status: true,

        },

      });

      if (!challenge) {

        throw new Error("التحدي غير موجود. تأكد من الكود.");

      }

      if (challenge.status !== GroupChallengeStatus.WAITING) {

        throw new Error("هذا التحدي لم يعد متاحاً للانضمام.");

      }
// Check challenge invitation

      const invitation = await tx.challengeInvitation.findUnique({

        where: {

          challengeId_studentId: {

            challengeId: challenge.id,

            studentId,

          },

        },

        select: {

          status: true,

        },

      });

      if (!invitation) {

        throw new Error("لم تصلك دعوة لهذا التحدي.");

      }

      if (

        invitation.status !== ChallengeInvitationStatus.ACCEPTED

      ) {

        throw new Error(

          "يجب قبول الدعوة أولاً للانضمام إلى التحدي."

        );

      }
// Check course enrollment

      const enrollment = await tx.enrollment.findUnique({

        where: {

          courseId_studentId: {

            courseId: challenge.courseId,

            studentId,

          },

        },

        select: {

          id: true,

        },

      });

      if (!enrollment) {

        throw new Error("يجب التسجيل في الكورس أولاً للانضمام.");

      }
// Check if student already joined

      const existingParticipant =

        await tx.challengeParticipant.findUnique({

          where: {

            challengeId_studentId: {

              challengeId: challenge.id,

              studentId,

            },

          },

        });

      if (existingParticipant) {

        return {

          alreadyJoined: true,

          challenge,

          participant: existingParticipant,

        };

      }
// Count members in each team

      const [teamACount, teamBCount] = await Promise.all([

        tx.challengeParticipant.count({

          where: {

            challengeId: challenge.id,

            team: ChallengeTeam.TEAM_A,

          },

        }),

        tx.challengeParticipant.count({

          where: {

            challengeId: challenge.id,

            team: ChallengeTeam.TEAM_B,

          },

        }),

      ]);
// Assign student to the smaller team

      const team =

        teamACount <= teamBCount

          ? ChallengeTeam.TEAM_A

          : ChallengeTeam.TEAM_B;
// Create participant

      const participant = await tx.challengeParticipant.create({

        data: {

          challengeId: challenge.id,

          studentId,

          team,

          isReady: false,

        },

      });

      return {

        alreadyJoined: false,

        challenge,

        participant,

      };

    },

    {

      isolationLevel: "Serializable",

    }

  );

  revalidatePath("/student/group-challenges");

  return {

    success: true,

    alreadyJoined: result.alreadyJoined,

    message: result.alreadyJoined

      ? "أنت منضم بالفعل إلى هذا التحدي."

      : "تم الانضمام إلى التحدي بنجاح.",

    challenge: result.challenge,

    participant: result.participant,

  };

}
// ============================================
// 2. Set Participant Ready Status
// ============================================

export async function setGroupChallengeReadyAction(

  challengeId: string,

  isReady: boolean

) {

  const studentId = await requireStudent();

  if (!challengeId?.trim()) {

    throw new Error("معرف التحدي غير صحيح.");

  }

  if (typeof isReady !== "boolean") {

    throw new Error("حالة الاستعداد غير صحيحة.");

  }

  const participant = await prisma.challengeParticipant.findUnique({

    where: {

      challengeId_studentId: {

        challengeId,

        studentId,

      },

    },

    include: {

      challenge: {

        select: {

          status: true,

        },

      },

    },

  });

  if (!participant) {

    throw new Error("أنت غير منضم إلى هذا التحدي.");

  }

  if (participant.challenge.status !== GroupChallengeStatus.WAITING) {

    throw new Error("لا يمكن تغيير حالة الاستعداد بعد بدء التحدي.");

  }

  const updatedParticipant =

    await prisma.challengeParticipant.update({

      where: {

        id: participant.id,

      },

      data: {

        isReady,

      },

      select: {

        id: true,

        challengeId: true,

        team: true,

        isReady: true,

        joinedAt: true,

      },

    });

  revalidatePath("/student/group-challenges");

  return {

    success: true,

    message: isReady

      ? "أنت الآن جاهز للتحدي."

      : "تم إلغاء حالة الاستعداد.",

    participant: updatedParticipant,

  };

}
// ============================================
// 3. Get Student Group Challenge
// ============================================

export async function getStudentGroupChallengeAction(

  challengeId: string

) {

  const studentId = await requireStudent();

  if (!challengeId?.trim()) {

    throw new Error("معرف التحدي غير صحيح.");

  }

  // Advance the challenge before reading its current status.
  await advanceGroupChallengeIfExpired(challengeId);
 const participant = await prisma.challengeParticipant.findUnique({
    where: {
      challengeId_studentId: {
        challengeId,
        studentId,
      },
    },
    select: {
      id: true,
      studentId: true,
      team: true,
      isReady: true,
      joinedAt: true,
      challenge: {
        select: {
          id: true,
          title: true,
          code: true,
          status: true,
          currentQuestionIndex: true,
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
              joinedAt: "asc",
            },
            select: {
              id: true,
              team: true,
              isReady: true,
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
    },
  });

  if (!participant) {
    throw new Error("أنت غير منضم إلى هذا التحدي.");
  }


  return {

    success: true,

    participant,

    challenge: participant.challenge,

  };

}

export async function getMyGroupChallengesAction() {

  const studentId = await requireStudent();

  const participants = await prisma.challengeParticipant.findMany({

    where: {

      studentId,

    },

    orderBy: {

      joinedAt: "desc",

    },

    select: {

      id: true,

      team: true,

      isReady: true,

      score: true,

      joinedAt: true,

      challenge: {

        select: {

          id: true,

          title: true,

          code: true,

          status: true,

          startedAt: true,

          finishedAt: true,

          course: {

            select: {

              title: true,

            },

          },

          _count: {

            select: {

              participants: true,

              questions: true,

            },

          },

        },

      },

    },

  });

  return participants;

}
// ============================================
// 4. Get Student Live Challenge State
// ============================================

export async function getStudentGroupChallengeLiveAction(
  challengeId: string
) {
  const studentId = await requireStudent();

  if (!challengeId?.trim()) {
    throw new Error("معرف التحدي غير صحيح.");
  }

  await advanceGroupChallengeIfExpired(challengeId);

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
          currentQuestionIndex: true,
          currentQuestionStartedAt: true,
          pointsPerQuestion: true,
          questions: {
            orderBy: {
              order: "asc",
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
            },
          },
          participants: {
            select: {
              team: true,
              score: true,
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

  if (challenge.status === GroupChallengeStatus.FINISHED) {
    throw new Error("انتهى التحدي. يمكنك مشاهدة النتائج الآن.");
  }

  if (challenge.status !== GroupChallengeStatus.LIVE) {
    throw new Error("التحدي ليس قيد التشغيل.");
  }

  const question =
    challenge.questions[challenge.currentQuestionIndex] ?? null;

  if (!question) {
    throw new Error("السؤال الحالي غير موجود.");
  }

  // Always use the fixed 60-second duration.
  const currentQuestion = {
    ...question,
    timeLimit: GROUP_CHALLENGE_QUESTION_DURATION_SECONDS,
  };

  const existingAnswer = await prisma.challengeAnswer.findUnique({
    where: {
      challengeQuestionId_participantId: {
        challengeQuestionId: currentQuestion.id,
        participantId: participant.id,
      },
    },
    select: {
      answer: true,
      isCorrect: true,
      responseTime: true,
    },
  });

  const teamA = challenge.participants.filter(
    (item) => item.team === "TEAM_A"
  );

  const teamB = challenge.participants.filter(
    (item) => item.team === "TEAM_B"
  );

  return {
    participant: {
      id: participant.id,
      team: participant.team,
      score: participant.score,
    },

    challenge: {
      id: challenge.id,
      title: challenge.title,
      status: challenge.status,
      currentQuestionIndex: challenge.currentQuestionIndex,
      currentQuestionStartedAt: challenge.currentQuestionStartedAt,
      totalQuestions: challenge.questions.length,
      pointsPerQuestion: challenge.pointsPerQuestion,
    },

    currentQuestion,
    existingAnswer,

    teamScores: {
      teamA: teamA.reduce((sum, item) => sum + item.score, 0),
      teamB: teamB.reduce((sum, item) => sum + item.score, 0),
    },
  };
}
// ============================================
// 5. Submit Student Answer
// ============================================

export async function submitGroupChallengeAnswerAction(
  challengeId: string,
  answer: string
) {
  const studentId = await requireStudent();
  const normalizedAnswer = answer?.trim();

  if (!challengeId?.trim()) {
    throw new Error("معرف التحدي غير صحيح.");
  }

  if (!normalizedAnswer) {
    throw new Error("من فضلك اختر إجابة أولاً.");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Lock the challenge row to prevent concurrent question transitions
    // while an answer is being submitted.
    const lockedChallenges = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "GroupChallenge"
      WHERE "id" = ${challengeId}
      FOR UPDATE
    `;

    if (lockedChallenges.length === 0) {
      throw new Error("التحدي غير موجود.");
    }

    const participant = await tx.challengeParticipant.findUnique({
      where: {
        challengeId_studentId: {
          challengeId,
          studentId,
        },
      },
      select: {
        id: true,
        score: true,
      },
    });

    if (!participant) {
      throw new Error("أنت غير منضم إلى هذا التحدي.");
    }

    // Read the challenge state after acquiring the row lock.
    const challenge = await tx.groupChallenge.findUnique({
      where: {
        id: challengeId,
      },
      select: {
        status: true,
        currentQuestionIndex: true,
        currentQuestionStartedAt: true,
        pointsPerQuestion: true,
        questions: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            answer: true,
          },
        },
      },
    });

    if (!challenge || challenge.status !== GroupChallengeStatus.LIVE) {
      throw new Error("التحدي ليس قيد التشغيل.");
    }

    const question =
      challenge.questions[challenge.currentQuestionIndex];

    if (!question) {
      throw new Error("السؤال الحالي غير موجود.");
    }

    const startedAt = challenge.currentQuestionStartedAt;

    if (!startedAt) {
      throw new Error("لم يتم تحديد وقت بداية السؤال.");
    }

    const responseTime = Date.now() - startedAt.getTime();

    // Every question has a fixed duration of 60 seconds.
    if (
      responseTime >=
      GROUP_CHALLENGE_QUESTION_DURATION_SECONDS * 1000
    ) {
      throw new Error("انتهى وقت الإجابة عن هذا السؤال.");
    }

    const existingAnswer = await tx.challengeAnswer.findUnique({
      where: {
        challengeQuestionId_participantId: {
          challengeQuestionId: question.id,
          participantId: participant.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingAnswer) {
      throw new Error("لقد أرسلت إجابتك بالفعل.");
    }

    const isCorrect =
      normalizedAnswer.toLocaleLowerCase() ===
      (question.answer ?? "").trim().toLocaleLowerCase();

    const pointsAwarded = isCorrect
      ? challenge.pointsPerQuestion
      : 0;

    await tx.challengeAnswer.create({
      data: {
        challengeQuestionId: question.id,
        participantId: participant.id,
        answer: normalizedAnswer,
        isCorrect,
        responseTime,
      },
    });

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
        score: true,
      },
    });

    return {
      isCorrect,
      pointsAwarded,
      score: updatedParticipant.score,
      responseTime,
    };
  });

  revalidatePath(`/student/group-challenges/${challengeId}`);

  return {
    success: true,
    message: result.isCorrect
      ? "إجابة صحيحة! أحسنت."
      : "إجابة غير صحيحة. حاول في السؤال التالي.",
    ...result,
  };
}

// ============================================
// 6. Get Student Challenge Results
// ============================================

export async function getStudentGroupChallengeResultsAction(

  challengeId: string

) {

  const studentId = await requireStudent();

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

          course: {

            select: {

              title: true,

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

              answers: {

                select: {

                  participantId: true,

                  answer: true,

                  isCorrect: true,

                  responseTime: true,

                },

              },

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

    },

  });

  if (!participant) {

    throw new Error("أنت غير منضم إلى هذا التحدي.");

  }

  if (participant.challenge.status !== GroupChallengeStatus.FINISHED) {

    throw new Error("لم يتم إنهاء التحدي بعد.");

  }

  const challenge = participant.challenge;

  const teamA = challenge.participants.filter(

    (item) => item.team === "TEAM_A"

  );

  const teamB = challenge.participants.filter(

    (item) => item.team === "TEAM_B"

  );

  const teamAScore = teamA.reduce(

    (sum, item) => sum + item.score,

    0

  );

  const teamBScore = teamB.reduce(

    (sum, item) => sum + item.score,

    0

  );

  const myAnswers = challenge.questions.map((question) => {

    const answer = question.answers.find(

      (item) => item.participantId === participant.id

    );

    return {

      questionId: question.id,

      question: question.question,

      correctAnswer: question.answer,

      submittedAnswer: answer?.answer ?? null,

      isCorrect: answer?.isCorrect ?? false,

      responseTime: answer?.responseTime ?? null,

    };

  });

  return {

    challenge: {

      id: challenge.id,

      title: challenge.title,

      courseTitle: challenge.course.title,

      startedAt: challenge.startedAt,

      finishedAt: challenge.finishedAt,

    },

    participant: {

      id: participant.id,

      team: participant.team,

      score: participant.score,

      rank:

        challenge.participants.findIndex(

          (item) => item.id === participant.id

        ) + 1,

    },

    teams: {

      teamA: {

        score: teamAScore,

        participants: teamA,

      },

      teamB: {

        score: teamBScore,

        participants: teamB,

      },

      winner:

        teamAScore === teamBScore

          ? "DRAW"

          : teamAScore > teamBScore

            ? "TEAM_A"

            : "TEAM_B",

    },

    questions: myAnswers,

    totalQuestions: challenge.questions.length,

    correctAnswers: myAnswers.filter(

      (item) => item.isCorrect

    ).length,

  };

}
