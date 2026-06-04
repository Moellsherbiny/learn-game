"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  Play,
  Radio,
} from "lucide-react";

import {
  ref,
  onValue,
} from "firebase/database";

import {
  toast,
} from "sonner";

import {
  startBattleAction,
} from "@/actions/teacher/startBattle";

import {
  realtimeDb,
} from "@/lib/firebase";

import {
  Button,
} from "@/components/ui/button";

interface Props {
  battleId: string;

  status:
    | "WAITING"
    | "LIVE"
    | "FINISHED";

  participants: {
    studentId: string;

    team:
      | "TEAM_A"
      | "TEAM_B";
  }[];
}

export default function StartBattleButton({
  battleId,
  status,
  participants,
}: Props) {
  // =========================================
  // ROUTER
  // =========================================

  const router =
    useRouter();

  // =========================================
  // STATE
  // =========================================

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    readyMap,
    setReadyMap,
  ] = useState<
    Record<
      string,
      boolean
    >
  >({});

  // =========================================
  // FIREBASE READY
  // =========================================

  useEffect(() => {
    const readyRef =
      ref(
        realtimeDb,
        `battles/${battleId}/ready`,
      );

    const unsubscribe =
      onValue(
        readyRef,
        (
          snapshot,
        ) => {
          setReadyMap(
            snapshot.val() ||
              {},
          );
        },
      );

    return () =>
      unsubscribe();
  }, [battleId]);

  // =========================================
  // READY COUNTS
  // =========================================

  const teamAReady =
    useMemo(
      () =>
        participants.filter(
          (
            participant,
          ) =>
            participant.team ===
              "TEAM_A" &&
            readyMap[
              participant
                .studentId
            ],
        ).length,
      [
        participants,
        readyMap,
      ],
    );

  const teamBReady =
    useMemo(
      () =>
        participants.filter(
          (
            participant,
          ) =>
            participant.team ===
              "TEAM_B" &&
            readyMap[
              participant
                .studentId
            ],
        ).length,
      [
        participants,
        readyMap,
      ],
    );

  // =========================================
  // CAN START
  // =========================================

  const canStart =
    teamAReady >= 1 &&
    teamBReady >= 1;

  // =========================================
  // START
  // =========================================

  async function handleStart() {
    startTransition(
      async () => {
        try {
          await startBattleAction(
            battleId,
          );

          toast.success(
            "تم بدء التحدي 🔥",
          );

          router.refresh();
        } catch (
          error
        ) {
          toast.error(
            error instanceof
              Error
              ? error.message
              : "حدث خطأ",
          );
        }
      },
    );
  }

  // =========================================
  // LIVE MODE
  // =========================================

  if (
    status === "LIVE"
  ) {
    return (
      <Button
        asChild
        size="lg"
        className="rounded-2xl"
      >

        <Link
          href={`/teacher/battles/${battleId}/live`}
          prefetch={false}
        >

          <Radio className="mr-2 h-5 w-5" />

          مشاهدة التفاعل المباشر
        </Link>
      </Button>
    );
  }

  // =========================================
  // FINISHED
  // =========================================

  if (
    status ===
    "FINISHED"
  ) {
    return (
      <Button
        asChild
        size="lg"
        variant="secondary"
        className="rounded-2xl"
      >

        <Link
          href={`/teacher/battles/${battleId}/results`}
          prefetch={false}
        >

          <Radio className="mr-2 h-5 w-5" />

          عرض النتائج
        </Link>
      </Button>
    );
  }

  // =========================================
  // WAITING
  // =========================================

  return (
    <Button
      size="lg"
      className="rounded-2xl"
      onClick={
        handleStart
      }
      disabled={
        isPending ||
        !canStart
      }
    >

      <Play className="mr-2 h-5 w-5" />

      {isPending
        ? "جاري البدء..."
        : !canStart
          ? "بانتظار جاهزية الفريقين"
          : "بدء التحدي"}
    </Button>
  );
}