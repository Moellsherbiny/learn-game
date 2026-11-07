"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Gamepad2,
  Users,
  BookOpen,
  Clock,
  Trophy,
  Plus,
  ArrowLeft,
  Bell,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import type { getMyGroupChallengesAction } from "@/actions/student/group-challenge";

import {
  getMyChallengeInvitationsAction,
  acceptChallengeInvitationAction,
  declineChallengeInvitationAction,
} from "@/actions/student/group-challenge-invitations";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

type Challenges = Awaited<ReturnType<typeof getMyGroupChallengesAction>>;

type Invitations = Awaited<ReturnType<typeof getMyChallengeInvitationsAction>>;

const statusLabels = {
  WAITING: "في انتظار البداية",
  LIVE: "جاري الآن",
  FINISHED: "انتهى",
  CANCELLED: "تم الإلغاء",
};

export function StudentGroupChallenges({
  challenges,
}: {
  challenges: Challenges;
}) {
  const router = useRouter();

  const [filter, setFilter] = useState("ALL");

  const [invitations, setInvitations] = useState<Invitations>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load student invitations
  useEffect(() => {
    let isMounted = true;

    async function fetchInvitations() {
      try {
        const result = await getMyChallengeInvitationsAction();

        if (isMounted) {
          setInvitations(result);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error instanceof Error ? error.message : "تعذر تحميل الدعوات.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingInvitations(false);
        }
      }
    }

    void fetchInvitations();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshInvitations() {
    const result = await getMyChallengeInvitationsAction();
    setInvitations(result);
  }

  async function handleAccept(invitationId: string) {
    try {
      setProcessingId(invitationId);

      const result = await acceptChallengeInvitationAction(invitationId);

      toast.success(result.message || "تم قبول الدعوة بنجاح.");

      await refreshInvitations();

      // Refresh server-provided challenges
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر قبول الدعوة.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDecline(invitationId: string) {
    try {
      setProcessingId(invitationId);

      const result = await declineChallengeInvitationAction(invitationId);

      toast.success(result.message || "تم رفض الدعوة.");

      await refreshInvitations();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر رفض الدعوة.");
    } finally {
      setProcessingId(null);
    }
  }

  const pendingInvitations = useMemo(
    () => invitations.filter((item) => item.status === "PENDING"),
    [invitations],
  );

  const filteredChallenges = challenges.filter((item) => {
    return filter === "ALL" || item.challenge.status === filter;
  });

  const activeChallenges = challenges.filter(
    (item) => item.challenge.status === "LIVE",
  ).length;

  const totalScore = challenges.reduce((sum, item) => sum + item.score, 0);

  return (
    <main dir="rtl" className="container mx-auto space-y-8 px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">التحديات الجماعية</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            تابع تحدياتك ونافس زملاءك لتحقيق أفضل النتائج.
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link href="/student/group-challenges/join">
            <Plus className="h-4 w-4" />
            الانضمام إلى تحدي
          </Link>
        </Button>
      </div>

      {/* Invitations Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />

            <h2 className="text-lg font-bold">دعوات التحديات</h2>

            {pendingInvitations.length > 0 && (
              <Badge variant="default">{pendingInvitations.length} جديدة</Badge>
            )}
          </div>
        </div>

        {isLoadingInvitations ? (
          <Card>
            <CardContent className="flex min-h-28 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : pendingInvitations.length === 0 ? (
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bell className="size-5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm font-medium">لا توجد دعوات جديدة</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  ستظهر هنا دعوات المدرسين للمشاركة في التحديات.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingInvitations.map((invitation) => {
              const challenge = invitation.challenge;
              const isProcessing = processingId === invitation.id;

              return (
                <Card
                  key={invitation.id}
                  className="border-primary/20 transition-shadow hover:shadow-md"
                >
                  <CardContent className="space-y-4 p-5">
                    {/* Challenge Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Gamepad2 className="size-6 text-primary" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-semibold">{challenge.title}</h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {challenge.course.title}
                          </p>
                        </div>
                      </div>

                      <Badge variant="secondary">دعوة جديدة</Badge>
                    </div>

                    {/* Teacher Information */}
                    <div className="flex items-center gap-2">
                      {challenge.teacher.image ? (
                        <Image
                          src={challenge.teacher.image}
                          alt={challenge.teacher.name ?? "المدرس"}
                          width={100}
                          height={100}
                          className="size-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                          <Users className="size-4 text-muted-foreground" />
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-muted-foreground">
                          تمت دعوتك بواسطة
                        </p>
                        <p className="text-sm font-medium">
                          {challenge.teacher.name || "المدرس"}
                        </p>
                      </div>
                    </div>

                    {/* Challenge Details */}
                    <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/40 p-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          المشاركون
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                          <Users className="size-4" />
                          {challenge._count.participants}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">الأسئلة</p>
                        <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                          <BookOpen className="size-4" />
                          {challenge._count.questions}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          وقت السؤال
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                          <Clock className="size-4" />
                          {challenge.questionTimeSeconds} ثانية
                        </p>
                      </div>
                    </div>

                    {/* Invitation Date */}
                    <p className="text-xs text-muted-foreground">
                      تاريخ الدعوة:{" "}
                      {new Date(invitation.invitedAt).toLocaleDateString(
                        "ar-EG",
                      )}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 border-t pt-4">
                      <Button
                        type="button"
                        className="flex-1 gap-2"
                        onClick={() => handleAccept(invitation.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                        قبول الدعوة
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleDecline(invitation.id)}
                        disabled={isProcessing}
                      >
                        <X className="size-4" />
                        رفض
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Gamepad2 className="h-8 w-8 text-primary" />

            <div>
              <p className="text-sm text-muted-foreground">إجمالي التحديات</p>

              <p className="text-2xl font-bold">{challenges.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Clock className="h-8 w-8 text-primary" />

            <div>
              <p className="text-sm text-muted-foreground">تحديات نشطة</p>

              <p className="text-2xl font-bold">{activeChallenges}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Trophy className="h-8 w-8 text-primary" />

            <div>
              <p className="text-sm text-muted-foreground">إجمالي النقاط</p>

              <p className="text-2xl font-bold">{totalScore}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challenge Filters */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold">تحدياتي</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            التحديات التي انضممت إليها بالفعل.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { value: "ALL", label: "الكل" },
            { value: "WAITING", label: "في الانتظار" },
            { value: "LIVE", label: "جارية" },
            { value: "FINISHED", label: "منتهية" },
          ].map((item) => (
            <Button
              key={item.value}
              size="sm"
              variant={filter === item.value ? "default" : "outline"}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {filteredChallenges.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <Gamepad2 className="h-12 w-12 text-muted-foreground" />

              <h2 className="font-semibold">لا توجد تحديات حتى الآن</h2>

              <p className="text-sm text-muted-foreground">
                اقبل دعوة من المدرس أو انضم إلى تحدٍ باستخدام الكود.
              </p>

              <Button asChild className="mt-2">
                <Link href="/student/group-challenges/join">
                  الانضمام إلى تحدي
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredChallenges.map((item) => {
              const challenge = item.challenge;

              return (
                <Card
                  key={item.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="space-y-5 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold">{challenge.title}</h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {challenge.course.title}
                        </p>
                      </div>

                      <Badge variant="secondary">
                        {statusLabels[challenge.status]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">فريقك</p>

                        <p className="mt-1 text-sm font-semibold">
                          {item.team === "TEAM_A" ? "الفريق A" : "الفريق B"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          المشاركون
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                          <Users className="h-4 w-4" />
                          {challenge._count.participants}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">نقاطك</p>

                        <p className="mt-1 text-sm font-semibold">
                          {item.score}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        {challenge._count.questions} أسئلة
                      </div>

                      <Button asChild size="sm" className="gap-2">
                        <Link
                          href={`/student/group-challenges/${challenge.id}`}
                        >
                          فتح التحدي
                          <ArrowLeft className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
