"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";

import {
  Loader2,
  Plus,
  Trophy,
} from "lucide-react";

import { toast } from "sonner";

import {
  createBattleQuestionAction,
} from "@/actions/teacher/battleQuestion";

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
    .min(1)
    .transform((value) =>
      Number(value),
    ),

  timeLimit: z
    .string()
    .min(1)
    .transform((value) =>
      Number(value),
    ),
});

type FormValues =
  z.input<typeof schema>;

type SubmitValues =
  z.output<typeof schema>;

// =========================================
// PROPS
// =========================================

interface CreateBattleQuestionFormProps {
  battleId: string;

  currentQuestionsCount: number;
}

// =========================================
// COMPONENT
// =========================================

export default function CreateBattleQuestionForm({
  battleId,
  currentQuestionsCount,
}: CreateBattleQuestionFormProps) {
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
  >("QUIZ");

  // =========================================
  // FORM
  // =========================================

const form = useForm<
  z.input<typeof schema>,
  any,
  z.output<typeof schema>
>({
  resolver: zodResolver(schema),

  defaultValues: {
    question: "",

    type: "QUIZ",

    answer: "",

    optionA: "",

    optionB: "",

    optionC: "",

    optionD: "",

    leftText: "",

    rightText: "",

    points: "10",

    timeLimit: "30",
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
  // SUBMIT
  // =========================================

  async function onSubmit(
    values: SubmitValues,
  ) {
    startTransition(
      async () => {
        try {
          await createBattleQuestionAction(
            {
              roomId:
                battleId,

              order:
                currentQuestionsCount,

              ...values,
            },
          );

          toast.success(
            "تم إضافة السؤال 🔥",
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

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit as any,
      )}
      className="space-y-8"
    >

      {/* QUESTION */}

      <div className="space-y-3">

        <Label>
          السؤال
        </Label>

        <Textarea
          placeholder="اكتب السؤال هنا..."
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
          defaultValue="QUIZ"
          onValueChange={(
            value,
          ) => {
            const questionType =
              value as FormValues["type"];

            setType(
              questionType,
            );

            setValue(
              "type",
              questionType,
            );
          }}
        >

          <SelectTrigger className="h-12 rounded-2xl">

            <SelectValue placeholder="اختر النوع" />
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

            <div className="space-y-2">

              <Label>
                Option A
              </Label>

              <Input
                className="rounded-2xl"
                {...register(
                  "optionA",
                )}
              />
            </div>

            <div className="space-y-2">

              <Label>
                Option B
              </Label>

              <Input
                className="rounded-2xl"
                {...register(
                  "optionB",
                )}
              />
            </div>

            <div className="space-y-2">

              <Label>
                Option C
              </Label>

              <Input
                className="rounded-2xl"
                {...register(
                  "optionC",
                )}
              />
            </div>

            <div className="space-y-2">

              <Label>
                Option D
              </Label>

              <Input
                className="rounded-2xl"
                {...register(
                  "optionD",
                )}
              />
            </div>
          </div>

          <div className="space-y-2">

            <Label>
              الإجابة الصحيحة
            </Label>

            <Input
              placeholder="مثال: A"
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
        <div className="space-y-6 rounded-3xl border p-6">

          <h3 className="text-xl font-black">

            بيانات الـ Matching
          </h3>

          <div className="grid gap-5 md:grid-cols-2">

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
        </div>
      )}

      {/* FILL BLANKS */}

      {type ===
        "FILL_BLANKS" && (
        <div className="space-y-6 rounded-3xl border p-6">

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

      {/* CONVERSATION */}

      {type ===
        "CONVERSATION" && (
        <div className="space-y-6 rounded-3xl border p-6">

          <div className="space-y-2">

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
            الوقت (بالثواني)
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

      {/* SUBMIT */}

      <Button
        type="submit"
        size="lg"
        disabled={
          isPending
        }
        className="h-14 rounded-2xl px-8 text-lg font-bold"
      >

        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />

            جاري الإضافة...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-5 w-5" />

            إضافة السؤال
          </>
        )}
      </Button>

      {/* INFO */}

      <div className="rounded-3xl border bg-primary/5 p-6">

        <div className="flex items-start gap-4">

          <div className="rounded-2xl bg-primary/10 p-3 text-primary">

            <Trophy className="h-6 w-6" />
          </div>

          <div>

            <h3 className="text-lg font-black">

              نصيحة
            </h3>

            <p className="mt-2 leading-7 text-muted-foreground">

              حاول جعل الأسئلة قصيرة وواضحة
              لزيادة سرعة التفاعل أثناء التحدي.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}