"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";


import { prisma } from "@/lib/prisma";


export type PlacementQuestion = {
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
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// =====================================
// SCHEMAS
// =====================================

const studentLevelSchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);

const placementQuestionSchema =
  z.object({
    id: z.string(),

    question: z.string(),

    options: z
      .array(z.string())
      .length(4),

    correctAnswer: z.string(),

    difficulty:
      studentLevelSchema,

    skill: z.string(),
  });

const placementTestSchema =
  z.object({
    title: z.string(),

    questions: z
      .array(
        placementQuestionSchema,
      )
      .min(15),
  });

export type PlacementTestData =
  z.infer<
    typeof placementTestSchema
  >;

// =====================================
// ACTION
// =====================================

export async function getOrCreatePlacementTestAction(
  courseId: string,
) {
  // =====================================
  // EXISTING TEST
  // =====================================

  const existingTest =
    await prisma.placementTest.findUnique({
      where: {
        courseId,
      },
    });

  if (existingTest) {
    return {
      id: existingTest.id,

      title: existingTest.title,

      questions:
        existingTest.questions as PlacementQuestion[],
    };
  }

  // =====================================
  // COURSE
  // =====================================

  const course =
    await prisma.course.findUnique({
      where: {
        id: courseId,
      },

      include: {
        modules: {
          orderBy: {
            order: "asc",
          },

          select: {
            title: true,
            description: true,
            level: true,
          },
        },
      },
    });

  if (!course) {
    throw new Error(
      "Course not found",
    );
  }

  // =====================================
  // COURSE CONTENT
  // =====================================

  const modulesSummary =
    course.modules
      .map(
        (module) => `
- ${module.title}
Level: ${module.level}
Description:
${module.description ?? ""}
`,
      )
      .join("\n");

  // =====================================
  // PROMPT
  // =====================================

  const prompt = `
أنت خبير تعليم إلكتروني.

أنشئ اختبار تحديد مستوى احترافي باللغة العربية.

اسم الكورس:
${course.title}

وصف الكورس:
${course.description ?? "غير متوفر"}

الوحدات الموجودة داخل الكورس:

${modulesSummary}

المطلوب:

- 15 سؤال اختيار من متعدد.
- 5 أسئلة Beginner.
- 5 أسئلة Intermediate.
- 5 أسئلة Advanced.
- 4 اختيارات لكل سؤال.
- إجابة صحيحة واحدة فقط.
- جميع الأسئلة باللغة العربية.
- جميع الخيارات باللغة العربية.
- أضف skill مناسبة لكل سؤال.
- الأسئلة يجب أن تقيس مستوى الطالب الحقيقي.
- لا تكرر الأسئلة.

أرجع JSON فقط.
`;

  // =====================================
  // GEMINI
  // =====================================

const response =
  await ai.models.generateContent({
    model: "gemini-2.5-flash",

    contents: prompt,

    config: {
      responseMimeType:
        "application/json",

      responseSchema: {
        type: Type.OBJECT,

        properties: {
          title: {
            type: Type.STRING,
          },

          questions: {
            type: Type.ARRAY,

            items: {
              type: Type.OBJECT,

              properties: {
                id: {
                  type: Type.STRING,
                },

                question: {
                  type: Type.STRING,
                },

                options: {
                  type: Type.ARRAY,

                  items: {
                    type: Type.STRING,
                  },
                },

                correctAnswer: {
                  type: Type.STRING,
                },

                difficulty: {
                  type: Type.STRING,
                },

                skill: {
                  type: Type.STRING,
                },
              },

              required: [
                "id",
                "question",
                "options",
                "correctAnswer",
                "difficulty",
                "skill",
              ],
            },
          },
        },

        required: [
          "title",
          "questions",
        ],
      },
    },
  });

  // =====================================
  // VALIDATION
  // =====================================

  if (!response.text) {
  throw new Error(
    "Gemini returned empty response",
  );
}

const parsed =
  JSON.parse(response.text);
  
  const parsedTest =
    placementTestSchema.parse(
      JSON.parse(
        response.text ?? "{}",
      ),
    );

  // =====================================
  // SAVE
  // =====================================

  const savedTest =
    await prisma.placementTest.create({
      data: {
        courseId,

        title:
          parsedTest.title,

        questions:
          parsedTest.questions,
      },
    });

  return {
    id: savedTest.id,

    title: savedTest.title,

    questions:
      parsedTest.questions,
  };
}