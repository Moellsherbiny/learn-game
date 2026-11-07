"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileQuestion,
  Loader2,
  Plus,
  Swords,
  Users,
  X,
} from "lucide-react";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { getCourseChallengeQuestionsAction } from "@/actions/teacher/group-challenge-form";

import { createGroupChallengeAction } from "@/actions/teacher/group-challenge";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { ChallengeInvitationManager } from "./challenge-invitation-manager";

// ============================================
// Types
// ============================================

type Course = {
  id: string;
  title: string;
  description: string | null;
  modulesCount: number;
  studentsCount: number;
};

type Question = {
  id: string;
  question: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  leftText: string | null;
  rightText: string | null;
  sortOrder: number;
};

type Lesson = {
  id: string;
  title: string;
  order: number;
  contents: Question[];
};

type CourseQuestionsResult = Awaited<
  ReturnType<typeof getCourseChallengeQuestionsAction>
>;

type Props = {
  courses: Course[];
};

// ============================================
// Component
// ============================================

export function CreateGroupChallengeForm({ courses }: Props) {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [timeLimit, setTimeLimit] = useState("60");

  // Questions State
  const [courseData, setCourseData] = useState<CourseQuestionsResult | null>(
    null,
  );

  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // UI State
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const [isCreating, setIsCreating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [createdChallenge, setCreatedChallenge] = useState<{
    id: string;
    code: string;
  } | null>(null);

  // ============================================
  // Derived Data
  // ============================================

  const allQuestions = useMemo(() => {
    if (!courseData) return [];

    return courseData.modules.flatMap((module) =>
      module.lessons.flatMap((lesson) =>
        lesson.contents.map((question) => ({
          ...question,
          moduleTitle: module.title,
          lessonTitle: lesson.title,
        })),
      ),
    );
  }, [courseData]);

  const selectedQuestions = useMemo(() => {
    const selectedIds = new Set(selectedQuestionIds);

    return allQuestions.filter((question) => selectedIds.has(question.id));
  }, [allQuestions, selectedQuestionIds]);

  // ============================================
  // Course Selection
  // ============================================

  async function handleCourseChange(nextCourseId: string) {
    setCourseId(nextCourseId);
    setCourseData(null);
    setSelectedQuestionIds([]);
    setError(null);

    if (!nextCourseId) return;

    setIsLoadingQuestions(true);

    try {
      const result = await getCourseChallengeQuestionsAction(nextCourseId);

      setCourseData(result);

      const totalQuestions = result.modules.reduce(
        (total, module) =>
          total +
          module.lessons.reduce(
            (lessonTotal, lesson) => lessonTotal + lesson.contents.length,
            0,
          ),
        0,
      );

      if (totalQuestions === 0) {
        toast.info("لا توجد أسئلة داخل هذا الكورس حتى الآن.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "تعذر تحميل أسئلة الكورس.";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  // ============================================
  // Question Selection
  // ============================================

  function toggleQuestion(questionId: string) {
    setSelectedQuestionIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId],
    );
  }

  function toggleLessonQuestions(lesson: Lesson) {
    const lessonIds = lesson.contents.map((question) => question.id);

    const allSelected = lessonIds.every((id) =>
      selectedQuestionIds.includes(id),
    );

    setSelectedQuestionIds((current) => {
      if (allSelected) {
        return current.filter((id) => !lessonIds.includes(id));
      }

      return Array.from(new Set([...current, ...lessonIds]));
    });
  }

  function removeSelectedQuestion(questionId: string) {
    setSelectedQuestionIds((current) =>
      current.filter((id) => id !== questionId),
    );
  }

  // ============================================
  // Create Challenge
  // ============================================

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!title.trim()) {
      setError("من فضلك أدخل عنوان التحدي.");
      return;
    }

    if (!courseId) {
      setError("من فضلك اختر الكورس.");
      return;
    }

    if (selectedQuestionIds.length === 0) {
      setError("يجب اختيار سؤال واحد على الأقل.");
      return;
    }

    const parsedTimeLimit = Number(timeLimit);

    if (
      !Number.isInteger(parsedTimeLimit) ||
      parsedTimeLimit < 5 ||
      parsedTimeLimit > 300
    ) {
      setError("وقت السؤال يجب أن يكون بين 5 و300 ثانية.");
      return;
    }

    setIsCreating(true);

    try {
      const result = await createGroupChallengeAction({
        title: title.trim(),
        courseId,
        questionIds: selectedQuestionIds,
        timeLimit: parsedTimeLimit,
      });

      setCreatedChallenge({
        id: result.challenge.id,
        code: result.challenge.code,
      });

      toast.success("تم إنشاء التحدي بنجاح.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء التحدي.";

      setError(message);
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  }

  // ============================================
  // Copy Code
  // ============================================

  async function copyCode() {
    if (!createdChallenge) return;

    try {
      await navigator.clipboard.writeText(createdChallenge.code);

      toast.success("تم نسخ كود التحدي.");
    } catch {
      toast.error("تعذر نسخ الكود.");
    }
  }

  // ============================================
  // Success Screen
  // ============================================

  if (createdChallenge) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl py-10">
        <Card>
          <CardContent className="space-y-6 p-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-500/10 text-green-600">
              <CheckCircle2 className="size-9" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">تم إنشاء التحدي بنجاح!</h1>

              <p className="text-sm text-muted-foreground">
                أصبح التحدي جاهزًا. شارك الكود مع الطلاب حتى يتمكنوا من
                الانضمام.
              </p>
            </div>

            <div className="rounded-xl border bg-muted/40 p-5">
              <p className="mb-3 text-sm text-muted-foreground">كود الانضمام</p>

              <div dir="ltr" className="text-3xl font-bold tracking-[0.25em]">
                {createdChallenge.code}
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-4 gap-2"
                onClick={copyCode}
              >
                <Copy className="size-4" />
                نسخ الكود
              </Button>
            </div>
            <ChallengeInvitationManager challengeId={createdChallenge.id} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 gap-2"
                onClick={() =>
                  router.push(
                    `/teacher/group-challenges/${createdChallenge.id}/live`,
                  )
                }
              >
                إدارة التحدي
                <ArrowRight className="size-4" />
              </Button>

              <Button variant="outline" className="flex-1" asChild>
                <Link href="/teacher/group-challenges">العودة للتحديات</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // Main Form
  // ============================================

  return (
    <div dir="rtl" className="mx-auto max-w-6xl space-y-8">
      {/* Header */}

      <div className="space-y-3">
        <Link
          href="/teacher/group-challenges"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          العودة للتحديات
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Swords className="size-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              إنشاء تحدٍ جماعي جديد
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              جهّز الأسئلة وحدد إعدادات التحدي قبل مشاركته مع الطلاب.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form Column */}

          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-5 text-primary" />

                  <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
                </div>

                <CardDescription>
                  أدخل اسم التحدي واختر الكورس الذي ستُسحب منه الأسئلة.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="challenge-title"
                    className="text-sm font-medium"
                  >
                    عنوان التحدي
                  </label>

                  <Input
                    id="challenge-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="مثال: تحدي أساسيات الحاسب"
                    maxLength={120}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="challenge-course"
                    className="text-sm font-medium"
                  >
                    الكورس التعليمي
                  </label>

                  <select
                    id="challenge-course"
                    value={courseId}
                    onChange={(event) =>
                      void handleCourseChange(event.target.value)
                    }
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">اختر الكورس</option>

                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>

                  {courses.length === 0 && (
                    <p className="text-sm text-destructive">
                      لا توجد كورسات مرتبطة بحسابك حاليًا.
                    </p>
                  )}
                </div>

                {courseId && courseData && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <BookOpen className="size-5 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          عدد الموديولات
                        </p>

                        <p className="font-semibold">
                          {courseData.modules.length.toLocaleString("ar-EG")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Users className="size-5 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          عدد الطلاب المسجلين
                        </p>

                        <p className="font-semibold">
                          {courses
                            .find((item) => item.id === courseId)
                            ?.studentsCount.toLocaleString("ar-EG")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Questions Selection */}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="size-5 text-primary" />

                    <CardTitle className="text-lg">اختيار الأسئلة</CardTitle>
                  </div>

                  <Badge variant="secondary">
                    {selectedQuestionIds.length.toLocaleString("ar-EG")} محدد
                  </Badge>
                </div>

                <CardDescription>
                  اختر الأسئلة التي تريد إضافتها إلى التحدي.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {!courseId ? (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                    <BookOpen className="size-9 text-muted-foreground" />

                    <p className="text-sm text-muted-foreground">
                      اختر كورسًا أولاً لعرض الموديولات والدروس والأسئلة.
                    </p>
                  </div>
                ) : isLoadingQuestions ? (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3">
                    <Loader2 className="size-7 animate-spin text-primary" />

                    <p className="text-sm text-muted-foreground">
                      جاري تحميل أسئلة الكورس...
                    </p>
                  </div>
                ) : courseData && allQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {courseData.modules.map((module) => (
                      <div
                        key={module.id}
                        className="overflow-hidden rounded-lg border"
                      >
                        <div className="flex items-center justify-between gap-3 bg-muted/40 p-4">
                          <div className="min-w-0">
                            <h3 className="font-semibold">{module.title}</h3>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {module.lessons.length.toLocaleString("ar-EG")}{" "}
                              دروس
                            </p>
                          </div>

                          <Badge variant="outline">
                            {module.lessons
                              .reduce(
                                (total, lesson) =>
                                  total + lesson.contents.length,
                                0,
                              )
                              .toLocaleString("ar-EG")}{" "}
                            سؤال
                          </Badge>
                        </div>

                        <div className="divide-y">
                          {module.lessons.map((lesson) => {
                            const lessonIds = lesson.contents.map(
                              (question) => question.id,
                            );

                            const allSelected =
                              lessonIds.length > 0 &&
                              lessonIds.every((id) =>
                                selectedQuestionIds.includes(id),
                              );

                            return (
                              <div key={lesson.id} className="p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-medium">
                                      {lesson.title}
                                    </h4>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {lesson.contents.length.toLocaleString(
                                        "ar-EG",
                                      )}{" "}
                                      أسئلة
                                    </p>
                                  </div>

                                  {lesson.contents.length > 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="shrink-0 text-xs"
                                      onClick={() =>
                                        toggleLessonQuestions(lesson)
                                      }
                                    >
                                      {allSelected
                                        ? "إلغاء تحديد الكل"
                                        : "تحديد الكل"}
                                    </Button>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  {lesson.contents.map((question, index) => {
                                    const checked =
                                      selectedQuestionIds.includes(question.id);

                                    return (
                                      <label
                                        key={question.id}
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                          checked
                                            ? "border-primary bg-primary/5"
                                            : "hover:bg-muted/40"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() =>
                                            toggleQuestion(question.id)
                                          }
                                          className="mt-1 size-4 shrink-0 accent-primary"
                                        />

                                        <div className="min-w-0 flex-1">
                                          <div className="mb-1 flex items-center gap-2">
                                            <span className="text-xs font-semibold text-muted-foreground">
                                              سؤال {index + 1}
                                            </span>

                                            {checked && (
                                              <Check className="size-3.5 text-primary" />
                                            )}
                                          </div>

                                          <p className="text-sm leading-6">
                                            {question.question}
                                          </p>

                                          {(question.optionA ||
                                            question.optionB ||
                                            question.optionC ||
                                            question.optionD) && (
                                            <div className="mt-2 grid gap-1 sm:grid-cols-2">
                                              {[
                                                question.optionA,
                                                question.optionB,
                                                question.optionC,
                                                question.optionD,
                                              ]
                                                .filter(Boolean)
                                                .map((option, optionIndex) => (
                                                  <p
                                                    key={optionIndex}
                                                    className="truncate text-xs text-muted-foreground"
                                                  >
                                                    {String.fromCharCode(
                                                      65 + optionIndex,
                                                    )}
                                                    . {option}
                                                  </p>
                                                ))}
                                            </div>
                                          )}

                                          {(question.leftText ||
                                            question.rightText) && (
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                              {question.leftText && (
                                                <Badge variant="outline">
                                                  {question.leftText}
                                                </Badge>
                                              )}

                                              {question.rightText && (
                                                <Badge variant="outline">
                                                  {question.rightText}
                                                </Badge>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </label>
                                    );
                                  })}

                                  {lesson.contents.length === 0 && (
                                    <p className="py-3 text-center text-xs text-muted-foreground">
                                      لا توجد أسئلة في هذا الدرس.
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : courseData ? (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                    <FileQuestion className="size-9 text-muted-foreground" />

                    <p className="text-sm text-muted-foreground">
                      لا توجد أسئلة متاحة داخل هذا الكورس.
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Time Settings */}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إعدادات الوقت</CardTitle>

                <CardDescription>
                  حدد الوقت المسموح به للإجابة على كل سؤال.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="max-w-xs space-y-2">
                  <label
                    htmlFor="question-time"
                    className="text-sm font-medium"
                  >
                    وقت السؤال بالثواني
                  </label>

                  <Input
                    id="question-time"
                    type="number"
                    min={5}
                    max={300}
                    value={timeLimit}
                    onChange={(event) => setTimeLimit(event.target.value)}
                  />

                  <p className="text-xs text-muted-foreground">
                    يمكنك تحديد وقت من 5 إلى 300 ثانية لكل سؤال.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Column */}

          <div className="space-y-6">
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-5 text-primary" />

                  <CardTitle className="text-lg">ملخص التحدي</CardTitle>
                </div>

                <CardDescription>
                  راجع إعدادات التحدي قبل إنشائه.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">عنوان التحدي</p>

                  <p className="font-medium">
                    {title.trim() || "لم يتم تحديد العنوان"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">الكورس</p>

                  <p className="font-medium">
                    {courses.find((item) => item.id === courseId)?.title ||
                      "لم يتم اختيار الكورس"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      الأسئلة المختارة
                    </p>

                    <p className="mt-1 text-2xl font-bold tabular-nums">
                      {selectedQuestionIds.length.toLocaleString("ar-EG")}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">وقت السؤال</p>

                    <p className="mt-1 text-2xl font-bold tabular-nums">
                      {Number(timeLimit) || 0}
                      <span className="mr-1 text-xs font-normal text-muted-foreground">
                        ثانية
                      </span>
                    </p>
                  </div>
                </div>

                {/* Selected Questions */}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">الأسئلة المحددة</h3>

                    <Badge variant="secondary">
                      {selectedQuestions.length.toLocaleString("ar-EG")}
                    </Badge>
                  </div>

                  {selectedQuestions.length > 0 ? (
                    <div className="max-h-72 space-y-2 overflow-y-auto">
                      {selectedQuestions.map((question, index) => (
                        <div
                          key={question.id}
                          className="flex items-start gap-2 rounded-lg border p-3"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-xs leading-5">
                              {question.question}
                            </p>

                            <p className="mt-1 truncate text-[11px] text-muted-foreground">
                              {question.moduleTitle} / {question.lessonTitle}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeSelectedQuestion(question.id)}
                            className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                            aria-label="إزالة السؤال"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-5 text-center">
                      <FileQuestion className="mx-auto mb-2 size-6 text-muted-foreground" />

                      <p className="text-xs text-muted-foreground">
                        لم تختر أي أسئلة بعد.
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                  >
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={
                    isCreating || isLoadingQuestions || courses.length === 0
                  }
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جاري إنشاء التحدي...
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      إنشاء التحدي
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  سيتم إنشاء التحدي بحالة انتظار الطلاب.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
