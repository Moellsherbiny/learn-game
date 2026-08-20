"use client";

import {
  useRef,
  useState,
  useTransition,
} from "react";

import {
  Loader2,
  SendHorizontal,
} from "lucide-react";

import { sendMessage } from "@/actions/messages/send-message";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";

interface MessageInputProps {
  conversationId: string;
}

export default function MessageInput({
  conversationId,
}: MessageInputProps) {
  const [content, setContent] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (
    event?: React.FormEvent,
  ) => {
    event?.preventDefault();

    const text = content.trim();

    if (!text || isPending) {
      return;
    }

    startTransition(async () => {
      const result =
        await sendMessage(
          conversationId,
          text,
        );

      if (!result.success) {
        toast.error(
          result.message ??
            "تعذر إرسال الرسالة.",
        );

        return;
      }

      setContent("");

      textareaRef.current?.focus();
    });
  };

  return (
    <div className="shrink-0 border-t bg-background p-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl items-end gap-2"
      >
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(event) =>
            setContent(
              event.target.value,
            )
          }
          placeholder="اكتب رسالتك..."
          disabled={isPending}
          rows={1}
          className="min-h-11 max-h-32 resize-none"
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();
              handleSubmit();
            }
          }}
        />

        <Button
          type="submit"
          size="icon"
          className="h-11 w-11 shrink-0"
          disabled={
            isPending ||
            !content.trim()
          }
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </form>

      <p className="mx-auto mt-1 max-w-3xl text-[11px] text-muted-foreground">
        Enter للإرسال · Shift + Enter لسطر جديد
      </p>
    </div>
  );
}