
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

const QUESTION_TIME_LIMIT = 60;
const MAX_CHALLENGE_QUESTIONS = 50;

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
      () => characters[randomInt(characters.length)],
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
// Matching Helpers
// ============================================

function getMatchingGroupKey(lessonId: string, question: string) {
  return JSON.stringify([lessonId, question]);
}

// ============================================
// 1. Create Group Challenge
// ============================================

export async function createGroupChallengeAction(
  data: CreateGroupChallengeInput,
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

  if (questionIds.length > 250) {
    throw new Error("عدد العناصر المختارة كبير جدًا.");
  }

  if (
    questionIds.some(
      (id) => typeof id !== "string" || !id.trim(),
    )
  ) {
    throw new Error("قائمة الأسئلة غير صحيحة.");
  }

  const uniqueQuestionIds = [...new Set(questionIds)];

  if (uniqueQuestionIds.length !== questionIds.length) {
    throw new Error("لا يمكن اختيار السؤال أكثر من مرة.");
  }

  // Fixed question time
  const timeLimit = QUESTION_TIME_LIMIT;

  // ============================================
  // Verify course ownership
  // ============================================

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

  // ============================================
  // Fetch selected lesson contents
  // ============================================

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
      lessonId: true,
      question: true,
      answer: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      leftText: true,
      rightText: true,
      sortOrder: true,
      lesson: {
        select: {
          gameType: true,
        },
      },
    },
  });

  if (contents.length !== uniqueQuestionIds.length) {
    throw new Error(
      "بعض الأسئلة غير موجودة أو لا تنتمي إلى هذا الكورس.",
    );
  }

  // ============================================
  // Preserve teacher selection order
  // ============================================

  const contentById = new Map(
    contents.map((content) => [content.id, content]),
  );

  const orderedContents = uniqueQuestionIds.map((id) => {
    const content = contentById.get(id);

    if (!content) {
      throw new Error("تعذر العثور على أحد الأسئلة.");
    }

    return content;
  });

  // ============================================
  // Fetch all Matching items for selected lessons
  // ============================================

  const matchingLessonIds = [
    ...new Set(
      orderedContents
        .filter((content) => content.lesson.gameType === "MATCHING")
        .map((content) => content.lessonId),
    ),
  ];

  const allMatchingContents =
    matchingLessonIds.length > 0
      ? await prisma.lessonContent.findMany({
          where: {
            lessonId: {
              in: matchingLessonIds,
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
            lessonId: true,
            question: true,
            leftText: true,
            rightText: true,
            sortOrder: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        })
      : [];

  // ============================================
  // Group Matching items
  // ============================================

  const matchingGroups = new Map<
    string,
    typeof allMatchingContents
  >();

  for (const item of allMatchingContents) {
    const key = getMatchingGroupKey(
      item.lessonId,
      item.question,
    );

    const group = matchingGroups.get(key) ?? [];

    group.push(item);

    matchingGroups.set(key, group);
  }

  // ============================================
  // Prepare challenge questions
  // ============================================

  type PreparedQuestion = {
    lessonContentId: string;
    gameType: (typeof orderedContents)[number]["lesson"]["gameType"];
    question: string;
    answer: string | null;
    optionA: string | null;
    optionB: string | null;
    optionC: string | null;
    optionD: string | null;
    leftText: string | null;
    rightText: string | null;
    matchingItems?: {
      leftText: string;
      rightText: string;
    }[];
  };

  const preparedQuestions: PreparedQuestion[] = [];
  const processedMatchingGroups = new Set<string>();

  for (const content of orderedContents) {
    const gameType = content.lesson.gameType;

    // --------------------------------------------
    // Matching
    // --------------------------------------------

    if (gameType === "MATCHING") {
      const groupKey = getMatchingGroupKey(
        content.lessonId,
        content.question,
      );

      // A matching group should become one question.
      if (processedMatchingGroups.has(groupKey)) {
        continue;
      }

      processedMatchingGroups.add(groupKey);

      const matchingItems = matchingGroups.get(groupKey) ?? [];

      if (matchingItems.length === 0) {
        throw new Error(
          "مجموعة المطابقة لا تحتوي على عناصر.",
        );
      }

      // Ensure teacher selected the entire matching group.
      const selectedIds = new Set(
        orderedContents
          .filter(
            (item) =>
              item.lesson.gameType === "MATCHING" &&
              getMatchingGroupKey(
                item.lessonId,
                item.question,
              ) === groupKey,
          )
          .map((item) => item.id),
      );

      const allGroupIds = new Set(
        matchingItems.map((item) => item.id),
      );

      const isComplete =
        selectedIds.size === allGroupIds.size &&
        [...allGroupIds].every((id) => selectedIds.has(id));

      if (!isComplete) {
        throw new Error(
          "يجب اختيار جميع عناصر مجموعة المطابقة معًا.",
        );
      }

      // Validate matching pairs.
      const hasInvalidPair = matchingItems.some(
        (item) =>
          !item.leftText?.trim() ||
          !item.rightText?.trim(),
      );

      if (hasInvalidPair) {
        throw new Error(
          "بعض عناصر المطابقة لا تحتوي على طرفي السؤال.",
        );
      }

      preparedQuestions.push({
        lessonContentId: matchingItems[0].id,
        gameType,
        question: content.question,
        answer: null,
        optionA: null,
        optionB: null,
        optionC: null,
        optionD: null,
        leftText: null,
        rightText: null,
        matchingItems: matchingItems.map((item) => ({
          leftText: item.leftText!,
          rightText: item.rightText!,
        })),
      });

      continue;
    }

    // --------------------------------------------
    // Other question types
    // --------------------------------------------

    preparedQuestions.push({
      lessonContentId: content.id,
      gameType,
      question: content.question,
      answer: content.answer,
      optionA: content.optionA,
      optionB: content.optionB,
      optionC: content.optionC,
      optionD: content.optionD,
      leftText: content.leftText,
      rightText: content.rightText,
    });
  }

  // ============================================
  // Validate final question count
  // ============================================

  if (preparedQuestions.length === 0) {
    throw new Error("لا توجد أسئلة صالحة لإنشاء التحدي.");
  }

  if (preparedQuestions.length > MAX_CHALLENGE_QUESTIONS) {
    throw new Error("الحد الأقصى للأسئلة هو 50 سؤالاً.");
  }

  // ============================================
  // Generate challenge code
  // ============================================

  const code = await generateChallengeCode();

  // ============================================
  // Create challenge and snapshot atomically
  // ============================================

  const challenge = await prisma.$transaction(async (tx) => {
    return tx.groupChallenge.create({
      data: {
        title,
        code,
        teacherId,
        courseId,
        questionTimeSeconds: timeLimit,

        questions: {
          create: preparedQuestions.map((question, index) => ({
            lessonContentId: question.lessonContentId,

            gameType: question.gameType,
            question: question.question,
            answer: question.answer,

            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,

            leftText: question.leftText,
            rightText: question.rightText,

            order: index + 1,
            timeLimit,

            ...(question.matchingItems && {
              challengeQuestionItems: {
                create: question.matchingItems,
              },
            }),
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

        questions: {
          orderBy: {
            order: "asc",
          },
          include: {
            challengeQuestionItems: true,
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
  challengeId: string,
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
          challengeQuestionItems: {
            orderBy: {
              createdAt: "asc",
            },
          },

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
