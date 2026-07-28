"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  KeyRound,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { toast } from "sonner";

import { resetPassword } from "@/actions/auth/reset-password";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email) {
      toast.error("الرابط غير صالح.");
      return;
    }

    if (password.length < 8) {
      toast.error(
        "يجب أن تكون كلمة المرور 8 أحرف على الأقل."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين.");
      return;
    }

    try {
      setIsLoading(true);

      const result = await resetPassword(
        email,
        password
      );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setIsSuccess(true);

      toast.success(result.message);

      setTimeout(() => {
        router.replace("/auth/login");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="rounded-3xl border-border/50 shadow-2xl">
        <CardContent className="py-12 text-center">

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold">
            تم تغيير كلمة المرور
          </h2>

          <p className="mt-4 text-muted-foreground leading-7">
            تم تحديث كلمة المرور بنجاح.
            سيتم تحويلك إلى صفحة تسجيل الدخول.
          </p>

          <Button
            asChild
            className="mt-8 w-full rounded-xl"
          >
            <Link href="/auth/login">
              <ArrowRight className="ml-2 h-4 w-4" />
              تسجيل الدخول
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-border/50 shadow-2xl">
      <CardHeader className="text-center">

        <div className="flex justify-center mb-4">
          <div className="rounded-2xl bg-linear-to-br from-primary to-accent p-3 text-white">
            <KeyRound className="h-6 w-6" />
          </div>
        </div>

        <CardTitle className="text-2xl font-bold">
          إنشاء كلمة مرور جديدة
        </CardTitle>

        <CardDescription className="leading-7">
          أدخل كلمة المرور الجديدة لحسابك.
        </CardDescription>
      </CardHeader>

      <CardContent>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label>كلمة المرور الجديدة</Label>

            <div className="relative">
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                type="password"
                className="pr-10 rounded-xl"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>تأكيد كلمة المرور</Label>

            <div className="relative">
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                type="password"
                className="pr-10 rounded-xl"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-linear-to-r from-primary to-accent text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                جاري تحديث كلمة المرور...
              </>
            ) : (
              "تغيير كلمة المرور"
            )}
          </Button>

          <div className="pt-2 text-center text-sm text-muted-foreground">
            <Link
              href="/auth/login"
              className="font-semibold text-primary hover:underline"
            >
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}