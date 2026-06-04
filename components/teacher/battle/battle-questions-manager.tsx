// components/teacher/battle/battle-questions-manager.tsx

"use client";

import { useState, useTransition } from "react";

import Link from "next/link";

import {
  Plus,
  Pencil,
  Trash2,
  Trophy,
  Loader2,
  Clock3,
  ArrowRight,
} from "lucide-react";

import { toast } from "sonner";

import {
  deleteBattleQuestionAction,
} from "@/actions/teacher/battle";

import {
  Button,
} from "@/components/ui/button";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface BattleQuestionsManagerProps {
  battle: {
    id: string;

    questions: {
      id: string;

      question: string;

      type: string;

      points: number;

      timeLimit: number;

      answers: {
        id: string;
      }[];
    }[];
  };
}

export default function BattleQuestionsManager({
  battle,
}: BattleQuestionsManagerProps) {
  const [
    deletingId,
    setDeletingId,
  ] = useState<
    string | null
  >(null);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  // =========================================
  // DELETE
  // =========================================

  async function handleDelete(
    questionId: string,
  ) {
    const confirmed =
      confirm(
        "هل أنت متأكد من حذف السؤال؟",
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      questionId,
    );

    startTransition(
      async () => {
        try {
          await deleteBattleQuestionAction(
            questionId,
          );

          toast.success(
            "تم حذف السؤال بنجاح",
          );
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "حدث خطأ",
          );
        } finally {
          setDeletingId(
            null,
          );
        }
      },
    );
  }

  // =========================================
  // EMPTY
  // =========================================

  if (
    battle.questions
      .length === 0
  ) {
    return (
      <div className="rounded-3xl border border-dashed p-12 text-center">

        <Trophy className="mx-auto mb-5 h-12 w-12 text-muted-foreground" />

        <h3 className="text-2xl font-black">

          لا توجد أسئلة
        </h3>

        <p className="mt-3 text-muted-foreground">

          أضف أول سؤال للتحدي
        </p>

        <Button
          asChild
          className="mt-6 rounded-2xl"
        >
          <Link
            href={`/teacher/battles/${battle.id}/questions/new`}
          >
            <Plus className="mr-2 h-5 w-5" />

            إضافة سؤال
          </Link>
        </Button>
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="space-y-6">

      {/* ========================================= */}
      {/* ADD BUTTON */}
      {/* ========================================= */}

      <div className="flex justify-end">

        <Button
          asChild
          className="rounded-2xl"
        >
          <Link
            href={`/teacher/battles/${battle.id}/questions/new`}
          >
            <Plus className="mr-2 h-5 w-5" />

            إضافة سؤال
          </Link>
        </Button>
      </div>

      {/* ========================================= */}
      {/* QUESTIONS */}
      {/* ========================================= */}

      <div className="space-y-5">

        {battle.questions.map(
          (
            question,
            index,
          ) => (
            <Card
              key={
                question.id
              }
              className="rounded-3xl border-border/50 transition-all hover:border-primary/40"
            >

              <CardContent className="p-6">

                {/* HEADER */}

                <div className="mb-5 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

                  <div className="flex items-start gap-4">

                    {/* NUMBER */}

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-xl font-black text-primary">

                      {index + 1}
                    </div>

                    {/* INFO */}

                    <div>

                      <h3 className="text-lg font-black leading-8">

                        {
                          question.question
                        }
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">

                        <Badge className="rounded-xl">

                          {
                            question.type
                          }
                        </Badge>

                        <Badge
                          variant="outline"
                          className="rounded-xl"
                        >

                          {
                            question.points
                          }{" "}
                          نقطة
                        </Badge>

                        <Badge
                          variant="secondary"
                          className="rounded-xl"
                        >

                          <Clock3 className="mr-1 h-4 w-4" />

                          {
                            question.timeLimit
                          }{" "}
                          ثانية
                        </Badge>

                        <Badge
                          variant="outline"
                          className="rounded-xl"
                        >

                          {
                            question
                              .answers
                              .length
                          }{" "}
                          إجابة
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap gap-3">

                    {/* VIEW */}

                    <Button
                      asChild
                      variant="outline"
                      className="rounded-2xl"
                    >
                      <Link
                        href={`/teacher/battles/questions/${question.id}`}
                      >
                        <ArrowRight className="mr-2 h-5 w-5" />

                        عرض
                      </Link>
                    </Button>

                    {/* EDIT */}

                    <Button
                      asChild
                      variant="secondary"
                      className="rounded-2xl"
                    >
                      <Link
                        href={`/teacher/battles/questions/${question.id}/edit`}
                      >
                        <Pencil className="mr-2 h-5 w-5" />

                        تعديل
                      </Link>
                    </Button>

                    {/* DELETE */}

                    <Button
                      variant="destructive"
                      className="rounded-2xl"
                      disabled={
                        isPending
                      }
                      onClick={() =>
                        handleDelete(
                          question.id,
                        )
                      }
                    >

                      {deletingId ===
                      question.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-5 w-5" />

                          حذف
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* QUESTION PREVIEW */}

                <div className="rounded-2xl border bg-muted/20 p-5">

                  <p className="text-sm font-medium text-muted-foreground">

                    معاينة السؤال
                  </p>

                  <div className="mt-4">

                    {/* QUIZ */}

                    {question.type ===
                      "QUIZ" && (
                      <div className="grid gap-3 md:grid-cols-2">

                        <div className="rounded-xl border bg-background p-4">
                          خيار A
                        </div>

                        <div className="rounded-xl border bg-background p-4">
                          خيار B
                        </div>

                        <div className="rounded-xl border bg-background p-4">
                          خيار C
                        </div>

                        <div className="rounded-xl border bg-background p-4">
                          خيار D
                        </div>
                      </div>
                    )}

                    {/* MATCHING */}

                    {question.type ===
                      "MATCHING" && (
                      <div className="grid gap-4 md:grid-cols-2">

                        <div className="rounded-xl border bg-background p-4">

                          Left Match
                        </div>

                        <div className="rounded-xl border bg-background p-4">

                          Right Match
                        </div>
                      </div>
                    )}

                    {/* FILL BLANKS */}

                    {question.type ===
                      "FILL_BLANKS" && (
                      <div className="rounded-xl border bg-background p-4">

                        Fill in the blank...
                      </div>
                    )}

                    {/* CONVERSATION */}

                    {question.type ===
                      "CONVERSATION" && (
                      <div className="rounded-xl border bg-background p-4">

                        Conversation Scenario
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}