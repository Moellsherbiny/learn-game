"use client";
import {
  Zap,
  CheckCircle2,
  Star,
  Trophy,
  BookOpen,
  Flame,
  Rocket,
  Sparkles,
  PlayCircle,
  Clock3,
  User,
  ArrowLeft,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  EnrolledCourseData,
  MyCoursesStats,
} from "@/actions/student/my-courses";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────
interface MyCoursesClientProps {
  courses: EnrolledCourseData[];
  stats: MyCoursesStats;
  studentName: string;
  studentImage: string | null;
}

type FilterTab = "all" | "in_progress" | "completed" | "not_started";
type SortOption = "recent" | "progress" | "xp" | "name";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date | null): string {
  if (!date) return "لم تبدأ بعد";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return new Date(date).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
  });
}

function IconBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl",
        "bg-primary/10 text-primary",
        "h-10 w-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
function getCourseStatus(course: EnrolledCourseData): FilterTab {
  if (course.totalLessons === 0) return "not_started";
  if (course.completedLessons === 0) return "not_started";
  if (course.completedLessons >= course.totalLessons) return "completed";
  return "in_progress";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  sub,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border p-5 flex flex-col gap-1",
        "bg-white border-border/60 shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
      )}
    >
      <div
        className={cn(
          "absolute -top-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-10",
          color,
        )}
      />

      <IconBox>{icon}</IconBox>

      <span className="text-3xl font-black text-foreground leading-none">
        {value}
      </span>

      <span className="text-sm text-muted-foreground font-medium">{label}</span>

      {sub && <span className="text-xs text-muted-foreground/70">{sub}</span>}
    </div>
  );
}

function XpLevelBar({ stats }: { stats: MyCoursesStats }) {
  return (
    <div className="bg-white border border-border/60 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-sm">
            {stats.level}
          </div>

          <div>
            <p className="text-foreground font-bold text-sm">
              {stats.levelLabel}
            </p>

            <p className="text-muted-foreground text-xs">
              المستوى {stats.level}
            </p>
          </div>
        </div>

        <div className="text-left">
          <p className="text-primary font-black text-xl leading-none">
            {stats.totalXp.toLocaleString()}
          </p>

          <p className="text-muted-foreground text-xs text-left">XP إجمالي</p>
        </div>
      </div>

      <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${stats.levelProgress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{stats.levelProgress}% للمستوى التالي</span>

        <span>{stats.nextLevelXp.toLocaleString()} XP</span>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: EnrolledCourseData }) {
  const status = getCourseStatus(course);
  const progressPct =
    course.totalLessons === 0
      ? 0
      : Math.round((course.completedLessons / course.totalLessons) * 100);
  const xpPct =
    course.totalXpAvailable === 0
      ? 0
      : Math.round((course.xpEarned / course.totalXpAvailable) * 100);

  return (
    <Link
      href={`/student/courses/${course.id}`}
      className="
group block
bg-white
border border-border/60
rounded-3xl
overflow-hidden
shadow-sm
hover:shadow-md
hover:-translate-y-1
hover:border-primary/20
transition-all duration-300
"
    >
      {/* Thumbnail / Header */}
      <div className="relative h-36 bg-muted/40 overflow-hidden">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            loading="eager"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl opacity-20 group-hover:opacity-30 transition-opacity">
              <BookOpen className="h-14 w-14 text-primary/20" />
            </div>
            {/* Decorative grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-size-[20px_20px]" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={status} />
        </div>

        {/* Streak badge */}
        {course.streakDays > 1 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-orange-500/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-bold text-white">
            <Flame className="h-3 w-3 fill-white" /> {course.streakDays}
          </div>
        )}

        {/* Progress overlay bar at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-900/60">
          <div
            className={cn(
              "h-full transition-all duration-700",
              status === "completed" ? "bg-emerald-400" : "bg-primary",
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Teacher */}
        <div className="flex items-center gap-1.5 mb-2">
          {course.teacher.image ? (
            <Image
              src={course.teacher.image}
              alt={course.teacher.name ?? ""}
              width={16}
              height={16}
              sizes="16x16"
              loading="eager"
              className="rounded-full"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          <span className="text-slate-500 text-xs">
            {course.teacher.name ?? "معلم"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-primary font-bold text-base leading-snug line-clamp-2 mb-3 transition-colors">
          {course.title}
        </h3>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <MiniStat
            icon={<BookOpen className="h-4 w-4 text-primary" />}
            value={`${course.completedLessons}/${course.totalLessons}`}
            label="درس"
          />
          <MiniStat
            icon={<Zap className="h-4 w-4 text-primary" />}
            value={`${course.xpEarned}`}
            label="XP"
            color="text-amber-400"
          />
          <MiniStat
            icon={<Star className="h-4 w-4 text-amber-400" />}
            value={`${course.totalStars}/${course.maxStars}`}
            label="نجوم"
            color="text-amber-400"
          />
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
            <span>التقدم الكلي</span>
            <span
              className={cn(
                "font-bold",
                progressPct === 100 ? "text-emerald-400" : "text-slate-300",
              )}
            >
              {progressPct}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                status === "completed" ? "bg-emerald-400" : "bg-primary",
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Footer: last activity + CTA */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-600">
            {formatRelativeTime(course.lastActivityAt)}
          </span>
          {status !== "completed" && course.nextLesson && (
            <span className="text-xs text-violet-400 font-medium group-hover:text-violet-300 transition-colors flex items-center gap-1">
              استمر في التعلم <PlayCircle className="h-4 w-4 inline-block" />
            </span>
          )}
          {status === "completed" && (
            <span className="text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 inline-block" />
              مكتمل
            </span>
          )}
          {status === "not_started" && (
            <span className="text-xs text-cyan-400 font-medium flex items-center gap-1">
              ابدأ الآن <ArrowLeft className="h-4 w-4 inline-block" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function MiniStat({
  icon,
  value,
  label,
  color = "text-foreground",
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <div className="bg-muted/40 rounded-2xl p-3 text-center border border-border/40">
      <IconBox className="h-8 w-8 rounded-xl mx-auto mb-2">{icon}</IconBox>

      <div className={cn("font-bold text-sm leading-tight", color)}>
        {value}
      </div>

      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: FilterTab }) {
  const map: Record<FilterTab, { label: string; className: string }> = {
    all: { label: "", className: "" },

    completed: {
      label: "✓ مكتمل",
      className: "bg-green-100 text-green-700",
    },

    in_progress: {
      label: "● جاري",
      className: "bg-orange-100 text-orange-700",
    },

    not_started: {
      label: "جديدة",
      className: "bg-muted text-muted-foreground",
    },
  };
  const { label, className } = map[status];
  if (!label) return null;
  return (
    <span
      className={cn(
        "text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm",
        className,
      )}
    >
      {label}
    </span>
  );
}

function EmptyState({ filter }: { filter: FilterTab }) {
  const messages: Record<
    FilterTab,
    { icon: React.ReactNode; title: string; sub: string }
  > = {
    all: {
      icon: <Rocket className="h-8 w-8 text-primary" />,
      title: "لم تسجل في أي دورة تعليمية بعد",
      sub: "استعرض الدورات التعليمية المتاحة وابدأ رحلتك!",
    },
    in_progress: {
      icon: <Rocket className="h-8 w-8 text-primary" />,
      title: "لا يوجد دورة تعليميةات جارية",
      sub: "ابدأ دورة تعليميةاً جديدةاً لتظهر هنا",
    },
    completed: {
      icon: <Trophy className="h-8 w-8 text-primary" />,
      title: "لم تكمل أي دورة تعليمية بعد",
      sub: "استمر في التعلم لتملأ هذه الصفحة بالإنجازات!",
    },
    not_started: {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "كل دورة تعليميةاتك جارية",
      sub: "أنت منتظم، استمر هكذا!",
    },
  };
  const { icon, title, sub } = messages[filter];
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <IconBox>{icon}</IconBox>
      <p className="text-slate-400 font-medium mb-1">{title}</p>
      <p className="text-slate-600 text-sm">{sub}</p>
      <Link
        href="/courses"
        className="mt-4 px-5 py-2.5 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-xl text-sm font-medium hover:bg-violet-600/30 transition-colors"
      >
        استعرض الدورات التعليمية →
      </Link>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MyCoursesClient({
  courses,
  stats,
  studentName,
  studentImage,
}: MyCoursesClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const tabs: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "الكل", icon: <Rocket size={18} /> },
    { key: "in_progress", label: "جاري", icon: <Flame size={18} /> },
    { key: "completed", label: "مكتمل", icon: <CheckCircle2 size={18} /> },
    { key: "not_started", label: "لم يبدأ", icon: <Sparkles size={18} /> },
  ];

  const tabCounts = useMemo(
    () => ({
      all: courses.length,
      in_progress: courses.filter((c) => getCourseStatus(c) === "in_progress")
        .length,
      completed: courses.filter((c) => getCourseStatus(c) === "completed")
        .length,
      not_started: courses.filter((c) => getCourseStatus(c) === "not_started")
        .length,
    }),
    [courses],
  );

  const filtered = useMemo(() => {
    let list =
      activeFilter === "all"
        ? courses
        : courses.filter((c) => getCourseStatus(c) === activeFilter);

    switch (sortBy) {
      case "recent":
        return [...list].sort(
          (a, b) =>
            (b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0) -
            (a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0),
        );
      case "progress":
        return [...list].sort(
          (a, b) =>
            b.completedLessons / Math.max(b.totalLessons, 1) -
            a.completedLessons / Math.max(a.totalLessons, 1),
        );
      case "xp":
        return [...list].sort((a, b) => b.xpEarned - a.xpEarned);
      case "name":
        return [...list].sort((a, b) => a.title.localeCompare(b.title, "ar"));
    }
  }, [courses, activeFilter, sortBy]);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "صباح الخير"
      : greetingHour < 18
        ? "مساء الخير"
        : "مساء النور";

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Starfield background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: (i % 3 === 0 ? 2 : 1) + "px",
              height: (i % 3 === 0 ? 2 : 1) + "px",
              top: ((i * 37 + 11) % 100) + "%",
              left: ((i * 53 + 7) % 100) + "%",
              animationDelay: ((i * 0.3) % 3) + "s",
              animationDuration: 2 + (i % 3) + "s",
              opacity: 0.1 + (i % 5) * 0.08,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 md:py-10">
        {/* ── Top Nav ── */}
        <nav className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {studentImage ? (
              <Image
                src={studentImage}
                alt={studentName}
                width={40}
                height={40}
                sizes="40x40"
                loading="eager"
                className="rounded-xl border-2 border-violet-500/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                {studentName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-slate-400 text-xs">{greeting}،</p>
              <p className="text-foreground font-bold text-sm leading-tight">
                {studentName}
              </p>
            </div>
          </div>
          <Button variant="default" asChild>
            <Link href="/courses">
              <span>+</span>
              <span>دورة تعليمية جديدة</span>
            </Link>
          </Button>
        </nav>

        {/* ── Hero stats ── */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black mb-1 bg-linear-to-l from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            دوراتي التعليمية
          </h1>
          <p className="text-slate-500 text-sm mb-5">
            {courses.length === 0
              ? "ابدأ رحلتك التعليمية الآن"
              : `${courses.length} دورة تعليمية مسجل · استمر في التعلم!`}
          </p>

          {/* XP bar */}
          <XpLevelBar stats={stats} />
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            icon={<Zap className="h-8 w-8 text-primary" />}
            value={stats.totalXp.toLocaleString()}
            label="نقاط XP"
            sub="مجموع الكل"
            color="bg-amber-400"
          />
          <StatCard
            icon={<CheckCircle2 className="h-8 w-8 text-emerald-400" />}
            value={stats.completedLessons}
            label="درس مكتمل"
            sub="في كل الدورات التعليمية"
            color="bg-emerald-400"
          />
          <StatCard
            icon={<Star className="h-8 w-8 text-amber-400" />}
            value={stats.totalStars}
            label="نجمة مكتسبة"
            sub="مجموع النجوم"
            color="bg-amber-300"
          />
          <StatCard
            icon={<Trophy className="h-8 w-8 text-primary" />}
            value={stats.rank ? `#${stats.rank}` : "—"}
            label="الترتيب"
            sub="في لوحة الصدارة"
            color="bg-violet-400"
          />
        </div>

        {/* ── Filter Tabs + Sort ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          {/* Tabs */}
          <div
            className="
flex items-center gap-1
bg-muted/50
border border-border/60
rounded-2xl
p-1
"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  activeFilter === tab.key
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white",
                )}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {tabCounts[tab.key] > 0 && (
                  <span
                    className={cn(
                      "text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center",
                      activeFilter === tab.key
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white",
                    )}
                  >
                    {tabCounts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="
w-full appearance-none
rounded-2xl
border border-border/60
bg-white
px-3 py-2 pr-3 pl-8
text-xs text-foreground
cursor-pointer
focus:outline-none
focus:border-primary/40
"
            >
              <option value="recent">الأحدث نشاطاً</option>
              <option value="progress">الأعلى تقدماً</option>
              <option value="xp">الأعلى XP</option>
              <option value="name">الاسم</option>
            </select>

            <ChevronDown className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* ── Courses Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          )}
        </div>

        {/* ── In-progress next lesson quick-access ── */}
        {courses.some(
          (c) => getCourseStatus(c) === "in_progress" && c.nextLesson,
        ) && (
          <div
            className="mt-8
bg-muted/30
border border-border/60
rounded-3xl
p-5"
          >
            <p className="text-slate-400 text-xs mb-3 font-medium">
              ⚡ تابع من حيث توقفت
            </p>
            <div className="flex flex-wrap gap-2">
              {courses
                .filter(
                  (c) => getCourseStatus(c) === "in_progress" && c.nextLesson,
                )
                .slice(0, 3)
                .map((course) => (
                  <Link
                    key={course.id}
                    href={`/student/courses/${course.id}/learn/${course.nextLesson!.id}`}
                    className="flex items-center gap-2 bg-white border border-border/60 hover:border-primary/20
rounded-2xl
px-3 py-2
text-xs text-foreground
hover:text-primary
transition-all
group
shadow-sm
"
                  >
                    <span className="text-violet-400 group-hover:scale-110 transition-transform">
                      <PlayCircle className="h-4 w-4 text-primary" />
                    </span>
                    <span className="font-medium line-clamp-1 max-w-35">
                      {course.nextLesson!.title}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 truncate max-w-20">
                      {course.title}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
