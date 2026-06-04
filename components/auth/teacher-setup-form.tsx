"use client";

import { useState, useTransition } from "react";

import { Loader2, Lock } from "lucide-react";

import { toast } from "sonner";

import { completeTeacherRegistration } from "@/actions/auth/complete-teacher-registration";

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

interface Props {
  token: string;
  name: string;
  email: string;
}

export default function SetupTeacherForm({
  token,
  name,
  email,
}: Props) {
  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    isPending,
    startTransition,
  ] = useTransition();

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    startTransition(
      async () => {
        const result =
          await completeTeacherRegistration(
            {
              token,
              password,
              confirmPassword,
            },
          );

        if (!result.success) {
          toast.error(
            result.message,
          );

          return;
        }

        toast.success(
          "تم إنشاء الحساب بنجاح",
        );

        window.location.href =
          "/auth/login";
      },
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          إكمال إنشاء الحساب
        </CardTitle>

        <CardDescription>
          قم بتحديد كلمة المرور
          الخاصة بك.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >
          <div>
            <Label>
              الاسم
            </Label>

            <Input
              value={name}
              disabled
            />
          </div>

          <div>
            <Label>
              البريد الإلكتروني
            </Label>

            <Input
              value={email}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label>
              كلمة المرور
            </Label>

            <div className="relative">
              <Lock
                className="
                  absolute
                  right-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-muted-foreground
                "
              />

              <Input
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value,
                  )
                }
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              تأكيد كلمة المرور
            </Label>

            <Input
              type="password"
              placeholder="أدخل كلمة المرور مرة أخرى"
              value={
                confirmPassword
              }
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value,
                )
              }
            />
          </div>

          <Button
            className="w-full"
            disabled={
              isPending
            }
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
      </CardContent>
    </Card>
  );
}