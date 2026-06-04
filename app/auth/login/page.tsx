"use client";

import React, {
  useState,
} from "react";

import Link from "next/link";

import {
  useSearchParams,
} from "next/navigation";

import {
  signIn,
} from "next-auth/react";

import {
  Loader2,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

export default function LoginPage() {
  // =========================================
  // SEARCH PARAMS
  // =========================================

  const searchParams =
    useSearchParams();

  const callbackUrl =
    searchParams.get(
      "callbackUrl",
    ) || "/student";

  const authError =
    searchParams.get(
      "error",
    );

  // =========================================
  // STATES
  // =========================================

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(
    authError
      ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      : null,
  );

  // =========================================
  // LOGIN
  // =========================================

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setIsLoading(
      true,
    );

    setError(null);

    const formData =
      new FormData(
        e.currentTarget,
      );

    const email =
      formData.get(
        "email",
      ) as string;

    const password =
      formData.get(
        "password",
      ) as string;

    const result =
      await signIn(
        "credentials",
        {
          email,
          password,
          redirect: false,
          callbackUrl,
        },
      );

    setIsLoading(
      false,
    );

    if (
      result?.error
    ) {
      setError(
        "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      );

      return;
    }

    window.location.href =
      result?.url ||
      callbackUrl;
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="mx-auto w-full max-w-md">

      <Card
        className="
          rounded-[2rem]
          border-border/60
          bg-card
          shadow-sm
        "
      >

        {/* HEADER */}

        <CardHeader className="space-y-3 text-center">

          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              bg-muted
            "
          >

            <LogIn className="h-6 w-6 text-primary" />
          </div>

          <div>

            <CardTitle
              className="
                text-3xl
                font-black
                tracking-tight
              "
            >

              تسجيل الدخول
            </CardTitle>

            <CardDescription
              className="
                mt-2
                text-base
                leading-7
              "
            >

              أكمل رحلتك التعليمية
              وواصل التقدم داخل المنصة
            </CardDescription>
          </div>
        </CardHeader>

        {/* CONTENT */}

        <CardContent className="space-y-6">

          {/* FORM */}

          <form
            onSubmit={
              handleLogin
            }
            className="space-y-5"
          >

            {/* EMAIL */}

            <div className="space-y-2">

              <Label
                htmlFor="email"
                className="font-medium"
              >

                البريد الإلكتروني
              </Label>

              <div className="relative">

                <Mail
                  className="
                    absolute
                    right-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  dir="ltr"
                  placeholder="name@example.com"
                  className="
                    h-11
                    rounded-xl
                    pr-11
                    text-left
                    shadow-none
                    focus-visible:ring-1
                  "
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="space-y-2">

              <div className="flex items-center justify-between">

                <Label
                  htmlFor="password"
                  className="font-medium"
                >

                  كلمة المرور
                </Label>

                <Link
                  href="/auth/forgot-password"
                  className="
                    text-xs
                    font-medium
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  نسيت كلمة المرور؟
                </Link>
              </div>

              <div className="relative">

                <Lock
                  className="
                    absolute
                    right-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  dir="ltr"
                  placeholder="••••••••"
                  className="
                    h-11
                    rounded-xl
                    pr-11
                    text-left
                    shadow-none
                    focus-visible:ring-1
                  "
                />
              </div>
            </div>

            {/* ERROR */}

            {error && (

              <div
                className="
                  rounded-xl
                  border
                  border-destructive/20
                  bg-destructive/10
                  px-4
                  py-3
                  text-sm
                  text-destructive
                "
              >

                {error}
              </div>
            )}

            {/* SUBMIT */}

            <Button
              type="submit"
              disabled={
                isLoading
              }
              className="
                h-11
                w-full
                rounded-xl
                font-semibold
              "
            >

              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />

                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>

          {/* REGISTER */}

          <p
            className="
              text-center
              text-sm
              text-muted-foreground
            "
          >

            ليس لديك حساب؟{" "}

            <Link
              href="/auth/register"
              className="
                font-semibold
                text-foreground
                hover:underline
              "
            >

              إنشاء حساب
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}