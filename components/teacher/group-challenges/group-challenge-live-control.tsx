
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  FileQuestion,
  Loader2,
  Play,
  RefreshCw,
  Trophy,
  Users,
  Swords,
} from "lucide-react";
import { toast } from "sonner";
import { GROUP_CHALLENGE_QUESTION_DURATION_SECONDS } from "@/lib/group-challenge-constants";
import {
  getGroupChallengeControlStateAction,
  startGroupChallengeAction,
} from "@/actions/teacher/group-challenge-control";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// ============================================
// Types
// ============================================

type LiveControlData = Awaited<
  ReturnType<typeof getGroupChallengeControlStateAction>
>;

type Props = {
  challengeId: string;
  initialData: LiveControlData;
};

// ============================================
// Helpers
// ============================================

function formatDate(date: Date | string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getRemainingSeconds(startedAt: Date | string | null) {
  if (!startedAt) return GROUP_CHALLENGE_QUESTION_DURATION_SECONDS;

  const elapsed = Math.floor(
    (Date.now() - new Date(startedAt).getTime()) / 1000,
  );

  return Math.max(
    0,
    GROUP_CHALLENGE_QUESTION_DURATION_SECONDS - elapsed,
  );
}

// ============================================
// Main Component
// ============================================

export function GroupChallengeLiveControl({
  challengeId,
  initialData,
}: Props) {
  const [data, setData] = useState(initialData);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const requestInProgress = useRef(false);
  const mounted = useRef(false);

  // ============================================
  // Polling
  // ============================================

  const refresh = useCallback(
    async (showIndicator = false) => {
      if (requestInProgress.current) return;

      requestInProgress.current = true;

      if (showIndicator && mounted.current) {
        setIsRefreshing(true);
      }

      try {
        const result =
          await getGroupChallengeControlStateAction(challengeId);

        if (mounted.current) {
          setData(result);
        }
      } catch (error) {
        if (mounted.current) {
          toast.error(
            error instanceof Error
              ? error.message
              : "تعذر تحديث بيانات التحدي.",
          );
        }
      } finally {
        requestInProgress.current = false;

        if (mounted.current) {
          setIsRefreshing(false);
        }
      }
    },
    [challengeId],
  );

  useEffect(() => {
    mounted.current = true;

    const initialRequest = setTimeout(() => {
      void refresh();
    }, 0);

    const interval = setInterval(() => {
      void refresh();
    }, 2000);

    return () => {
      mounted.current = false;
      clearTimeout(initialRequest);
      clearInterval(interval);
    };
  }, [refresh]);

  // ============================================
  // Derived Data
  // ============================================

  const challenge = data;

  const teamA = useMemo(
    () =>
      challenge.participants.filter(
        (participant) => participant.team === "TEAM_A",
      ),
    [challenge.participants],
  );

  const teamB = useMemo(
    () =>
      challenge.participants.filter(
        (participant) => participant.team === "TEAM_B",
      ),
    [challenge.participants],
  );

  const allReady =
    challenge.participants.length > 0 &&
    challenge.statistics.readyCount ===
      challenge.statistics.totalParticipants;

  const currentQuestion = challenge.currentQuestion;

  const remainingSeconds = currentQuestion
    ? getRemainingSeconds(challenge.currentQuestionStartedAt)
    : 0;

  // ============================================
  // Actions
  // ============================================

  async function handleStartChallenge() {
    if (!allReady) {
      toast.error("يجب أن يكون جميع الطلاب جاهزين أولاً.");
      return;
    }

    setActionLoading(true);

    try {
      await startGroupChallengeAction(challengeId);

      toast.success("تم بدء التحدي بنجاح.");

      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "تعذر بدء التحدي.",
      );

      await refresh();
    } finally {
      setActionLoading(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(challenge.code);
      toast.success("تم نسخ كود الانضمام.");
    } catch {
      toast.error("تعذر نسخ الكود.");
    }
  }

  // ============================================
  // Finished State
  // ============================================

  if (challenge.status === "FINISHED") {
    return (
      <div dir="rtl" className="mx-auto max-w-3xl py-10">
        <Card>
          <CardContent className="space-y-6 p-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy className="size-9" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                انتهى التحدي!
              </h1>

              <p className="text-sm text-muted-foreground">
                تم إنهاء التحدي بنجاح. يمكنك الآن مراجعة النتائج النهائية.
              </p>
            </div>

            <div className="rounded-lg border p-4 text-sm">
              <p className="font-semibold">{challenge.title}</p>

              <p className="mt-1 text-muted-foreground">
                تاريخ الانتهاء: {formatDate(challenge.finishedAt)}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1 gap-2">
                <Link
                  href={`/teacher/group-challenges/${challengeId}/results`}
                >
                  <Trophy className="size-4" />
                  عرض النتائج
                </Link>
              </Button>

              <Button asChild variant="outline" className="flex-1">
                <Link href="/teacher/group-challenges">
                  العودة للتحديات
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // Main Layout
  // ============================================

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/teacher/group-challenges"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="size-4" />
            العودة للتحديات
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Swords className="size-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {challenge.title}
              </h1>

              <p className="text-sm text-muted-foreground">
                {challenge.course.title}
              </p>
            </div>

            <ChallengeStatusBadge status={challenge.status} />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => void refresh(true)}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          تحديث البيانات
        </Button>
      </div>

      {/* Challenge Code */}

      <Card>
        <CardContent className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                كود الانضمام
              </p>

              <p className="text-xs text-muted-foreground">
                شارك الكود مع الطلاب للانضمام إلى التحدي.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              dir="ltr"
              className="rounded-lg border bg-muted/40 px-5 py-2 font-mono text-xl font-bold tracking-[0.2em]"
            >
              {challenge.code}
            </span>

            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={copyCode}
              aria-label="نسخ الكود"
            >
              <Copy className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الطلاب"
          value={challenge.statistics.totalParticipants}
          icon={Users}
        />

        <StatCard
          title="الطلاب الجاهزون"
          value={challenge.statistics.readyCount}
          icon={CheckCircle2}
        />

        <StatCard
          title="عدد الأسئلة"
          value={challenge.questions.length}
          icon={FileQuestion}
        />

        <StatCard
          title="السؤال الحالي"
          value={
            challenge.status === "LIVE"
              ? challenge.currentQuestionIndex + 1
              : 0
          }
          icon={Activity}
        />
      </div>

      {/* ================================= */}
      {/* WAITING ROOM */}
      {/* ================================= */}

      {challenge.status === "WAITING" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">
                    غرفة الانتظار
                  </CardTitle>

                  <CardDescription>
                    تابع انضمام الطلاب واستعدادهم قبل بدء التحدي.
                  </CardDescription>
                </div>

                <Badge variant="secondary" className="gap-1.5">
                  <Clock3 className="size-3" />
                  في انتظار البدء
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  جاهزية المشاركين
                </span>

                <span className="font-semibold tabular-nums">
                  {challenge.statistics.readyCount} /{" "}
                  {challenge.statistics.totalParticipants}
                </span>
              </div>

              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={challenge.statistics.readyCount}
                aria-valuemin={0}
                aria-valuemax={challenge.statistics.totalParticipants}
              >
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${
                      challenge.statistics.totalParticipants > 0
                        ? (challenge.statistics.readyCount /
                            challenge.statistics.totalParticipants) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              {allReady ? (
                <p className="text-sm text-green-600">
                  جميع الطلاب جاهزون. يمكنك بدء التحدي الآن.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  في انتظار استعداد جميع الطلاب.
                </p>
              )}
            </CardContent>
          </Card>

          <TeamParticipants teamA={teamA} teamB={teamB} />

          <div className="flex flex-col gap-3 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">
                هل أنت جاهز لبدء التحدي؟
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                لن يبدأ التحدي إلا بعد استعداد جميع الطلاب.
              </p>
            </div>

            <Button
              onClick={handleStartChallenge}
              disabled={
                actionLoading ||
                !allReady ||
                challenge.questions.length === 0
              }
              className="gap-2"
            >
              {actionLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Play className="size-4" />
              )}

              بدء التحدي
            </Button>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* LIVE GAME */}
      {/* ================================= */}

      {challenge.status === "LIVE" && (
        <div className="space-y-6">
          {/* Team Scoreboard */}

          <div className="grid gap-4 md:grid-cols-2">
            <TeamScoreCard
              title="الفريق A"
              count={challenge.statistics.teamA.count}
              score={challenge.statistics.teamA.score}
              color="blue"
            />

            <TeamScoreCard
              title="الفريق B"
              count={challenge.statistics.teamB.count}
              score={challenge.statistics.teamB.score}
              color="emerald"
            />
          </div>

          {/* Current Question */}

          {currentQuestion ? (
            <Card className="overflow-hidden border-primary/20 shadow-sm">
              <div className="h-1.5 bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${
                      GROUP_CHALLENGE_QUESTION_DURATION_SECONDS > 0
                        ? (remainingSeconds /
                            GROUP_CHALLENGE_QUESTION_DURATION_SECONDS) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <CardHeader className="border-b bg-muted/20 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <Badge className="w-fit">
                      السؤال {currentQuestion.order} من{" "}
                      {challenge.questions.length}
                    </Badge>

                    <CardTitle className="text-xl">
                      السؤال الحالي
                    </CardTitle>

                    <p className="text-sm text-muted-foreground">
                      تابع إجابات الطلاب وانتظر الانتقال التلقائي للسؤال التالي.
                    </p>
                  </div>

                  <div
                    className={`flex min-w-28 flex-col items-center rounded-xl border p-3 ${
                      remainingSeconds <= 10
                        ? "border-destructive/30 bg-destructive/5 text-destructive"
                        : "border-primary/20 bg-primary/5 text-primary"
                    }`}
                  >
                    <Clock3 className="mb-1 size-5" />

                    <span className="text-3xl font-bold tabular-nums">
                      {remainingSeconds}
                    </span>

                    <span className="text-xs">
                      ثانية متبقية
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 p-5 sm:p-6">
                <div className="rounded-xl border bg-background p-6 sm:p-8">
                  <p className="text-lg font-semibold leading-9 sm:text-xl">
                    {currentQuestion.question}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="size-5" />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        إجابات الطلاب
                      </p>

                      <p className="text-lg font-bold tabular-nums">
                        {currentQuestion._count.answers}

                        <span className="text-sm font-normal text-muted-foreground">
                          {" "}
                          / {challenge.statistics.totalParticipants}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock3 className="size-5" />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        الوقت المحدد
                      </p>

                      <p className="text-lg font-bold">
                        {GROUP_CHALLENGE_QUESTION_DURATION_SECONDS} ثانية
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 border-t pt-5 text-sm text-muted-foreground">
                  <RefreshCw className="size-4 animate-spin" />

                  <span>
                    ينتقل التحدي تلقائيًا بعد انتهاء الوقت المحدد للسؤال
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 p-8 text-center">
                <FileQuestion className="size-9 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                  لم يتم العثور على السؤال الحالي.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Participants */}

          <TeamParticipants teamA={teamA} teamB={teamB} showScores />
        </div>
      )}
    </div>
  );
}

// ============================================
// Status Badge
// ============================================

function ChallengeStatusBadge({ status }: { status: string }) {
  const config = {
    WAITING: {
      label: "في الانتظار",
      variant: "secondary" as const,
    },
    LIVE: {
      label: "جاري الآن",
      variant: "default" as const,
    },
    FINISHED: {
      label: "منتهي",
      variant: "outline" as const,
    },
    CANCELLED: {
      label: "ملغي",
      variant: "destructive" as const,
    },
  }[status] ?? {
    label: status,
    variant: "outline" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// ============================================
// Stat Card
// ============================================

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tabular-nums">
            {value.toLocaleString("ar-EG")}
          </p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Team Score Card
// ============================================

function TeamScoreCard({
  title,
  count,
  score,
  color,
}: {
  title: string;
  count: number;
  score: number;
  color: "blue" | "emerald";
}) {
  const styles =
    color === "blue"
      ? {
          card: "border-blue-500/20 bg-blue-500/[0.03]",
          icon: "bg-blue-500/10 text-blue-600",
          dot: "bg-blue-500",
        }
      : {
          card: "border-emerald-500/20 bg-emerald-500/[0.03]",
          icon: "bg-emerald-500/10 text-emerald-600",
          dot: "bg-emerald-500",
        };

  return (
    <Card className={styles.card}>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${styles.dot}`} />
            <p className="font-semibold">{title}</p>
          </div>

          <p className="text-sm text-muted-foreground">
            {count.toLocaleString("ar-EG")} طالب
          </p>

          <div>
            <p className="text-3xl font-bold tabular-nums">
              {score.toLocaleString("ar-EG")}
            </p>

            <p className="text-xs text-muted-foreground">
              إجمالي النقاط
            </p>
          </div>
        </div>

        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Trophy className="size-6" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Team Participants
// ============================================

type Participant = LiveControlData["participants"][number];

function TeamParticipants({
  teamA,
  teamB,
  showScores = false,
}: {
  teamA: Participant[];
  teamB: Participant[];
  showScores?: boolean;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <TeamParticipantsCard
        title="الفريق A"
        participants={teamA}
        showScores={showScores}
        color="blue"
      />

      <TeamParticipantsCard
        title="الفريق B"
        participants={teamB}
        showScores={showScores}
        color="emerald"
      />
    </div>
  );
}

function TeamParticipantsCard({
  title,
  participants,
  showScores,
  color,
}: {
  title: string;
  participants: Participant[];
  showScores: boolean;
  color: "blue" | "emerald";
}) {
  const teamColor =
    color === "blue"
      ? {
          icon: "bg-blue-500/10 text-blue-600",
          avatar: "bg-blue-500/10 text-blue-600",
          border: "border-blue-500/20",
        }
      : {
          icon: "bg-emerald-500/10 text-emerald-600",
          avatar: "bg-emerald-500/10 text-emerald-600",
          border: "border-emerald-500/20",
        };

  const readyCount = participants.filter(
    (participant) => participant.isReady,
  ).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-xl ${teamColor.icon}`}
            >
              <Users className="size-5" />
            </div>

            <div>
              <CardTitle className="text-base">
                {title}
              </CardTitle>

              <CardDescription>
                {participants.length.toLocaleString("ar-EG")} طالب
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="tabular-nums">
            {readyCount} / {participants.length} جاهز
          </Badge>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${
                participants.length
                  ? (readyCount / participants.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {participants.length > 0 ? (
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${teamColor.avatar}`}
                  >
                    {participant.student.name?.charAt(0) || "؟"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {participant.student.name || "طالب"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {participant.student.level}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {showScores && (
                    <span className="text-sm font-bold tabular-nums">
                      {participant.score.toLocaleString("ar-EG")} نقطة
                    </span>
                  )}

                  {participant.isReady ? (
                    <Badge className="gap-1 bg-green-600 hover:bg-green-600">
                      <Check className="size-3" />
                      جاهز
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock3 className="size-3" />
                      منتظر
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-center">
            <Users className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              لا يوجد طلاب في هذا الفريق حتى الآن.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
