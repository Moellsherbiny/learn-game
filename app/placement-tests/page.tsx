import Link from "next/link";

import {
  ChevronLeft,
  ClipboardCheck,
  Search,
  UserRound,
} from "lucide-react";

import { getPlacementStudents } from "@/actions/placement/get-students";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface PlacementTestsPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function PlacementTestsPage({
  searchParams,
}: PlacementTestsPageProps) {
  const params = await searchParams;

  const search =
    params.search?.trim() ?? "";

  // =========================================
  // Get students
  // =========================================

  const result =
    await getPlacementStudents(search);

  if (!result.success) {
    return (
      <div
        dir="rtl"
        className="mx-auto w-full max-w-7xl px-4 py-8"
      >
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">
              {result.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const students = result.data;

  // =========================================
  // Statistics
  // =========================================

  const totalStudents =
    students?.length;

  const totalTests =
    students?.reduce(
      (total, student) =>
        total +
        student._count.placementResults,
      0,
    );

  return (
    <div
      dir="rtl"
      className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8"
    >
      {/* =========================================
          Header
      ========================================= */}

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              الاختبارات القبلية
            </h1>

            <p className="mt-1 text-muted-foreground">
              عرض الطلاب الذين أجروا الاختبارات
              القبلية ونتائجهم
            </p>
          </div>
        </div>
      </div>

      {/* =========================================
          Stats
      ========================================= */}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <UserRound className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                الطلاب الذين أدوا الاختبار
              </p>

              <p className="text-2xl font-bold">
                {totalStudents}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardCheck className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                إجمالي نتائج الاختبارات
              </p>

              <p className="text-2xl font-bold">
                {totalTests}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =========================================
          Search
      ========================================= */}

      <Card>
        <CardContent className="p-4">
          <form
            method="GET"
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="search"
                defaultValue={search}
                placeholder="ابحث عن طالب بالاسم أو البريد الإلكتروني..."
                className="h-10 pr-10"
              />
            </div>

            <Button
              type="submit"
              className="h-10"
            >
              بحث
            </Button>

            {search && (
              <Button
                asChild
                variant="outline"
                className="h-10"
              >
                <Link href="/placement-tests">
                  مسح البحث
                </Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* =========================================
          Students
      ========================================= */}

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>
                نتائج الطلاب
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                اختر طالبًا لعرض تفاصيل الاختبارات
                القبلية الخاصة به
              </p>
            </div>

            <Badge variant="secondary">
              {totalStudents} طالب
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {students?.length === 0 ? (
            <Empty className="min-h-87.5 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardCheck />
                </EmptyMedia>

                <EmptyTitle>
                  {search
                    ? "لم يتم العثور على نتائج"
                    : "لا توجد اختبارات قبلية"}
                </EmptyTitle>

                <EmptyDescription>
                  {search
                    ? "لم يتم العثور على طالب يطابق البحث."
                    : "لم يقم أي طالب بإجراء اختبار قبلي حتى الآن."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="divide-y">
              {students?.map(
                (student) => {
                  const testsCount =
                    student._count
                      .placementResults;

                  return (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40"
                    >
                      {/* Avatar */}

                      <Avatar className="h-11 w-11 shrink-0">
                        <AvatarImage
                          src={
                            student.image ??
                            undefined
                          }
                          alt={
                            student.name ??
                            "Student"
                          }
                        />

                        <AvatarFallback>
                          {getInitials(
                            student.name,
                          )}
                        </AvatarFallback>
                      </Avatar>

                      {/* Student Info */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {student.name ??
                              "بدون اسم"}
                          </h3>

                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            أجرى الاختبار
                          </Badge>
                        </div>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {student.email}
                        </p>
                      </div>

                      {/* School */}

                      <div className="hidden max-w-45 truncate text-sm text-muted-foreground lg:block">
                        {student.school ??
                          "بدون مدرسة"}
                      </div>

                      {/* Tests */}

                      <div className="hidden text-center sm:block">
                        <p className="text-lg font-semibold">
                          {testsCount}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {testsCount === 1
                            ? "اختبار"
                            : "اختبارات"}
                        </p>
                      </div>

                      {/* View */}

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <Link
                          href={`/placement-tests/${student.id}`}
                        >
                          <span className="hidden sm:inline">
                            عرض النتائج
                          </span>

                          <span className="sm:hidden">
                            عرض
                          </span>

                          <ChevronLeft className="mr-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* =====================================================
   Initials
===================================================== */

function getInitials(
  name: string | null,
) {
  if (!name) {
    return "U";
  }

  const words = name
    .trim()
    .split(/\s+/);

  if (words.length === 1) {
    return words[0]
      .charAt(0)
      .toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
}