import Link from "next/link";
import {
  Trophy,
  Users,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Medal,
  ArrowRight,
  Target,
  BarChart3,
} from "lucide-react";

import type { getGroupChallengeResultsAction } from "@/actions/teacher/group-challenge-results";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ResultsData = Awaited<
  ReturnType<typeof getGroupChallengeResultsAction>
>;

function formatDuration(date: Date | null) {
  if (!date) return "—";

  return new Date(date).toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TeacherGroupChallengeResults({
  data,
}: {
  data: ResultsData;
}) {
  const {
    challenge,
    summary,
    teams,
    leaderboard,
    questionStatistics,
  } = data;

  const winningTeamName =
    teams.winningTeam === "DRAW"
      ? "تعادل"
      : teams.winningTeam === "TEAM_A"
        ? "الفريق A"
        : "الفريق B";

  const accuracy =
    summary.totalAnswers > 0
      ? Math.round(
          (summary.totalCorrectAnswers / summary.totalAnswers) * 100
        )
      : 0;

const teamCard = (
  title: string,
  team: typeof teams.teamA | typeof teams.teamB,
  isWinner: boolean,
) => (
    <Card className={isWinner ? "border-primary shadow-sm" : ""}>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          {isWinner && <Badge>الفريق الفائز</Badge>}
        </div>

        <p className="text-3xl font-bold tabular-nums">
          {team.score.toLocaleString("en-US")}
          <span className="mr-2 text-sm font-normal text-muted-foreground">
            نقطة
          </span>
        </p>

        <div className="grid grid-cols-2 gap-3 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">المشاركون</p>
            <p className="mt-1 font-semibold">{team.participants}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">إجابات صحيحة</p>
            <p className="mt-1 font-semibold">{team.correctAnswers}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main dir="rtl" className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Button variant="ghost" asChild className="-mr-3 gap-2">
            <Link href="/teacher/group-challenges">
              <ArrowRight className="h-4 w-4" />
              العودة للتحديات
            </Link>
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{challenge.title}</h1>
              <Badge variant="secondary">
                {challenge.status === "FINISHED"
                  ? "منتهي"
                  : challenge.status === "LIVE"
                    ? "جاري"
                    : challenge.status === "WAITING"
                      ? "في الانتظار"
                      : "ملغي"}
              </Badge>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {challenge.course.title}
            </p>
          </div>
        </div>

        <div className="rounded-lg border px-4 py-3">
          <p className="text-xs text-muted-foreground">كود التحدي</p>
          <p dir="ltr" className="mt-1 text-lg font-bold tracking-widest">
            {challenge.code}
          </p>
        </div>
      </div>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">المشاركون</p>
              <p className="text-2xl font-bold">{summary.totalParticipants}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الأسئلة</p>
              <p className="text-2xl font-bold">{summary.totalQuestions}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">إجابات صحيحة</p>
              <p className="text-2xl font-bold">
                {summary.totalCorrectAnswers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">معدل الإجابات الصحيحة</p>
              <p className="text-2xl font-bold">{accuracy}%</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Winner */}
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-7 text-center">
          <Trophy className="h-10 w-10 text-primary" />

          <p className="text-sm text-muted-foreground">نتيجة المنافسة</p>

          <h2 className="text-2xl font-bold">{winningTeamName}</h2>

          <p className="text-sm text-muted-foreground">
            {teams.winningTeam === "DRAW"
              ? "الفريقان حققا نفس عدد النقاط."
              : "حقق أعلى مجموع من النقاط في التحدي."}
          </p>
        </CardContent>
      </Card>

      {/* Teams */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold">نتائج الفريقين</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {teamCard(
            "الفريق A",
            teams.teamA,
            teams.winningTeam === "TEAM_A",
          )}

          {teamCard(
            "الفريق B",
            teams.teamB,
            teams.winningTeam === "TEAM_B",
          )}
        </div>
      </section>

      {/* Details */}
      <Tabs defaultValue="leaderboard" dir="rtl" className="space-y-5">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">ترتيب الطلاب</TabsTrigger>
          <TabsTrigger value="questions">تحليل الأسئلة</TabsTrigger>
          <TabsTrigger value="answers">إجابات الطلاب</TabsTrigger>
        </TabsList>

        {/* Leaderboard */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Medal className="h-5 w-5" />
                ترتيب المشاركين
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {leaderboard.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold">
                      {student.rank}
                    </div>

                    <div>
                      <p className="font-semibold">
                        {student.student.name ?? "طالب"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.team === "TEAM_A" ? "الفريق A" : "الفريق B"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">صحيح</p>
                      <p className="font-semibold text-green-600">
                        {student.correctAnswers}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">خطأ</p>
                      <p className="font-semibold text-destructive">
                        {student.wrongAnswers}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">النقاط</p>
                      <p className="font-bold">{student.score}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">متوسط الوقت</p>
                      <p className="font-semibold">
                        {(student.averageResponseTime / 1000).toFixed(1)} ث
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {leaderboard.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  لا يوجد مشاركون.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Question Statistics */}
        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                تحليل أداء الأسئلة
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {questionStatistics.map((question) => {
                  const correctPercentage =
                    question.totalAnswers > 0
                      ? (question.correctCount / question.totalAnswers) * 100
                      : 0;

                  return (
                    <AccordionItem key={question.id} value={question.id}>
                      <AccordionTrigger>
                        <div className="flex flex-1 items-center justify-between gap-4 pl-3 text-right">
                          <span className="line-clamp-2 text-sm font-medium">
                            السؤال {question.order}: {question.question}
                          </span>

                          <Badge variant="secondary">
                            {question.correctCount} صحيح
                          </Badge>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="space-y-5">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>نسبة الإجابات الصحيحة</span>
                            <span className="font-semibold">
                              {Math.round(correctPercentage)}%
                            </span>
                          </div>

                          <Progress value={correctPercentage} />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-lg bg-muted p-3">
                            <p className="text-xs text-muted-foreground">صحيح</p>
                            <p className="mt-1 font-bold text-green-600">
                              {question.correctCount}
                            </p>
                          </div>

                          <div className="rounded-lg bg-muted p-3">
                            <p className="text-xs text-muted-foreground">خطأ</p>
                            <p className="mt-1 font-bold text-destructive">
                              {question.wrongCount}
                            </p>
                          </div>

                          <div className="rounded-lg bg-muted p-3">
                            <p className="text-xs text-muted-foreground">بدون إجابة</p>
                            <p className="mt-1 font-bold">
                              {question.unansweredCount}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border p-3">
                            <p className="mb-2 text-sm font-semibold">الفريق A</p>
                            <p className="text-sm text-muted-foreground">
                              صحيح: {question.teamA.correct}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              خطأ: {question.teamA.wrong}
                            </p>
                          </div>

                          <div className="rounded-lg border p-3">
                            <p className="mb-2 text-sm font-semibold">الفريق B</p>
                            <p className="text-sm text-muted-foreground">
                              صحيح: {question.teamB.correct}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              خطأ: {question.teamB.wrong}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Answers */}
        <TabsContent value="answers">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تفاصيل إجابات الطلاب</CardTitle>
            </CardHeader>

            <CardContent>
              <Accordion type="multiple" className="w-full">
                {leaderboard.map((student) => (
                  <AccordionItem key={student.id} value={student.id}>
                    <AccordionTrigger>
                      <div className="flex flex-1 items-center justify-between gap-3 pl-3 text-right">
                        <span className="font-semibold">
                          {student.student.name ?? "طالب"}
                        </span>

                        <Badge variant="secondary">
                          {student.score} نقطة
                        </Badge>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="space-y-3">
                      {student.answers.map((answer, index) => (
                        <div
                          key={answer.id}
                          className="space-y-2 rounded-lg border p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium">
                              {index + 1}. {answer.question.question}
                            </p>

                            {answer.isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            إجابة الطالب:{" "}
                            <span className="font-medium text-foreground">
                              {answer.answer}
                            </span>
                          </p>

                          <p className="text-sm text-muted-foreground">
                            الإجابة الصحيحة:{" "}
                            <span className="font-medium text-foreground">
                              {answer.question.answer ?? "غير محددة"}
                            </span>
                          </p>

                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {(answer.responseTime / 1000).toFixed(1)} ثانية
                          </p>
                        </div>
                      ))}

                      {student.answers.length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          لم يرسل الطالب أي إجابات.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dates */}
      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">وقت بدء التحدي</p>
            <p className="mt-1 text-sm font-medium">
              {formatDuration(challenge.startedAt)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">وقت انتهاء التحدي</p>
            <p className="mt-1 text-sm font-medium">
              {formatDuration(challenge.finishedAt)}
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}