// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { sendResetCode } from "@/actions/auth/send-reset-code";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, ArrowRight, Loader2, ShieldCheck, KeyRound } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const result = await sendResetCode(email);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setIsSubmitted(true);

      // أو انقله مباشرة لصفحة إدخال الكود
      setTimeout(() => {
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (error) {
      console.error(error);

      toast.error("حدث خطأ أثناء إرسال رمز التحقق.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (isSubmitted) {
    return (
     <Card className="overflow-hidden rounded-3xl border-border/50 bg-card/90 shadow-2xl backdrop-blur-xl">
        <CardContent className="px-6 py-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-primary/10 to-accent/10">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl font-black tracking-tight">
            تم إرسال رمز التحقق
          </h1>

          <p className="mt-4 leading-8 text-muted-foreground">
            إذا كان البريد الإلكتروني
            <span className="mx-1 font-semibold text-foreground">{email}</span>
            مسجلًا لدينا، فستصلك رسالة تحتوي على رمز تحقق مكون من 6 أرقام صالح
            لمدة 10 دقائق.
          </p>

          <Button asChild className="mt-8 h-11 w-full rounded-xl">
            <Link href="/auth/login">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى تسجيل الدخول
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-border/50 bg-card/90 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-3 pt-8 text-center">
        {/* Icon */}
        <div className="mb-2 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary to-accent blur-md opacity-60" />
            <div className="relative rounded-2xl bg-linear-to-br from-primary to-accent p-3 text-white shadow-lg">
              <KeyRound className="h-6 w-6" />
            </div>
          </div>
        </div>

        <CardTitle className="text-2xl font-black tracking-tight">
          نسيت كلمة المرور؟
        </CardTitle>

        <CardDescription className="text-sm leading-7 text-muted-foreground">
          أدخل بريدك الإلكتروني وسنرسل إليك رمز تحقق لإعادة تعيين كلمة المرور.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>

            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                name="email"
                type="email"
                dir="ltr"
                placeholder="name@example.com"
                className="rounded-xl pr-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-linear-to-r from-primary to-accent font-bold text-white shadow-lg transition-all hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                جاري إرسال رمز التحقق...
              </>
            ) : (
              <>
                <Mail className="ml-2 h-5 w-5" />
                إرسال رمز التحقق
              </>
            )}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="pt-2 text-center text-sm text-muted-foreground">
          تذكرت كلمة المرور؟{" "}
          <Link
            href="/auth/login"
            className="font-bold text-primary hover:underline"
          >
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
