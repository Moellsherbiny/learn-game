
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  UserRole,
  GroupChallengeStatus,
  ChallengeInvitationStatus,
  ChallengeTeam,
} from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";

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

// 1. Get current student's invitations
export async function getMyChallengeInvitationsAction() {
  const studentId = await requireStudent();

  const invitations = await prisma.challengeInvitation.findMany({
    where: {
      studentId,
      challenge: {
        status: {
          not: GroupChallengeStatus.CANCELLED,
        },
      },
    },
    orderBy: {
      invitedAt: "desc",
    },
    include: {
      challenge: {
        select: {
          id: true,
          title: true,
          code: true,
          status: true,
          questionTimeSeconds: true,
          startedAt: true,
          finishedAt: true,

          teacher: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },

          course: {
            select: {
              id: true,
              title: true,
            },
          },

          _count: {
            select: {
              questions: true,
              participants: true,
            },
          },
        },
      },
    },
  });

  return invitations;
}

// 2. Accept invitation and join the challenge
export async function acceptChallengeInvitationAction(
  invitationId: string
) {
  const studentId = await requireStudent();

  if (!invitationId?.trim()) {
    throw new Error("معرف الدعوة غير صحيح.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const invitation = await tx.challengeInvitation.findFirst({
      where: {
        id: invitationId,
        studentId,
      },
      include: {
        challenge: {
          select: {
            id: true,
            status: true,
            courseId: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new Error("الدعوة غير موجودة.");
    }

    if (
      invitation.status !== ChallengeInvitationStatus.PENDING
    ) {
      throw new Error("تم الرد على هذه الدعوة من قبل.");
    }

    if (
      invitation.challenge.status !== GroupChallengeStatus.WAITING
    ) {
      throw new Error("هذا التحدي لم يعد متاحًا للانضمام.");
    }

    // Confirm the student is still enrolled in the course
    const enrollment = await tx.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId: invitation.challenge.courseId,
          studentId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!enrollment) {
      throw new Error("يجب أن تكون مسجلًا في الكورس.");
    }

    // Prevent duplicate participation
    const existingParticipant =
      await tx.challengeParticipant.findUnique({
        where: {
          challengeId_studentId: {
            challengeId: invitation.challengeId,
            studentId,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingParticipant) {
      await tx.challengeInvitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          status: ChallengeInvitationStatus.ACCEPTED,
          respondedAt: new Date(),
        },
      });

      return {
        challengeId: invitation.challengeId,
        alreadyJoined: true,
      };
    }

    // Assign student to the team with fewer participants
    const participants = await tx.challengeParticipant.findMany({
      where: {
        challengeId: invitation.challengeId,
      },
      select: {
        team: true,
      },
    });

    const teamACount = participants.filter(
      (p) => p.team === ChallengeTeam.TEAM_A
    ).length;

    const teamBCount = participants.filter(
      (p) => p.team === ChallengeTeam.TEAM_B
    ).length;

    const team =
      teamACount <= teamBCount
        ? ChallengeTeam.TEAM_A
        : ChallengeTeam.TEAM_B;

    await tx.challengeParticipant.create({
      data: {
        challengeId: invitation.challengeId,
        studentId,
        team,
        isReady: false,
      },
    });

    await tx.challengeInvitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: ChallengeInvitationStatus.ACCEPTED,
        respondedAt: new Date(),
      },
    });

    return {
      challengeId: invitation.challengeId,
      alreadyJoined: false,
    };
  });

  revalidatePath("/student/group-challenges");
  revalidatePath(
    `/student/group-challenges/${result.challengeId}`
  );

  revalidatePath("/teacher/group-challenges");

  return {
    success: true,
    challengeId: result.challengeId,
    message: result.alreadyJoined
      ? "أنت منضم بالفعل إلى هذا التحدي."
      : "تم قبول الدعوة والانضمام إلى التحدي بنجاح.",
  };
}

// 3. Decline invitation
export async function declineChallengeInvitationAction(
  invitationId: string
) {
  const studentId = await requireStudent();

  if (!invitationId?.trim()) {
    throw new Error("معرف الدعوة غير صحيح.");
  }

  const invitation = await prisma.challengeInvitation.findFirst({
    where: {
      id: invitationId,
      studentId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!invitation) {
    throw new Error("الدعوة غير موجودة.");
  }

  if (
    invitation.status !== ChallengeInvitationStatus.PENDING
  ) {
    throw new Error("تم الرد على هذه الدعوة من قبل.");
  }

  await prisma.challengeInvitation.update({
    where: {
      id: invitation.id,
    },
    data: {
      status: ChallengeInvitationStatus.DECLINED,
      respondedAt: new Date(),
    },
  });

  revalidatePath("/student/group-challenges");

  return {
    success: true,
    message: "تم رفض الدعوة.",
  };
}
