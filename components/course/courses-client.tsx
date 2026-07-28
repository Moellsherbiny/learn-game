"use client";
import Link from "next/link";
import {
  Filter,
  Trophy,
  Users,
  ArrowLeft,
  BookOpen,
  FolderOpen,
  Gamepad,
} from "lucide-react";

import { GetCoursesResult } from "@/actions/courses/get-courses";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Image from "next/image";
import { CourseSearch } from "@/components/course/course-search";

interface CoursesClientProps {
  courses: GetCoursesResult[];
}
export default function CoursesPage({ courses }: CoursesClientProps) {
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;
    return courses.filter((course) =>
      course.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, courses]);

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-background" />
        <div className="absolute left-1/2 top-10 h-105 w-200 -translate-x-1/2 rounded-full bg-linear-to-r from-primary/15 via-accent/15 to-primary/10 blur-3xl" />

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 rounded-full px-4 py-1.5"
            >
              <Gamepad className="mr-2 h-4 w-4" />
              تعلم من خلال الألعاب والمستويات والتحديات
            </Badge>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
              تعلم بالطريقة التي
              <span className="block bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                تناسب مستواك
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              منصة تعليمية تعتمد على الذكاء التكيفي. كل طالب يحصل على رحلة تعلم
              مختلفة بناءً على أدائه.
            </p>

            {/* Search */}
            <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <CourseSearch
                  value={search}
                  onChange={(value) => setSearch(value)}
                />
              </div>

              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-6"
              >
                <Filter className="ml-2 h-4 w-4" />
                تصفية
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight">
              المسارات التعليمية
            </h2>
            <p className="mt-2 text-muted-foreground">
              اختر المجال الذي ترغب في تعلمه وابدأ بجمع نقاط الخبرة.
            </p>
          </div>

          <Badge
            variant="outline"
            className="hidden rounded-full px-4 py-2 md:inline-flex"
          >
            {courses.length} مسار متاح
          </Badge>
        </div>

        {/* Empty State */}
        {courses.length === 0 ? (
          <Card className="mx-auto max-w-2xl rounded-3xl border-border/50 bg-card/80 shadow-sm">
            <CardContent className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-primary/10 to-accent/10">
                <FolderOpen className="h-10 w-10 text-primary" />
              </div>

              <h3 className="text-2xl font-bold">
                لا توجد دورات متاحة حاليًا
              </h3>

              <p className="mt-3 max-w-md leading-8 text-muted-foreground">
                لم يتم إضافة أي دورة تعليمية بعد. بناء تجربة تعلم ممتعة تعتمد على
                الألعاب والمستويات.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Courses Grid */
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="group overflow-hidden rounded-3xl border-border/50 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Header Gradient */}
                <div className="relative h-36 bg-linear-to-br from-primary to-accent">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      width={400}
                      height={200}
                      loading="eager"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full bg-linear-to-br from-primary to-accent" />
                  )}

                  <Badge className="absolute right-4 top-4 rounded-full bg-white/90 text-slate-900 hover:bg-white">
                    جديد
                  </Badge>

                  <div className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="line-clamp-2 text-2xl font-bold">
                      {course.title}
                    </CardTitle>

                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <Badge variant="secondary">
                        {course._count.enrollments} طالب
                      </Badge>
                    </div>
                  </div>

                  <CardDescription className="line-clamp-3 leading-7 text-base">
                    {course.description ||
                      "ابدأ رحلة تعليمية ممتعة ومليئة بالتحديات."}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {course.levels.map((level) => (
                        <Badge
                          key={level}
                          variant="outline"
                          className="rounded-full"
                        >
                          {level}
                        </Badge>
                      ))}

                      <Badge className="rounded-full">تعلم تكيفي</Badge>

                      <Badge variant="secondary" className="rounded-full">
                         نقاط خبرة
                      </Badge>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-muted/50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">الطلاب</span>
                      </div>

                      <p className="font-bold">{course._count.enrollments}</p>
                    </div>

                    <div className="rounded-2xl bg-muted/50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-xs">الوحدات</span>
                      </div>

                      <p className="font-bold">{course._count.modules}</p>
                    </div>

                    <div className="rounded-2xl bg-muted/50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        <span className="text-xs">الدروس</span>
                      </div>

                      <p className="font-bold">{course.lessonsCount}</p>
                    </div>

                    <div className="rounded-2xl bg-muted/50 p-3">
                      <div className="mb-1 text-xs text-muted-foreground">
                        المدرس
                      </div>

                      <p className="truncate font-bold">
                        {course.teacher.name || "غير معروف"}
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button asChild className="mt-6 h-11 w-full rounded-2xl">
                    <Link href={`/courses/${course.id}`}>
                      استكشف الدورة التعليمية
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
