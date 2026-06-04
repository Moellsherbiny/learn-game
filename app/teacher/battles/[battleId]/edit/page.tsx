// app/teacher/battles/[battleId]/edit/page.tsx

import { notFound, redirect } from "next/navigation";

import {
  ArrowLeft,
  Pencil,
  Swords,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";

import Link from "next/link";

import { auth } from "@/auth";
export const dynamic =
  "force-dynamic";
import {
  getBattleRoomAction,
  getStudentsAction,
} from "@/actions/teacher/battle";

import EditBattleRoomForm from "@/components/teacher/battle/edit-battle-room-form";

import BattleQuestionsManager from "@/components/teacher/battle/battle-questions-manager";

import BattleParticipantsManager from "@/components/teacher/battle/battle-participants-manager";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    battleId: string;
  }>;
}

export default async function EditBattlePage({
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
    const students =
  await getStudentsAction();
  if (!battle) {
    notFound();
  }

  // =========================================
  // UI
  // =========================================

  return (
    <main className="min-h-screen bg-background">

      <div className="container mx-auto max-w-7xl px-4 py-10">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="mb-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div>

            <div className="mb-4 flex flex-wrap items-center gap-3">

              <Badge
                variant="outline"
                className="rounded-xl px-4 py-1.5"
              >
                {battle.code}
              </Badge>

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
                className="rounded-xl px-4 py-1.5"
              >
                {battle.status ===
                "LIVE"
                  ? "🔥 مباشر"
                  : battle.status ===
                    "WAITING"
                  ? "⏳ انتظار"
                  : "🏁 منتهي"}
              </Badge>
            </div>

            <h1 className="flex items-center gap-3 text-4xl font-black">

              <div className="rounded-3xl bg-primary/10 p-4 text-primary">

                <Pencil className="h-8 w-8" />
              </div>

              تعديل التحدي
            </h1>

            <p className="mt-3 text-muted-foreground">

              إدارة إعدادات الغرفة والأسئلة والطلاب
            </p>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-3">

            <Button
              asChild
              variant="outline"
              className="rounded-2xl"
            >
              <Link
                href={`/teacher/battles/${battle.id}`}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />

                العودة للغرفة
              </Link>
            </Button>

            <Button
              variant="destructive"
              className="rounded-2xl"
            >
              <Trash2 className="mr-2 h-5 w-5" />

              حذف التحدي
            </Button>
          </div>
        </div>

        {/* ========================================= */}
        {/* STATS */}
        {/* ========================================= */}

        <div className="mb-8 grid gap-6 md:grid-cols-3">

          <Card className="rounded-3xl">

            <CardContent className="flex items-center gap-4 p-6">

              <div className="rounded-2xl bg-primary/10 p-4 text-primary">

                <Users className="h-7 w-7" />
              </div>

              <div>

                <p className="text-sm text-muted-foreground">
                  المشاركون
                </p>

                <h2 className="text-3xl font-black">

                  {
                    battle
                      .participants
                      .length
                  }
                </h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">

            <CardContent className="flex items-center gap-4 p-6">

              <div className="rounded-2xl bg-amber-500/10 p-4 text-amber-500">

                <Trophy className="h-7 w-7" />
              </div>

              <div>

                <p className="text-sm text-muted-foreground">
                  الأسئلة
                </p>

                <h2 className="text-3xl font-black">

                  {
                    battle
                      .questions
                      .length
                  }
                </h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">

            <CardContent className="flex items-center gap-4 p-6">

              <div className="rounded-2xl bg-rose-500/10 p-4 text-rose-500">

                <Swords className="h-7 w-7" />
              </div>

              <div>

                <p className="text-sm text-muted-foreground">
                  الحالة
                </p>

                <h2 className="text-2xl font-black">

                  {battle.status ===
                  "LIVE"
                    ? "🔥 مباشر"
                    : battle.status ===
                      "WAITING"
                    ? "⏳ انتظار"
                    : "🏁 انتهى"}
                </h2>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================= */}
        {/* CONTENT */}
        {/* ========================================= */}

        <div className="grid gap-8 xl:grid-cols-3">

          {/* ========================================= */}
          {/* LEFT SIDE */}
          {/* ========================================= */}

          <div className="space-y-8 xl:col-span-2">

            {/* SETTINGS */}

            <Card className="rounded-3xl">

              <CardHeader>

                <CardTitle className="text-2xl font-black">

                  إعدادات الغرفة
                </CardTitle>

                <CardDescription>

                  تعديل بيانات التحدي الأساسية
                </CardDescription>
              </CardHeader>

              <CardContent>

                <EditBattleRoomForm
                  battle={battle}
                />
              </CardContent>
            </Card>

            {/* QUESTIONS */}

            <Card className="rounded-3xl">

              <CardHeader>

                <CardTitle className="text-2xl font-black">

                  إدارة الأسئلة
                </CardTitle>

                <CardDescription>

                  إضافة وتعديل وحذف أسئلة التحدي
                </CardDescription>
              </CardHeader>

              <CardContent>

                <BattleQuestionsManager
                  battle={battle}
                />
              </CardContent>
            </Card>
          </div>

          {/* ========================================= */}
          {/* RIGHT SIDE */}
          {/* ========================================= */}

          <div className="space-y-8">

            {/* PARTICIPANTS */}

            <Card className="rounded-3xl">

              <CardHeader>

                <CardTitle className="text-2xl font-black">

                  إدارة الطلاب
                </CardTitle>

                <CardDescription>

                  إضافة الطلاب للفرق
                </CardDescription>
              </CardHeader>

              <CardContent>

                <BattleParticipantsManager
                  battle={battle}
                  students={students}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}