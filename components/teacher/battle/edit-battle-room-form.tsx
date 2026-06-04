// components/teacher/battle/edit-battle-room-form.tsx

"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import {
  Loader2,
  Save,
  Swords,
} from "lucide-react";

import {
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";

import { toast } from "sonner";

import {
  updateBattleRoomAction,
} from "@/actions/teacher/battle";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Badge,
} from "@/components/ui/badge";

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

interface EditBattleRoomFormProps {
  battle: {
    id: string;

    title: string;

    code: string;

    status: string;

    participants: unknown[];

    questions: unknown[];
  };
}

// =========================================
// COMPONENT
// =========================================

export default function EditBattleRoomForm({
  battle,
}: EditBattleRoomFormProps) {
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

    formState: {
      errors,
      isDirty,
    },
  } = useForm<FormValues>({
    resolver:
      zodResolver(schema),

    defaultValues: {
      title:
        battle.title,
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
          await updateBattleRoomAction(
            {
              roomId:
                battle.id,

              title:
                values.title,
            },
          );

          toast.success(
            "تم تحديث التحدي بنجاح ",
          );

          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء التحديث",
          );
        }
      },
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="space-y-8">

      {/* ========================================= */}
      {/* INFO CARDS */}
      {/* ========================================= */}

      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-3xl border bg-muted/20 p-5">

          <p className="text-sm text-muted-foreground">
            كود الغرفة
          </p>

          <h3 className="mt-2 text-2xl font-black tracking-widest text-primary">

            {battle.code}
          </h3>
        </div>

        <div className="rounded-3xl border bg-muted/20 p-5">

          <p className="text-sm text-muted-foreground">
            المشاركون
          </p>

          <h3 className="mt-2 text-2xl font-black">

            {
              battle
                .participants
                .length
            }
          </h3>
        </div>

        <div className="rounded-3xl border bg-muted/20 p-5">

          <p className="text-sm text-muted-foreground">
            الأسئلة
          </p>

          <h3 className="mt-2 text-2xl font-black">

            {
              battle.questions
                .length
            }
          </h3>
        </div>
      </div>

      {/* ========================================= */}
      {/* FORM */}
      {/* ========================================= */}

      <form
        onSubmit={handleSubmit(
          onSubmit,
        )}
        className="space-y-8"
      >

        {/* TITLE */}

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

        {/* STATUS */}

        <div className="space-y-3">

          <Label className="text-base font-bold">

            حالة التحدي
          </Label>

          <div>

            <Badge
              variant={
                battle.status ===
                "LIVE"
                  ? "default"
                  : battle.status ===
                    "WAITING"
                  ? "secondary"
                  : "outline"
              }
              className="rounded-xl px-4 py-2 text-sm"
            >
              {battle.status ===
              "LIVE"
                ? "🔥 مباشر الآن"
                : battle.status ===
                  "WAITING"
                ? "⏳ بانتظار البدء"
                : "🏁 انتهى"}
            </Badge>
          </div>
        </div>

        {/* DESCRIPTION */}

        <div className="space-y-3">

          <Label className="text-base font-bold">

            ملاحظات
          </Label>

          <Textarea
            placeholder="أضف أي ملاحظات خاصة بالتحدي..."
            className="min-h-30 rounded-2xl"
            disabled
          />
        </div>

        {/* SUBMIT */}

        <Button
          type="submit"
          size="lg"
          disabled={
            isPending ||
            !isDirty
          }
          className="h-14 rounded-2xl px-8 text-lg font-bold"
        >

          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />

              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />

              حفظ التعديلات
            </>
          )}
        </Button>
      </form>

      {/* ========================================= */}
      {/* EXTRA INFO */}
      {/* ========================================= */}

      <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6">

        <div className="flex items-start gap-4">

          <div className="rounded-2xl bg-primary/10 p-3 text-primary">

            <Swords className="h-6 w-6" />
          </div>

          <div>

            <h3 className="text-lg font-black">

              إدارة التحدي
            </h3>

            <p className="mt-2 leading-7 text-muted-foreground">

              يمكنك تعديل اسم التحدي وإدارة الطلاب
              والأسئلة من نفس الصفحة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}