import { redirect } from "next/navigation";

import Link from "next/link";

import { Bell, Swords, Users, Trophy, ArrowRight, Radio } from "lucide-react";

import { auth } from "@/auth";

import { prisma } from "@/lib/prisma";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function StudentBattlesPage() {
  // =========================================
  // AUTH
  // =========================================

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // =========================================
  // BATTLES
  // =========================================

  const battles = await prisma.battleParticipant.findMany({
    where: {
      studentId: session.user.id,
    },

    include: {
      room: {
        include: {
          teacher: {
            select: {
              name: true,
            },
          },

          participants: {
            select: {
              id: true,
            },
          },

          questions: {
            select: {
              id: true,
            },
          },
        },
      },
    },

    orderBy: {
      joinedAt: "desc",
    },
  });

  // =========================================
  // UI
  // =========================================

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-10">
        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="mb-10">
          <div className="mb-5 flex items-center gap-4">
            <div className="rounded-3xl bg-primary/10 p-4 text-primary">
              <Swords className="h-8 w-8" />
            </div>

            <div>
              <h1 className="text-5xl font-black">التحديات</h1>

              <p className="mt-2 text-lg text-muted-foreground">
                جميع التحديات والدعوات الخاصة بك
              </p>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* EMPTY */}
        {/* ========================================= */}

        {battles.length === 0 && (
          <Card className="rounded-[2rem] border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 rounded-full bg-primary/10 p-6 text-primary">
                <Bell className="h-12 w-12" />
              </div>

              <h2 className="text-4xl font-black">لا توجد دعوات</h2>

              <p className="mt-4 max-w-lg text-lg text-muted-foreground">
                لم يتم دعوتك لأي تحدي حتى الآن
              </p>
            </CardContent>
          </Card>
        )}

        {/* ========================================= */}
        {/* BATTLES */}
        {/* ========================================= */}

        <div className="grid gap-6">
          {battles.map((battle) => {
            const room = battle.room;

            const isLive = room.status === "LIVE";

            const isFinished = room.status === "FINISHED";

            return (
              <Card
                key={battle.id}
                className="
    group
    overflow-hidden
    rounded-[2rem]
    border
    border-border/50
    bg-card
    shadow-lg
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-2xl
  "
              >
                <CardContent className="relative p-8">
                  {/* GLOW */}

                  <div
                    className="
        absolute
        inset-0
        opacity-0
        transition-opacity
        duration-500
        group-hover:opacity-100
        bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_35%)]
      "
                  />

                  <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
                    {/* ========================================= */}
                    {/* LEFT */}
                    {/* ========================================= */}

                    <div className="flex flex-1 gap-5">
                      {/* ICON */}

                      <div
                        className="
            flex
            h-20
            w-20
            shrink-0
            items-center
            justify-center
            rounded-[2rem]
            bg-primary
            text-primary-foreground
            shadow-xl
            transition-transform
            duration-300
            group-hover:scale-110
          "
                      >
                        <Trophy className="h-10 w-10" />
                      </div>

                      {/* CONTENT */}

                      <div className="flex-1">
                        {/* BADGES */}

                        <div className="mb-4 flex flex-wrap items-center gap-3">
                          {/* STATUS */}

                          {isLive ? (
                            <Badge
                              className="
                  rounded-xl
                  bg-red-500
                  px-4
                  py-1.5
                  text-white
                  shadow
                "
                            >
                              <Radio className="mr-2 h-4 w-4 animate-pulse" />
                              LIVE
                            </Badge>
                          ) : isFinished ? (
                            <Badge
                              className="
                  rounded-xl
                  bg-emerald-600
                  px-4
                  py-1.5
                  text-white
                "
                            >
                              FINISHED
                            </Badge>
                          ) : (
                            <Badge
                              className="
                  rounded-xl
                  bg-yellow-500
                  px-4
                  py-1.5
                  text-white
                "
                            >
                              WAITING
                            </Badge>
                          )}

                          {/* TEAM */}

                          <Badge
                            variant="outline"
                            className="
                rounded-xl
                border-primary/20
                bg-primary/5
                px-4
                py-1.5
                font-bold
              "
                          >
                            {battle.team}
                          </Badge>

                          {/* CODE */}

                          <Badge
                            variant="outline"
                            className="
                rounded-xl
                border-border
                bg-muted/50
                px-4
                py-1.5
                font-mono
                text-sm
              "
                          >
                            {room.code}
                          </Badge>
                        </div>

                        {/* TITLE */}

                        <h2
                          className="
              text-3xl
              sm:text-4xl
              font-black
              leading-[1.7]
              tracking-normal
            "
                          style={{
                            wordSpacing: "3px",
                          }}
                        >
                          {room.title}
                        </h2>

                        {/* TEACHER */}

                        <p className="mt-3 text-lg text-muted-foreground">
                          بواسطة الأستاذ{" "}
                          <span className="font-bold text-foreground">
                            {room.teacher.name}
                          </span>
                        </p>

                        {/* STATS */}

                        <div className="mt-6 flex flex-wrap items-center gap-4">
                          <div
                            className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-border/50
                bg-muted/40
                px-4
                py-2
                backdrop-blur
              "
                          >
                            <Users className="h-4 w-4 text-primary" />

                            <span className="font-bold">
                              {room.participants.length} لاعب
                            </span>
                          </div>

                          <div
                            className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-border/50
                bg-muted/40
                px-4
                py-2
                backdrop-blur
              "
                          >
                            <Trophy className="h-4 w-4 text-yellow-500" />

                            <span className="font-bold">
                              {room.questions.length} سؤال
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ========================================= */}
                    {/* ACTION */}
                    {/* ========================================= */}

                    <div className="flex items-center">
                      <Button
                        asChild
                        size="lg"
                        className="
            h-14
            rounded-2xl
            px-8
            text-lg
            font-black
            shadow-lg
            transition-all
            hover:scale-105
          "
                      >
                        <Link
                          href={`/student/battles/${room.id}`}
                          prefetch={false}
                        >
                          {isFinished
                            ? "عرض النتائج"
                            : isLive
                              ? "دخول التحدي"
                              : "عرض الدعوة"}

                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
