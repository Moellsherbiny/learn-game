// app/teacher/battles/[battleId]/questions/new/page.tsx

import {
  notFound,
  redirect,
} from "next/navigation";

import Link from "next/link";

import {
  ArrowLeft,
  Plus,
  Swords,
} from "lucide-react";

import { auth } from "@/auth";

import {
  getBattleRoomAction,
} from "@/actions/teacher/battle";

import CreateBattleQuestionForm from "@/components/teacher/battle/create-battle-question-form";

import {
  Button,
} from "@/components/ui/button";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic =
  "force-dynamic";

interface PageProps {
  params: Promise<{
    battleId: string;
  }>;
}

export default async function NewBattleQuestionPage({
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

      <div className="container mx-auto max-w-5xl px-4 py-10">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="mb-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div>

            <div className="mb-4 flex items-center gap-3">

              <Badge
                variant="outline"
                className="rounded-xl px-4 py-1.5"
              >
                {battle.code}
              </Badge>

              <Badge
                className="rounded-xl px-4 py-1.5"
              >
                {
                  battle.questions
                    .length
                }{" "}
                سؤال
              </Badge>
            </div>

            <h1 className="flex items-center gap-3 text-4xl font-black">

              <div className="rounded-3xl bg-primary/10 p-4 text-primary">

                <Plus className="h-8 w-8" />
              </div>

              إضافة سؤال جديد
            </h1>

            <p className="mt-3 text-muted-foreground">

              أضف سؤال جديد للتحدي
            </p>
          </div>

          {/* ACTIONS */}

          <Button
            asChild
            variant="outline"
            className="rounded-2xl"
          >
            <Link
              href={`/teacher/battles/${battle.id}/edit`}
              prefetch={false}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />

              العودة للتعديل
            </Link>
          </Button>
        </div>

        {/* ========================================= */}
        {/* INFO */}
        {/* ========================================= */}

        <Card className="mb-8 rounded-3xl">

          <CardContent className="flex items-center gap-5 p-6">

            <div className="rounded-3xl bg-primary/10 p-4 text-primary">

              <Swords className="h-8 w-8" />
            </div>

            <div>

              <h2 className="text-2xl font-black">

                {battle.title}
              </h2>

              <p className="mt-2 text-muted-foreground">

                يمكنك إضافة أنواع مختلفة من الأسئلة:
                Quiz - Matching - Fill Blanks - Conversation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ========================================= */}
        {/* FORM */}
        {/* ========================================= */}

        <Card className="rounded-3xl">

          <CardHeader>

            <CardTitle className="text-2xl font-black">

              بيانات السؤال
            </CardTitle>

            <CardDescription>

              قم بإدخال تفاصيل السؤال
            </CardDescription>
          </CardHeader>

          <CardContent>

            <CreateBattleQuestionForm
              battleId={battle.id}
              currentQuestionsCount={
                battle.questions
                  .length
              }
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}