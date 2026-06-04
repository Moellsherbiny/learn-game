"use client";

import React, { useState, useTransition } from "react";

import Link from "next/link";

import {
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
  Phone,
  School,
} from "lucide-react";

import { toast } from "sonner";

import { registerStudent } from "@/actions/auth/register-student";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

// =========================================
// PAGE
// =========================================

export default function RegisterPage() {
  // =========================================
  // STATES
  // =========================================
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [password, setPassword] = useState("");

  // =========================================
  // SUBMIT
  // =========================================

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const result = await registerStudent({
          name,
          email,
          phone,
          school,
          password,
        });

        if (!result.success) {
          toast.error(
            Object.values(result.errors || {})
              .flat()
              .join("\n"),
          );

          router.push("/auth/login");
        }

        toast.success("تم إنشاء الحساب بنجاح");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "حدث خطأ");
      }
    });
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
            <Sparkles className="h-6 w-6 text-primary" />
          </div>

          <div>
            <CardTitle
              className="
                text-3xl
                font-black
                tracking-tight
              "
            >
              إنشاء حساب
            </CardTitle>

            <CardDescription
              className="
                mt-2
                text-base
                leading-7
              "
            >
              ابدأ رحلتك التعليمية داخل المنصة
            </CardDescription>
          </div>
        </CardHeader>

        {/* CONTENT */}

        <CardContent className="space-y-6">
          {/* FORM */}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAME */}

            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">
                الاسم
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
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
              <Label htmlFor="email" className="font-medium">
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
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
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

            {/* PHONE */}

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-medium">
                رقم الهاتف
              </Label>

              <div className="relative">
                <Phone
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
                  id="phone"
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
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
            {/* SCHOOL */}

            <div className="space-y-2">
              <Label htmlFor="school" className="font-medium">
                اسم المدرسة
              </Label>

              <div className="relative">
                <School
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
                  id="school"
                  type="text"
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="مدرسة دمياط الثانوية"
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
            {/* PASSWORD */}

            <div className="space-y-2">
              <Label htmlFor="password" className="font-medium">
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* SUBMIT */}

            <Button
              type="submit"
              disabled={isPending}
              className="
                h-11
                w-full
                rounded-xl
                font-semibold
              "
            >
              {isPending ? (
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
