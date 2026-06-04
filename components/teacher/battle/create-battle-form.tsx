// components/teacher/battle/create-battle-room-form.tsx

"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import {
  Loader2,
  Swords,
} from "lucide-react";

import {
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";

import { toast } from "sonner";

import {
  createBattleRoomAction,
} from "@/actions/teacher/battle";

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

// =========================================
// SCHEMA
// =========================================

const schema = z.object({
  title: z
    .string()
    .min(
      3,
      "اسم التحدي قصير جدًا",
    )
    .max(
      100,
      "اسم التحدي طويل جدًا",
    ),
});

type FormValues = z.infer<
  typeof schema
>;

// =========================================
// COMPONENT
// =========================================

export default function CreateBattleRoomForm() {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  // =========================================
  // FORM
  // =========================================

  const {
    register,

    handleSubmit,

    reset,

    formState: {
      errors,
    },
  } = useForm<FormValues>({
    resolver:
      zodResolver(schema),

    defaultValues: {
      title: "",
    },
  });

  // =========================================
  // SUBMIT
  // =========================================

  async function onSubmit(
    values: FormValues,
  ) {
    startTransition(
      async () => {
        try {
          const room =
            await createBattleRoomAction(
              {
                title:
                  values.title,
              },
            );

          toast.success(
            "تم إنشاء التحدي بنجاح 🔥",
          );

          reset();

          router.push(
            `/teacher/battles/${room.id}`,
          );
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء إنشاء التحدي",
          );
        }
      },
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <Card className="rounded-[2rem] border-border/50 shadow-2xl">

      <CardHeader className="space-y-5 text-center">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 text-primary shadow-inner">

          <Swords className="h-12 w-12" />
        </div>

        <div>

          <CardTitle className="text-4xl font-black tracking-tight">

            إنشاء تحدي جديد
          </CardTitle>

          <CardDescription className="mt-3 text-base">

            قم بإنشاء غرفة معركة تعليمية مباشرة
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>

        <form
          onSubmit={handleSubmit(
            onSubmit,
          )}
          className="space-y-8"
        >

          {/* ========================================= */}
          {/* TITLE */}
          {/* ========================================= */}

          <div className="space-y-3">

            <Label
              htmlFor="title"
              className="text-base font-bold"
            >
              اسم التحدي
            </Label>

            <Input
              id="title"
              placeholder="مثال: تحدي البايثون 🔥"
              className="h-14 rounded-2xl text-lg"
              {...register(
                "title",
              )}
            />

            {errors.title && (
              <p className="text-sm font-medium text-destructive">

                {
                  errors.title
                    .message
                }
              </p>
            )}
          </div>

          {/* ========================================= */}
          {/* SUBMIT */}
          {/* ========================================= */}

          <Button
            type="submit"
            size="lg"
            disabled={
              isPending
            }
            className="h-14 w-full rounded-2xl text-lg font-bold"
          >

            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />

                جاري إنشاء الغرفة...
              </>
            ) : (
              <>
                <Swords className="mr-2 h-5 w-5" />

                إنشاء التحدي
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}