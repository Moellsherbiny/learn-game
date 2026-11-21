"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Users,
  XCircle,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

import {
  getStudentGroupChallengeAction,
  setGroupChallengeReadyAction,
} from "@/actions/student/group-challenge";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type LobbyData = Awaited<
  ReturnType<typeof getStudentGroupChallengeAction>
>;

export function StudentGroupChallengeLobby({
  challengeId,
  initialData,
}: {
  challengeId: string;
  initialData: LobbyData;
}) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const { participant, challenge } = data;

useEffect(() => {
  let isActive = true;
  let isNavigating = false;
  let isChecking = false;

  const checkChallengeStatus = async () => {
    if (!isActive || isNavigating || isChecking) return;

    isChecking = true;

    try {
      const updated =
        await getStudentGroupChallengeAction(challengeId);

      if (!isActive) return;

      setData(updated);

      console.log(
        "[Student Lobby] Challenge status:",
        updated.challenge.status
      );

      if (updated.challenge.status === "LIVE") {
        isNavigating = true;

        router.replace(
          `/student/group-challenges/${challengeId}/live`
        );

        return;
      }

      if (updated.challenge.status === "FINISHED") {
        isNavigating = true;

        router.replace(
          `/student/group-challenges/${challengeId}/results`
        );
      }
    } catch (error) {
      console.error(
        "[Student Lobby] Failed to check challenge status:",
        error
      );
    } finally {
      isChecking = false;
    }
  };

  // Check immediately when the lobby mounts.
  checkChallengeStatus();

  // Continue checking every 2 seconds.
  const interval = setInterval(
    checkChallengeStatus,
    2000
  );

  return () => {
    isActive = false;
    clearInterval(interval);
  };
}, [challengeId, router]);

  const handleReady = () => {
    startTransition(async () => {
      try {
        const result = await setGroupChallengeReadyAction(
          challengeId,
          !participant.isReady
        );

        toast.success(result.message);

        const updated = await getStudentGroupChallengeAction(challengeId);
        setData(updated);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "حدث خطأ."
        );
      }
    });
  };

  const teamA = challenge.participants.filter(
    (item) => item.team === "TEAM_A"
  );

  const teamB = challenge.participants.filter(
    (item) => item.team === "TEAM_B"
  );

  const renderTeam = (
    title: string,
    members: typeof challenge.participants,
    isMyTeam: boolean
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {title}
          </span>
          <Badge variant="secondary">{members.length} لاعبين</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {members.length === 0 && (
          <p className="text-sm text-muted-foreground">
            لا يوجد مشاركون في هذا الفريق حتى الآن.
          </p>
        )}

        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted font-semibold">
                {member.student.name?.charAt(0) ?? "؟"}
              </div>

              <div>
                <p className="text-sm font-medium">
                  {member.student.name ?? "طالب"}
                  {member.student.id === participant.studentId && " (أنت)"}
                </p>
              </div>
            </div>

            {member.isReady ? (
              <Badge className="gap-1 bg-green-600">
                <CheckCircle2 className="h-3 w-3" />
                جاهز
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                ينتظر
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <main dir="rtl" className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <Badge variant="secondary">غرفة الانتظار</Badge>
        <h1 className="mt-3 text-2xl font-bold">{challenge.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {challenge.course.title}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Users className="h-8 w-8 text-primary" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">كود التحدي</h2>
            <p
              dir="ltr"
              className="mt-2 text-3xl font-bold tracking-[0.3em]"
            >
              {challenge.code}
            </p>
          </div>

          <Separator />

          <p className="text-sm text-muted-foreground">
            انتظر حتى يبدأ المدرس التحدي. تأكد من تحديد حالة استعدادك.
          </p>

          <Button
            onClick={handleReady}
            disabled={isPending}
            size="lg"
            className="w-full max-w-sm gap-2"
            variant={participant.isReady ? "outline" : "default"}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : participant.isReady ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}

            {participant.isReady ? "إلغاء الاستعداد" : "أنا جاهز"}
          </Button>

          <p className="text-xs text-muted-foreground">
            يتم تحديث حالة المشاركين تلقائيًا.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {renderTeam(
          "الفريق A",
          teamA,
          participant.team === "TEAM_A"
        )}

        {renderTeam(
          "الفريق B",
          teamB,
          participant.team === "TEAM_B"
        )}
      </div>
    </main>
  );
}