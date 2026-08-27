"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Clock3,
  FileQuestion,
  GraduationCap,
  Layers3,
  Search,
  Swords,
  Trophy,
  Users,
  X,
} from "lucide-react";

import {
  getTeacherCoursesAction,
  getCourseModulesAction,
  getModuleQuestionsAction,
  getCourseStudentsAction,
  createBattleAction,
} from "@/actions/teacher/battle-controle";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ========================================================= */
/* TYPES */
/* ========================================================= */

type Step = 1 | 2 | 3 | 4;

type Course = {
  id: string;
  title: string;
  description: string | null;
};

type Module = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  level: string;
};

type Question = {
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
};

type Student = {
  id: string;
  name: string | null;
  image: string | null;
  level: string;
};

/* ========================================================= */
/* STEPS */
/* ========================================================= */

const STEPS = [
  {
    id: 1,
    title: "المعلومات",
    description: "بيانات التحدي",
    icon: Swords,
  },
  {
    id: 2,
    title: "الأسئلة",
    description: "محتوى التحدي",
    icon: FileQuestion,
  },
  {
    id: 3,
    title: "الفرق",
    description: "تكوين الفريقين",
    icon: Users,
  },
  {
    id: 4,
    title: "المراجعة",
    description: "تأكيد التحدي",
    icon: Check,
  },
] as const;

/* ========================================================= */
/* PAGE */
/* ========================================================= */

export default function NewBattlePage() {
  const router = useRouter();

  /* ======================================================= */
  /* BASIC DATA */
  /* ======================================================= */

  const [step, setStep] = React.useState<Step>(1);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [course, setCourse] = React.useState("");
  const [module, setModule] = React.useState("");

  /* ======================================================= */
  /* SERVER DATA */
  /* ======================================================= */

  const [courses, setCourses] = React.useState<Course[]>([]);

  const [modules, setModules] = React.useState<Module[]>([]);

  const [questions, setQuestions] = React.useState<Question[]>([]);

  const [students, setStudents] = React.useState<Student[]>([]);

  /* ======================================================= */
  /* LOADING */
  /* ======================================================= */

  const [loadingCourses, setLoadingCourses] = React.useState(true);

  const [loadingModules, setLoadingModules] = React.useState(false);

  const [loadingQuestions, setLoadingQuestions] = React.useState(false);

  const [loadingStudents, setLoadingStudents] = React.useState(false);

  /* ======================================================= */
  /* SELECTIONS */
  /* ======================================================= */

  const [selectedQuestions, setSelectedQuestions] = React.useState<string[]>(
    [],
  );

  const [teamAName, setTeamAName] = React.useState("الصقور");

  const [teamBName, setTeamBName] = React.useState("النسور");

  const [teamAStudents, setTeamAStudents] = React.useState<string[]>([]);

  const [teamBStudents, setTeamBStudents] = React.useState<string[]>([]);

  /* ======================================================= */
  /* BATTLE SETTINGS */
  /* ======================================================= */

  const [questionTime, setQuestionTime] = React.useState("20");

  const [points, setPoints] = React.useState("100");

  /* ======================================================= */
  /* SEARCH */
  /* ======================================================= */

  const [searchStudents, setSearchStudents] = React.useState("");

  /* ======================================================= */
  /* UI STATE */
  /* ======================================================= */

  const [isCreating, setIsCreating] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);

  /* ======================================================= */
  /* LOAD COURSES */
  /* ======================================================= */

  React.useEffect(() => {
    async function loadCourses() {
      setLoadingCourses(true);
      setError(null);

      const result = await getTeacherCoursesAction();

      if (!result.success) {
        setError(result.error ?? "حدث خطأ أثناء تحميل الكورسات");

        setLoadingCourses(false);
        return;
      }

      setCourses(result.data ?? []);
      setLoadingCourses(false);
    }

    loadCourses();
  }, []);

  /* ======================================================= */
  /* DERIVED DATA */
  /* ======================================================= */

  const filteredStudents = students.filter((student) =>
    (student.name ?? "").toLowerCase().includes(searchStudents.toLowerCase()),
  );

  const selectedCourse = courses.find((item) => item.id === course);

  const selectedModule = modules.find((item) => item.id === module);

  /* ======================================================= */
  /* VALIDATION */
  /* ======================================================= */

  function canContinue() {
    if (step === 1) {
      return title.trim().length > 2 && course.length > 0 && module.length > 0;
    }

    if (step === 2) {
      return selectedQuestions.length > 0;
    }

    if (step === 3) {
      return (
        teamAStudents.length > 0 &&
        teamBStudents.length > 0 &&
        teamAName.trim().length > 0 &&
        teamBName.trim().length > 0
      );
    }

    return true;
  }

  /* ======================================================= */
  /* COURSE CHANGE */
  /* ======================================================= */

  async function handleCourseChange(courseId: string) {
    setCourse(courseId);

    setModule("");
    setModules([]);

    setQuestions([]);
    setSelectedQuestions([]);

    setStudents([]);

    setTeamAStudents([]);
    setTeamBStudents([]);

    if (!courseId) {
      return;
    }

    setLoadingModules(true);
    setLoadingStudents(true);
    setError(null);

    const [modulesResult, studentsResult] = await Promise.all([
      getCourseModulesAction(courseId),
      getCourseStudentsAction(courseId),
    ]);

    if (!modulesResult.success) {
      setError(modulesResult.error ?? "حدث خطأ أثناء تحميل الوحدات");
    } else {
      setModules(modulesResult.data ?? []);
    }

    if (!studentsResult.success) {
      setError(studentsResult.error ?? "حدث خطأ أثناء تحميل الطلاب");
    } else {
      setStudents(studentsResult.data ?? []);
    }

    setLoadingModules(false);
    setLoadingStudents(false);
  }

  /* ======================================================= */
  /* MODULE CHANGE */
  /* ======================================================= */

  async function handleModuleChange(moduleId: string) {
    setModule(moduleId);

    setQuestions([]);
    setSelectedQuestions([]);

    if (!moduleId) {
      return;
    }

    setLoadingQuestions(true);
    setError(null);

    const result = await getModuleQuestionsAction(moduleId);

    if (!result.success) {
      setError(result.error ?? "حدث خطأ أثناء تحميل الأسئلة");

      setLoadingQuestions(false);
      return;
    }

    setQuestions(result.data ?? []);

    setLoadingQuestions(false);
  }

  /* ======================================================= */
  /* NAVIGATION */
  /* ======================================================= */

  function nextStep() {
    if (!canContinue()) return;

    setStep((current) => Math.min(current + 1, 4) as Step);
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 1) as Step);
  }

  /* ======================================================= */
  /* QUESTION SELECTION */
  /* ======================================================= */

  function toggleQuestion(id: string) {
    setSelectedQuestions((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  /* ======================================================= */
  /* STUDENT SELECTION */
  /* ======================================================= */

  function addStudentToTeam(studentId: string, team: "A" | "B") {
    // Remove from both teams first
    setTeamAStudents((current) => current.filter((id) => id !== studentId));

    setTeamBStudents((current) => current.filter((id) => id !== studentId));

    if (team === "A") {
      setTeamAStudents((current) => [...current, studentId]);
    } else {
      setTeamBStudents((current) => [...current, studentId]);
    }
  }

  function removeStudentFromTeams(studentId: string) {
    setTeamAStudents((current) => current.filter((id) => id !== studentId));

    setTeamBStudents((current) => current.filter((id) => id !== studentId));
  }

  function getStudentTeam(studentId: string): "A" | "B" | null {
    if (teamAStudents.includes(studentId)) {
      return "A";
    }

    if (teamBStudents.includes(studentId)) {
      return "B";
    }

    return null;
  }



  /* ======================================================= */
  /* CREATE BATTLE */
  /* ======================================================= */

  async function createBattle() {
    if (!canContinue()) {
      return;
    }

    setIsCreating(true);
    setError(null);

    /*
     * createBattleAction will be added next.
     *
     * Payload:
     *
     * {
     *   title,
     *   description,
     *   courseId: course,
     *   moduleId: module,
     *   questionIds: selectedQuestions,
     *   studentIds: selectedStudents,
     *   questionTime: Number(questionTime),
     *   points: Number(points),
     * }
     */

     try {
    const result = await createBattleAction({
      title: title.trim(),

      courseId: course,

      moduleId: module,

      questionIds: selectedQuestions,

      teamAStudentIds: teamAStudents,

      teamBStudentIds: teamBStudents,

      questionTime: Number(questionTime),

      points: Number(points),
    });
      // =========================================
    // ERROR
    // =========================================

    if (!result.success) {
      setError(
        result.error ??
          "حدث خطأ أثناء إنشاء التحدي",
      );

      setIsCreating(false);

      return;
    }

    // =========================================
    // SUCCESS
    // =========================================

    router.push(
      `/teacher/battles/${result.data?.battleId}`,
    );

    router.refresh();
  } catch (error) {
    console.error(
      "CREATE_BATTLE_UI_ERROR:",
      error,
    );

    setError(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء إنشاء التحدي",
    );

    setIsCreating(false);
  }
    console.log({
      title,
      description,
      courseId: course,
      moduleId: module,
      questionIds: selectedQuestions,
      teamA: {
        name: teamAName.trim(),
        studentIds: teamAStudents,
      },

      teamB: {
        name: teamBName.trim(),
        studentIds: teamBStudents,
      },
      questionTime: Number(questionTime),
      points: Number(points),
    });

    /*
     * TODO:
     *
     * const result =
     *   await createBattleAction({...});
     *
     * if (!result.success) {
     *   setError(result.error ?? "...");
     *   setIsCreating(false);
     *   return;
     * }
     *
     * router.push(
     *   `/teacher/battles/${result.data.id}`,
     * );
     */

    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsCreating(false);
  }

  /* ======================================================= */
  /* RENDER */
  /* ======================================================= */

  return (
    <main dir="rtl" className="min-h-screen bg-muted/20">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">
          <Link
            href="/teacher/battles"
            className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            العودة إلى التحديات
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Swords className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                إنشاء تحدي جديد
              </h1>

              <p className="mt-1.5 text-sm text-muted-foreground">
                أنشئ تحديًا تنافسيًا واختر الأسئلة والطلاب المشاركين.
              </p>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <span>{error}</span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ================================================= */}
        {/* STEPPER */}
        {/* ================================================= */}

        <div className="mb-8 overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="grid grid-cols-4">
            {STEPS.map((item, index) => {
              const Icon = item.icon;

              const active = step === item.id;

              const completed = step > item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.id > step}
                  onClick={() => {
                    if (item.id <= step) {
                      setStep(item.id as Step);
                    }
                  }}
                  className={[
                    "relative flex min-w-0 items-center gap-3 px-3 py-4 text-right transition-colors sm:px-5",
                    active ? "bg-primary/5" : "hover:bg-muted/50",
                  ].join(" ")}
                >
                  {index > 0 && (
                    <div className="absolute right-0 top-1/2 h-px w-4 -translate-y-1/2 bg-border sm:w-6" />
                  )}

                  <div
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold",
                      completed
                        ? "border-primary bg-primary text-primary-foreground"
                        : active
                          ? "border-primary bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>

                  <div className="hidden min-w-0 sm:block">
                    <p
                      className={[
                        "truncate text-sm font-semibold",
                        active ? "text-primary" : "text-foreground",
                      ].join(" ")}
                    >
                      {item.title}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* ================================================= */}
          {/* MAIN */}
          {/* ================================================= */}

          <Card className="rounded-2xl border bg-background shadow-sm">
            {/* STEP 1 */}

            {step === 1 && (
              <StepInformation
                title={title}
                description={description}
                course={course}
                module={module}
                questionTime={questionTime}
                points={points}
                courses={courses}
                modules={modules}
                loadingCourses={loadingCourses}
                loadingModules={loadingModules}
                setTitle={setTitle}
                setDescription={setDescription}
                setCourse={handleCourseChange}
                setModule={handleModuleChange}
                setQuestionTime={setQuestionTime}
                setPoints={setPoints}
              />
            )}

            {/* STEP 2 */}

            {step === 2 && (
              <StepQuestions
                questions={questions}
                selectedQuestions={selectedQuestions}
                toggleQuestion={toggleQuestion}
                loading={loadingQuestions}
              />
            )}

            {/* STEP 3 */}

            {step === 3 && (
              <StepTeams
                students={filteredStudents}
                totalStudents={students.length}
                teamAName={teamAName}
                teamBName={teamBName}
                teamAStudents={teamAStudents}
                teamBStudents={teamBStudents}
                search={searchStudents}
                setSearch={setSearchStudents}
                setTeamAName={setTeamAName}
                setTeamBName={setTeamBName}
                addStudentToTeam={addStudentToTeam}
                removeStudentFromTeams={removeStudentFromTeams}
                getStudentTeam={getStudentTeam}
                loading={loadingStudents}
              />
            )}

            {/* STEP 4 */}

            {step === 4 && (
              <StepReview
                title={title}
    description={description}
    course={selectedCourse?.title ?? "-"}
    module={selectedModule?.title ?? "-"}
    selectedQuestions={selectedQuestions}
    teamAName={teamAName}
    teamBName={teamBName}
    teamAStudents={teamAStudents}
    teamBStudents={teamBStudents}
    students={students}
    questionTime={questionTime}
    points={points}
              />
            )}

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <div className="border-t bg-muted/20 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={previousStep}
                  disabled={step === 1 || isCreating}
                  className="rounded-xl"
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                  السابق
                </Button>

                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canContinue()}
                    className="rounded-xl px-6"
                  >
                    التالي
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={createBattle}
                    disabled={isCreating || !canContinue()}
                    className="rounded-xl px-6"
                  >
                    {isCreating ? (
                      <>جاري إنشاء التحدي...</>
                    ) : (
                      <>
                        <Swords className="mr-2 h-4 w-4" />
                        إنشاء التحدي
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* ================================================= */}
          {/* SIDE SUMMARY */}
          {/* ================================================= */}

          <aside className="hidden lg:block">
            <Card className="sticky top-6 rounded-2xl border bg-background shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">ملخص التحدي</CardTitle>

                <CardDescription>
                  يظهر لك ملخص الإعدادات أثناء الإنشاء.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <SummaryItem
                  icon={Swords}
                  label="اسم التحدي"
                  value={title || "لم يتم تحديده"}
                />

                <SummaryItem
                  icon={GraduationCap}
                  label="الكورس"
                  value={selectedCourse?.title ?? "لم يتم اختيار الكورس"}
                />

                <SummaryItem
                  icon={Layers3}
                  label="الوحدة"
                  value={selectedModule?.title ?? "لم يتم اختيار الوحدة"}
                />

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <SummaryStat
                    icon={FileQuestion}
                    value={selectedQuestions.length}
                    label="أسئلة"
                  />

                  <SummaryStat
                    icon={Users}
                    value={teamAStudents.length + teamBStudents.length}
                    label="طلاب"
                  />
                  <div className="rounded-xl border bg-muted/20 p-3 text-center">
                    <p className="text-xs text-muted-foreground">الفرق</p>

                    <p className="mt-1 text-sm font-bold">
                      {teamAName} {teamAStudents.length}
                      {" × "}
                      {teamBStudents.length} {teamBName}
                    </p>
                  </div>
                  <SummaryStat
                    icon={Clock3}
                    value={`${questionTime}s`}
                    label="لكل سؤال"
                  />

                  <SummaryStat icon={Trophy} value={points} label="نقطة" />
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ========================================================= */
/* STEP 1 */
/* ========================================================= */

function StepInformation({
  title,
  description,
  course,
  module,
  questionTime,
  points,
  courses,
  modules,
  loadingCourses,
  loadingModules,
  setTitle,
  setDescription,
  setCourse,
  setModule,
  setQuestionTime,
  setPoints,
}: {
  title: string;
  description: string;
  course: string;
  module: string;
  questionTime: string;
  points: string;

  courses: Course[];
  modules: Module[];

  loadingCourses: boolean;
  loadingModules: boolean;

  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setCourse: (value: string) => void;
  setModule: (value: string) => void;
  setQuestionTime: (value: string) => void;
  setPoints: (value: string) => void;
}) {
  return (
    <div>
      <CardHeader>
        <CardTitle>معلومات التحدي</CardTitle>

        <CardDescription>
          أدخل المعلومات الأساسية التي ستظهر للطلاب.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* TITLE */}

        <div className="space-y-2">
          <Label htmlFor="title">اسم التحدي</Label>

          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: تحدي مكونات الحاسب"
            className="h-11 rounded-xl"
          />
        </div>

        {/* DESCRIPTION */}

        <div className="space-y-2">
          <Label htmlFor="description">
            وصف التحدي
            <span className="mr-2 text-xs font-normal text-muted-foreground">
              اختياري
            </span>
          </Label>

          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب وصفًا مختصرًا للتحدي..."
            className="min-h-28 resize-none rounded-xl"
          />
        </div>

        {/* COURSE / MODULE */}

        <div className="grid gap-5 sm:grid-cols-2">
          {/* COURSE */}

          <div className="space-y-2">
            <Label>الكورس</Label>

            <Select
              value={course}
              onValueChange={setCourse}
              disabled={loadingCourses}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue
                  placeholder={
                    loadingCourses ? "جاري تحميل الكورسات..." : "اختر الكورس"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {courses.length === 0 && !loadingCourses ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    لا توجد كورسات متاحة
                  </div>
                ) : (
                  courses.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* MODULE */}

          <div className="space-y-2">
            <Label>الوحدة</Label>

            <Select
              value={module}
              onValueChange={setModule}
              disabled={!course || loadingModules}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue
                  placeholder={
                    !course
                      ? "اختر الكورس أولًا"
                      : loadingModules
                        ? "جاري تحميل الوحدات..."
                        : "اختر الوحدة"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {modules.length === 0 && !loadingModules ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    لا توجد وحدات متاحة
                  </div>
                ) : (
                  modules.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* SETTINGS */}

        <div>
          <h3 className="mb-1 font-semibold">إعدادات الجولة</h3>

          <p className="text-xs text-muted-foreground">
            تحدد مدة الإجابة وعدد النقاط الأساسية لكل سؤال.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* TIME */}

          <div className="space-y-2">
            <Label>وقت السؤال</Label>

            <Select value={questionTime} onValueChange={setQuestionTime}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="10">10 ثوانٍ</SelectItem>

                <SelectItem value="15">15 ثانية</SelectItem>

                <SelectItem value="20">20 ثانية</SelectItem>

                <SelectItem value="30">30 ثانية</SelectItem>

                <SelectItem value="45">45 ثانية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* POINTS */}

          <div className="space-y-2">
            <Label>النقاط الأساسية</Label>

            <Select value={points} onValueChange={setPoints}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="50">50 نقطة</SelectItem>

                <SelectItem value="100">100 نقطة</SelectItem>

                <SelectItem value="150">150 نقطة</SelectItem>

                <SelectItem value="200">200 نقطة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </div>
  );
}

/* ========================================================= */
/* STEP 2 */
/* ========================================================= */

function StepQuestions({
  questions,
  selectedQuestions,
  toggleQuestion,
  loading,
}: {
  questions: Question[];
  selectedQuestions: string[];
  toggleQuestion: (id: string) => void;
  loading: boolean;
}) {
  return (
    <div>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>اختيار الأسئلة</CardTitle>

            <CardDescription>
              اختر الأسئلة التي ستظهر في التحدي.
            </CardDescription>
          </div>

          <Badge variant="secondary" className="w-fit rounded-full">
            {selectedQuestions.length} محدد
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers3 className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold">أسئلة الوحدة المختارة</p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                الأسئلة المعروضة هنا مأخوذة مباشرة من محتوى الوحدة، وسيتم نسخ
                المختار منها إلى التحدي عند الإنشاء.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-xl border border-dashed py-12 text-center">
              <FileQuestion className="mx-auto h-8 w-8 animate-pulse text-muted-foreground/50" />

              <p className="mt-3 text-sm font-medium">جاري تحميل الأسئلة...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-xl border border-dashed py-12 text-center">
              <FileQuestion className="mx-auto h-8 w-8 text-muted-foreground/50" />

              <p className="mt-3 text-sm font-medium">لا توجد أسئلة متاحة</p>

              <p className="mt-1 text-xs text-muted-foreground">
                اختر وحدة تحتوي على أسئلة أولًا.
              </p>
            </div>
          ) : (
            questions.map((question, index) => {
              const selected = selectedQuestions.includes(question.id);

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => toggleQuestion(question.id)}
                  className={[
                    "flex w-full items-start gap-4 rounded-xl border p-4 text-right transition-all",
                    selected
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/30 hover:bg-muted/30",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background",
                    ].join(" ")}
                  >
                    {selected && <Check className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">
                        سؤال {index + 1}
                      </span>

                      <Badge
                        variant="outline"
                        className="rounded-md text-[10px]"
                      >
                        {question.gameType}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium leading-6">
                      {question.question}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      الدرس: {question.lessonTitle}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </CardContent>
    </div>
  );
}

/* ========================================================= */
/* STEP 3 */
/* ========================================================= */

function StepTeams({
  students,
  totalStudents,
  teamAName,
  teamBName,
  teamAStudents,
  teamBStudents,
  search,
  setSearch,
  setTeamAName,
  setTeamBName,
  addStudentToTeam,
  removeStudentFromTeams,
  getStudentTeam,
  loading,
}: {
  students: Student[];
  totalStudents: number;

  teamAName: string;
  teamBName: string;

  teamAStudents: string[];
  teamBStudents: string[];

  search: string;
  setSearch: (value: string) => void;

  setTeamAName: (value: string) => void;
  setTeamBName: (value: string) => void;

  addStudentToTeam: (studentId: string, team: "A" | "B") => void;

  removeStudentFromTeams: (studentId: string) => void;

  getStudentTeam: (studentId: string) => "A" | "B" | null;

  loading: boolean;
}) {
  const selectedCount = teamAStudents.length + teamBStudents.length;

  const isBalanced = teamAStudents.length === teamBStudents.length;

  const getStudent = (id: string) =>
    students.find((student) => student.id === id);

  return (
    <div>
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}

      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>تكوين الفرق</CardTitle>

            <CardDescription>
              وزّع الطلاب على فريقين للمنافسة في التحدي.
            </CardDescription>
          </div>

          <Badge variant="secondary" className="w-fit rounded-full px-3 py-1.5">
            {selectedCount} / {totalStudents} طالب
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ============================================ */}
        {/* TEAM NAMES */}
        {/* ============================================ */}

        <div className="grid gap-4 md:grid-cols-2">
          {/* TEAM A */}

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/3 p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Users className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <Label htmlFor="team-a-name" className="text-sm font-bold">
                  الفريق الأول
                </Label>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {teamAStudents.length} أعضاء
                </p>
              </div>
            </div>

            <Input
              id="team-a-name"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              placeholder="اسم الفريق"
              className="h-11 rounded-xl bg-background"
            />
          </div>

          {/* TEAM B */}

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/3 p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                <Users className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <Label htmlFor="team-b-name" className="text-sm font-bold">
                  الفريق الثاني
                </Label>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {teamBStudents.length} أعضاء
                </p>
              </div>
            </div>

            <Input
              id="team-b-name"
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              placeholder="اسم الفريق"
              className="h-11 rounded-xl bg-background"
            />
          </div>
        </div>

        {/* ============================================ */}
        {/* BALANCE */}
        {/* ============================================ */}

        <div
          className={[
            "rounded-xl border px-4 py-3",
            isBalanced && teamAStudents.length > 0
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-amber-500/20 bg-amber-500/5",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <div
              className={[
                "flex h-8 w-8 items-center justify-center rounded-lg",
                isBalanced && teamAStudents.length > 0
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-amber-500/10 text-amber-600",
              ].join(" ")}
            >
              {isBalanced && teamAStudents.length > 0 ? (
                <Check className="h-4 w-4" />
              ) : (
                <Swords className="h-4 w-4" />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">
                {isBalanced && teamAStudents.length > 0
                  ? "الفرق متوازنة"
                  : "الفرق غير متوازنة"}
              </p>

              <p className="text-xs text-muted-foreground">
                {teamAStudents.length} {teamAName}{" "}
                <span className="mx-1">مقابل</span>
                {teamBStudents.length} {teamBName}
              </p>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* SEARCH */}
        {/* ============================================ */}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">الطلاب</h3>

              <p className="mt-1 text-xs text-muted-foreground">
                أضف كل طالب إلى الفريق المناسب.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن طالب..."
              className="h-11 rounded-xl pr-9"
              disabled={loading}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* STUDENT LIST */}
        {/* ============================================ */}

        <div className="overflow-hidden rounded-2xl border">
          {loading ? (
            <div className="py-16 text-center">
              <Users className="mx-auto h-8 w-8 animate-pulse text-muted-foreground/50" />

              <p className="mt-3 text-sm font-medium">جاري تحميل الطلاب...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />

              <p className="mt-3 text-sm font-semibold">لا يوجد طلاب</p>

              <p className="mt-1 text-xs text-muted-foreground">
                {search
                  ? "لم يتم العثور على طالب بهذا الاسم."
                  : "لا يوجد طلاب مسجلون في هذا الكورس."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {students.map((student) => {
                const team = getStudentTeam(student.id);

                return (
                  <div
                    key={student.id}
                    className={[
                      "flex flex-col gap-4 p-4 transition-colors sm:flex-row sm:items-center",
                      team === "A"
                        ? "bg-blue-500/2.5"
                        : team === "B"
                          ? "bg-rose-500/2.5"
                          : "hover:bg-muted/30",
                    ].join(" ")}
                  >
                    {/* STUDENT */}

                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-bold">
                        {student.image ? (
                          <img
                            src={student.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          (student.name?.charAt(0) ?? "؟")
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {student.name ?? "طالب بدون اسم"}
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          المستوى: {student.level}
                        </p>
                      </div>
                    </div>

                    {/* CURRENT TEAM */}

                    {team ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={[
                            "rounded-lg",
                            team === "A"
                              ? "border-blue-500/20 bg-blue-500/10 text-blue-700 hover:bg-blue-500/10"
                              : "border-rose-500/20 bg-rose-500/10 text-rose-700 hover:bg-rose-500/10",
                          ].join(" ")}
                          variant="outline"
                        >
                          {team === "A" ? `🟦 ${teamAName}` : `🟥 ${teamBName}`}
                        </Badge>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStudentFromTeams(student.id)}
                          className="rounded-lg text-muted-foreground hover:text-destructive"
                        >
                          إزالة
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            addStudentToTeam(
                              student.id,
                              team === "A" ? "B" : "A",
                            )
                          }
                          className="rounded-lg"
                        >
                          نقل إلى {team === "A" ? teamBName : teamAName}
                        </Button>
                      </div>
                    ) : (
                      /* NO TEAM */

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addStudentToTeam(student.id, "A")}
                          className="rounded-lg border-blue-500/30 text-blue-700 hover:bg-blue-500/10 hover:text-blue-700"
                        >
                          + {teamAName}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addStudentToTeam(student.id, "B")}
                          className="rounded-lg border-rose-500/30 text-rose-700 hover:bg-rose-500/10 hover:text-rose-700"
                        >
                          + {teamBName}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* TEAM PREVIEW */}
        {/* ============================================ */}

        {(teamAStudents.length > 0 || teamBStudents.length > 0) && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* TEAM A */}

            <TeamPreview
              name={teamAName}
              students={teamAStudents
                .map(getStudent)
                .filter((student): student is Student => Boolean(student))}
              onRemove={removeStudentFromTeams}
              type="A"
            />

            {/* TEAM B */}

            <TeamPreview
              name={teamBName}
              students={teamBStudents
                .map(getStudent)
                .filter((student): student is Student => Boolean(student))}
              onRemove={removeStudentFromTeams}
              type="B"
            />
          </div>
        )}
      </CardContent>
    </div>
  );
}

function TeamPreview({
  name,
  students,
  onRemove,
  type,
}: {
  name: string;
  students: Student[];
  onRemove: (studentId: string) => void;
  type: "A" | "B";
}) {
  return (
    <div
      className={[
        "rounded-2xl border p-4",
        type === "A"
          ? "border-blue-500/20 bg-blue-500/3"
          : "border-rose-500/20 bg-rose-500/3",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={[
              "h-2.5 w-2.5 rounded-full",
              type === "A" ? "bg-blue-500" : "bg-rose-500",
            ].join(" ")}
          />

          <h3 className="text-sm font-bold">{name}</h3>
        </div>

        <Badge variant="secondary" className="rounded-lg">
          {students.length}
        </Badge>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed py-7 text-center">
          <Users className="mx-auto h-6 w-6 text-muted-foreground/40" />

          <p className="mt-2 text-xs text-muted-foreground">
            لم تتم إضافة طلاب بعد
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-3 rounded-xl border bg-background p-2.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-bold">
                {student.image ? (
                  <img
                    src={student.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (student.name?.charAt(0) ?? "؟")
                )}
              </div>

              <p className="min-w-0 flex-1 truncate text-xs font-semibold">
                {student.name ?? "طالب بدون اسم"}
              </p>

              <button
                type="button"
                onClick={() => onRemove(student.id)}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* ========================================================= */
/* STEP 4 */
/* ========================================================= */

function StepReview({
  title,
  description,
  course,
  module,
  selectedQuestions,
  teamAName,
  teamBName,
  teamAStudents,
  teamBStudents,
  students,
  questionTime,
  points,
}: {
  title: string;
  description: string;
  course: string;
  module: string;

  selectedQuestions: string[];

  teamAName: string;
  teamBName: string;

  teamAStudents: string[];
  teamBStudents: string[];

  students: Student[];

  questionTime: string;
  points: string;
}) {
  const getStudent = (id: string) =>
    students.find(
      (student) => student.id === id,
    );

  const teamA = teamAStudents
    .map(getStudent)
    .filter(
      (student): student is Student =>
        Boolean(student),
    );

  const teamB = teamBStudents
    .map(getStudent)
    .filter(
      (student): student is Student =>
        Boolean(student),
    );

  return (
    <div>
      <CardHeader>
        <CardTitle>
          مراجعة التحدي
        </CardTitle>

        <CardDescription>
          راجع جميع إعدادات التحدي قبل إنشائه وإرسال الدعوات للطلاب.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* ========================================= */}
        {/* HERO */}
        {/* ========================================= */}

        <div className="rounded-2xl border bg-muted/20 p-5">
          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Swords className="h-5 w-5" />
            </div>

            <div className="min-w-0">

              <h3 className="text-xl font-bold">
                {title || "تحدي جديد"}
              </h3>

              {description && (
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              )}

            </div>

          </div>
        </div>

        {/* ========================================= */}
        {/* BASIC DETAILS */}
        {/* ========================================= */}

        <div className="grid gap-3 sm:grid-cols-2">

          <ReviewItem
            icon={GraduationCap}
            label="الكورس"
            value={course}
          />

          <ReviewItem
            icon={Layers3}
            label="الوحدة"
            value={module}
          />

          <ReviewItem
            icon={FileQuestion}
            label="عدد الأسئلة"
            value={`${selectedQuestions.length} سؤال`}
          />

          <ReviewItem
            icon={Clock3}
            label="وقت السؤال"
            value={`${questionTime} ثانية`}
          />

          <ReviewItem
            icon={Trophy}
            label="النقاط الأساسية"
            value={`${points} نقطة`}
          />

          <ReviewItem
            icon={Users}
            label="إجمالي اللاعبين"
            value={`${
              teamAStudents.length +
              teamBStudents.length
            } طالب`}
          />

        </div>

        <Separator />

        {/* ========================================= */}
        {/* TEAMS */}
        {/* ========================================= */}

        <div>

          <div className="mb-4">

            <h3 className="text-base font-bold">
              الفرق المشاركة
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              سيتم إرسال الدعوة لكل طالب مع تحديد الفريق الخاص به.
            </p>

          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* TEAM A */}

            <ReviewTeam
              name={teamAName}
              students={teamA}
              type="A"
            />

            {/* TEAM B */}

            <ReviewTeam
              name={teamBName}
              students={teamB}
              type="B"
            />

          </div>

        </div>

        {/* ========================================= */}
        {/* MATCH PREVIEW */}
        {/* ========================================= */}

        <div className="rounded-2xl border bg-muted/20 p-5">

          <div className="flex items-center justify-center gap-4 sm:gap-8">

            <div className="min-w-0 text-center">

              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                <Users className="h-5 w-5" />
              </div>

              <p className="truncate text-sm font-bold">
                {teamAName}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {teamAStudents.length} لاعبين
              </p>

            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-black">
              VS
            </div>

            <div className="min-w-0 text-center">

              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
                <Users className="h-5 w-5" />
              </div>

              <p className="truncate text-sm font-bold">
                {teamBName}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {teamBStudents.length} لاعبين
              </p>

            </div>

          </div>

        </div>

        {/* ========================================= */}
        {/* INVITATIONS */}
        {/* ========================================= */}

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">

          <div className="flex items-start gap-3">

            <Users className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

            <div>

              <p className="text-sm font-semibold">
                الدعوات
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">

                بعد إنشاء التحدي سيتم إرسال دعوة إلى{" "}

                <strong className="text-foreground">
                  {
                    teamAStudents.length +
                    teamBStudents.length
                  } طالب
                </strong>

                ، مع تحديد الفريق الذي ينتمي إليه كل طالب.

                سيبقى التحدي في حالة انتظار حتى تبدأه أنت.

              </p>

            </div>

          </div>

        </div>

      </CardContent>
    </div>
  );
}

function ReviewTeam({
  name,
  students,
  type,
}: {
  name: string;
  students: Student[];
  type: "A" | "B";
}) {
  const isA = type === "A";

  return (
    <div
      className={[
        "rounded-2xl border p-4",
        isA
          ? "border-blue-500/20 bg-blue-500/3"
          : "border-rose-500/20 bg-rose-500/3",
      ].join(" ")}
    >

      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">

        <div className="flex min-w-0 items-center gap-3">

          <div
            className={[
              "h-3 w-3 shrink-0 rounded-full",
              isA
                ? "bg-blue-500"
                : "bg-rose-500",
            ].join(" ")}
          />

          <h4 className="truncate text-sm font-bold">
            {name}
          </h4>

        </div>

        <Badge
          variant="secondary"
          className="rounded-lg"
        >
          {students.length}
        </Badge>

      </div>

      {/* STUDENTS */}

      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed py-6 text-center">

          <Users className="mx-auto h-6 w-6 text-muted-foreground/40" />

          <p className="mt-2 text-xs text-muted-foreground">
            لا يوجد لاعبين
          </p>

        </div>
      ) : (
        <div className="space-y-2">

          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-3 rounded-xl border bg-background p-2.5"
            >

              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-bold">

                {student.image ? (
                  <img
                    src={student.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  student.name?.charAt(0) ?? "؟"
                )}

              </div>

              <div className="min-w-0">

                <p className="truncate text-xs font-semibold">
                  {student.name ??
                    "طالب بدون اسم"}
                </p>

                <p className="text-[10px] text-muted-foreground">
                  المستوى: {student.level}
                </p>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}
/* ========================================================= */
/* SUMMARY ITEM */
/* ========================================================= */

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>

        <p className="mt-1 truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

/* ========================================================= */
/* SUMMARY STAT */
/* ========================================================= */

function SummaryStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />

      <p className="mt-2 text-lg font-bold">{value}</p>

      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

/* ========================================================= */
/* REVIEW ITEM */
/* ========================================================= */

function ReviewItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>

        <p className="mt-1 truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
