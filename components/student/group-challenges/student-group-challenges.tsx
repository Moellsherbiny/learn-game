"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Gamepad2,
  Users,
  BookOpen,
  Clock,
  Trophy,
  Plus,
  ArrowLeft,
} from "lucide-react";

import type { getMyGroupChallengesAction } from "@/actions/student/group-challenge";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Challenges = Awaited<
  ReturnType<typeof getMyGroupChallengesAction>
>;

const statusLabels = {
  WAITING: "في انتظار البداية",
  LIVE: "جاري الآن",
  FINISHED: "انتهى",
  CANCELLED: "تم الإلغاء",
};

export function StudentGroupChallenges({
  challenges,
}: {
  challenges: Challenges;
}) {
  const [filter, setFilter] = useState("ALL");

  const filteredChallenges = challenges.filter((item) => {
    return filter === "ALL" || item.challenge.status === filter;
  });

  return (
    <main dir="rtl" className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">التحديات الجماعية</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            تابع تحدياتك ونافس زملاءك لتحقيق أفضل النتائج.
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link href="/student/group-challenges/join">
            <Plus className="h-4 w-4" />
            الانضمام إلى تحدي
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">إجمالي التحديات</p>
              <p className="text-2xl font-bold">{challenges.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">تحديات نشطة</p>
              <p className="text-2xl font-bold">
                {challenges.filter((item) => item.challenge.status === "LIVE").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">إجمالي النقاط</p>
              <p className="text-2xl font-bold">
                {challenges.reduce((sum, item) => sum + item.score, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { value: "ALL", label: "الكل" },
          { value: "WAITING", label: "في الانتظار" },
          { value: "LIVE", label: "جارية" },
          { value: "FINISHED", label: "منتهية" },
        ].map((item) => (
          <Button
            key={item.value}
            size="sm"
            variant={filter === item.value ? "default" : "outline"}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {filteredChallenges.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Gamepad2 className="h-12 w-12 text-muted-foreground" />
            <h2 className="font-semibold">لا توجد تحديات حتى الآن</h2>
            <p className="text-sm text-muted-foreground">
              انضم إلى تحدٍ باستخدام الكود الذي يوفره المدرس.
            </p>
            <Button asChild className="mt-2">
              <Link href="/student/group-challenges/join">
                الانضمام إلى تحدي
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredChallenges.map((item) => {
            const challenge = item.challenge;

            return (
              <Card key={item.id} className="transition-shadow hover:shadow-md">
                <CardContent className="space-y-5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{challenge.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {challenge.course.title}
                      </p>
                    </div>

                    <Badge variant="secondary">
                      {statusLabels[challenge.status]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">فريقك</p>
                      <p className="mt-1 text-sm font-semibold">
                        {item.team === "TEAM_A" ? "الفريق A" : "الفريق B"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">المشاركون</p>
                      <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                        <Users className="h-4 w-4" />
                        {challenge._count.participants}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">نقاطك</p>
                      <p className="mt-1 text-sm font-semibold">{item.score}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {challenge._count.questions} أسئلة
                    </div>

                    <Button asChild size="sm" className="gap-2">
                      <Link href={`/student/group-challenges/${challenge.id}`}>
                        فتح التحدي
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}