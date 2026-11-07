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
    const interval = setInterval(async () => {
      try {
        const updated = await getStudentGroupChallengeAction(challengeId);
        setData(updated);

        if (updated.challenge.status === "LIVE") {
          router.replace(
            `/student/group-challenges/${challengeId}/live`
          );
        }

        if (updated.challenge.status === "FINISHED") {
          router.replace(
            `/student/group-challenges/${challengeId}/results`
          );
        }
      } catch {
        // Keep the current lobby state if a refresh temporarily fails.
      }
    }, 3000);

    return () => clearInterval(interval);
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