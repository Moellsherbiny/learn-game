"use client";

import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Clock,
  Medal,
  Trophy,
  XCircle,
} from "lucide-react";

import type { getStudentGroupChallengeResultsAction } from "@/actions/student/group-challenge";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ResultsData = Awaited<
  ReturnType<typeof getStudentGroupChallengeResultsAction>
>;

export function StudentGroupChallengeResults({
  data,
}: {
  data: ResultsData;
}) {
  const { challenge, participant, teams, questions } = data;

  const isWinner = teams.winner === participant.team;
  const isDraw = teams.winner === "DRAW";

  const teamLabel = (team: "TEAM_A" | "TEAM_B") =>
    team === "TEAM_A" ? "الفريق A" : "الفريق B";

  return (
    <main dir="rtl" className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="rounded-full bg-primary/10 p-5">
            {isDraw ? (
              <Award className="h-12 w-12 text-primary" />
            ) : (
              <Trophy className="h-12 w-12 text-primary" />
            )}
          </div>

          <div>
            <Badge variant="secondary">انتهى التحدي</Badge>

            <h1 className="mt-3 text-2xl font-bold">
              {isDraw
                ? "انتهى التحدي بالتعادل"
                : isWinner
                  ? "تهانينا! فريقك فاز"
                  : "انتهى التحدي"}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {challenge.title} · {challenge.courseTitle}
            </p>
          </div>

          <div className="mt-2">
            <p className="text-sm text-muted-foreground">مجموع نقاطك</p>
            <p className="text-4xl font-bold tabular-nums">
              {participant.score}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className={teams.winner === "TEAM_A" ? "border-primary" : ""}>
          <CardContent className="space-y-2 p-5 text-center">
            <p className="font-semibold">الفريق A</p>
            <p className="text-3xl font-bold tabular-nums">
              {teams.teamA.score}
            </p>
            <p className="text-xs text-muted-foreground">
              {teams.teamA.participants.length} مشاركين
            </p>
            {teams.winner === "TEAM_A" && (
              <Badge>الفريق الفائز</Badge>
            )}
          </CardContent>
        </Card>

        <Card className={teams.winner === "TEAM_B" ? "border-primary" : ""}>
          <CardContent className="space-y-2 p-5 text-center">
            <p className="font-semibold">الفريق B</p>
            <p className="text-3xl font-bold tabular-nums">
              {teams.teamB.score}
            </p>
            <p className="text-xs text-muted-foreground">
              {teams.teamB.participants.length} مشاركين
            </p>
            {teams.winner === "TEAM_B" && (
              <Badge>الفريق الفائز</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Medal className="h-5 w-5" />
            ترتيب المشاركين
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {[...teams.teamA.participants, ...teams.teamB.participants]
            .sort((a, b) => b.score - a.score)
            .map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {item.student.name ?? "طالب"}
                      {item.id === participant.id && " (أنت)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {teamLabel(item.team)}
                    </p>
                  </div>
                </div>

                <span className="font-bold tabular-nums">
                  {item.score} نقطة
                </span>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">مراجعة إجاباتك</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">الإجابات الصحيحة</p>
              <p className="mt-1 text-2xl font-bold">
                {data.correctAnswers}
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">إجمالي الأسئلة</p>
              <p className="mt-1 text-2xl font-bold">
                {data.totalQuestions}
              </p>
            </div>
          </div>

          <Separator />

          {questions.map((item, index) => (
            <div key={item.questionId} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium leading-7">
                  {index + 1}. {item.question}
                </p>

                {item.isCorrect ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <XCircle className="mt-1 h-5 w-5 shrink-0 text-destructive" />
                )}
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  إجابتك:{" "}
                  <span className="font-medium text-foreground">
                    {item.submittedAnswer ?? "لم تجب"}
                  </span>
                </p>

                <p className="text-muted-foreground">
                  الإجابة الصحيحة:{" "}
                  <span className="font-medium text-foreground">
                    {item.correctAnswer ?? "غير محددة"}
                  </span>
                </p>

                {item.responseTime !== null && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    زمن الإجابة: {(item.responseTime / 1000).toFixed(1)} ثانية
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/student/group-challenges">
            العودة إلى التحديات
          </Link>
        </Button>
      </div>
    </main>
  );
}