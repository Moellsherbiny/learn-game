"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { StudentLevel } from "@/lib/generated/prisma/client";

export type SubmitPlacementTestInput = {
  courseId: string;

  answers: Record<string, string>;
};

type PlacementQuestion = {
  id: string;

  question: string;

  options: string[];

  correctAnswer: string;

  difficulty:
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED";

  skill: string;
};

export async function submitPlacementTestAction(
  input: SubmitPlacementTestInput,
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const studentId = session.user.id;

  // =========================
  // TEST
  // =========================

  const placementTest =
    await prisma.placementTest.findUnique({
      where: {
        courseId: input.courseId,
      },
    });

  if (!placementTest) {
    throw new Error(
      "Placement test not found",
    );
  }

  const questions =
    placementTest.questions as PlacementQuestion[];

    const answersSchema = z.record(
  z.string().min(1),
  z.string().min(1),
);

const parsedAnswers =
  answersSchema.safeParse(input.answers);

if (!parsedAnswers.success) {
  throw new Error("إجابات الاختبار غير صالحة");
}

const answers = parsedAnswers.data;
  // =========================
  // SCORE
  // =========================

  let correctAnswers = 0;

  const skillStats = new Map<
    string,
    {
      total: number;
      correct: number;
    }
  >();

  for (const question of questions) {
    const userAnswer =
      input.answers[question.id];

    const isCorrect =
      userAnswer ===
      question.correctAnswer;

    if (isCorrect) {
      correctAnswers++;
    }

    const current =
      skillStats.get(
        question.skill,
      ) ?? {
        total: 0,
        correct: 0,
      };

    current.total++;

    if (isCorrect) {
      current.correct++;
    }

    skillStats.set(
      question.skill,
      current,
    );
  }

  const score =
    Math.round(
      (correctAnswers /
        questions.length) *
        100,
    );

  // =========================
  // LEVEL
  // =========================

  let level: StudentLevel;

  if (score >= 80) {
    level = "ADVANCED";
  } else if (score >= 50) {
    level = "INTERMEDIATE";
  } else {
    level = "BEGINNER";
  }

  // =========================
  // STRENGTHS / WEAKNESSES
  // =========================

  const strengths: string[] = [];

  const weaknesses: string[] = [];

  for (const [
    skill,
    stat,
  ] of skillStats.entries()) {
    const percentage =
      (stat.correct /
        stat.total) *
      100;

    if (percentage >= 70) {
      strengths.push(skill);
    }

    if (percentage < 50) {
      weaknesses.push(skill);
    }
  }

  // =========================
  // CONFIDENCE
  // =========================

  const confidence =
    Math.min(
      100,
      Math.max(
        60,
        Math.round(score),
      ),
    );

  // =========================
  // FEEDBACK
  // =========================

  let feedback = "";

  if (level === "ADVANCED") {
    feedback =
      "ممتاز، لديك فهم قوي للمحتوى ويمكنك البدء من الوحدات المتقدمة.";
  }

  if (
    level === "INTERMEDIATE"
  ) {
    feedback =
      "لديك أساس جيد، ننصحك بالبدء من الوحدات المتوسطة ثم التدرج نحو المحتوى المتقدم.";
  }

  if (level === "BEGINNER") {
    feedback =
      "ننصحك بالبدء من الوحدات الأساسية لبناء أساس قوي قبل الانتقال للمستويات الأعلى.";
  }

  // =========================
  // SAVE RESULT
  // =========================

  const result =
    await prisma.placementResult.upsert({
      where: {
        studentId_courseId: {
          studentId,
          courseId:
            input.courseId,
        },
      },

      create: {
        studentId,

        courseId:
          input.courseId,

        level,

        score,

        confidence,

        strengths,

        weaknesses,

        feedback,
        answers: answers,
      },

      update: {
        level,

        score,

        confidence,

        strengths,

        weaknesses,

        feedback,

        answers: answers,
      },
    });

  // =========================
  // OPTIONAL
  // UPDATE USER LEVEL
  // =========================

  await prisma.user.update({
    where: {
      id: studentId,
    },

    data: {
      level,
    },
  });

  return {
    success: true,

    level,

    score,

    confidence,

    strengths,

    weaknesses,

    feedback,

    result,
  };
}