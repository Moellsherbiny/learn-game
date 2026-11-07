"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flame,
  PlayCircle,
  Sparkles,
  Star,
  Trophy,
  User,
  Zap,
} from "lucide-react";

import {
  EnrolledCourseData,
  MyCoursesStats,
} from "@/actions/student/my-courses";

import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

/* ============================================================
   TYPES
============================================================ */

interface MyCoursesClientProps {
  courses: EnrolledCourseData[];
  stats: MyCoursesStats;
  studentName: string;
  studentImage: string | null;
}

type FilterTab =
  | "all"
  | "in_progress"
  | "completed"
  | "not_started";

type SortOption =
  | "recent"
  | "progress"
  | "xp"
  | "name";

/* ============================================================
   HELPERS
============================================================ */

function getCourseStatus(
  course: EnrolledCourseData,
): FilterTab {
  if (course.totalLessons === 0) {
    return "not_started";
  }

  if (course.completedLessons === 0) {
    return "not_started";
  }

  if (
    course.completedLessons >=
    course.totalLessons
  ) {
    return "completed";
  }

  return "in_progress";
}

function getProgress(
  course: EnrolledCourseData,
) {
  if (course.totalLessons <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (course.completedLessons /
          course.totalLessons) *
          100,
      ),
    ),
  );
}

function formatRelativeTime(
  date: Date | null,
): string {
  if (!date) {
    return "لم تبدأ بعد";
  }

  const diff =
    Date.now() -
    new Date(date).getTime();

  const mins = Math.floor(
    diff / 60000,
  );

  if (mins < 1) {
    return "الآن";
  }

  if (mins < 60) {
    return `منذ ${mins} دقيقة`;
  }

  const hrs = Math.floor(
    mins / 60,
  );

  if (hrs < 24) {
    return `منذ ${hrs} ساعة`;
  }

  const days = Math.floor(
    hrs / 24,
  );

  if (days < 7) {
    return `منذ ${days} يوم`;
  }

  return new Date(
    date,
  ).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
  });
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: FilterTab;
}) {
  const config: Record<
    FilterTab,
    {
      label: string;
      icon: React.ReactNode;
    }
  > = {
    all: {
      label: "",
      icon: null,
    },

    in_progress: {
      label: "قيد التعلم",
      icon: (
        <Clock3 className="h-3 w-3" />
      ),
    },

    completed: {
      label: "مكتملة",
      icon: (
        <CheckCircle2 className="h-3 w-3" />
      ),
    },

    not_started: {
      label: "لم تبدأ",
      icon: (
        <Sparkles className="h-3 w-3" />
      ),
    },
  };

  const item = config[status];

  if (!item.label) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className="
        gap-1
        rounded-full
        border
        border-background/70
        bg-background/90
        px-2.5
        py-1
        text-[10px]
        font-bold
        text-foreground
        shadow-sm
        backdrop-blur-sm
      "
    >
      {item.icon}
      {item.label}
    </Badge>
  );
}

/* ============================================================
   COURSE CARD
============================================================ */

function CourseCard({
  course,
}: {
  course: EnrolledCourseData;
}) {
  const status =
    getCourseStatus(course);

  const progress =
    getProgress(course);

  const xpProgress =
    course.totalXpAvailable > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (course.xpEarned /
                course.totalXpAvailable) *
                100,
            ),
          ),
        )
      : 0;

  return (
    <Link
      href={`/student/courses/${course.id}`}
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-border/60
        bg-background
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/30
        hover:shadow-md
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
        focus-visible:ring-offset-2
      "
    >
      {/* ======================================================
          THUMBNAIL
      ======================================================= */}

      <div className="relative h-44 shrink-0 overflow-hidden bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1024px) 50vw,
              33vw
            "
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/4">
            <BookOpen
              className="
                h-16
                w-16
                text-primary/20
                transition-transform
                duration-500
                group-hover:scale-110
              "
            />
          </div>
        )}

        {/* Soft overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/35 to-transparent" />

        {/* Status */}
        <div className="absolute right-3 top-3">
          <StatusBadge status={status} />
        </div>

        {/* Streak */}
        {course.streakDays > 1 && (
          <div
            className="
              absolute
              left-3
              top-3
              flex
              items-center
              gap-1
              rounded-full
              border
              border-background/70
              bg-background/90
              px-2.5
              py-1
              text-[10px]
              font-bold
              text-foreground
              shadow-sm
              backdrop-blur-sm
            "
          >
            <Flame className="h-3 w-3 text-primary" />
            {course.streakDays}
          </div>
        )}

        {/* Progress */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-background/50">
          <div
            className="
              h-full
              rounded-full
              bg-primary
              transition-all
              duration-700
            "
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* ======================================================
          BODY
      ======================================================= */}

      <div className="flex flex-1 flex-col p-5">
        {/* Teacher */}
        <div className="mb-2 flex items-center gap-2">
          {course.teacher.image ? (
            <Image
              src={course.teacher.image}
              alt={
                course.teacher.name ??
                "المعلم"
              }
              width={20}
              height={20}
              className="rounded-full object-cover"
            />
          ) : (
            <div
              className="
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                bg-muted
              "
            >
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
          )}

          <span className="truncate text-xs text-muted-foreground">
            {course.teacher.name ??
              "المعلم"}
          </span>
        </div>

        {/* Title */}
        <h3
          className="
            line-clamp-2
            min-h-11
            text-lg
            font-black
            leading-snug
            text-foreground
            transition-colors
            group-hover:text-primary
          "
        >
          {course.title}
        </h3>

        {/* Description */}
        {course.description && (
          <p
            className="
              mt-2
              line-clamp-2
              text-xs
              leading-5
              text-muted-foreground
            "
          >
            {course.description}
          </p>
        )}

        {/* ====================================================
            COURSE STATS
        ===================================================== */}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniStat
            icon={
              <BookOpen className="h-4 w-4" />
            }
            value={`${course.completedLessons}/${course.totalLessons}`}
            label="درس"
          />

          <MiniStat
            icon={
              <Zap className="h-4 w-4" />
            }
            value={course.xpEarned.toLocaleString()}
            label="XP"
          />

          <MiniStat
            icon={
              <Star className="h-4 w-4" />
            }
            value={`${course.totalStars}/${course.maxStars}`}
            label="نجوم"
          />
        </div>

        {/* ====================================================
            PROGRESS
        ===================================================== */}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              التقدم
            </span>

            <span className="text-xs font-bold text-foreground">
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="
                h-full
                rounded-full
                bg-primary
                transition-all
                duration-700
              "
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* XP Progress */}
        {course.totalXpAvailable > 0 && (
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              {course.xpEarned.toLocaleString()} XP
            </span>

            <span>
              من{" "}
              {course.totalXpAvailable.toLocaleString()}
            </span>
          </div>
        )}

        {/* ====================================================
            NEXT LESSON
        ===================================================== */}

        {status !== "completed" &&
          course.nextLesson && (
            <div
              className="
                mt-5
                rounded-2xl
                border
                border-border/60
                bg-muted/40
                p-3
              "
            >
              <div className="mb-1 flex items-center gap-1.5">
                <PlayCircle className="h-3.5 w-3.5 text-primary" />

                <span className="text-[10px] font-bold text-muted-foreground">
                  الدرس التالي
                </span>
              </div>

              <p className="line-clamp-1 text-xs font-bold text-foreground">
                {course.nextLesson.title}
              </p>

              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                {course.nextLesson.moduleTitle}
              </p>
            </div>
          )}

        {/* ====================================================
            FOOTER
        ===================================================== */}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(
              course.lastActivityAt,
            )}
          </span>

          {status === "completed" ? (
            <span className="flex items-center gap-1 text-xs font-bold text-primary">
              <CheckCircle2 className="h-4 w-4" />
              مكتملة
            </span>
          ) : status === "not_started" ? (
            <span className="flex items-center gap-1 text-xs font-bold text-primary transition-transform group-hover:-translate-x-1">
              ابدأ الآن
              <ArrowLeft className="h-4 w-4" />
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-primary transition-transform group-hover:-translate-x-1">
              متابعة التعلم
              <ArrowLeft className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   MINI STAT
============================================================ */

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-border/50
        bg-muted/30
        p-2.5
        text-center
      "
    >
      <div className="mb-1 flex justify-center text-primary">
        {icon}
      </div>

      <p className="text-xs font-black text-foreground">
        {value}
      </p>

      <p className="mt-0.5 text-[9px] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  filter,
}: {
  filter: FilterTab;
}) {
  const messages: Record<
    FilterTab,
    {
      icon: React.ReactNode;
      title: string;
      description: string;
    }
  > = {
    all: {
      icon: (
        <BookOpen className="h-7 w-7" />
      ),
      title:
        "لم تسجل في أي دورة بعد",
      description:
        "استعرض الدورات التعليمية المتاحة وابدأ رحلتك.",
    },

    in_progress: {
      icon: (
        <Clock3 className="h-7 w-7" />
      ),
      title:
        "لا توجد دورات قيد التعلم",
      description:
        "ابدأ دورة جديدة وستظهر هنا.",
    },

    completed: {
      icon: (
        <Trophy className="h-7 w-7" />
      ),
      title:
        "لم تكمل أي دورة بعد",
      description:
        "استمر في التعلم وستظهر إنجازاتك هنا.",
    },

    not_started: {
      icon: (
        <Sparkles className="h-7 w-7" />
      ),
      title:
        "لا توجد دورات لم تبدأها",
      description:
        "رائع! لديك نشاط في جميع دوراتك.",
    },
  };

  const item = messages[filter];

  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
      <div
        className="
          mb-4
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-primary/10
          text-primary
        "
      >
        {item.icon}
      </div>

      <h3 className="text-base font-black text-foreground">
        {item.title}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {item.description}
      </p>

      <Button
        asChild
        variant="outline"
        className="mt-5 rounded-xl"
      >
        <Link href="/courses">
          استعرض الدورات
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export function MyCoursesClient({
  courses,
}: MyCoursesClientProps) {
  const [
    activeFilter,
    setActiveFilter,
  ] = useState<FilterTab>("all");

  const [
    sortBy,
    setSortBy,
  ] = useState<SortOption>("recent");

  /* ==========================================================
     TABS
  ========================================================== */

  const tabs: {
    key: FilterTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "all",
      label: "الكل",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      key: "in_progress",
      label: "قيد التعلم",
      icon: <Clock3 className="h-4 w-4" />,
    },
    {
      key: "completed",
      label: "مكتملة",
      icon: (
        <CheckCircle2 className="h-4 w-4" />
      ),
    },
    {
      key: "not_started",
      label: "لم تبدأ",
      icon: (
        <Sparkles className="h-4 w-4" />
      ),
    },
  ];

  /* ==========================================================
     COUNTS
  ========================================================== */

  const tabCounts = useMemo(
    () => ({
      all: courses.length,

      in_progress:
        courses.filter(
          (course) =>
            getCourseStatus(course) ===
            "in_progress",
        ).length,

      completed:
        courses.filter(
          (course) =>
            getCourseStatus(course) ===
            "completed",
        ).length,

      not_started:
        courses.filter(
          (course) =>
            getCourseStatus(course) ===
            "not_started",
        ).length,
    }),
    [courses],
  );

  /* ==========================================================
     FILTER + SORT
  ========================================================== */

  const filtered = useMemo(() => {
    let list =
      activeFilter === "all"
        ? courses
        : courses.filter(
            (course) =>
              getCourseStatus(course) ===
              activeFilter,
          );

    switch (sortBy) {
      case "recent":
        return [...list].sort(
          (a, b) =>
            (b.lastActivityAt
              ? new Date(
                  b.lastActivityAt,
                ).getTime()
              : 0) -
            (a.lastActivityAt
              ? new Date(
                  a.lastActivityAt,
                ).getTime()
              : 0),
        );

      case "progress":
        return [...list].sort(
          (a, b) =>
            b.completedLessons /
              Math.max(
                b.totalLessons,
                1,
              ) -
            a.completedLessons /
              Math.max(
                a.totalLessons,
                1,
              ),
        );

      case "xp":
        return [...list].sort(
          (a, b) =>
            b.xpEarned -
            a.xpEarned,
        );

      case "name":
        return [...list].sort(
          (a, b) =>
            a.title.localeCompare(
              b.title,
              "ar",
            ),
        );
    }
  }, [
    courses,
    activeFilter,
    sortBy,
  ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="w-full"
      dir="rtl"
    >
      {/* ======================================================
          CONTROLS
      ======================================================= */}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* FILTERS */}
        <div
          className="
            flex
            w-full
            items-center
            gap-1
            overflow-x-auto
            rounded-2xl
            border
            border-border/60
            bg-muted/40
            p-1
            sm:w-auto
          "
        >
          {tabs.map((tab) => {
            const active =
              activeFilter ===
              tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setActiveFilter(
                    tab.key,
                  )
                }
                className={cn(
                  `
                    flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-xl
                    px-3
                    py-2
                    text-xs
                    font-bold
                    transition-all
                  `,
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground",
                )}
              >
                {tab.icon}

                <span>
                  {tab.label}
                </span>

                <span
                  className={cn(
                    `
                      flex
                      h-5
                      min-w-5
                      items-center
                      justify-center
                      rounded-full
                      px-1
                      text-[10px]
                    `,
                    active
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "bg-background text-muted-foreground",
                  )}
                >
                  {
                    tabCounts[
                      tab.key
                    ]
                  }
                </span>
              </button>
            );
          })}
        </div>

        {/* SORT */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target
                  .value as SortOption,
              )
            }
            className="
              h-10
              w-full
              appearance-none
              rounded-xl
              border
              border-border/60
              bg-background
              px-3
              pl-9
              text-xs
              font-medium
              text-foreground
              outline-none
              transition-colors
              focus:border-primary
              sm:w-44
            "
          >
            <option value="recent">
              الأحدث نشاطًا
            </option>

            <option value="progress">
              الأعلى تقدمًا
            </option>

            <option value="xp">
              الأعلى XP
            </option>

            <option value="name">
              الاسم
            </option>
          </select>

          <ChevronDown
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
            "
          />
        </div>
      </div>

      {/* ======================================================
          RESULT COUNT
      ======================================================= */}

      {filtered.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            عرض{" "}
            <span className="font-bold text-foreground">
              {filtered.length}
            </span>{" "}
            من{" "}
            <span className="font-bold text-foreground">
              {courses.length}
            </span>{" "}
            دورة
          </p>
        </div>
      )}

      {/* ======================================================
          COURSES GRID
      ======================================================= */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <EmptyState
            filter={activeFilter}
          />
        ) : (
          filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
            />
          ))
        )}
      </div>
    </div>
  );
}
