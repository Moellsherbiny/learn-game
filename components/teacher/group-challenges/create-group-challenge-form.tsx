"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type Course = {
  id: string;
  title: string;
  description: string | null;
  modulesCount: number;
  studentsCount: number;
};

type CourseQuestionsResult = Awaited<
  ReturnType<typeof getCourseChallengeQuestionsAction>
>;

type Lesson = CourseQuestionsResult["modules"][number]["lessons"][number];

type GameType = "QUIZ" | "MATCHING" | "FILL_BLANKS";

type Props = {
  courses: Course[];
};

const GAME_TYPE_LABELS: Record<GameType, string> = {
  QUIZ: "اختيار من متعدد",
  MATCHING: "مطابقة",
  FILL_BLANKS: "أكمل الفراغ",
};

export function CreateGroupChallengeForm({ courses }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseData, setCourseData] = useState<CourseQuestionsResult | null>(
    null,
  );
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdChallenge, setCreatedChallenge] = useState<{
    id: string;
    code: string;
  } | null>(null);

  // Exclude conversation questions from the available questions.
  const allQuestions = useMemo(() => {
    if (!courseData) return [];

    return courseData.modules.flatMap((module) =>
      module.lessons
        .filter((lesson) => lesson.gameType !== "CONVERSATION")
        .flatMap((lesson) =>
          lesson.contents.map((question) => ({
            ...question,
            lessonId: lesson.id,
            gameType: lesson.gameType as GameType,
            moduleTitle: module.title,
            lessonTitle: lesson.title,
          })),
        ),
    );
  }, [courseData]);

  // Matching content rows that share the same lesson and prompt form one challenge question.
  const getMatchingGroup = (questionId: string) => {
    const question = allQuestions.find((item) => item.id === questionId);

    if (!question || question.gameType !== "MATCHING") {
      return [questionId];
    }

    return allQuestions
      .filter(
        (item) =>
          item.gameType === "MATCHING" &&
          item.lessonId === question.lessonId &&
          item.question === question.question,
      )
      .map((item) => item.id);
  };

  const selectedQuestions = useMemo(() => {
    const selectedIds = new Set(selectedQuestionIds);

    const result: {
      id: string;
      question: string;
      moduleTitle: string;
      lessonTitle: string;
      gameType: GameType;
      contentIds: string[];
    }[] = [];

    const processedMatchingGroups = new Set<string>();

    for (const item of allQuestions) {
      if (!selectedIds.has(item.id)) continue;

      if (item.gameType === "MATCHING") {
        const groupKey = JSON.stringify([item.lessonId, item.question]);

        if (processedMatchingGroups.has(groupKey)) continue;

        processedMatchingGroups.add(groupKey);

        const group = allQuestions.filter(
          (candidate) =>
            candidate.gameType === "MATCHING" &&
            candidate.lessonId === item.lessonId &&
            candidate.question === item.question,
        );

        // A matching group is counted only when all its rows are selected.
        if (!group.every((entry) => selectedIds.has(entry.id))) continue;

        result.push({
          id: item.id,
          question: item.question,
          moduleTitle: item.moduleTitle,
          lessonTitle: item.lessonTitle,
          gameType: item.gameType,
          contentIds: group.map((entry) => entry.id),
        });

        continue;
      }

      result.push({
        id: item.id,
        question: item.question,
        moduleTitle: item.moduleTitle,
        lessonTitle: item.lessonTitle,
        gameType: item.gameType,
        contentIds: [item.id],
      });
    }

    return result;
  }, [allQuestions, selectedQuestionIds]);

  const selectedChallengeQuestionCount = selectedQuestions.length;

  const canCreateChallenge =
    title.trim().length > 0 &&
    !!courseId &&
    !!courseData &&
    !isLoadingQuestions &&
    !isCreating &&
    selectedChallengeQuestionCount >= 2;

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
            (lessonTotal, lesson) =>
              lesson.gameType === "CONVERSATION"
                ? lessonTotal
                : lessonTotal + lesson.contents.length,
            0,
          ),
        0,
      );

      if (totalQuestions === 0) {
        toast.info("لا توجد أسئلة متاحة داخل هذه الدورة التعليمية حتى الآن.");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "تعذر تحميل أسئلة الدورة التعليمية.";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  function toggleQuestion(questionId: string) {
    const ids = getMatchingGroup(questionId);

    setSelectedQuestionIds((current) => {
      const allSelected = ids.every((id) => current.includes(id));

      if (allSelected) {
        return current.filter((id) => !ids.includes(id));
      }

      return Array.from(new Set([...current, ...ids]));
    });
  }

  function removeSelectedQuestion(questionId: string) {
    const ids = getMatchingGroup(questionId);

    setSelectedQuestionIds((current) =>
      current.filter((id) => !ids.includes(id)),
    );
  }

  function toggleLessonQuestions(lesson: Lesson) {
    if (lesson.gameType === "CONVERSATION") return;

    const lessonIds = lesson.contents.flatMap((question) =>
      getMatchingGroup(question.id),
    );

    const uniqueLessonIds = Array.from(new Set(lessonIds));

    setSelectedQuestionIds((current) => {
      const allSelected = uniqueLessonIds.every((id) => current.includes(id));

      if (allSelected) {
        return current.filter((id) => !uniqueLessonIds.includes(id));
      }

      return Array.from(new Set([...current, ...uniqueLessonIds]));
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("من فضلك أدخل اسم الاختبار.");
      return;
    }

    if (!courseId) {
      setError("من فضلك اختر دورة تعليمية.");
      return;
    }

    if (!courseData || isLoadingQuestions) {
      setError("يرجى الانتظار حتى يتم تحميل أسئلة الدورة التعليمية.");
      return;
    }

    if (selectedChallengeQuestionCount < 2) {
      setError("يجب اختيار سؤالين على الأقل لإنشاء الاختبار.");
      return;
    }

    if (selectedChallengeQuestionCount > 50) {
      setError("الحد الأقصى للأسئلة هو 50 سؤالاً.");
      return;
    }

    // Prevent sending an incomplete matching group if the selection ever becomes inconsistent.
    const incompleteMatchingGroup = allQuestions.some((item) => {
      if (item.gameType !== "MATCHING") return false;

      const groupIds = getMatchingGroup(item.id);

      const selectedCount = groupIds.filter((id) =>
        selectedQuestionIds.includes(id),
      ).length;

      return selectedCount > 0 && selectedCount !== groupIds.length;
    });

    if (incompleteMatchingGroup) {
      setError("يجب اختيار جميع عناصر سؤال المطابقة أو إلغاء اختيارها.");
      return;
    }

    setIsCreating(true);

    try {
      const result = await createGroupChallengeAction({
        title: title.trim(),
        courseId,
        questionIds: selectedQuestionIds,
      });

      setCreatedChallenge({
        id: result.challenge.id,
        code: result.challenge.code,
      });

      toast.success("تم إنشاء الاختبار بنجاح.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الاختبار.";

      setError(message);
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  }

  async function copyCode() {
    if (!createdChallenge) return;

    try {
      await navigator.clipboard.writeText(createdChallenge.code);
      toast.success("تم نسخ كود الاختبار.");
    } catch {
      toast.error("تعذر نسخ الكود.");
    }
  }

  if (createdChallenge) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl py-10">
        <Card>
          <CardContent className="space-y-6 p-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-500/10 text-green-600">
              <CheckCircle2 className="size-9" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">تم إنشاء الاختبار بنجاح!</h1>

              <p className="text-sm text-muted-foreground">
                أصبح الاختبار جاهزًا. شارك الكود مع الطلاب حتى يتمكنوا من
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
                إدارة الاختبار
                <ArrowRight className="size-4" />
              </Button>

              <Button variant="outline" className="flex-1" asChild>
                <Link href="/teacher/group-challenges">العودة للاختبارات</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-3">
        <Link
          href="/teacher/group-challenges"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          العودة للاختبارات
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Swords className="size-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              إنشاء اختبار جماعي جديد
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              جهّز الأسئلة وحدد إعدادات الاختبار قبل مشاركته مع الطلاب.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Basic information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-5 text-primary" />
                  <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
                </div>

                <CardDescription>
                  أدخل اسم الاختبار واختر الدورة التعليمية التي ستُسحب منها
                  الأسئلة.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="challenge-title"
                    className="text-sm font-medium"
                  >
                    اسم الاختبار
                  </label>

                  <Input
                    id="challenge-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="مثال: اختبار أساسيات الحاسب"
                    maxLength={120}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="challenge-course"
                    className="text-sm font-medium"
                  >
                    الدورة التعليمية
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
                    <option value="">اختر دورة تعليمية</option>

                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>

                  {courses.length === 0 && (
                    <p className="text-sm text-destructive">
                      لا توجد دورات تعليمية مرتبطة بحسابك حاليًا.
                    </p>
                  )}
                </div>

                {courseId && courseData && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <BookOpen className="size-5 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          عدد الوحدات التعليمية
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
                            ?.studentsCount.toLocaleString("ar-EG") ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Questions selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="size-5 text-primary" />
                    <CardTitle className="text-lg">اختيار الأسئلة</CardTitle>
                  </div>

                  <Badge variant="secondary">
                    {selectedChallengeQuestionCount.toLocaleString("ar-EG")}{" "}
                    محدد
                  </Badge>
                </div>

                <CardDescription>
                  اختر الأسئلة التي تريد إضافتها إلى الاختبار. عناصر المطابقة
                  المرتبطة ببعضها تُضاف كمجموعة واحدة.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {!courseId ? (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                    <BookOpen className="size-9 text-muted-foreground" />

                    <p className="text-sm text-muted-foreground">
                      اختر دورة تعليمية أولاً لعرض الوحدات والدروس والأسئلة.
                    </p>
                  </div>
                ) : isLoadingQuestions ? (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3">
                    <Loader2 className="size-7 animate-spin text-primary" />

                    <p className="text-sm text-muted-foreground">
                      جاري تحميل أسئلة الدورة التعليمية...
                    </p>
                  </div>
                ) : courseData && allQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {courseData.modules.map((module) => {
                      const availableLessons = module.lessons.filter(
                        (lesson) => lesson.gameType !== "CONVERSATION",
                      );

                      if (availableLessons.length === 0) return null;

                      const moduleQuestionCount = availableLessons.reduce(
                        (total, lesson) => total + lesson.contents.length,
                        0,
                      );

                      return (
                        <div
                          key={module.id}
                          className="overflow-hidden rounded-xl border"
                        >
                          <div className="flex items-center justify-between gap-3 bg-muted/40 p-4">
                            <div className="min-w-0">
                              <h3 className="font-semibold">{module.title}</h3>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {availableLessons.length.toLocaleString(
                                  "ar-EG",
                                )}{" "}
                                دروس
                              </p>
                            </div>

                            <Badge variant="outline">
                              {moduleQuestionCount.toLocaleString("ar-EG")} سؤال
                            </Badge>
                          </div>

                          <div className="divide-y">
                            {availableLessons.map((lesson) => {
                              const lessonIds = Array.from(
                                new Set(
                                  lesson.contents.flatMap((question) =>
                                    getMatchingGroup(question.id),
                                  ),
                                ),
                              );

                              const allSelected =
                                lessonIds.length > 0 &&
                                lessonIds.every((id) =>
                                  selectedQuestionIds.includes(id),
                                );

                              return (
                                <div key={lesson.id} className="p-4">
                                  <div className="mb-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                      <h4 className="text-sm font-semibold">
                                        {lesson.title}
                                      </h4>

                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {lesson.contents.length.toLocaleString(
                                          "ar-EG",
                                        )}{" "}
                                        سؤال
                                        <span className="mx-2">•</span>
                                        {
                                          GAME_TYPE_LABELS[
                                            lesson.gameType as GameType
                                          ]
                                        }
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

                                  <div className="grid gap-3 md:grid-cols-2">
                                    {lesson.contents.map((question, index) => {
                                      const checked =
                                        selectedQuestionIds.includes(
                                          question.id,
                                        );

                                      const isMatching =
                                        lesson.gameType === "MATCHING";

                                      const matchingGroupSize = isMatching
                                        ? getMatchingGroup(question.id).length
                                        : 1;

                                      const options = [
                                        question.optionA,
                                        question.optionB,
                                        question.optionC,
                                        question.optionD,
                                      ].filter(Boolean);

                                      return (
                                        <label
                                          key={question.id}
                                          className={`
                                              group flex cursor-pointer flex-col gap-3 rounded-xl
                                              border p-4 transition-all duration-200
                                              ${
                                                checked
                                                  ? "border-primary bg-primary/5 shadow-sm"
                                                  : "border-border hover:border-primary/40 hover:bg-muted/30"
                                              }
                                            `}
                                        >
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                                                {index + 1}
                                              </span>

                                              <Badge variant="outline">
                                                {
                                                  GAME_TYPE_LABELS[
                                                    lesson.gameType as GameType
                                                  ]
                                                }
                                              </Badge>

                                              {isMatching && (
                                                <Badge variant="secondary">
                                                  {matchingGroupSize} أزواج
                                                </Badge>
                                              )}
                                            </div>

                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              onChange={() =>
                                                toggleQuestion(question.id)
                                              }
                                              className="mt-1 size-4 shrink-0 accent-primary"
                                            />
                                          </div>

                                          <p className="text-sm font-medium leading-7">
                                            {question.question}
                                          </p>

                                          {options.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2">
                                              {options.map(
                                                (option, optionIndex) => (
                                                  <div
                                                    key={optionIndex}
                                                    className="rounded-md bg-muted/50 px-3 py-2 text-xs leading-5"
                                                  >
                                                    <span className="ml-1 font-semibold text-muted-foreground">
                                                      {String.fromCharCode(
                                                        65 + optionIndex,
                                                      )}
                                                      .
                                                    </span>

                                                    {option}
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          )}

                                          {(question.leftText ||
                                            question.rightText) && (
                                            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 p-3">
                                              {question.leftText && (
                                                <Badge variant="outline">
                                                  {question.leftText}
                                                </Badge>
                                              )}

                                              <span className="text-muted-foreground">
                                                ↔
                                              </span>

                                              {question.rightText && (
                                                <Badge variant="outline">
                                                  {question.rightText}
                                                </Badge>
                                              )}
                                            </div>
                                          )}

                                          {checked && (
                                            <div className="flex items-center gap-1 text-xs font-medium text-primary">
                                              <Check className="size-3.5" />
                                              تم اختيار السؤال
                                            </div>
                                          )}
                                        </label>
                                      );
                                    })}

                                    {lesson.contents.length === 0 && (
                                      <p className="col-span-full py-3 text-center text-xs text-muted-foreground">
                                        لا توجد أسئلة في هذا الدرس.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : courseData ? (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                    <FileQuestion className="size-9 text-muted-foreground" />

                    <p className="text-sm text-muted-foreground">
                      لا توجد أسئلة متاحة داخل هذه الدورة التعليمية.
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Time settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إعدادات الوقت</CardTitle>

                <CardDescription>
                  وقت الإجابة موحد وثابت لكل سؤال في الاختبار.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">وقت السؤال</p>

                  <p className="mt-1 text-2xl font-bold tabular-nums">
                    60
                    <span className="mr-1 text-xs font-normal text-muted-foreground">
                      ثانية
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Challenge summary */}
          <div className="space-y-6">
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-5 text-primary" />
                  <CardTitle className="text-lg">ملخص الاختبار</CardTitle>
                </div>

                <CardDescription>
                  راجع إعدادات الاختبار قبل إنشائه.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">اسم الاختبار</p>

                  <p className="font-medium">
                    {title.trim() || "لم يتم تحديد الاسم"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    الدورة التعليمية
                  </p>

                  <p className="font-medium">
                    {courses.find((item) => item.id === courseId)?.title ||
                      "لم يتم اختيار دورة تعليمية"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      الأسئلة المختارة
                    </p>

                    <p className="mt-1 text-2xl font-bold tabular-nums">
                      {selectedChallengeQuestionCount.toLocaleString("ar-EG")}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">وقت السؤال</p>

                    <p className="mt-1 text-2xl font-bold tabular-nums">
                      60
                      <span className="mr-1 text-xs font-normal text-muted-foreground">
                        ثانية
                      </span>
                    </p>
                  </div>
                </div>

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
                          key={`${question.gameType}-${question.id}`}
                          className="flex items-start gap-2 rounded-lg border p-3"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-xs leading-5">
                              {question.question}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              <p className="truncate text-[11px] text-muted-foreground">
                                {question.moduleTitle} / {question.lessonTitle}
                              </p>

                              <Badge variant="outline" className="text-[10px]">
                                {GAME_TYPE_LABELS[question.gameType]}
                              </Badge>
                            </div>

                            {question.gameType === "MATCHING" && (
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                {question.contentIds.length} أزواج مطابقة
                              </p>
                            )}
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
                  disabled={!canCreateChallenge}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جاري إنشاء الاختبار...
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      إنشاء الاختبار
                    </>
                  )}
                </Button>

                {selectedChallengeQuestionCount < 2 && (
                  <p className="text-center text-xs text-muted-foreground">
                    يجب اختيار سؤالين على الأقل لتفعيل إنشاء الاختبار.
                  </p>
                )}

                <p className="text-center text-xs text-muted-foreground">
                  سيتم إنشاء الاختبار بحالة انتظار الطلاب.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
