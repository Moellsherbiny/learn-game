import { redirect } from "next/navigation";

import Link from "next/link";

import {
  Crown,
  Medal,
  Trophy,
  Flame,
  Coins,
  Sparkles,
  ChevronLeft,
  BookOpen,
  GraduationCap,
  Users,
  Star,
} from "lucide-react";

import { auth } from "@/auth";

import { getLeaderboardAction } from "@/actions/leaderboard";

import { Card, CardContent } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";
import DashboardNavbar from "@/components/layout/navbar";
import DashboardFooter from "@/components/layout/dash-footer";

function getRankUI(rank: number) {
  if (rank === 1) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-yellow-100 text-yellow-500 shadow-sm">
        <Crown className="h-7 w-7" />
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 shadow-sm">
        <Medal className="h-7 w-7" />
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-100 text-orange-500 shadow-sm">
        <Trophy className="h-7 w-7" />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-sm font-black text-muted-foreground">
      #{rank}
    </div>
  );
}

export default async function LeaderboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const data = await getLeaderboardAction();

  if (!data) {
    redirect("/login");
  }

  const { students, teachers, currentUser } = data;

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <DashboardNavbar />
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.03),transparent_40%)]" />

      {/* HERO */}
      <section className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-12">
          {/* BREADCRUMB */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
            >
              الرئيسية
              <ChevronLeft className="h-4 w-4" />
            </Link>

            <span className="text-muted-foreground">/</span>

            <span className="font-medium">لوحة المتصدرين</span>
          </div>

          {/* TITLE */}
          <div className="text-center">
            <Badge className="mb-5 rounded-full px-5 py-2">
              <Sparkles className="ml-2 h-4 w-4" />
              المنافسة التعليمية
            </Badge>

            <h1 className="text-5xl font-black tracking-tight md:text-6xl">
              لوحة
              <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {" "}
                المتصدرين
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              تنافس، اجمع الخبرات، واصعد إلى قمة النظام التعليمي.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        {/* CURRENT USER */}
        {currentUser && (
          <Card className="mb-10 overflow-hidden rounded-[32px] border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5">
                  {getRankUI(currentUser.rank)}

                  <Avatar className="h-20 w-20 border-4 border-white shadow-sm">
                    <AvatarImage src={currentUser.image ?? ""} />

                    <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-sm text-primary">ترتيبك الحالي</p>

                    <h2 className="mt-1 text-3xl font-black">
                      {currentUser.name}
                    </h2>

                    <p className="mt-2 text-muted-foreground">
                      المركز #{currentUser.rank}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <InfoBadge
                    icon={<Sparkles className="h-4 w-4" />}
                    value={`${currentUser.xp.toLocaleString()} XP`}
                  />

                  <InfoBadge
                    icon={<Coins className="h-4 w-4" />}
                    value={`${currentUser.coins}`}
                  />

                  <InfoBadge
                    icon={<Star className="h-4 w-4" />}
                    value={`Lv.${currentUser.level}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TABS */}
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-2 rounded-2xl bg-muted/40 p-1">
            <TabsTrigger value="students" className="rounded-xl">
              <GraduationCap className="ml-2 h-4 w-4" />
              الطلاب
            </TabsTrigger>

            <TabsTrigger value="teachers" className="rounded-xl">
              <BookOpen className="ml-2 h-4 w-4" />
              المدرسون
            </TabsTrigger>
          </TabsList>

          {/* STUDENTS */}
          <TabsContent value="students">
            <LeaderboardList data={students} type="student" />
          </TabsContent>

          {/* TEACHERS */}
          <TabsContent value="teachers">
            <LeaderboardList data={teachers} type="teacher" />
          </TabsContent>
        </Tabs>
      </section>
      <DashboardFooter />
    </main>
  );
}

function LeaderboardList({
  data,
  type,
}: {
  data: any[];

  type: "student" | "teacher";
}) {
  const topThree = data.slice(0, 3);

  const others = data.slice(3);

  return (
    <>
      {/* TOP 3 */}
      <div className="mb-12 grid gap-6 lg:grid-cols-3">
        {topThree.map((user, index) => (
          <Card
            key={user.id}
            className={cn(
              "overflow-hidden rounded-[32px] border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md",

              index === 0 && "border-yellow-200 bg-yellow-50/40",

              index === 1 && "border-slate-200 bg-slate-50/40",

              index === 2 && "border-orange-200 bg-orange-50/40",
            )}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-5 flex justify-center">
                {getRankUI(user.rank)}
              </div>

              <Avatar className="mx-auto mb-5 h-28 w-28 border-4 border-white shadow-md">
                <AvatarImage src={user.image ?? ""} />

                <AvatarFallback className="text-2xl font-black">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-2xl font-black">{user.name}</h2>

              <Badge className="mt-3 rounded-full">المستوى {user.level}</Badge>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">XP</span>

                  <span className="font-bold text-primary">
                    {user.xp.toLocaleString()}
                  </span>
                </div>

                <Progress
                  value={user.levelProgress}
                  className="h-3 rounded-full"
                />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <MiniStat
                  icon={<Coins className="h-4 w-4" />}
                  value={user.coins}
                />

                {type === "student" ? (
                  <>
                    <MiniStat
                      icon={<Flame className="h-4 w-4" />}
                      value={user.streak}
                    />

                    <MiniStat
                      icon={<BookOpen className="h-4 w-4" />}
                      value={user.completedLessons}
                    />
                  </>
                ) : (
                  <>
                    <MiniStat
                      icon={<BookOpen className="h-4 w-4" />}
                      value={user.totalCourses}
                    />

                    <MiniStat
                      icon={<Users className="h-4 w-4" />}
                      value={user.totalStudents}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* OTHERS */}
      <div className="space-y-4">
        {others.map((user) => (
          <Card
            key={user.id}
            className={cn(
              "rounded-3xl border-border/60 bg-white shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md",

              user.isCurrentUser && "border-primary/20 bg-primary/5",
            )}
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5">
                  {getRankUI(user.rank)}

                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                    <AvatarImage src={user.image ?? ""} />

                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="text-xl font-black">{user.name}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      المستوى {user.level}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <InfoBadge
                    icon={<Sparkles className="h-4 w-4" />}
                    value={`${user.xp.toLocaleString()} XP`}
                  />

                  <InfoBadge
                    icon={<Coins className="h-4 w-4" />}
                    value={`${user.coins}`}
                  />

                  {type === "student" ? (
                    <>
                      <InfoBadge
                        icon={<Flame className="h-4 w-4" />}
                        value={`${user.streak} يوم`}
                      />

                      <InfoBadge
                        icon={<BookOpen className="h-4 w-4" />}
                        value={`${user.completedLessons} درس`}
                      />
                    </>
                  ) : (
                    <>
                      <InfoBadge
                        icon={<BookOpen className="h-4 w-4" />}
                        value={`${user.totalCourses} كورس`}
                      />

                      <InfoBadge
                        icon={<Users className="h-4 w-4" />}
                        value={`${user.totalStudents} طالب`}
                      />
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function MiniStat({
  icon,
  value,
}: {
  icon: React.ReactNode;

  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white/70 p-3 text-center">
      <div className="mb-2 flex justify-center text-primary">{icon}</div>

      <p className="text-sm font-black">{value}</p>
    </div>
  );
}

function InfoBadge({
  icon,
  value,
}: {
  icon: React.ReactNode;

  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-4 py-2 text-sm">
      <div className="text-primary">{icon}</div>

      <span className="font-bold">{value}</span>
    </div>
  );
}
