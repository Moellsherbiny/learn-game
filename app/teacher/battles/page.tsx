// app/teacher/battles/page.tsx

import Link from "next/link";

import { redirect } from "next/navigation";

import {
  Swords,
  Plus,
  Users,
  Trophy,
  PlayCircle,
  Pencil,
  Clock3,
} from "lucide-react";

import { auth } from "@/auth";

import {
  getTeacherBattleRoomsAction,
} from "@/actions/battle";

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

export default async function TeacherBattlesPage() {
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
  // DATA
  // =========================================

  const rooms =
    await getTeacherBattleRoomsAction();

  // =========================================
  // UI
  // =========================================

  return (
    <main className="min-h-screen bg-background">

      <div className="container mx-auto max-w-7xl px-4 py-10">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h1 className="flex items-center gap-3 text-4xl font-black">

              <div className="rounded-3xl bg-primary/10 p-4 text-primary">

                <Swords className="h-8 w-8" />
              </div>

              ساحات التحدي
            </h1>

            <p className="mt-3 text-muted-foreground">

              إدارة التحديات المباشرة بين الطلاب
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="rounded-2xl"
          >
            <Link href="/teacher/battles/new">

              <Plus className="mr-2 h-5 w-5" />

              إنشاء تحدي جديد
            </Link>
          </Button>
        </div>

        {/* ========================================= */}
        {/* EMPTY STATE */}
        {/* ========================================= */}

        {rooms.length === 0 ? (
          <Card className="rounded-3xl border-dashed">

            <CardContent className="flex flex-col items-center justify-center py-24 text-center">

              <div className="mb-6 rounded-full bg-primary/10 p-6 text-primary">

                <Swords className="h-12 w-12" />
              </div>

              <h2 className="text-3xl font-black">

                لا توجد تحديات حتى الآن
              </h2>

              <p className="mt-3 max-w-md text-muted-foreground">

                ابدأ بإنشاء أول غرفة تحدي للطلاب
              </p>

              <Button
                asChild
                size="lg"
                className="mt-8 rounded-2xl"
              >
                <Link href="/teacher/battles/new">

                  <Plus className="mr-2 h-5 w-5" />

                  إنشاء تحدي
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (

          /* ========================================= */
          /* BATTLE ROOMS */
          /* ========================================= */

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {rooms.map((room) => (
              <Card
                key={room.id}
                className="group rounded-3xl border-border/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl"
              >

                <CardHeader className="space-y-5">

                  {/* STATUS */}

                  <div className="flex items-center justify-between gap-4">

                    <Badge
                      variant={
                        room.status ===
                        "LIVE"
                          ? "default"
                          : room.status ===
                            "WAITING"
                          ? "secondary"
                          : "outline"
                      }
                      className="rounded-xl px-4 py-1.5"
                    >
                      {room.status ===
                      "LIVE"
                        ? "🔥 مباشر"
                        : room.status ===
                          "WAITING"
                        ? "⏳ بانتظار البدء"
                        : "🏁 منتهي"}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="rounded-xl px-4 py-1.5"
                    >
                      {room.code}
                    </Badge>
                  </div>

                  {/* TITLE */}

                  <div>

                    <CardTitle className="line-clamp-1 text-2xl font-black">

                      {room.title}
                    </CardTitle>

                    <CardDescription className="mt-2">

                      تم إنشاء الغرفة بتاريخ{" "}
                      {new Date(
                        room.createdAt,
                      ).toLocaleDateString(
                        "ar-EG",
                      )}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>

                  {/* STATS */}

                  <div className="mb-6 grid grid-cols-3 gap-3">

                    <div className="rounded-2xl border bg-muted/30 p-4 text-center">

                      <Users className="mx-auto mb-2 h-5 w-5 text-primary" />

                      <p className="text-2xl font-black">

                        {
                          room
                            .participants
                            .length
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">

                        طالب
                      </p>
                    </div>

                    <div className="rounded-2xl border bg-muted/30 p-4 text-center">

                      <Trophy className="mx-auto mb-2 h-5 w-5 text-amber-500" />

                      <p className="text-2xl font-black">

                        {
                          room
                            .questions
                            .length
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">

                        سؤال
                      </p>
                    </div>

                    <div className="rounded-2xl border bg-muted/30 p-4 text-center">

                      <Clock3 className="mx-auto mb-2 h-5 w-5 text-blue-500" />

                      <p className="text-2xl font-black">

                        {
                          room.currentQuestion +
                            1
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">

                        الحالي
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex gap-3">

                    {/* OPEN */}

                    <Button
                      asChild
                      className="flex-1 rounded-2xl"
                    >
                      <Link
                        href={`/teacher/battles/${room.id}`}
                      >
                        <PlayCircle className="mr-2 h-5 w-5" />

                        دخول
                      </Link>
                    </Button>

                    {/* EDIT */}

                    <Button
                      asChild
                      variant="outline"
                      className="rounded-2xl"
                    >
                      <Link
                        href={`/teacher/battles/${room.id}/edit`}
                      >
                        <Pencil className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}