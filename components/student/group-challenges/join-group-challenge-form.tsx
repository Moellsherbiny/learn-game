"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Users, Gamepad2 } from "lucide-react";
import { toast } from "sonner";

import { joinGroupChallengeAction } from "@/actions/student/group-challenge";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function JoinGroupChallengeForm() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleJoin = () => {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      toast.error("من فضلك أدخل كود التحدي.");
      return;
    }

    if (normalizedCode.length !== 8) {
      toast.error("كود التحدي يجب أن يتكون من 8 أحرف.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await joinGroupChallengeAction(normalizedCode);

        toast.success(result.message);

        router.push(
          `/student/group-challenges/${result.challenge.id}`
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء الانضمام للتحدي."
        );
      }
    });
  };

  return (
    <div dir="rtl" className="space-y-6">
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        رجوع
      </Button>

      <Card className="border shadow-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Gamepad2 className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl">
              انضم إلى تحدي جماعي
            </CardTitle>

            <CardDescription className="text-sm leading-6">
              أدخل كود التحدي الذي حصلت عليه من المدرس
              للانضمام إلى المنافسة مع زملائك.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="challenge-code"
              className="text-sm font-medium"
            >
              كود التحدي
            </label>

            <Input
              id="challenge-code"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.toUpperCase().slice(0, 8))
              }
              placeholder="XXXXXXXX"
              maxLength={8}
              disabled={isPending}
              className="h-14 text-center text-xl font-bold tracking-[0.35em] uppercase"
              dir="ltr"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleJoin();
                }
              }}
            />

            <p className="text-xs text-muted-foreground">
              الكود يتكون من 8 أحرف.
            </p>
          </div>

          <Button
            className="h-12 w-full gap-2"
            onClick={handleJoin}
            disabled={isPending || code.trim().length !== 8}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الانضمام...
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                انضم إلى التحدي
              </>
            )}
          </Button>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              قبل الانضمام
            </p>
            <p className="mt-1 leading-6">
              تأكد أنك مسجل في الكورس المرتبط بالتحدي،
              وأن الكود صحيح ولم يبدأ التحدي بعد.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}