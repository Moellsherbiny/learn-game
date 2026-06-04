"use client";

import { useTransition } from "react";

import {
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import {
  nextBattleQuestionAction,
} from "@/actions/teacher/nextQuestion";

import {
  Button,
} from "@/components/ui/button";

interface Props {
  battleId: string;
}

export default function NextQuestionButton({
  battleId,
}: Props) {
  const [
    isPending,
    startTransition,
  ] = useTransition();

  function handleNext() {
    startTransition(
      async () => {
        try {
          await nextBattleQuestionAction(
            battleId,
          );

          toast.success(
            "تم الانتقال للسؤال التالي",
          );
        } catch {
          toast.error(
            "حدث خطأ",
          );
        }
      },
    );
  }

  return (
    <Button
      onClick={
        handleNext
      }
      disabled={
        isPending
      }
      className="rounded-2xl"
    >

      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ArrowLeft className="mr-2 h-4 w-4" />
      )}

      السؤال التالي
    </Button>
  );
}