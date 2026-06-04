
import {
  notFound,
  redirect,
} from "next/navigation";

import Link from "next/link";

import {
  ArrowLeft,
  Plus,
  Pencil,
  Trophy,
  Clock,
  MessageSquare,
} from "lucide-react";

import { auth } from "@/auth";

import {
  getBattleRoomAction,
} from "@/actions/teacher/battle";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export const dynamic =
  "force-dynamic";

interface PageProps {
  params: Promise<{
    battleId: string;
  }>;
}

export default async function BattleQuestionsPage({
  params,
}: PageProps) {
  // =========================================
  // AUTH
  // =========================================

  const session =
    await auth();

  if (
    !session?.user?.id
  ) {
    redirect("/login");
  }

  if (
    session.user.role !==
    "TEACHER"
  ) {
    redirect("/");
  }

  // =========================================
  // PARAMS
  // =========================================

  const {
    battleId,
  } = await params;

  // =========================================
  // DATA
  // =========================================

  const battle =
    await getBattleRoomAction(
      battleId,
    );

  if (!battle) {
    notFound();
  }

  // =========================================
  // UI
  // =========================================

  return (
    <main className="min-h-screen bg-background">

      <div className="container mx-auto max-w-6xl px-4 py-10">

        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-4 flex flex-wrap items-center gap-3">

              <Badge
                variant="outline"
                className="rounded-xl px-4 py-1.5"
              >
                {battle.code}
              </Badge>

              <Badge className="rounded-xl px-4 py-1.5">

                {
                  battle.questions
                    .length
                }{" "}
                سؤال
              </Badge>
            </div>

            <h1 className="text-4xl font-black">

              أسئلة التحدي
            </h1>

            <p className="mt-3 text-muted-foreground">

              إدارة جميع أسئلة التحدي
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <Button
              asChild
              variant="outline"
              className="rounded-2xl"
            >
              <Link
                href={`/teacher/battles/${battle.id}`}
                prefetch={false}
              >

                <ArrowLeft className="mr-2 h-5 w-5" />

                العودة
              </Link>
            </Button>

            <Button
              asChild
              className="rounded-2xl"
            >
              <Link
                href={`/teacher/battles/${battle.id}/questions/new`}
                prefetch={false}
              >

                <Plus className="mr-2 h-5 w-5" />

                إضافة سؤال
              </Link>
            </Button>
          </div>
        </div>

        {/* EMPTY */}

        {battle.questions
          .length ===
          0 && (
          <Card className="rounded-3xl border-dashed">

            <CardContent className="flex flex-col items-center justify-center py-20 text-center">

              <div className="mb-5 rounded-full bg-primary/10 p-5 text-primary">

                <MessageSquare className="h-10 w-10" />
              </div>

              <h2 className="text-3xl font-black">

                لا توجد أسئلة
              </h2>

              <p className="mt-3 max-w-lg text-muted-foreground">

                ابدأ بإضافة أول سؤال للتحدي
              </p>

              <Button
                asChild
                className="mt-8 rounded-2xl"
              >
                <Link
                  href={`/teacher/battles/${battle.id}/questions/new`}
                  prefetch={false}
                >

                  <Plus className="mr-2 h-5 w-5" />

                  إضافة سؤال
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* QUESTIONS */}

        <div className="grid gap-6">

          {battle.questions.map(
            (
              question,
              index,
            ) => (
              <Card
                key={
                  question.id
                }
                className="rounded-3xl transition-all hover:shadow-lg"
              >

                <CardContent className="p-6">

                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">

                    {/* LEFT */}

                    <div className="flex flex-1 gap-5">

                      {/* NUMBER */}

                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-primary/10 text-2xl font-black text-primary">

                        {index + 1}
                      </div>

                      {/* CONTENT */}

                      <div className="flex-1">

                        <div className="mb-4 flex flex-wrap items-center gap-3">

                          <Badge className="rounded-xl">

                            {
                              question.type
                            }
                          </Badge>

                          <Badge
                            variant="outline"
                            className="rounded-xl"
                          >

                            <Trophy className="mr-1 h-3 w-3" />

                            {
                              question.points
                            }{" "}
                            نقطة
                          </Badge>

                          <Badge
                            variant="outline"
                            className="rounded-xl"
                          >

                            <Clock className="mr-1 h-3 w-3" />

                            {
                              question.timeLimit
                            }
                            s
                          </Badge>
                        </div>

                        <h2 className="text-2xl font-black leading-relaxed">

                          {
                            question.question
                          }
                        </h2>

                        {/* QUIZ OPTIONS */}

                        {question.type ===
                          "QUIZ" && (
                          <div className="mt-5 grid gap-3 md:grid-cols-2">

                            {question.optionA && (
                              <div className="rounded-2xl border p-4">

                                A.{" "}
                                {
                                  question.optionA
                                }
                              </div>
                            )}

                            {question.optionB && (
                              <div className="rounded-2xl border p-4">

                                B.{" "}
                                {
                                  question.optionB
                                }
                              </div>
                            )}

                            {question.optionC && (
                              <div className="rounded-2xl border p-4">

                                C.{" "}
                                {
                                  question.optionC
                                }
                              </div>
                            )}

                            {question.optionD && (
                              <div className="rounded-2xl border p-4">

                                D.{" "}
                                {
                                  question.optionD
                                }
                              </div>
                            )}
                          </div>
                        )}

                        {/* ANSWER */}

                        {question.answer && (
                          <div className="mt-5 rounded-2xl bg-green-500/10 p-4 text-green-700 dark:text-green-400">

                            <span className="font-black">

                              الإجابة الصحيحة:
                            </span>{" "}
                            {
                              question.answer
                            }
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex gap-3">

                      <Button
                        asChild
                        variant="outline"
                        className="rounded-2xl"
                      >
                        <Link
                          href={`/teacher/battles/${battle.id}/questions/${question.id}/edit`}
                          prefetch={false}
                        >

                          <Pencil className="mr-2 h-4 w-4" />

                          تعديل
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      </div>
    </main>
  );
}