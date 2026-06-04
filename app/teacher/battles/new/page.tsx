// app/teacher/battles/new/page.tsx

import { redirect } from "next/navigation";

import {
  Swords,
  Sparkles,
  Zap,
  Trophy,
} from "lucide-react";

import { auth } from "@/auth";

import CreateBattleRoomForm from "@/components/teacher/battle/create-battle-form";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default async function NewBattlePage() {
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
  // UI
  // =========================================

  return (
    <main className="min-h-screen bg-background">

      <div className="container mx-auto max-w-7xl px-4 py-10">

        <div className="grid gap-8 xl:grid-cols-2">

          {/* ========================================= */}
          {/* LEFT SIDE */}
          {/* ========================================= */}

          <div className="flex flex-col justify-center">

            <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-2xl border bg-primary/5 px-5 py-3 text-primary">

              <Swords className="h-5 w-5" />

              <span className="font-bold">

                نظام التحديات المباشرة
              </span>
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight">

              أنشئ معركة تعليمية
              <br />

              مباشرة بين الطلاب 
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">

              أنشئ غرفة تحدي مباشرة، أضف الأسئلة،
              وزع الطلاب على الفرق،
              وشاهد المنافسة لحظة بلحظة.
            </p>

            {/* FEATURES */}

            <div className="mt-10 space-y-4">

              <Card className="rounded-3xl border-border/50">

                <CardContent className="flex items-center gap-4 p-5">

                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">

                    <Zap className="h-6 w-6" />
                  </div>

                  <div>

                    <h3 className="font-black">

                      تحديات مباشرة
                    </h3>

                    <p className="text-sm text-muted-foreground">

                      تحديثات فورية باستخدام Firebase
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-border/50">

                <CardContent className="flex items-center gap-4 p-5">

                  <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-500">

                    <Trophy className="h-6 w-6" />
                  </div>

                  <div>

                    <h3 className="font-black">

                      نظام فرق وتنافس
                    </h3>

                    <p className="text-sm text-muted-foreground">

                      قسم الطلاب لفريقين وابدأ المنافسة
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-border/50">

                <CardContent className="flex items-center gap-4 p-5">

                  <div className="rounded-2xl bg-pink-500/10 p-3 text-pink-500">

                    <Sparkles className="h-6 w-6" />
                  </div>

                  <div>

                    <h3 className="font-black">

                      ألعاب تعليمية متنوعة
                    </h3>

                    <p className="text-sm text-muted-foreground">

                      Quiz — Matching — Fill Blanks
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ========================================= */}
          {/* RIGHT SIDE */}
          {/* ========================================= */}

          <div className="flex items-center justify-center">

            <div className="w-full max-w-2xl">

              <CreateBattleRoomForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}