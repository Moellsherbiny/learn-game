import { redirect } from "next/navigation";
import {
  BookOpen,
  Crown,
  Flame,
  Sparkles,
  Trophy,
  Swords,
  Coins,
  Target,
  Gamepad2,
} from "lucide-react";

import { auth } from "@/auth";
import { getMyCoursesAction } from "@/actions/student/my-courses";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { MyCoursesClient } from "@/components/game/MyCoursesClient";

export default async function MyCoursesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { courses, stats } = await getMyCoursesAction();

  const level = stats.level || 1;

  const currentLevelXp =
    (stats.totalXp || 0) %
    (stats.nextLevelXp || 1000);

  const nextLevelXp = stats.nextLevelXp || 1000;

  const progress = stats.levelProgress || 0;

  return (
    <main className="min-h-screen overflow-hidden bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b bg-white">
        <div className="container relative z-10 mx-auto px-4 py-14 md:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* LEFT */}
            <div>
              <Badge
                variant="secondary"
                className="mb-6 rounded-full px-4 py-2 text-sm"
              >
                <Gamepad2 className="h-7 w-7 text-primary" />
                 رحلتك التعليمية
              </Badge>

              <h1 className="text-5xl font-black leading-tight tracking-tight text-foreground md:text-7xl">
                أهلاً،
                <span className="mt-3 block text-primary">
                  {session.user.name ?? "أيها البطل"}
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                استمر في تطوير مهاراتك، اجمع نقاط الخبرة، وافتح مراحل جديدة
                داخل مغامرتك التعليمية.
              </p>

              {/* XP CARD */}
              <div className="mt-10 rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      التقدم للمستوى التالي
                    </p>

                    <h3 className="mt-1 text-3xl font-black">
                      المستوى {level}
                    </h3>

                    <p className="mt-2 text-sm text-primary">
                      {stats.levelLabel}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-primary/10 p-4">
                    <Crown className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <Progress
                  value={progress}
                  className="h-3 rounded-full"
                />

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">
                    {currentLevelXp} XP
                  </span>

                  <span className="font-medium text-muted-foreground">
                    {nextLevelXp} XP
                  </span>
                </div>

                <p className="mt-5 text-sm text-muted-foreground">
                  متبقي{" "}
                  <span className="font-bold text-primary">
                    {nextLevelXp - currentLevelXp} XP
                  </span>{" "}
                  للوصول للمستوى التالي
                </p>
              </div>
            </div>

            {/* RIGHT STATS */}
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  title: "الكورسات",
                  value: stats.totalCourses,
                  icon: BookOpen,
                },
                {
                  title: "نقاط الخبرة",
                  value:
                    stats.totalXp?.toLocaleString() || 0,
                  icon: Trophy,
                },
                {
                  title: "سلسلة النشاط",
                  value: stats.streak || 0,
                  icon: Flame,
                },
                {
                  title: "العملات",
                  value: stats.coins || 0,
                  icon: Coins,
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="
                    rounded-3xl
                    border-border/60
                    bg-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-primary/20
                    hover:shadow-md
                  "
                >
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="rounded-2xl bg-primary/10 p-3">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>

                      <div className="h-2 w-2 rounded-full bg-primary/40" />
                    </div>

                    <h2 className="text-4xl font-black tracking-tight text-foreground">
                      {item.value}
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.title}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12">
          {/* MISSIONS */}
          <div className="mb-10 flex items-center gap-3">
            <Target className="h-7 w-7 text-primary" />

            <h2 className="text-3xl font-black">
              المهام اليومية
            </h2>
          </div>

          <div className="mb-16 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "أكمل كورس جديد",
                progress: 70,
                reward: "+100 XP",
                icon: BookOpen,
              },
              {
                title: "حقق سلسلة نشاط",
                progress: 50,
                reward: "+50 Coins",
                icon: Flame,
              },
              {
                title: "شارك في تحدي جماعي",
                progress: 25,
                reward: "+200 XP",
                icon: Swords,
              },
            ].map((mission, index) => (
              <Card
                key={index}
                className="
                  rounded-3xl
                  border-border/60
                  bg-white
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-primary/20
                  hover:shadow-md
                "
              >
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="rounded-2xl bg-primary/10 p-3">
                      <mission.icon className="h-6 w-6 text-primary" />
                    </div>

                    <Badge
                      variant="secondary"
                      className="rounded-full"
                    >
                      {mission.reward}
                    </Badge>
                  </div>

                  <h3 className="mb-4 text-xl font-black">
                    {mission.title}
                  </h3>

                  <Progress
                    value={mission.progress}
                    className="h-3 rounded-full"
                  />

                  <p className="mt-3 text-sm text-muted-foreground">
                    نسبة الإنجاز: {mission.progress}%
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* COURSES */}
          <div className="mb-8 flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-primary" />

            <h2 className="text-3xl font-black">
              الكورسات النشطة
            </h2>
          </div>

          <MyCoursesClient
            courses={courses}
            stats={stats}
            studentName={session.user.name ?? "طالب"}
            studentImage={session.user.image ?? null}
          />
        </div>
      </section>
    </main>
  );
}