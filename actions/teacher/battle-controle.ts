"use server";

import { auth } from "@/auth";
import { createBattleRealtimeRoom } from "@/lib/battle/room";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  update,
} from "firebase/database";
import { getBattleRoomRef } from "@/lib/battle/room";
/* ========================================================= */
/* TYPES */
/* ========================================================= */

export type BattleActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* ========================================================= */
/* AUTH HELPER */
/* ========================================================= */

async function getTeacherSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false as const,
      error: "يجب تسجيل الدخول أولًا",
    };
  }

  if (session.user.role !== "TEACHER") {
    return {
      success: false as const,
      error: "غير مسموح لك بتنفيذ هذا الإجراء",
    };
  }

  return {
    success: true as const,
    userId: session.user.id,
  };
}

/* ========================================================= */
/* 1. GET TEACHER COURSES */
/* ========================================================= */

export async function getTeacherCoursesAction(): Promise<
  BattleActionResult<
    Array<{
      id: string;
      title: string;
      description: string | null;
    }>
  >
> {
  try {
    const authResult = await getTeacherSession();

    if (!authResult.success) {
      return authResult;
    }

    const courses = await prisma.course.findMany({
      where: {
        teacherId: authResult.userId,
      },

      select: {
        id: true,
        title: true,
        description: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: courses,
    };
  } catch (error) {
    console.error("getTeacherCoursesAction error:", error);

    return {
      success: false,
      error: "حدث خطأ أثناء تحميل الكورسات",
    };
  }
}

/* ========================================================= */
/* 2. GET COURSE MODULES */
/* ========================================================= */

export async function getCourseModulesAction(courseId: string): Promise<
  BattleActionResult<
    Array<{
      id: string;
      title: string;
      description: string | null;
      order: number;
      level: string;
    }>
  >
> {
  try {
    if (!courseId) {
      return {
        success: false,
        error: "معرف الكورس مطلوب",
      };
    }

    const authResult = await getTeacherSession();

    if (!authResult.success) {
      return authResult;
    }

    /* ============================================= */
    /* MAKE SURE COURSE BELONGS TO TEACHER */
    /* ============================================= */

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: authResult.userId,
      },

      select: {
        id: true,
      },
    });

    if (!course) {
      return {
        success: false,
        error: "الكورس غير موجود أو غير تابع لك",
      };
    }

    /* ============================================= */
    /* MODULES */
    /* ============================================= */

    const modules = await prisma.module.findMany({
      where: {
        courseId,
      },

      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        level: true,
      },

      orderBy: {
        order: "asc",
      },
    });

    return {
      success: true,
      data: modules,
    };
  } catch (error) {
    console.error("getCourseModulesAction error:", error);

    return {
      success: false,
      error: "حدث خطأ أثناء تحميل الوحدات",
    };
  }
}

/* ========================================================= */
/* 3. GET MODULE QUESTIONS */
/* ========================================================= */

export async function getModuleQuestionsAction(moduleId: string): Promise<
  BattleActionResult<
    Array<{
      id: string;
      question: string;
      answer: string | null;
      optionA: string | null;
      optionB: string | null;
      optionC: string | null;
      optionD: string | null;
      leftText: string | null;
      rightText: string | null;
      sortOrder: number;
      lessonId: string;
      lessonTitle: string;
      gameType: string;
    }>
  >
> {
  try {
    if (!moduleId) {
      return {
        success: false,
        error: "معرف الوحدة مطلوب",
      };
    }

    const authResult = await getTeacherSession();

    if (!authResult.success) {
      return authResult;
    }

    /* ============================================= */
    /* VERIFY MODULE BELONGS TO TEACHER */
    /* ============================================= */

    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,

        course: {
          teacherId: authResult.userId,
        },
      },

      select: {
        id: true,
      },
    });

    if (!module) {
      return {
        success: false,
        error: "الوحدة غير موجودة أو غير تابعة لك",
      };
    }

    /* ============================================= */
    /* GET QUESTIONS FROM LESSON CONTENT */
    /* ============================================= */

    const contents = await prisma.lessonContent.findMany({
      where: {
        lesson: {
          moduleId,
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
        sortOrder: true,

        lesson: {
          select: {
            id: true,
            title: true,
            gameType: true,
          },
        },
      },

      orderBy: [
        {
          lesson: {
            order: "asc",
          },
        },
        {
          sortOrder: "asc",
        },
      ],
    });

    const questions = contents.map((content) => ({
      id: content.id,
      question: content.question,
      answer: content.answer,
      optionA: content.optionA,
      optionB: content.optionB,
      optionC: content.optionC,
      optionD: content.optionD,
      leftText: content.leftText,
      rightText: content.rightText,
      sortOrder: content.sortOrder,

      lessonId: content.lesson.id,
      lessonTitle: content.lesson.title,
      gameType: content.lesson.gameType,
    }));

    return {
      success: true,
      data: questions,
    };
  } catch (error) {
    console.error("getModuleQuestionsAction error:", error);

    return {
      success: false,
      error: "حدث خطأ أثناء تحميل الأسئلة",
    };
  }
}

/* ========================================================= */
/* 4. GET COURSE STUDENTS */
/* ========================================================= */

export async function getCourseStudentsAction(courseId: string): Promise<
  BattleActionResult<
    Array<{
      id: string;
      name: string | null;
      image: string | null;
      level: string;
    }>
  >
> {
  try {
    if (!courseId) {
      return {
        success: false,
        error: "معرف الكورس مطلوب",
      };
    }

    const authResult = await getTeacherSession();

    if (!authResult.success) {
      return authResult;
    }

    /* ============================================= */
    /* VERIFY COURSE BELONGS TO TEACHER */
    /* ============================================= */

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: authResult.userId,
      },

      select: {
        id: true,
      },
    });

    if (!course) {
      return {
        success: false,
        error: "الكورس غير موجود أو غير تابع لك",
      };
    }

    /* ============================================= */
    /* GET ENROLLED STUDENTS */
    /* ============================================= */

    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        student: {
          role: "STUDENT",
        },
      },

      select: {
        student: {
          select: {
            id: true,
            name: true,
            image: true,
            level: true,
          },
        },
      },

      orderBy: {
        student: {
          name: "asc",
        },
      },
    });

    const students = enrollments.map((enrollment) => enrollment.student);

    return {
      success: true,
      data: students,
    };
  } catch (error) {
    console.error("getCourseStudentsAction error:", error);

    return {
      success: false,
      error: "حدث خطأ أثناء تحميل الطلاب",
    };
  }
}

/* ========================================================= */
/* 5. GET BATTLE ROOM DETAILS */
/* ========================================================= */
export async function getTeacherBattleRoomAction(roomId: string): Promise<
  BattleActionResult<{
    id: string;
    title: string;
    code: string;
    teacherId: string;
    status: "WAITING" | "LIVE" | "FINISHED";
    currentQuestion: number;
    createdAt: Date;
    updatedAt: Date;

    participants: Array<{
      id: string;
      roomId: string;
      studentId: string;
      team: "TEAM_A" | "TEAM_B";
      score: number;
      isReady: boolean;
      joinedAt: Date;

      student: {
        id: string;
        name: string | null;
        image: string | null;
        level: string;
      };
    }>;

    questions: Array<{
      id: string;
      roomId: string;
      question: string;
      type: "QUIZ" | "MATCHING" | "FILL_BLANKS" | "CONVERSATION";
      answer: string | null;

      optionA: string | null;
      optionB: string | null;
      optionC: string | null;
      optionD: string | null;

      leftText: string | null;
      rightText: string | null;

      points: number;
      timeLimit: number;
      order: number;

      createdAt: Date;
      updatedAt: Date;
    }>;
  }>
> {
  try {
    if (!roomId) {
      return {
        success: false,
        error: "معرف التحدي مطلوب",
      };
    }

    const authResult = await getTeacherSession();

    if (!authResult.success) {
      return authResult;
    }

    const room = await prisma.battleRoom.findFirst({
      where: {
        id: roomId,
        teacherId: authResult.userId,
      },

      include: {
        participants: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                image: true,
                level: true,
              },
            },
          },

          orderBy: {
            joinedAt: "asc",
          },
        },

        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!room) {
      return {
        success: false,
        error: "التحدي غير موجود",
      };
    }

    return {
      success: true,
      data: room,
    };
  } catch (error) {
    console.error("getTeacherBattleRoomAction error:", error);

    return {
      success: false,
      error: "حدث خطأ أثناء تحميل التحدي",
    };
  }
}

// =========================================================
// GET TEACHER BATTLE
// =========================================================

export async function getTeacherBattleAction(battleId: string) {
  try {
    // =========================================
    // AUTH
    // =========================================

    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false as const,
        error: "يجب تسجيل الدخول أولًا",
        data: null,
      };
    }

    if (session.user.role !== "TEACHER") {
      return {
        success: false as const,
        error: "غير مصرح لك بالوصول إلى هذا التحدي",
        data: null,
      };
    }

    // =========================================
    // VALIDATE ID
    // =========================================

    if (!battleId) {
      return {
        success: false as const,
        error: "معرف التحدي غير صالح",
        data: null,
      };
    }

    // =========================================
    // GET BATTLE
    // =========================================

    const battle = await prisma.battleRoom.findFirst({
      where: {
        id: battleId,
        teacherId: session.user.id,
      },

      include: {
        // =====================================
        // PARTICIPANTS
        // =====================================

        participants: {
          orderBy: [
            {
              team: "asc",
            },
            {
              joinedAt: "asc",
            },
          ],

          include: {
            student: {
              select: {
                id: true,
                name: true,
                image: true,
                level: true,
              },
            },
          },
        },

        // =====================================
        // INVITATIONS
        // =====================================

        invitations: {
          orderBy: [
            {
              team: "asc",
            },
            {
              createdAt: "asc",
            },
          ],

          include: {
            student: {
              select: {
                id: true,
                name: true,
                image: true,
                level: true,
              },
            },
          },
        },

        // =====================================
        // QUESTIONS
        // =====================================

        questions: {
          orderBy: {
            order: "asc",
          },

          select: {
            id: true,
            question: true,
            type: true,
            points: true,
            timeLimit: true,
            order: true,
          },
        },
      },
    });

    // =========================================
    // NOT FOUND
    // =========================================

    if (!battle) {
      return {
        success: false as const,
        error: "التحدي غير موجود",
        data: null,
      };
    }

    // =========================================
    // SUCCESS
    // =========================================

    return {
      success: true as const,
      data: battle,
    };
  } catch (error) {
    console.error("GET_TEACHER_BATTLE_ERROR:", error);

    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل التحدي",
      data: null,
    };
  }
}

// =========================================================
// CREATE BATTLE
// =========================================================

interface CreateBattleInput {
  title: string;
  courseId: string;
  moduleId: string;

  questionIds: string[];

  teamAStudentIds: string[];
  teamBStudentIds: string[];

  questionTime: number;
  points: number;
}

export async function createBattleAction(data: CreateBattleInput) {
  try {
    // =====================================================
    // AUTH
    // =====================================================

    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false as const,
        error: "يجب تسجيل الدخول أولًا",
      };
    }

    if (session.user.role !== "TEACHER") {
      return {
        success: false as const,
        error: "غير مصرح لك بإنشاء تحدي",
      };
    }

    const teacherId = session.user.id;

    // =====================================================
    // BASIC VALIDATION
    // =====================================================

    const title = data.title?.trim() ?? "";

    if (title.length < 3) {
      return {
        success: false as const,
        error: "عنوان التحدي قصير جدًا",
      };
    }

    if (!data.courseId) {
      return {
        success: false as const,
        error: "يجب اختيار الكورس",
      };
    }

    if (!data.moduleId) {
      return {
        success: false as const,
        error: "يجب اختيار الوحدة",
      };
    }

    if (!Array.isArray(data.questionIds)) {
      return {
        success: false as const,
        error: "بيانات الأسئلة غير صحيحة",
      };
    }

    if (data.questionIds.length === 0) {
      return {
        success: false as const,
        error: "يجب اختيار سؤال واحد على الأقل",
      };
    }

    if (!Array.isArray(data.teamAStudentIds)) {
      return {
        success: false as const,
        error: "بيانات الفريق الأول غير صحيحة",
      };
    }

    if (!Array.isArray(data.teamBStudentIds)) {
      return {
        success: false as const,
        error: "بيانات الفريق الثاني غير صحيحة",
      };
    }

    if (data.teamAStudentIds.length === 0) {
      return {
        success: false as const,
        error: "الفريق A يجب أن يحتوي على طالب واحد على الأقل",
      };
    }

    if (data.teamBStudentIds.length === 0) {
      return {
        success: false as const,
        error: "الفريق B يجب أن يحتوي على طالب واحد على الأقل",
      };
    }

    if (!Number.isFinite(data.questionTime) || data.questionTime <= 0) {
      return {
        success: false as const,
        error: "وقت السؤال غير صحيح",
      };
    }

    if (!Number.isFinite(data.points) || data.points <= 0) {
      return {
        success: false as const,
        error: "النقاط يجب أن تكون أكبر من صفر",
      };
    }

    // =====================================================
    // REMOVE DUPLICATES
    // =====================================================

    const questionIds = [...new Set(data.questionIds)];

    const teamAStudentIds = [...new Set(data.teamAStudentIds)];

    const teamBStudentIds = [...new Set(data.teamBStudentIds)];

    // =====================================================
    // CHECK DUPLICATED STUDENTS
    // =====================================================

    const teamASet = new Set(teamAStudentIds);

    const duplicatedStudents = teamBStudentIds.filter((studentId) =>
      teamASet.has(studentId),
    );

    if (duplicatedStudents.length > 0) {
      return {
        success: false as const,
        error: "لا يمكن أن يكون الطالب موجودًا في الفريقين",
      };
    }

    // =====================================================
    // COURSE
    // =====================================================

    const course = await prisma.course.findFirst({
      where: {
        id: data.courseId,
        teacherId,
      },

      select: {
        id: true,
        title: true,
      },
    });

    if (!course) {
      return {
        success: false as const,
        error: "الكورس غير موجود أو غير تابع لك",
      };
    }

    // =====================================================
    // MODULE
    // =====================================================

    const module = await prisma.module.findFirst({
      where: {
        id: data.moduleId,
        courseId: data.courseId,
      },

      select: {
        id: true,
      },
    });

    if (!module) {
      return {
        success: false as const,
        error: "الوحدة غير موجودة أو لا تنتمي للكورس",
      };
    }

    // =====================================================
    // QUESTIONS
    // =====================================================

    const contents = await prisma.lessonContent.findMany({
      where: {
        id: {
          in: questionIds,
        },

        lesson: {
          moduleId: data.moduleId,
        },
      },

      include: {
        lesson: {
          select: {
            gameType: true,
          },
        },
      },

      orderBy: {
        sortOrder: "asc",
      },
    });

    if (contents.length !== questionIds.length) {
      return {
        success: false as const,
        error: "بعض الأسئلة غير موجودة أو لا تنتمي للوحدة المحددة",
      };
    }

    // =====================================================
    // STUDENTS
    // =====================================================

    const allStudentIds = [...teamAStudentIds, ...teamBStudentIds];

    const students = await prisma.user.findMany({
      where: {
        id: {
          in: allStudentIds,
        },

        role: "STUDENT",

        enrollments: {
          some: {
            courseId: data.courseId,
          },
        },
      },

      select: {
        id: true,
      },
    });

    // =====================================================
    // VERIFY STUDENTS
    // =====================================================

    if (students.length !== allStudentIds.length) {
      return {
        success: false as const,
        error: "بعض الطلاب غير موجودين أو غير مسجلين في الكورس",
      };
    }

    // =====================================================
    // GENERATE UNIQUE BATTLE CODE
    // =====================================================

    function generateBattleCode() {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    let code = generateBattleCode();

    while (
      await prisma.battleRoom.findUnique({
        where: {
          code,
        },
        select: {
          id: true,
        },
      })
    ) {
      code = generateBattleCode();
    }

    // =====================================================
    // REALTIME PLAYERS
    // =====================================================

    const realtimePlayers = [
      ...teamAStudentIds.map((studentId) => ({
        studentId,
        team: "TEAM_A" as const,
      })),

      ...teamBStudentIds.map((studentId) => ({
        studentId,
        team: "TEAM_B" as const,
      })),
    ];

    // =====================================================
    // DATABASE TRANSACTION
    // =====================================================

    const battle = await prisma.$transaction(async (tx) => {
      // =================================================
      // CREATE ROOM
      // =================================================

      const room = await tx.battleRoom.create({
        data: {
          title,
          code,

          teacherId,

          status: "WAITING",

          currentQuestion: 0,
        },
      });

      // =================================================
      // CREATE QUESTIONS
      // =================================================

      await tx.battleQuestion.createMany({
        data: contents.map((content, index) => ({
          roomId: room.id,

          question: content.question,

          type: content.lesson.gameType,

          answer: content.answer,

          optionA: content.optionA,

          optionB: content.optionB,

          optionC: content.optionC,

          optionD: content.optionD,

          leftText: content.leftText,

          rightText: content.rightText,

          points: data.points,

          timeLimit: data.questionTime,

          order: index,
        })),
      });

      // =================================================
      // TEAM A INVITATIONS
      // =================================================

      await tx.battleInvitation.createMany({
        data: teamAStudentIds.map((studentId) => ({
          roomId: room.id,

          studentId,

          team: "TEAM_A",

          status: "PENDING",
        })),
      });

      // =================================================
      // TEAM B INVITATIONS
      // =================================================

      await tx.battleInvitation.createMany({
        data: teamBStudentIds.map((studentId) => ({
          roomId: room.id,

          studentId,

          team: "TEAM_B",

          status: "PENDING",
        })),
      });

      // =================================================
      // RETURN ROOM
      // =================================================

      return room;
    });

    // =====================================================
    // INITIALIZE FIREBASE REALTIME ROOM
    // =====================================================

    try {
      await createBattleRealtimeRoom(battle.id, realtimePlayers);
    } catch (realtimeError) {
      console.error("CREATE_BATTLE_REALTIME_ERROR:", realtimeError);

      /*
       * مهم:
       *
       * الـ Prisma transaction نجحت بالفعل.
       * لذلك لا نرجع success:false هنا ونوهم
       * الـ UI أن إنشاء التحدي فشل.
       *
       * سنضيف لاحقًا recovery/retry mechanism
       * لتهيئة Firebase لو فشلت.
       */
    }

    // =====================================================
    // REVALIDATE
    // =====================================================

    revalidatePath("/teacher/battles");

    revalidatePath(`/teacher/battles/${battle.id}`);

    // =====================================================
    // SUCCESS
    // =====================================================

    return {
      success: true as const,

      data: {
        battleId: battle.id,

        code: battle.code,

        invitations: teamAStudentIds.length + teamBStudentIds.length,

        teams: {
          teamA: teamAStudentIds.length,

          teamB: teamBStudentIds.length,
        },

        questions: contents.length,
      },
    };
  } catch (error) {
    console.error("CREATE_BATTLE_ERROR:", error);

    return {
      success: false as const,

      error:
        error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء التحدي",
    };
  }
}


// =========================================================
// START BATTLE ACTION
// =========================================================

export async function startBattleAction(
  battleId: string,
) {
  try {
    // =======================================================
    // AUTH
    // =======================================================

    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false as const,
        error: "يجب تسجيل الدخول أولًا",
        data: null,
      };
    }

    if (session.user.role !== "TEACHER") {
      return {
        success: false as const,
        error: "غير مصرح لك ببدء التحدي",
        data: null,
      };
    }

    // =======================================================
    // VALIDATE ID
    // =======================================================

    if (!battleId) {
      return {
        success: false as const,
        error: "معرف التحدي غير صالح",
        data: null,
      };
    }

    // =======================================================
    // GET BATTLE
    // =======================================================

    const battle =
      await prisma.battleRoom.findFirst({
        where: {
          id: battleId,
          teacherId: session.user.id,
        },

        include: {
          invitations: {
            select: {
              id: true,
              studentId: true,
              team: true,
              status: true,
            },
          },

          participants: {
            select: {
              id: true,
              studentId: true,
              team: true,
              isReady: true,
            },
          },

          questions: {
            select: {
              id: true,
              order: true,
            },

            orderBy: {
              order: "asc",
            },
          },
        },
      });

    // =======================================================
    // NOT FOUND
    // =======================================================

    if (!battle) {
      return {
        success: false as const,
        error: "التحدي غير موجود",
        data: null,
      };
    }

    // =======================================================
    // STATUS
    // =======================================================

    if (battle.status !== "WAITING") {
      return {
        success: false as const,
        error:
          battle.status === "LIVE"
            ? "التحدي بدأ بالفعل"
            : "لا يمكن بدء تحدي منتهي",
        data: null,
      };
    }

    // =======================================================
    // QUESTIONS
    // =======================================================

    if (battle.questions.length === 0) {
      return {
        success: false as const,
        error: "لا يمكن بدء التحدي بدون أسئلة",
        data: null,
      };
    }

    // =======================================================
    // INVITATIONS
    // =======================================================

    if (battle.invitations.length === 0) {
      return {
        success: false as const,
        error: "لا يوجد طلاب في التحدي",
        data: null,
      };
    }

    // =======================================================
    // TEAM A / TEAM B
    // =======================================================

    const teamAInvitations =
      battle.invitations.filter(
        (invitation) =>
          invitation.team === "TEAM_A",
      );

    const teamBInvitations =
      battle.invitations.filter(
        (invitation) =>
          invitation.team === "TEAM_B",
      );

    if (teamAInvitations.length === 0) {
      return {
        success: false as const,
        error:
          "لا يمكن بدء التحدي لأن الفريق الأول فارغ",
        data: null,
      };
    }

    if (teamBInvitations.length === 0) {
      return {
        success: false as const,
        error:
          "لا يمكن بدء التحدي لأن الفريق الثاني فارغ",
        data: null,
      };
    }

    // =======================================================
    // ACCEPTED PLAYERS
    // =======================================================

    const acceptedInvitations =
      battle.invitations.filter(
        (invitation) =>
          invitation.status ===
          "ACCEPTED",
      );

    if (
      acceptedInvitations.length !==
      battle.invitations.length
    ) {
      return {
        success: false as const,
        error:
          "يجب أن يقبل جميع الطلاب الدعوة قبل بدء التحدي",
        data: null,
      };
    }

    // =======================================================
    // PARTICIPANTS
    // =======================================================

    if (
      battle.participants.length !==
      acceptedInvitations.length
    ) {
      return {
        success: false as const,
        error:
          "لم ينضم جميع الطلاب إلى التحدي بعد",
        data: null,
      };
    }

    // =======================================================
    // READY
    // =======================================================

    const notReadyParticipants =
      battle.participants.filter(
        (participant) =>
          participant.isReady !== true,
      );

    if (
      notReadyParticipants.length > 0
    ) {
      return {
        success: false as const,
        error:
          "يجب أن يكون جميع الطلاب جاهزين قبل بدء التحدي",
        data: null,
      };
    }

    // =======================================================
    // TRANSACTION
    // =======================================================

    const startedAt =
      new Date();

    const updatedBattle =
      await prisma.$transaction(
        async (tx) => {
          /*
           * نعيد قراءة الغرفة داخل الـ transaction
           * للتأكد أن مدرسًا آخر/طلبًا آخر لم يبدأها
           * في نفس الوقت.
           */

          const currentBattle =
            await tx.battleRoom.findFirst({
              where: {
                id: battle.id,
                teacherId:
                  session.user.id,
                status: "WAITING",
              },

              select: {
                id: true,
                status: true,
              },
            });

          if (!currentBattle) {
            throw new Error(
              "BATTLE_ALREADY_STARTED",
            );
          }

          return tx.battleRoom.update({
            where: {
              id: battle.id,
            },

            data: {
              status: "LIVE",
              currentQuestion: 0,
              
            },

            select: {
              id: true,
              status: true,
              currentQuestion: true,
              
            },
          });
        },
      );

    // =======================================================
    // FIREBASE
    // =======================================================

  await update(
  getBattleRoomRef(battle.id),
  {
    status: "LIVE",
    currentQuestion: 0,
    startedAt: startedAt.getTime(),
    questionStartedAt: startedAt.getTime(),
  },
);

    // =======================================================
    // REVALIDATE
    // =======================================================

    revalidatePath(
      `/teacher/battles/${battle.id}`,
    );

    revalidatePath(
      "/teacher/battles",
    );

    // =======================================================
    // SUCCESS
    // =======================================================

    return {
      success: true as const,

      data: {
        battleId:
          updatedBattle.id,

        status:
          updatedBattle.status,

        currentQuestion:
          updatedBattle.currentQuestion,

        startedAt:
          startedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error(
      "START_BATTLE_ERROR:",
      error,
    );

    // =======================================================
    // KNOWN ERRORS
    // =======================================================

    if (
      error instanceof Error &&
      error.message ===
        "BATTLE_ALREADY_STARTED"
    ) {
      return {
        success: false as const,
        error:
          "التحدي بدأ بالفعل أو لم يعد في حالة الانتظار",
        data: null,
      };
    }

    // =======================================================
    // UNKNOWN ERROR
    // =======================================================

    return {
      success: false as const,

      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء بدء التحدي",

      data: null,
    };
  }
}