"use client";

import { useMemo, useState, useTransition } from "react";

import { Check, Loader2, Play, Users, Wifi, WifiOff } from "lucide-react";

import { useBattleRealtime } from "@/hooks/use-battle-realtime";

import { Button } from "@/components/ui/button";
import { startBattleAction } from "@/actions/teacher/battle-controle";

// =========================================================
// TYPES
// =========================================================

interface Invitation {
  id: string;

  team: "TEAM_A" | "TEAM_B";

  status: "PENDING" | "ACCEPTED" | "DECLINED";

  student: {
    id: string;
    name: string | null;
    image: string | null;
    level: unknown;
  };
}

interface Participant {
  id: string;
  score: number;
  isReady: boolean;

  student: {
    id: string;
    name: string | null;
    image: string | null;
    level: unknown;
  };
}

interface RealtimePlayer {
  connected?: boolean;
  ready?: boolean;
}

interface Props {
  battleId: string;
  invitations: Invitation[];
  participants: Participant[];
  initialStatus: "WAITING" | "LIVE" | "FINISHED";
}

// =========================================================
// COMPONENT
// =========================================================

export function TeacherBattleRealtime({
  battleId,
  invitations,
  participants,
  initialStatus,
}: Props) {
  const { state, loading, error } = useBattleRealtime(battleId);

  const [isStarting, startTransition] = useTransition();

  const [actionError, setActionError] = useState<string | null>(null);
  // =======================================================
  // PARTICIPANT MAP
  // =======================================================

  const participantMap = useMemo(
    () =>
      new Map(
        participants.map((participant) => [
          participant.student.id,
          participant,
        ]),
      ),
    [participants],
  );

  // =======================================================
  // TEAMS
  // =======================================================

  const teamAInvitations = invitations.filter(
    (invitation) => invitation.team === "TEAM_A",
  );

  const teamBInvitations = invitations.filter(
    (invitation) => invitation.team === "TEAM_B",
  );

  // =======================================================
  // REALTIME PLAYERS
  // =======================================================

  const realtimePlayers = state?.players ?? {};

  // =======================================================
  // PLAYER STATE
  // =======================================================

  function getPlayerState(studentId: string) {
    const realtimePlayer = realtimePlayers[studentId];

    const participant = participantMap.get(studentId);

    return {
      ready: realtimePlayer?.ready ?? participant?.isReady ?? false,

      connected: realtimePlayer?.connected ?? false,

      participant,
    };
  }

  // =======================================================
  // LOBBY STATS
  // =======================================================

  const totalPlayers = invitations.length;

  const connectedPlayers = invitations.filter(
    (invitation) => getPlayerState(invitation.student.id).connected,
  ).length;

  const readyPlayers = invitations.filter(
    (invitation) => getPlayerState(invitation.student.id).ready,
  ).length;

  // =======================================================
  // START CONDITION
  // =======================================================

  /*
   * الاتصال ليس شرطًا لبدء المباراة.
   *
   * الشرط الحقيقي:
   *
   * 1. الغرفة WAITING
   * 2. يوجد لاعبين
   * 3. جميع اللاعبين READY
   */

  const canStart =
    (state?.status ?? initialStatus) === "WAITING" &&
    totalPlayers > 0 &&
    readyPlayers === totalPlayers;

  const handleStartBattle = () => {
    if (!canStart || isStarting) {
      return;
    }

    setActionError(null);

    startTransition(async () => {
      const result = await startBattleAction(battleId);

      if (!result.success) {
        setActionError(result.error);

        return;
      }
    });
  };
  // =======================================================
  // UI
  // =======================================================

  return (
    <section className="space-y-6">
      {/* ================================================= */}
      {/* REALTIME ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          <WifiOff className="h-4 w-4" />
          تعذر الاتصال المباشر بالغرفة
        </div>
      )}

      {/* ================================================= */}
      {/* LOBBY STATS */}
      {/* ================================================= */}

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-4">
        <LobbyStat label="المدعوون" value={totalPlayers} />

        <LobbyStat label="داخل الغرفة" value={connectedPlayers} live />

        <LobbyStat label="جاهزون" value={readyPlayers} />

        <LobbyStat
          label="الحالة"
          value={
            loading
              ? "..."
              : state?.status === "LIVE"
                ? "مباشر"
                : state?.status === "FINISHED"
                  ? "منتهي"
                  : "انتظار"
          }
        />
      </div>

      {/* ================================================= */}
      {/* TEAMS */}
      {/* ================================================= */}

      <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_72px_1fr]">
        {/* ================================================= */}
        {/* TEAM A */}
        {/* ================================================= */}

        <BattleTeamCard
          title="الفريق الأول"
          code="A"
          type="A"
          invitations={teamAInvitations}
          participants={participants}
          realtimePlayers={realtimePlayers}
        />

        {/* ================================================= */}
        {/* VS */}
        {/* ================================================= */}

        <div className="hidden items-center justify-center lg:flex">
          <div className="relative flex h-full items-center justify-center">
            <div className="absolute inset-y-0 w-px bg-border" />

            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border bg-background text-[10px] font-black tracking-[0.2em]">
              VS
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* TEAM B */}
        {/* ================================================= */}

        <BattleTeamCard
          title="الفريق الثاني"
          code="B"
          type="B"
          invitations={teamBInvitations}
          participants={participants}
          realtimePlayers={realtimePlayers}
        />
      </div>

      {/* ================================================= */}
      {/* READY STATUS */}
      {/* ================================================= */}

      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-3">
          <span
            className={[
              "h-2.5 w-2.5 rounded-full",
              canStart ? "bg-emerald-500" : "bg-amber-400",
            ].join(" ")}
          />

          <div>
            <p className="text-sm font-bold">
              {canStart ? "الفريقان جاهزان" : "بانتظار اللاعبين"}
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {canStart
                ? "يمكن للمدرس بدء التحدي الآن"
                : `${readyPlayers} من ${totalPlayers} لاعبين جاهزون`}
            </p>
          </div>
        </div>

        {state && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Wifi className="h-3.5 w-3.5 text-emerald-500" />
            تحديث مباشر
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* START BATTLE */}
      {/* ================================================= */}

      {(state?.status ?? initialStatus) === "WAITING" && (
        <div className="rounded-2xl border bg-background p-4 my-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "h-2 w-2 shrink-0 rounded-full",
                    canStart ? "bg-emerald-500" : "bg-amber-500",
                  ].join(" ")}
                />

                <p className="text-sm font-bold">
                  {totalPlayers === 0
                    ? "الغرفة في انتظار اللاعبين"
                    : canStart
                      ? "التحدي جاهز للبدء"
                      : "الغرفة في انتظار جاهزية اللاعبين"}
                </p>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {totalPlayers === 0
                  ? "أضف الطلاب وانتظر انضمامهم إلى التحدي"
                  : canStart
                    ? "جميع اللاعبين جاهزون ويمكنك بدء المنافسة"
                    : `${readyPlayers} من ${totalPlayers} لاعبين جاهزون`}
              </p>
            </div>

            <Button
              type="button"
              size="lg"
              disabled={!canStart || isStarting}
              onClick={handleStartBattle}
              className="w-full shrink-0 rounded-xl px-6 sm:w-auto"
            >
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري بدء التحدي...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  بدء التحدي
                </>
              )}
            </Button>
          </div>

          {actionError && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              {actionError}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// =========================================================
// LOBBY STAT
// =========================================================

function LobbyStat({
  label,
  value,
  live = false,
}: {
  label: string;
  value: string | number;
  live?: boolean;
}) {
  return (
    <div className="bg-background px-5 py-4">
      <div className="flex items-center gap-2">
        {live && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        )}

        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      </div>

      <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
    </div>
  );
}

// =========================================================
// TEAM CARD
// =========================================================

function BattleTeamCard({
  title,
  code,
  type,
  invitations,
  participants,
  realtimePlayers,
}: {
  title: string;
  code: string;
  type: "A" | "B";

  invitations: Invitation[];

  participants: Participant[];

  realtimePlayers: Record<string, RealtimePlayer>;
}) {
  const isTeamA = type === "A";

  // =======================================================
  // PARTICIPANT MAP
  // =======================================================

  const participantMap = useMemo(
    () =>
      new Map(
        participants.map((participant) => [
          participant.student.id,
          participant,
        ]),
      ),
    [participants],
  );

  // =======================================================
  // JOINED COUNT
  // =======================================================

  const joinedCount = invitations.filter(
    (item) => item.status === "ACCEPTED",
  ).length;

  // =======================================================
  // READY COUNT
  // =======================================================

  const readyCount = invitations.filter((invitation) => {
    const realtimePlayer = realtimePlayers[invitation.student.id];

    const participant = participantMap.get(invitation.student.id);

    return realtimePlayer?.ready ?? participant?.isReady ?? false;
  }).length;

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="relative">
      {/* ================================================= */}
      {/* TEAM HEADER */}
      {/* ================================================= */}

      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span
              className={[
                "text-[11px] font-black uppercase tracking-[0.18em]",
                isTeamA ? "text-blue-600" : "text-rose-600",
              ].join(" ")}
            >
              TEAM {code}
            </span>

            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />

            <span className="text-[11px] text-muted-foreground">
              {joinedCount}/{invitations.length}
            </span>
          </div>

          <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        </div>

        {/* READY COUNT */}

        <div className="text-left">
          <div className="flex items-baseline gap-1">
            <span
              className={[
                "text-3xl font-black tracking-tighter",
                isTeamA ? "text-blue-600" : "text-rose-600",
              ].join(" ")}
            >
              {readyCount}
            </span>

            <span className="text-sm text-muted-foreground">
              /{joinedCount}
            </span>
          </div>

          <p className="text-[10px] font-medium text-muted-foreground">جاهز</p>
        </div>
      </div>

      {/* ================================================= */}
      {/* PLAYERS */}
      {/* ================================================= */}

      <div className="overflow-hidden rounded-[22px] border bg-background">
        {invitations.map((invitation, index) => {
          const participant = participantMap.get(invitation.student.id);

          const accepted = invitation.status === "ACCEPTED";

          const declined = invitation.status === "DECLINED";

          const realtimePlayer = realtimePlayers[invitation.student.id];

          const ready = realtimePlayer?.ready ?? participant?.isReady ?? false;

          const connected = realtimePlayer?.connected ?? false;

          return (
            <div
              key={invitation.id}
              className={[
                "group relative flex items-center gap-4 px-4 py-4",
                index !== invitations.length - 1 ? "border-b" : "",
                "transition-colors hover:bg-muted/30",
              ].join(" ")}
            >
              {/* NUMBER */}

              <span className="w-5 text-[10px] font-bold text-muted-foreground/40">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* AVATAR */}

              <div className="relative shrink-0">
                <div className="h-11 w-11 overflow-hidden rounded-full bg-muted">
                  {invitation.student.image ? (
                    <img
                      src={invitation.student.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold">
                      {invitation.student.name?.charAt(0) ?? "؟"}
                    </div>
                  )}
                </div>

                {/* ONLINE STATUS */}

                <span
                  className={[
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",

                    connected
                      ? ready
                        ? "bg-emerald-500"
                        : "bg-amber-400"
                      : accepted
                        ? "bg-zinc-300"
                        : declined
                          ? "bg-red-500"
                          : "bg-zinc-300",
                  ].join(" ")}
                />
              </div>

              {/* NAME */}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {invitation.student.name ?? "طالب"}
                </p>

                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {ready
                    ? "مستعد للمواجهة"
                    : connected
                      ? "داخل الغرفة"
                      : accepted
                        ? "انضم إلى الفريق"
                        : declined
                          ? "رفض الدعوة"
                          : "بانتظار الانضمام"}
                </p>
              </div>

              {/* SCORE */}

              {participant && (
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-black tabular-nums">
                    {participant.score}
                  </p>

                  <p className="text-[9px] text-muted-foreground">نقطة</p>
                </div>
              )}

              {/* STATE */}

              <div className="min-w-18 text-left">
                {ready ? (
                  <span className="text-[11px] font-bold text-emerald-600">
                    جاهز
                  </span>
                ) : accepted ? (
                  <span className="text-[11px] font-medium text-amber-600">
                    ينتظر
                  </span>
                ) : declined ? (
                  <span className="text-[11px] font-medium text-red-500">
                    مرفوض
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    دعوة
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {invitations.length === 0 && (
          <div className="flex min-h-55 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-5 w-5 text-muted-foreground/50" />
              </div>

              <p className="text-sm font-semibold">لا يوجد لاعبين</p>

              <p className="mt-1 text-xs text-muted-foreground">
                أضف لاعبين إلى هذا الفريق
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* TEAM FOOTER */}
      {/* ================================================= */}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {invitations.map((invitation) => {
              const participant = participantMap.get(invitation.student.id);

              const realtimePlayer = realtimePlayers[invitation.student.id];

              const ready =
                realtimePlayer?.ready ?? participant?.isReady ?? false;

              return (
                <span
                  key={invitation.id}
                  className={[
                    "h-1.5 w-5 rounded-full",

                    ready
                      ? "bg-emerald-500"
                      : invitation.status === "ACCEPTED"
                        ? "bg-amber-400"
                        : "bg-muted",
                  ].join(" ")}
                />
              );
            })}
          </div>

          <span className="text-[10px] text-muted-foreground">حالة الفريق</span>
        </div>

        <span className="text-[10px] font-medium text-muted-foreground">
          {readyCount === joinedCount && joinedCount > 0
            ? "مستعد للمواجهة"
            : "جاري التجهيز"}
        </span>
      </div>
    </div>
  );
}
