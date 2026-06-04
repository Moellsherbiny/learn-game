
"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import {
  Flag,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import {
  endBattleAction,
} from "@/actions/teacher/endBattle";

import {
  Button,
} from "@/components/ui/button";

interface Props {
  battleId: string;
}

export default function EndBattleButton({
  battleId,
}: Props) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  // =========================================
  // END BATTLE
  // =========================================

  async function handleEndBattle() {
    const confirmed =
      confirm(
        "هل أنت متأكد من إنهاء التحدي؟",
      );

    if (!confirmed) {
      return;
    }

    startTransition(
      async () => {
        try {
          await endBattleAction(
            battleId,
          );

          toast.success(
            "تم إنهاء التحدي 🏁",
          );

          router.push(
            `/teacher/battles/${battleId}/results`,
          );

          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "حدث خطأ",
          );
        }
      },
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <Button
      size="lg"
      variant="destructive"
      className="rounded-2xl"
      onClick={
        handleEndBattle
      }
      disabled={
        isPending
      }
    >

      {isPending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />

          جاري الإنهاء...
        </>
      ) : (
        <>
          <Flag className="mr-2 h-5 w-5" />

          إنهاء التحدي
        </>
      )}
    </Button>
  );
}