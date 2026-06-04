"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type TeacherWithStats = {
  id: string;

  name: string | null;

  image: string | null;

  xp: number;

  coins: number;

  coursesTeaching: {
    id: string;

    enrollments: {
      id: string;
    }[];
  }[];
};

export type LeaderboardEntry = {
  rank: number;

  studentId: string;

  name: string;

  image: string | null;

  score: number;

  updatedAt: Date;
};
function calculateLevel(xp: number) {
  return Math.floor(xp / 1000) + 1;
}

function getLevelProgress(xp: number) {
  return (xp % 1000) / 10;
}

export async function getLeaderboardAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // =========================
  // TOP STUDENTS
  // =========================
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      enrollments: {
        some: {},
      },
    },

    select: {
      id: true,
      name: true,
      image: true,

      xp: true,
      coins: true,
      streak: true,

      progress: {
        where: {
          completed: true,
        },

        select: {
          id: true,
        },
      },

      enrollments: {
        select: {
          id: true,
        },
      },
    },

    orderBy: [
      {
        xp: "desc",
      },

      {
        coins: "desc",
      },
    ],

    take: 100,
  });

  // =========================
  // TOP TEACHERS
  // =========================
  const teachers: TeacherWithStats[] =
    await prisma.user.findMany({
      where: {
        role: "TEACHER",
      },

      select: {
        id: true,
        name: true,
        image: true,

        xp: true,
        coins: true,

        coursesTeaching: {
          select: {
            id: true,

            enrollments: {
              select: {
                id: true,
              },
            },
          },
        },
      },

      orderBy: {
        xp: "desc",
      },

      take: 20,
    });

  // =========================
  // STUDENTS FORMAT
  // =========================
  const formattedStudents =
    students.map(
      (student, index) => ({
        id: student.id,

        rank: index + 1,

        name:
          student.name ??
          "طالب",

        image: student.image,

        xp: student.xp,

        coins: student.coins,

        streak:
          student.streak,

        completedLessons:
          student.progress
            .length,

        enrolledCourses:
          student.enrollments
            .length,

        level:
          calculateLevel(
            student.xp,
          ),

        levelProgress:
          getLevelProgress(
            student.xp,
          ),

        isCurrentUser:
          student.id ===
          session.user.id,
      }),
    );

  // =========================
  // TEACHERS FORMAT
  // =========================
  const formattedTeachers =
    teachers.map(
      (teacher, index) => {
        const totalStudents =
  teacher.coursesTeaching.reduce(
    (
      sum: number,
      course: {
        enrollments: {
          id: string;
        }[];
      },
    ) =>
      sum +
      course.enrollments.length,
    0,
  );

        return {
          id: teacher.id,

          rank: index + 1,

          name:
            teacher.name ??
            "مدرس",

          image:
            teacher.image,

          xp: teacher.xp,

          coins:
            teacher.coins,

          level:
            calculateLevel(
              teacher.xp,
            ),

          levelProgress:
            getLevelProgress(
              teacher.xp,
            ),

          totalCourses:
            teacher.coursesTeaching.length,

          totalStudents,

          isCurrentUser:
            teacher.id ===
            session.user.id,
        };
      },
    );

  // =========================
  // CURRENT USER
  // =========================
  const currentStudent =
    formattedStudents.find(
      (s) =>
        s.isCurrentUser,
    );

  const currentTeacher =
    formattedTeachers.find(
      (t) =>
        t.isCurrentUser,
    );

  return {
    role:
      session.user.role,

    students:
      formattedStudents,

    teachers:
      formattedTeachers,

    currentUser:
      currentStudent ??
      currentTeacher ??
      null,
  };
}