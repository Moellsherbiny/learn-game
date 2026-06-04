"use client";

import React, {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  signIn,
} from "next-auth/react";

import {
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";

import {
  register,
} from "@/actions/auth/register";

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

export default function TeacherRegisterPage() {
  // =========================================
  // ROUTER
  // =========================================

  const router =
    useRouter();

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
  >(null);

  // =========================================
  // SUBMIT
  // =========================================

  async function handleRegister(
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

    const name =
      formData.get(
        "name",
      ) as string;

    const email =
      formData.get(
        "email",
      ) as string;

    const password =
      formData.get(
        "password",
      ) as string;

    try {
      await register({
        name,
        email,
        password,
        role:
          "TEACHER",
      });

      await signIn(
        "credentials",
        {
          email,
          password,
          redirect: false,
        },
      );

      router.push(
        "/teacher",
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof
          Error
          ? error.message
          : "حدث خطأ أثناء إنشاء الحساب",
      );
    } finally {
      setIsLoading(
        false,
      );
    }
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

            <GraduationCap className="h-6 w-6 text-primary" />
          </div>

          <div>

            <CardTitle
              className="
                text-3xl
                font-black
                tracking-tight
              "
            >

              حساب مدرس
            </CardTitle>

            <CardDescription
              className="
                mt-2
                text-base
                leading-7
              "
            >

              أنشئ الدورات التعليمية
              ونظم التحديات التفاعلية
              لطلابك
            </CardDescription>
          </div>
        </CardHeader>

        {/* CONTENT */}

        <CardContent className="space-y-6">

          {/* FORM */}

          <form
            onSubmit={
              handleRegister
            }
            className="space-y-5"
          >

            {/* NAME */}

            <div className="space-y-2">

              <Label
                htmlFor="name"
                className="font-medium"
              >

                الاسم الكامل
              </Label>

              <div className="relative">

                <User
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
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="أحمد محمد"
                  className="
                    h-11
                    rounded-xl
                    pr-11
                    shadow-none
                    focus-visible:ring-1
                  "
                />
              </div>
            </div>

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
                  placeholder="teacher@example.com"
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

              <Label
                htmlFor="password"
                className="font-medium"
              >

                كلمة المرور
              </Label>

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

                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء الحساب"
              )}
            </Button>
          </form>

          {/* LOGIN */}

          <p
            className="
              text-center
              text-sm
              text-muted-foreground
            "
          >

            لديك حساب بالفعل؟{" "}

            <Link
              href="/auth/login"
              className="
                font-semibold
                text-foreground
                hover:underline
              "
            >

              تسجيل الدخول
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}