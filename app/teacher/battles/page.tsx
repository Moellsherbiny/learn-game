"use server";

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Swords,
  Plus,
  Users,
  Trophy,
  Play,
  Pencil,
  Clock3,
  ArrowLeft,
  Radio,
  CalendarDays,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

import { auth } from "@/auth";
import { getTeacherBattleRoomsAction } from "@/actions/battle";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function TeacherBattlesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "TEACHER") {
    redirect("/");
  }

  const rooms = await getTeacherBattleRoomsAction();

  const liveRooms = rooms.filter(
    (room) => room.status === "LIVE",
  );

  const waitingRooms = rooms.filter(
    (room) => room.status === "WAITING",
  );

  const finishedRooms = rooms.filter(
    (room) => room.status === "FINISHED",
  );

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <header className="mb-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Swords className="h-6 w-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    ساحات التحدي
                  </h1>

                  {liveRooms.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="hidden rounded-full sm:flex"
                    >
                      <Radio className="mr-1.5 h-3 w-3" />
                      مباشر
                    </Badge>
                  )}
                </div>

                <p className="mt-1.5 text-sm text-muted-foreground">
                  أنشئ تحديات تنافسية وتابع أداء طلابك في الوقت الفعلي.
                </p>
              </div>

            </div>

            <Button
              asChild
              className="h-11 rounded-xl px-5 font-semibold"
            >
              <Link href="/teacher/battles/new">
                <Plus className="mr-2 h-4 w-4" />
                إنشاء تحدي
              </Link>
            </Button>

          </div>
        </header>

        {/* ================================================== */}
        {/* OVERVIEW */}
        {/* ================================================== */}

        {rooms.length > 0 && (
          <section className="mb-8">

            <div className="grid grid-cols-2 divide-x divide-border overflow-hidden rounded-2xl border bg-background shadow-sm sm:grid-cols-4">

              <OverviewItem
                label="إجمالي التحديات"
                value={rooms.length}
              />

              <OverviewItem
                label="بانتظار البدء"
                value={waitingRooms.length}
                active={waitingRooms.length > 0}
              />

              <OverviewItem
                label="مباشرة الآن"
                value={liveRooms.length}
                active={liveRooms.length > 0}
              />

              <OverviewItem
                label="منتهية"
                value={finishedRooms.length}
              />

            </div>

          </section>
        )}

        {/* ================================================== */}
        {/* LIVE SECTION */}
        {/* ================================================== */}

        {liveRooms.length > 0 && (
          <section className="mb-10">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

                  <h2 className="font-bold">
                    التحديات المباشرة
                  </h2>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  تحديات جارية الآن وتحتاج إلى متابعتك.
                </p>
              </div>

              <Badge
                variant="outline"
                className="rounded-full"
              >
                {liveRooms.length} مباشر
              </Badge>

            </div>

            <div className="grid gap-4">

              {liveRooms.map((room) => (
                <LiveBattleCard
                  key={room.id}
                  room={room}
                />
              ))}

            </div>

          </section>
        )}

        {/* ================================================== */}
        {/* WAITING SECTION */}
        {/* ================================================== */}

        {waitingRooms.length > 0 && (
          <section className="mb-10">

            <SectionHeader
              title="بانتظار البدء"
              description="التحديات الجاهزة لاستقبال الطلاب وبدء المباراة."
              count={waitingRooms.length}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {waitingRooms.map((room) => (
                <BattleCard
                  key={room.id}
                  room={room}
                />
              ))}

            </div>

          </section>
        )}

        {/* ================================================== */}
        {/* FINISHED SECTION */}
        {/* ================================================== */}

        {finishedRooms.length > 0 && (
          <section>

            <SectionHeader
              title="التحديات السابقة"
              description="راجع نتائج التحديات التي انتهت."
              count={finishedRooms.length}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {finishedRooms.slice(0, 6).map((room) => (
                <BattleCard
                  key={room.id}
                  room={room}
                />
              ))}

            </div>

            {finishedRooms.length > 6 && (
              <div className="mt-5 text-center">
                <Button
                  variant="outline"
                  className="rounded-xl"
                >
                  عرض جميع التحديات السابقة
                  <ChevronLeft className="mr-2 h-4 w-4" />
                </Button>
              </div>
            )}

          </section>
        )}

        {/* ================================================== */}
        {/* EMPTY STATE */}
        {/* ================================================== */}

        {rooms.length === 0 && (
          <Card className="overflow-hidden rounded-3xl border bg-background shadow-sm">

            <CardContent className="flex min-h-130 flex-col items-center justify-center px-6 text-center">

              <div className="relative mb-7">

                <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 text-primary">
                  <Swords className="h-11 w-11" />
                </div>

                <div className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-xl border bg-background shadow-sm">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </div>

              </div>

              <h2 className="text-2xl font-bold">
                ابدأ أول تحدي لطلابك
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                أنشئ تحديًا، اختر الأسئلة والطلاب، ثم ابدأ المباراة
                وتابع النتائج في الوقت الفعلي.
              </p>

              <Button
                asChild
                size="lg"
                className="mt-8 h-11 rounded-xl px-6"
              >
                <Link href="/teacher/battles/new">
                  <Plus className="mr-2 h-4 w-4" />
                  إنشاء أول تحدي
                </Link>
              </Button>

            </CardContent>
          </Card>
        )}

      </div>
    </main>
  );
}

/* ====================================================== */
/* OVERVIEW ITEM */
/* ====================================================== */

function OverviewItem({
  label,
  value,
  active = false,
}: {
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <div className="min-w-0 px-4 py-4 sm:px-6">

      <p className="truncate text-xs text-muted-foreground">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-2xl font-bold tracking-tight",
          active ? "text-primary" : "",
        ].join(" ")}
      >
        {value}
      </p>

    </div>
  );
}

/* ====================================================== */
/* SECTION HEADER */
/* ====================================================== */

function SectionHeader({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count: number;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">

      <div>
        <h2 className="text-lg font-bold">
          {title}
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <Badge
        variant="secondary"
        className="shrink-0 rounded-full"
      >
        {count}
      </Badge>

    </div>
  );
}

/* ====================================================== */
/* LIVE CARD */
/* ====================================================== */

function LiveBattleCard({
  room,
}: {
  room: any;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-red-500/20 bg-background shadow-sm">

      <div className="h-1 bg-red-500" />

      <CardContent className="p-5 sm:p-6">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          {/* INFO */}

          <div className="min-w-0">

            <div className="mb-3 flex flex-wrap items-center gap-2">

              <Badge
                variant="destructive"
                className="rounded-full"
              >
                <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                مباشر الآن
              </Badge>

              <Badge
                variant="outline"
                className="rounded-full font-mono text-xs"
              >
                {room.code}
              </Badge>

            </div>

            <h3 className="truncate text-xl font-bold">
              {room.title}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              السؤال {room.currentQuestion + 1} من{" "}
              {room.questions.length}
            </p>

          </div>

          {/* STATS */}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

            <MiniStat
              icon={Users}
              value={room.participants.length}
              label="طلاب"
            />

            <MiniStat
              icon={Trophy}
              value={room.questions.length}
              label="أسئلة"
            />

            <MiniStat
              icon={Clock3}
              value={room.currentQuestion + 1}
              label="السؤال"
            />

          </div>

          {/* ACTION */}

          <Button
            asChild
            size="lg"
            className="h-11 shrink-0 rounded-xl px-6"
          >
            <Link href={`/teacher/battles/${room.id}`}>
              <Play className="mr-2 h-4 w-4" />
              متابعة التحدي
              <ArrowLeft className="ml-2 h-4 w-4" />
            </Link>
          </Button>

        </div>

      </CardContent>
    </Card>
  );
}

/* ====================================================== */
/* NORMAL CARD */
/* ====================================================== */

function BattleCard({
  room,
}: {
  room: any;
}) {
  const isWaiting = room.status === "WAITING";

  return (
    <Card className="group flex h-full flex-col rounded-2xl border bg-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <CardHeader className="pb-4">

        <div className="flex items-center justify-between gap-3">

          <Badge
            variant={isWaiting ? "secondary" : "outline"}
            className="rounded-full"
          >
            {isWaiting ? (
              <>
                <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                بانتظار البدء
              </>
            ) : (
              <>
                <Trophy className="mr-1.5 h-3.5 w-3.5" />
                منتهي
              </>
            )}
          </Badge>

          <span className="font-mono text-xs text-muted-foreground">
            {room.code}
          </span>

        </div>

        <div className="pt-3">

          <h3 className="line-clamp-2 text-lg font-bold leading-7">
            {room.title}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">

            <CalendarDays className="h-3.5 w-3.5" />

            {new Date(room.createdAt).toLocaleDateString(
              "ar-EG",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              },
            )}

          </div>

        </div>

      </CardHeader>

      <CardContent className="mt-auto">

        <div className="grid grid-cols-2 divide-x overflow-hidden rounded-xl border bg-muted/20">

          <MiniStat
            icon={Users}
            value={room.participants.length}
            label="طلاب"
          />

          <MiniStat
            icon={Trophy}
            value={room.questions.length}
            label="أسئلة"
          />

        </div>

        <div className="mt-4 flex gap-2">

          <Button
            asChild
            className="h-10 flex-1 rounded-xl"
          >
            <Link href={`/teacher/battles/${room.id}`}>
              {isWaiting ? "إدارة الغرفة" : "عرض النتائج"}
              <ArrowLeft className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {isWaiting && (
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl"
            >
              <Link
                href={`/teacher/battles/${room.id}/edit`}
                aria-label="تعديل التحدي"
              >
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          )}

        </div>

      </CardContent>
    </Card>
  );
}

/* ====================================================== */
/* MINI STAT */
/* ====================================================== */

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-3">

      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

      <div className="min-w-0">
        <p className="text-sm font-bold">
          {value}
        </p>

        <p className="text-[10px] text-muted-foreground">
          {label}
        </p>
      </div>

    </div>
  );
}