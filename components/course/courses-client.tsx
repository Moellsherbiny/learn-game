"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Filter,
  FolderOpen,
  Gamepad2,
  GraduationCap,
  Trophy,
  Users,
} from "lucide-react";

import { GetCoursesResult } from "@/actions/courses/get-courses";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CourseSearch } from "@/components/course/course-search";

interface CoursesClientProps {
  courses: GetCoursesResult[];
}

export default function CoursesPage({
  courses,
}: CoursesClientProps) {
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return courses;
    }

    return courses.filter((course) => {
      const title =
        course.title?.toLowerCase() ?? "";

      const description =
        course.description?.toLowerCase() ?? "";

      const teacher =
        course.teacher.name?.toLowerCase() ?? "";

      return (
        title.includes(query) ||
        description.includes(query) ||
        teacher.includes(query)
      );
    });
  }, [search, courses]);

  return (
    <main className="min-h-screen bg-background">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden border-b">
        {/* Subtle background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-1/2 top-0 h-80 w-80 translate-x-1/2 rounded-full bg-primary/6 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <Badge
              variant="secondary"
              className="
                mb-5
                rounded-full
                border
                border-primary/10
                px-4
                py-1.5
                text-xs
                font-bold
              "
            >
              <Gamepad2 className="ml-2 h-4 w-4 text-primary" />
              تعلم من خلال الألعاب والتحديات
            </Badge>

            {/* Heading */}
            <h1
              className="
                text-4xl
                font-black
                tracking-tight
                text-foreground
                sm:text-5xl
                md:text-6xl
              "
            >
              اختر مسارك
              <span className="mt-2 block text-primary">
                وابدأ رحلة التعلم
              </span>
            </h1>

            {/* Description */}
            <p
              className="
                mx-auto
                mt-5
                max-w-2xl
                text-base
                leading-7
                text-muted-foreground
                md:text-lg
              "
            >
              استكشف الدورات التعليمية المتاحة
              واختر المسار المناسب لمستواك وأهدافك.
            </p>

            {/* Search */}
            <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <div className="min-w-0 flex-1">
                <CourseSearch
                  value={search}
                  onChange={setSearch}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="
                  h-12
                  rounded-xl
                  px-5
                  sm:shrink-0
                "
              >
                <Filter className="ml-2 h-4 w-4" />
                تصفية
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COURSES
      ====================================================== */}
      <section className="container mx-auto px-4 py-10 pb-20">
        {/* Section Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>

              <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                المسارات التعليمية
              </h2>
            </div>

            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              اختر الدورة التي تناسب أهدافك وابدأ التعلم.
            </p>
          </div>

          <Badge
            variant="outline"
            className="
              w-fit
              rounded-full
              px-3
              py-1.5
              text-xs
            "
          >
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1
              ? "دورة"
              : "دورات"}
          </Badge>
        </div>

        {/* ===================================================
            EMPTY STATE
        ==================================================== */}
        {courses.length === 0 ? (
          <EmptyState type="no_courses" />
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            type="no_results"
            onReset={() => setSearch("")}
          />
        ) : (
          /* =================================================
             COURSES GRID
          ================================================== */
          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
              xl:grid-cols-3
            "
          >
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* ============================================================
   COURSE CARD
============================================================ */

function CourseCard({
  course,
}: {
  course: GetCoursesResult;
}) {
  return (
   <Card className=" group flex h-full flex-col overflow-hidden rounded-3xl border-border/60 bg-card p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl " >
      {/* ======================================================
          THUMBNAIL
      ======================================================= */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1280px) 50vw,
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
            <BookOpen className="h-14 w-14 text-primary/20" />
          </div>
        )}

        {/* Image overlay */}
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-24
            bg-linear-to-t
            from-black/35
            to-transparent
          "
        />

        {/* New badge */}
        <Badge
          className="
            absolute
            right-4
            top-4
            rounded-full
            border-0
            bg-background/90
            text-foreground
            shadow-sm
            backdrop-blur-sm
            hover:bg-background
          "
        >
          جديد
        </Badge>

        {/* Course icon */}
        <div
          className="
            absolute
            bottom-4
            right-4
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-background/90
            text-primary
            shadow-sm
            backdrop-blur-sm
          "
        >
          <BookOpen className="h-5 w-5" />
        </div>
      </div>

      {/* ======================================================
          HEADER
      ======================================================= */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle
            className="
              line-clamp-2
              text-xl
              font-black
              leading-snug
              transition-colors
              group-hover:text-primary
            "
          >
            {course.title}
          </CardTitle>

          <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />

            <span>
              {course._count.enrollments}
            </span>
          </div>
        </div>

        <CardDescription
          className="
            mt-2
            line-clamp-3
            text-sm
            leading-6
          "
        >
          {course.description ||
            "ابدأ رحلة تعليمية ممتعة ومليئة بالتحديات."}
        </CardDescription>

        {/* ====================================================
            TAGS
        ===================================================== */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {course.levels.map((level) => (
            <Badge
              key={level}
              variant="outline"
              className="
                rounded-full
                px-2.5
                py-1
                text-[10px]
                font-semibold
              "
            >
              {level}
            </Badge>
          ))}

          <Badge
            variant="secondary"
            className="
              rounded-full
              px-2.5
              py-1
              text-[10px]
              font-semibold
            "
          >
            تعلم تكيفي
          </Badge>

          <Badge
            variant="secondary"
            className="
              rounded-full
              px-2.5
              py-1
              text-[10px]
              font-semibold
            "
          >
            نقاط خبرة
          </Badge>
        </div>
      </CardHeader>

      {/* ======================================================
          CONTENT
      ======================================================= */}
      <CardContent className="mt-auto pt-0">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <CourseStat
            icon={
              <Users className="h-4 w-4" />
            }
            label="الطلاب"
            value={
              course._count.enrollments
            }
          />

          <CourseStat
            icon={
              <BookOpen className="h-4 w-4" />
            }
            label="الوحدات"
            value={course._count.modules}
          />

          <CourseStat
            icon={
              <Trophy className="h-4 w-4" />
            }
            label="الدروس"
            value={course.lessonsCount}
          />
        </div>

        {/* Teacher */}
        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-border/50
            bg-muted/30
            px-3
            py-2.5
          "
        >
          <span className="text-xs text-muted-foreground">
            المدرس
          </span>

          <span className="max-w-[60%] truncate text-xs font-bold text-foreground">
            {course.teacher.name ||
              "غير معروف"}
          </span>
        </div>

        {/* CTA */}
        <Button
          asChild
          className="
            mt-4
            h-11
            w-full
            rounded-2xl
            font-bold
            transition-transform
            group-hover:shadow-sm
          "
        >
          <Link
            href={`/courses/${course.id}`}
          >
            استكشف الدورة
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   COURSE STAT
============================================================ */

function CourseStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
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

      <p className="text-sm font-black text-foreground">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  type,
  onReset,
}: {
  type: "no_courses" | "no_results";
  onReset?: () => void;
}) {
  const noResults =
    type === "no_results";

  return (
    <Card className="mx-auto max-w-2xl rounded-3xl border-border/60 shadow-sm">
      <CardContent className="flex flex-col items-center px-6 py-16 text-center">
        <div
          className="
            mb-5
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-primary/10
            text-primary
          "
        >
          {noResults ? (
            <BookOpen className="h-8 w-8" />
          ) : (
            <FolderOpen className="h-8 w-8" />
          )}
        </div>

        <h3 className="text-xl font-black">
          {noResults
            ? "لم نجد دورة مطابقة"
            : "لا توجد دورات متاحة حاليًا"}
        </h3>

        <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
          {noResults
            ? "جرّب البحث باستخدام كلمة مختلفة أو امسح البحث لعرض جميع الدورات."
            : "لم تتم إضافة أي دورة تعليمية بعد. ستظهر الدورات هنا عند توفرها."}
        </p>

        {noResults && onReset && (
          <Button
            type="button"
            variant="outline"
            className="mt-5 rounded-xl"
            onClick={onReset}
          >
            عرض جميع الدورات
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
