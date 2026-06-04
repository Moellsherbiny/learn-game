// components/teacher/battle/edit-battle-question-form.tsx

"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";

import {
  Loader2,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

import {
  updateBattleQuestionAction,
  deleteBattleQuestionAction,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// =========================================
// SCHEMA
// =========================================

const schema = z.object({
  question: z
    .string()
    .min(
      3,
      "السؤال قصير جدًا",
    ),

  type: z.enum([
    "QUIZ",
    "MATCHING",
    "FILL_BLANKS",
    "CONVERSATION",
  ]),

  answer:
    z.string().optional(),

  optionA:
    z.string().optional(),

  optionB:
    z.string().optional(),

  optionC:
    z.string().optional(),

  optionD:
    z.string().optional(),

  leftText:
    z.string().optional(),

  rightText:
    z.string().optional(),

  points: z
    .string()
    .transform((value) =>
      Number(value),
    ),

  timeLimit: z
    .string()
    .transform((value) =>
      Number(value),
    ),
});

// =========================================
// TYPES
// =========================================

type FormInput =
  z.input<typeof schema>;

type FormOutput =
  z.output<typeof schema>;

// =========================================
// PROPS
// =========================================

interface EditBattleQuestionFormProps {
  battleId: string;

  question: {
    id: string;

    question: string;

    type:
      | "QUIZ"
      | "MATCHING"
      | "FILL_BLANKS"
      | "CONVERSATION";

    answer:
      | string
      | null;

    optionA:
      | string
      | null;

    optionB:
      | string
      | null;

    optionC:
      | string
      | null;

    optionD:
      | string
      | null;

    leftText:
      | string
      | null;

    rightText:
      | string
      | null;

    points: number;

    timeLimit: number;
  };
}

// =========================================
// COMPONENT
// =========================================

export default function EditBattleQuestionForm({
  battleId,
  question,
}: EditBattleQuestionFormProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    type,
    setType,
  ] = useState<
    | "QUIZ"
    | "MATCHING"
    | "FILL_BLANKS"
    | "CONVERSATION"
  >(question.type);

  // =========================================
  // FORM
  // =========================================

  const form =
    useForm<
      FormInput,
      any,
      FormOutput
    >({
      resolver:
        zodResolver(
          schema,
        ),

      defaultValues: {
        question:
          question.question,

        type:
          question.type,

        answer:
          question.answer ??
          "",

        optionA:
          question.optionA ??
          "",

        optionB:
          question.optionB ??
          "",

        optionC:
          question.optionC ??
          "",

        optionD:
          question.optionD ??
          "",

        leftText:
          question.leftText ??
          "",

        rightText:
          question.rightText ??
          "",

        points:
          String(
            question.points,
          ),

        timeLimit:
          String(
            question.timeLimit,
          ),
      },
    });

  const {
    register,

    handleSubmit,

    setValue,

    formState: {
      errors,
    },
  } = form;

  // =========================================
  // UPDATE
  // =========================================

  async function onSubmit(
    values: FormOutput,
  ) {
    startTransition(
      async () => {
        try {
          await updateBattleQuestionAction(
            {
              questionId:
                question.id,

              ...values,
            },
          );

          toast.success(
            "تم تحديث السؤال ✅",
          );

          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof
              Error
              ? error.message
              : "حدث خطأ",
          );
        }
      },
    );
  }

  // =========================================
  // DELETE
  // =========================================

  async function handleDelete() {
    const confirmed =
      confirm(
        "هل أنت متأكد من حذف السؤال؟",
      );

    if (!confirmed) {
      return;
    }

    startTransition(
      async () => {
        try {
          await deleteBattleQuestionAction(
            question.id,
          );

          toast.success(
            "تم حذف السؤال 🗑️",
          );

          router.push(
            `/teacher/battles/${battleId}/edit`,
          );

          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof
              Error
              ? error.message
              : "حدث خطأ",
          );
        }
      },
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit,
      )}
      className="space-y-8"
    >

      {/* QUESTION */}

      <div className="space-y-3">

        <Label>
          السؤال
        </Label>

        <Textarea
          className="min-h-30 rounded-2xl"
          {...register(
            "question",
          )}
        />

        {errors.question && (
          <p className="text-sm text-destructive">

            {
              errors
                .question
                .message
            }
          </p>
        )}
      </div>

      {/* TYPE */}

      <div className="space-y-3">

        <Label>
          نوع السؤال
        </Label>

        <Select
          value={type}
          onValueChange={(
            value,
          ) => {
            const nextType =
              value as FormInput["type"];

            setType(
              nextType,
            );

            setValue(
              "type",
              nextType,
            );
          }}
        >

          <SelectTrigger className="h-12 rounded-2xl">

            <SelectValue />
          </SelectTrigger>

          <SelectContent>

            <SelectItem value="QUIZ">
              Quiz
            </SelectItem>

            <SelectItem value="MATCHING">
              Matching
            </SelectItem>

            <SelectItem value="FILL_BLANKS">
              Fill Blanks
            </SelectItem>

            <SelectItem value="CONVERSATION">
              Conversation
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* QUIZ */}

      {type ===
        "QUIZ" && (
        <div className="space-y-6 rounded-3xl border p-6">

          <h3 className="text-xl font-black">

            خيارات السؤال
          </h3>

          <div className="grid gap-5 md:grid-cols-2">

            <Input
              placeholder="Option A"
              className="rounded-2xl"
              {...register(
                "optionA",
              )}
            />

            <Input
              placeholder="Option B"
              className="rounded-2xl"
              {...register(
                "optionB",
              )}
            />

            <Input
              placeholder="Option C"
              className="rounded-2xl"
              {...register(
                "optionC",
              )}
            />

            <Input
              placeholder="Option D"
              className="rounded-2xl"
              {...register(
                "optionD",
              )}
            />
          </div>

          <div className="space-y-2">

            <Label>
              الإجابة الصحيحة
            </Label>

            <Input
              className="rounded-2xl"
              {...register(
                "answer",
              )}
            />
          </div>
        </div>
      )}

      {/* MATCHING */}

      {type ===
        "MATCHING" && (
        <div className="grid gap-5 rounded-3xl border p-6 md:grid-cols-2">

          <div className="space-y-2">

            <Label>
              Left Text
            </Label>

            <Input
              className="rounded-2xl"
              {...register(
                "leftText",
              )}
            />
          </div>

          <div className="space-y-2">

            <Label>
              Right Text
            </Label>

            <Input
              className="rounded-2xl"
              {...register(
                "rightText",
              )}
            />
          </div>
        </div>
      )}

      {/* FILL BLANKS */}

      {type ===
        "FILL_BLANKS" && (
        <div className="space-y-2 rounded-3xl border p-6">

          <Label>
            الإجابة الصحيحة
          </Label>

          <Input
            className="rounded-2xl"
            {...register(
              "answer",
            )}
          />
        </div>
      )}

      {/* CONVERSATION */}

      {type ===
        "CONVERSATION" && (
        <div className="space-y-2 rounded-3xl border p-6">

          <Label>
            الرد الصحيح
          </Label>

          <Textarea
            className="min-h-30 rounded-2xl"
            {...register(
              "answer",
            )}
          />
        </div>
      )}

      {/* SETTINGS */}

      <div className="grid gap-5 md:grid-cols-2">

        <div className="space-y-2">

          <Label>
            النقاط
          </Label>

          <Input
            type="number"
            className="rounded-2xl"
            {...register(
              "points",
            )}
          />
        </div>

        <div className="space-y-2">

          <Label>
            الوقت
          </Label>

          <Input
            type="number"
            className="rounded-2xl"
            {...register(
              "timeLimit",
            )}
          />
        </div>
      </div>

      {/* ACTIONS */}

      <div className="flex flex-wrap gap-4">

        <Button
          type="submit"
          disabled={
            isPending
          }
          className="h-12 rounded-2xl px-6"
        >

          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />

              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />

              حفظ التعديلات
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="destructive"
          disabled={
            isPending
          }
          onClick={
            handleDelete
          }
          className="h-12 rounded-2xl px-6"
        >

          <Trash2 className="mr-2 h-4 w-4" />

          حذف السؤال
        </Button>
      </div>

      {/* INFO */}

      <div className="rounded-3xl border bg-primary/5 p-6">

        <div className="flex items-start gap-4">

          <div className="rounded-2xl bg-primary/10 p-3 text-primary">

            <Pencil className="h-6 w-6" />
          </div>

          <div>

            <h3 className="text-lg font-black">

              تعديل السؤال
            </h3>

            <p className="mt-2 leading-7 text-muted-foreground">

              يمكنك تعديل جميع بيانات السؤال
              وسيتم تحديثها فورًا داخل التحدي.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}