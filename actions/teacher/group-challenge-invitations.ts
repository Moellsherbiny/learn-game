
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  UserRole,
  GroupChallengeStatus,
} from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";

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

// 1. Get enrolled students for a challenge
export async function getChallengeStudentsAction(
  challengeId: string
) {
  const teacherId = await requireTeacher();

  const challenge = await prisma.groupChallenge.findFirst({
    where: {
      id: challengeId,
      teacherId,
    },
    select: {
      id: true,
      courseId: true,
      status: true,
      participants: {
        select: {
          studentId: true,
        },
      },
      invitations: {
        select: {
          studentId: true,
          status: true,
        },
      },
      course: {
        select: {
          enrollments: {
            select: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  level: true,
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

  const participantIds = new Set(
    challenge.participants.map((p) => p.studentId)
  );

  const invitationMap = new Map(
    challenge.invitations.map((invitation) => [
      invitation.studentId,
      invitation.status,
    ])
  );

  return challenge.course.enrollments
    .map(({ student }) => ({
      ...student,
      isParticipant: participantIds.has(student.id),
      invitationStatus: invitationMap.get(student.id) ?? null,
    }))
    .filter((student) => !student.isParticipant);
}

// 2. Invite selected students
export async function inviteStudentsToChallengeAction(
  challengeId: string,
  studentIds: string[]
) {
  const teacherId = await requireTeacher();

  if (!challengeId?.trim()) {
    throw new Error("معرف التحدي غير صحيح.");
  }

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    throw new Error("اختر طالبًا واحدًا على الأقل.");
  }

  if (
    studentIds.some(
      (id) => typeof id !== "string" || !id.trim()
    )
  ) {
    throw new Error("قائمة الطلاب غير صحيحة.");
  }

  const uniqueStudentIds = [...new Set(studentIds)];

  const challenge = await prisma.groupChallenge.findFirst({
    where: {
      id: challengeId,
      teacherId,
    },
    select: {
      id: true,
      courseId: true,
      status: true,
    },
  });

  if (!challenge) {
    throw new Error("التحدي غير موجود أو غير مصرح لك.");
  }

  if (challenge.status !== GroupChallengeStatus.WAITING) {
    throw new Error("لا يمكن إرسال دعوات بعد بدء التحدي.");
  }

  // Only students enrolled in this challenge's course
  const enrolledStudents = await prisma.enrollment.findMany({
    where: {
      courseId: challenge.courseId,
      studentId: {
        in: uniqueStudentIds,
      },
    },
    select: {
      studentId: true,
    },
  });

  if (enrolledStudents.length !== uniqueStudentIds.length) {
    throw new Error(
      "بعض الطلاب غير مسجلين في الكورس."
    );
  }

  const existingParticipants =
    await prisma.challengeParticipant.findMany({
      where: {
        challengeId,
        studentId: {
          in: uniqueStudentIds,
        },
      },
      select: {
        studentId: true,
      },
    });

  const participantIds = new Set(
    existingParticipants.map((p) => p.studentId)
  );

  const studentsToInvite = uniqueStudentIds.filter(
    (studentId) => !participantIds.has(studentId)
  );

  const result = await prisma.challengeInvitation.createMany({
    data: studentsToInvite.map((studentId) => ({
      challengeId,
      studentId,
    })),
    skipDuplicates: true,
  });

  revalidatePath("/teacher/group-challenges");
  revalidatePath(
    `/teacher/group-challenges/${challengeId}`
  );

  return {
    success: true,
    invitedCount: result.count,
    message:
      result.count > 0
        ? `تم إرسال ${result.count} دعوة بنجاح.`
        : "الطلاب المحددون لديهم دعوات بالفعل أو انضموا للتحدي.",
  };
}
