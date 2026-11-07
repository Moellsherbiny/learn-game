
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { randomInt } from "node:crypto";

// ============================================
// Types
// ============================================

type CreateGroupChallengeInput = {
  title: string;
  courseId: string;
  questionIds: string[];
  timeLimit?: number;
};

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
// Helpers
// ============================================

async function generateChallengeCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = Array.from(
      { length: 8 },
      () => characters[randomInt(characters.length)]
    ).join("");

    const existing = await prisma.groupChallenge.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("تعذر إنشاء كود التحدي. حاول مرة أخرى.");
}

// ============================================
// 1. Create Group Challenge
// ============================================

export async function createGroupChallengeAction(
  data: CreateGroupChallengeInput
) {
  const teacherId = await requireTeacher();

  const title = data.title?.trim();
  const courseId = data.courseId?.trim();
  const questionIds = data.questionIds;

  if (!title) {
    throw new Error("عنوان التحدي مطلوب.");
  }

  if (!courseId) {
    throw new Error("يجب تحديد الكورس.");
  }

  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    throw new Error("يجب اختيار سؤال واحد على الأقل.");
  }

  if (questionIds.length > 50) {
    throw new Error("الحد الأقصى للأسئلة هو 50 سؤالاً.");
  }

  if (
    questionIds.some(
      (id) => typeof id !== "string" || !id.trim()
    )
  ) {
    throw new Error("قائمة الأسئلة غير صحيحة.");
  }

  const uniqueQuestionIds = [...new Set(questionIds)];

  if (uniqueQuestionIds.length !== questionIds.length) {
    throw new Error("لا يمكن اختيار السؤال أكثر من مرة.");
  }

  const timeLimit = 60;

  if (
    !Number.isInteger(timeLimit) ||
    timeLimit < 5 ||
    timeLimit > 300
  ) {
    throw new Error("وقت السؤال يجب أن يكون بين 5 و300 ثانية.");
  }

  // Verify course ownership
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      teacherId,
    },
    select: {
      id: true,
    },
  });

  if (!course) {
    throw new Error("الكورس غير موجود أو غير مصرح لك.");
  }

  // Fetch selected questions from the teacher's course
  const contents = await prisma.lessonContent.findMany({
    where: {
      id: {
        in: uniqueQuestionIds,
      },
      lesson: {
        is: {
          module: {
            is: {
              course: {
                is: {
                  id: courseId,
                  teacherId,
                },
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      question: true,
      answer: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      leftText: true,
      rightText: true,
    },
  });

  if (contents.length !== uniqueQuestionIds.length) {
    throw new Error(
      "بعض الأسئلة غير موجودة أو لا تنتمي إلى هذا الكورس."
    );
  }

  // Keep the same order selected by the teacher
  const contentById = new Map(
    contents.map((content) => [content.id, content])
  );

  const orderedContents = uniqueQuestionIds.map((id) => {
    const content = contentById.get(id);

    if (!content) {
      throw new Error("تعذر العثور على أحد الأسئلة.");
    }

    return content;
  });

  const code = await generateChallengeCode();

  // Create challenge and snapshot questions atomically
  const challenge = await prisma.$transaction(async (tx) => {
    return tx.groupChallenge.create({
      data: {
        title,
        code,
        teacherId,
        courseId,
        questionTimeSeconds: 60,
        questions: {
          create: orderedContents.map((content, index) => ({
            lessonContentId: content.id,

            question: content.question,
            answer: content.answer,

            optionA: content.optionA,
            optionB: content.optionB,
            optionC: content.optionC,
            optionD: content.optionD,

            leftText: content.leftText,
            rightText: content.rightText,

            order: index + 1,
            timeLimit: 60,
          })),
        },
      },

      include: {
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
    });
  });

  revalidatePath("/teacher");
  revalidatePath("/teacher/group-challenges");

  return {
    success: true,
    message: "تم إنشاء التحدي بنجاح.",
    challenge,
  };
}

// ============================================
// 2. Get Teacher Group Challenges
// ============================================

export async function getTeacherGroupChallengesAction() {
  const teacherId = await requireTeacher();

  const challenges = await prisma.groupChallenge.findMany({
    where: {
      teacherId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
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
  });

  return challenges;
}

// ============================================
// 3. Get Group Challenge By ID
// ============================================

export async function getGroupChallengeByIdAction(
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

    include: {
      course: {
        select: {
          id: true,
          title: true,
        },
      },

      questions: {
        orderBy: {
          order: "asc",
        },

        include: {
          lessonContent: {
            select: {
              id: true,
              question: true,
              answer: true,
              optionA: true,
              optionB: true,
              optionC: true,
              optionD: true,
              leftText: true,
              rightText: true,
              sortOrder: true,
            },
          },

          _count: {
            select: {
              answers: true,
            },
          },
        },
      },

      participants: {
        orderBy: {
          joinedAt: "asc",
        },

        include: {
          student: {
            select: {
              id: true,
              name: true,
              image: true,
              level: true,
              xp: true,
            },
          },

          _count: {
            select: {
              answers: true,
            },
          },
        },
      },

      _count: {
        select: {
          questions: true,
          participants: true,
        },
      },
    },
  });

  if (!challenge) {
    throw new Error("التحدي غير موجود أو غير مصرح لك.");
  }

  return challenge;
}
