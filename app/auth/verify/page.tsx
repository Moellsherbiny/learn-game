"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { verifyResetOTP } from "@/actions/auth/verify-reset-otp";
import { sendResetCode } from "@/actions/auth/send-reset-code";
import { ShieldCheck, Mail, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  /* ── countdown timer ── */
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  /* ── auto-submit when 6 digits entered ── */
  useEffect(() => {
    if (otp.length === 6) handleSubmit(otp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleSubmit = (value: string) => {
    if (value.length !== 6) return;

    setError(null);

    startTransition(async () => {
      const result = await verifyResetOTP(email, value);

      if (!result.success) {
        setError(result.message);
        setOtp("");
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      }, 1000);
    });
  };

  const handleResend = () => {
    setError(null);
    setCanResend(false);
    setCountdown(60);

    startResendTransition(async () => {
      const result = await sendResetCode(email);

      if (!result.success) {
        setError(result.message);
      }
    });
  };

  return (
    <main className="flex items-center justify-center">
      <Card className="w-full max-w-md overflow-hidden rounded-3xl border-border/50 bg-card/90 shadow-2xl backdrop-blur-xl">
        {/* back link */}
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-3 h-3" />
          العودة
        </Link>

        {/* icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary to-accent blur-md opacity-60" />
            <div className="relative rounded-2xl bg-linear-to-br from-primary to-accent p-3 text-white shadow-lg">
              {success ? (
                <ShieldCheck className="h-6 w-6" />
              ) : (
                <Mail className="h-6 w-6" />
              )}
            </div>
          </div>
        </div>

        {/* heading */}
        <CardHeader className="space-y-3 pt-8 text-center">
          <CardTitle className="text-2xl font-black tracking-tight">
            "التحقق من البريد الإلكتروني"
          </CardTitle>
          <CardDescription className="text-sm leading-7 text-muted-foreground">
            أدخل رمز التحقق المكون من 6 أرقام الذي تم إرساله إلى
            <span className="text-primary font-semibold"> {email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          {/* OTP input */}
          <div
            className={cn(
              "flex justify-center mb-6 transition-all duration-300",
              success && "opacity-0 scale-95",
            )}
          >
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isPending || success}
              className="gap-2"
            >
              <InputOTPGroup className="gap-2" dir="ltr">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className={cn(
                      "w-12 h-14 text-xl font-bold rounded-xl border",
                      "bg-background border-border text-primary",
                      "focus:border-primary focus:bg-primary/5 focus:ring-0",
                      "transition-all duration-200",
                      error && "border-red-500/60 bg-red-500/10",
                      success &&
                        "border-primary bg-emerald-500/10 text-primary",
                    )}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* success state */}
          {success && (
            <div className="text-center mb-6 animate-fade-in">
              <p className="text-primary font-semibold text-sm">
                "تم التحقق من الرمز بنجاح..."
              </p>
            </div>
          )}

          {/* error */}
          {error && (
            <p className="text-center text-sm text-red-400 mb-4 animate-fade-in">
              {error}
            </p>
          )}

          {/* verify button */}
          <Button
            onClick={() => handleSubmit(otp)}
            disabled={otp.length !== 6 || isPending || success}
            className={cn(
              "w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200",
              "bg-linear-to-r from-primary to-accent",
              "hover:opacity-90",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "shadow-lg",
            )}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                التحقق...
              </span>
            ) : (
              "التحقق"
            )}
          </Button>

          {/* resend */}
          <div className="mt-5 text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw
                  className={cn("w-3.5 h-3.5", isResending && "animate-spin")}
                />
                إعادة الإرسال
              </button>
            ) : (
              <p className="text-sm text-primary/30">
                إعادة الإرسال بعد{" "}
                <span className="text-primary/60 tabular-nums font-medium">
                  0:{countdown.toString().padStart(2, "0")}
                </span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
