"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Loader2,
  MessageCircle,
} from "lucide-react";

import { getOrCreateConversation } from "@/actions/messages/get-or-create-conversation";

import { Button } from "@/components/ui/button";

import { toast } from "sonner";

interface Props {
  teacherId: string;
}

export default function MessageTeacherButton({
  teacherId,
}: Props) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result =
        await getOrCreateConversation(
          teacherId,
        );

      if (!result.success || !result.data) {
        toast.error(
          result.message ??
            "تعذر فتح المحادثة.",
        );

        return;
      }

      router.push(
        `/messages/${result.data.id}`,
      );
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle className="ml-2 h-4 w-4" />
      )}

      مراسلة المدرس
    </Button>
  );
}