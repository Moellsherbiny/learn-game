import Link from "next/link";

import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Target,
  XCircle,
} from "lucide-react";

import { getPlacementResult } from "@/actions/placement/get-placement-res";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

interface PlacementResultPageProps {
  params: Promise<{
    studentId: string;
    resultId: string;
  }>;
}

interface QuestionData {
  id?: string;
  question: string;
  options: string[];
  correctAnswer?: string | null;
}

interface AnswerData {
  questionId?: string | null;
  question?: string | null;
  answer?: string | null;
  correctAnswer?: string | null;
  isCorrect?: boolean | null;
}

interface QuestionResult {
  question: string;
  options: string[];
  studentAnswer: string | null;
  correctAnswer: string | null;
  isCorrect: boolean | null;
}

export default async function PlacementResultPage({
  params,
}: PlacementResultPageProps) {
  const { studentId, resultId } = await params;

  const response = await getPlacementResult(
    studentId,
    resultId,
  );

  if (!response.success || !response.data) {
    return (
      <div
        dir="rtl"
        className="mx-auto w-full max-w-5xl px-4 py-8"
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>

            <div>
              <h2 className="font-semibold">
                تعذر تحميل الاختبار
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {response.message ??
                  "حدث خطأ أثناء تحميل بيانات الاختبار."}
              </p>
            </div>

            <Button asChild variant="outline">
              <Link
                href={`/placement-tests/${studentId}`}
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة إلى نتائج الطالب
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student, result } = response.data;

  // =========================================
  // Normalize JSON
  // =========================================

  const questions = normalizeQuestions(
    result.course?.placementTest?.questions,
  );

  const answers = normalizeAnswers(
    result.answers,
  );

  const questionResults =
    mergeQuestionsAndAnswers(
      questions,
      answers,
    );

  // =========================================
  // Statistics
  // =========================================

  const score = Number(result.score) || 0;

  const confidence =
    Number(result.confidence) || 0;

  const answeredQuestions =
    questionResults.filter(
      (item) =>
        item.studentAnswer !== null &&
        item.studentAnswer.trim() !== "",
    ).length;

  const correctAnswers =
    questionResults.filter(
      (item) => item.isCorrect === true,
    ).length;

  const incorrectAnswers =
    questionResults.filter(
      (item) => item.isCorrect === false,
    ).length;

  return (
    <div
      dir="rtl"
      className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8"
    >
      {/* =========================================
          Back
      ========================================= */}

      <Button
        asChild
        variant="ghost"
        className="w-fit"
      >
        <Link
          href={`/placement-tests/${studentId}`}
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة إلى نتائج الطالب
        </Link>
      </Button>

      {/* =========================================
          Student / Exam Header
      ========================================= */}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}

            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage
                src={
                  student.image ??
                  undefined
                }
                alt={
                  student.name ??
                  "Student"
                }
              />

              <AvatarFallback className="text-xl">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>

            {/* Student */}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {student.name ??
                    "بدون اسم"}
                </h1>

                <Badge variant="secondary">
                  طالب
                </Badge>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {student.email}
              </p>

              {student.school && (
                <p className="mt-1 text-sm text-muted-foreground">
                  المدرسة: {student.school}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">
                  {result.course?.title ??
                    "الكورس"}
                </Badge>

                <Badge variant="outline">
                  {result.course
                    ?.placementTest?.title ??
                    "الاختبار القبلي"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =========================================
          Result Statistics
      ========================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={
            <Target className="h-5 w-5" />
          }
          label="النتيجة"
          value={`${formatNumber(score)}%`}
        />

        <StatCard
          icon={
            <Award className="h-5 w-5" />
          }
          label="المستوى المحدد"
          value={getLevelLabel(
            result.level,
          )}
        />

        <StatCard
          icon={
            <ClipboardCheck className="h-5 w-5" />
          }
          label="مستوى الثقة"
          value={`${formatNumber(
            confidence,
          )}%`}
        />

        <StatCard
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          label="الإجابات الصحيحة"
          value={
            questionResults.length > 0
              ? `${correctAnswers}/${questionResults.length}`
              : `${formatNumber(score)}%`
          }
        />
      </div>

      {/* =========================================
          Answer Summary
      ========================================= */}

      {questionResults.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <MiniStat
            label="عدد الأسئلة"
            value={questionResults.length}
          />

          <MiniStat
            label="تمت الإجابة"
            value={answeredQuestions}
          />

          <MiniStat
            label="الإجابات الخاطئة"
            value={incorrectAnswers}
          />
        </div>
      )}

      {/* =========================================
          Strengths / Weaknesses
      ========================================= */}

      <div className="grid gap-5 lg:grid-cols-2">
        <AnalysisCard
          title="نقاط القوة"
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          items={toStringArray(
            result.strengths,
          )}
          emptyText="لا توجد نقاط قوة مسجلة."
        />

        <AnalysisCard
          title="نقاط الضعف"
          icon={
            <XCircle className="h-5 w-5" />
          }
          items={toStringArray(
            result.weaknesses,
          )}
          emptyText="لا توجد نقاط ضعف مسجلة."
        />
      </div>

      {/* =========================================
          Feedback
      ========================================= */}

      {result.feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              التقييم والتوصية
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl bg-muted/50 p-5 text-sm leading-8">
              {result.feedback}
            </div>
          </CardContent>
        </Card>
      )}

      {/* =========================================
          Questions
      ========================================= */}

      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold">
            الأسئلة والإجابات
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            مراجعة إجابات الطالب في الاختبار
            القبلي
          </p>
        </div>

        {questionResults.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" />

              <p className="mt-4 font-medium">
                لا توجد تفاصيل للأسئلة
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                لم يتم تخزين تفاصيل الأسئلة أو
                الإجابات لهذا الاختبار.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questionResults.map(
              (item, index) => (
                <QuestionCard
                  key={`question-${index}`}
                  index={index}
                  data={item}
                />
              ),
            )}
          </div>
        )}
      </div>

      {/* =========================================
          Footer
      ========================================= */}

      <div className="border-t pt-4 text-xs text-muted-foreground">
        تم إجراء الاختبار في{" "}
        {formatDate(result.createdAt)}
      </div>
    </div>
  );
}

/* =====================================================
   Stat Card
===================================================== */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 truncate text-xl font-bold">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* =====================================================
   Mini Stat
===================================================== */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 text-xl font-bold">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

/* =====================================================
   Analysis Card
===================================================== */

function AnalysisCard({
  title,
  icon,
  items,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  emptyText: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map(
              (item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="rounded-lg bg-muted/50 px-4 py-3 text-sm leading-6"
                >
                  {item}
                </li>
              ),
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* =====================================================
   Question Card
===================================================== */

function QuestionCard({
  index,
  data,
}: {
  index: number;
  data: QuestionResult;
}) {
  const {
    question,
    options,
    studentAnswer,
    correctAnswer,
    isCorrect,
  } = data;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base leading-7">
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              السؤال {index + 1}
            </span>

            {question}
          </CardTitle>

          {typeof isCorrect ===
            "boolean" && (
            <Badge
              variant={
                isCorrect
                  ? "default"
                  : "destructive"
              }
              className="shrink-0"
            >
              {isCorrect
                ? "صحيحة"
                : "خاطئة"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        {/* Options */}

        {options.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">
              الاختيارات
            </p>

            {options.map(
              (option, optionIndex) => {
                const isStudentAnswer =
                  normalizeText(
                    studentAnswer,
                  ) ===
                  normalizeText(option);

                const isCorrectAnswer =
                  normalizeText(
                    correctAnswer,
                  ) ===
                  normalizeText(option);

                let className =
                  "border bg-background";

                if (
                  isCorrectAnswer
                ) {
                  className =
                    "border-green-500/40 bg-green-500/10";
                } else if (
                  isStudentAnswer
                ) {
                  className =
                    "border-destructive/40 bg-destructive/10";
                }

                return (
                  <div
                    key={`${option}-${optionIndex}`}
                    className={`rounded-lg p-3 text-sm ${className}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>
                        {option}
                      </span>

                      <div className="flex shrink-0 items-center gap-2">
                        {isCorrectAnswer && (
                          <span className="text-xs font-medium text-green-600">
                            الإجابة الصحيحة
                          </span>
                        )}

                        {isStudentAnswer &&
                          !isCorrectAnswer && (
                            <span className="text-xs font-medium text-destructive">
                              إجابة الطالب
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}

        {/* Student Answer */}

        <div>
          <p className="mb-2 text-sm font-semibold">
            إجابة الطالب
          </p>

          <div
            className={`rounded-xl p-4 text-sm leading-7 ${
              isCorrect === true
                ? "bg-green-500/10"
                : isCorrect === false
                  ? "bg-destructive/10"
                  : "bg-muted/50"
            }`}
          >
            {studentAnswer &&
            studentAnswer.trim() ? (
              studentAnswer
            ) : (
              <span className="text-muted-foreground">
                لم يتم تسجيل إجابة.
              </span>
            )}
          </div>
        </div>

        {/* Correct Answer */}

        {correctAnswer && (
          <div>
            <p className="mb-2 text-sm font-semibold">
              الإجابة الصحيحة
            </p>

            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 text-sm leading-7">
              {correctAnswer}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* =====================================================
   JSON Normalization
===================================================== */

function normalizeQuestions(
  value: unknown,
): QuestionData[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const questions: QuestionData[] = [];

  for (const item of value) {
    // -----------------------------------------
    // Question stored as string
    // -----------------------------------------

    if (typeof item === "string") {
      const question = item.trim();

      if (!question) {
        continue;
      }

      questions.push({
        question,
        options: [],
        correctAnswer: null,
      });

      continue;
    }

    // -----------------------------------------
    // Invalid item
    // -----------------------------------------

    if (
      typeof item !== "object" ||
      item === null
    ) {
      continue;
    }

    const data =
      item as Record<string, unknown>;

    const question = String(
      data.question ??
        data.text ??
        data.title ??
        "",
    ).trim();

    // Ignore invalid questions
    if (!question) {
      continue;
    }

    // -----------------------------------------
    // Options
    // -----------------------------------------

    let options: string[] = [];

    if (Array.isArray(data.options)) {
      options = data.options.filter(
        (
          option,
        ): option is string =>
          typeof option === "string" &&
          option.trim().length > 0,
      );
    } else {
      options = getOptions(data);
    }

    // -----------------------------------------
    // Correct answer
    // -----------------------------------------

    let correctAnswer:
      | string
      | null = null;

    if (
      data.correctAnswer !==
        null &&
      data.correctAnswer !==
        undefined
    ) {
      correctAnswer = String(
        data.correctAnswer,
      );
    } else if (
      data.answer !== null &&
      data.answer !== undefined
    ) {
      correctAnswer = String(
        data.answer,
      );
    }

    // -----------------------------------------
    // Push valid question
    // -----------------------------------------

    questions.push({
      id:
        data.id !== null &&
        data.id !== undefined
          ? String(data.id)
          : undefined,

      question,

      options,

      correctAnswer,
    });
  }

  return questions;
}

function normalizeAnswers(
  value: unknown,
): AnswerData[] {
  // =========================
  // Array format
  // =========================

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") {
        return {
          answer: item,
        };
      }

      if (
        typeof item !== "object" ||
        item === null
      ) {
        return {
          answer: null,
        };
      }

      const data =
        item as Record<string, unknown>;

      return {
        questionId:
          data.questionId != null
            ? String(data.questionId)
            : null,

        question:
          data.question != null
            ? String(data.question)
            : null,

        answer:
          data.answer != null
            ? String(data.answer)
            : data.selectedAnswer != null
              ? String(data.selectedAnswer)
              : null,

        correctAnswer:
          data.correctAnswer != null
            ? String(data.correctAnswer)
            : null,

        isCorrect:
          typeof data.isCorrect === "boolean"
            ? data.isCorrect
            : null,
      };
    });
  }

  // =========================
  // Object format
  // =========================

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const data =
      value as Record<string, unknown>;

    return Object.entries(data).map(
      ([questionId, answer]) => ({
        questionId,
        answer:
          typeof answer === "string"
            ? answer
            : answer != null
              ? String(answer)
              : null,

        question: null,
        correctAnswer: null,
        isCorrect: null,
      }),
    );
  }

  return [];
}
/* =====================================================
   Merge Questions + Answers
===================================================== */

function mergeQuestionsAndAnswers(
  questions: QuestionData[],
  answers: AnswerData[],
): QuestionResult[] {
  return questions.map(
    (question, index) => {
      let answer: AnswerData | undefined;

      // First try question ID
      if (question.id) {
        answer = answers.find(
          (item) =>
            item.questionId ===
            question.id,
        );
      }

      // Then try question text
      if (!answer) {
        answer = answers.find(
          (item) =>
            item.question &&
            normalizeText(
              item.question,
            ) ===
              normalizeText(
                question.question,
              ),
        );
      }

      // Finally fallback to index
      if (!answer) {
        answer = answers[index];
      }

      const studentAnswer =
        answer?.answer ??
        null;

      const correctAnswer =
        answer?.correctAnswer ??
        question.correctAnswer ??
        null;

      let isCorrect =
        answer?.isCorrect ??
        null;

      // If isCorrect wasn't stored,
      // compare answers
      if (
        isCorrect === null &&
        studentAnswer &&
        correctAnswer
      ) {
        isCorrect =
          normalizeText(
            studentAnswer,
          ) ===
          normalizeText(
            correctAnswer,
          );
      }

      return {
        question:
          question.question,

        options:
          question.options,

        studentAnswer,

        correctAnswer,

        isCorrect,
      };
    },
  );
}

/* =====================================================
   Helpers
===================================================== */

function getOptions(
  data: Record<string, unknown>,
) {
  const options = [
    data.optionA,
    data.optionB,
    data.optionC,
    data.optionD,
  ];

  return options.filter(
    (option): option is string =>
      typeof option === "string" &&
      option.trim().length > 0,
  );
}

function toStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string",
  );
}

function normalizeText(
  value:
    | string
    | null
    | undefined,
) {
  return (
    value
      ?.trim()
      .toLowerCase() ?? ""
  );
}

function getLevelLabel(
  level:
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED",
) {
  switch (level) {
    case "BEGINNER":
      return "مبتدئ";

    case "INTERMEDIATE":
      return "متوسط";

    case "ADVANCED":
      return "متقدم";

    default:
      return "غير محدد";
  }
}

function formatNumber(
  value: number,
) {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);
}

function formatDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "ar-EG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(date));
}

function getInitials(
  name: string | null,
) {
  if (!name) {
    return "U";
  }

  const words = name
    .trim()
    .split(/\s+/);

  if (words.length === 1) {
    return words[0]
      .charAt(0)
      .toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
}