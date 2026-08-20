import Link from "next/link";

import {
  Eye,
  GraduationCap,
  MessageCircle,
  Search,
  Trophy,
  Users,
} from "lucide-react";

import { getStudents } from "@/actions/admin/get-students";

import { Input } from "@/components/ui/input";

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

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StudentsPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function StudentsPage({
  searchParams,
}: StudentsPageProps) {
  const params = await searchParams;

  const search =
    params.search?.trim() ?? "";

  const students =
    await getStudents(search);

  return (
    <div
      dir="rtl"
      className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8"
    >
      {/* =====================================================
          Header
      ===================================================== */}

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              الطلاب
            </h1>
          </div>

          <p className="mt-2 text-muted-foreground">
            إدارة ومتابعة جميع الطلاب المسجلين في المنصة
          </p>
        </div>
      </div>

      {/* =====================================================
          Statistics
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                إجمالي الطلاب
              </p>

              <p className="text-2xl font-bold">
                {students.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                الطلاب النشطون
              </p>

              <p className="text-2xl font-bold">
                {students.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                إجمالي XP
              </p>

              <p className="text-2xl font-bold">
                {students.reduce(
                  (total, student) =>
                    total + student.xp,
                  0,
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          Search
      ===================================================== */}

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
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
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
                <Link href="/admin/students">
                  مسح البحث
                </Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* =====================================================
          Students Table
      ===================================================== */}

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                قائمة الطلاب
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? `نتائج البحث عن "${search}"`
                  : "جميع الطلاب المسجلين في المنصة"}
              </p>
            </div>

            <Badge variant="secondary">
              {students.length} طالب
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {students.length === 0 ? (
            <Empty className="min-h-87.5 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>

                <EmptyTitle>
                  {search
                    ? "لم يتم العثور على طلاب"
                    : "لا يوجد طلاب حتى الآن"}
                </EmptyTitle>

                <EmptyDescription>
                  {search
                    ? "جرب البحث باستخدام اسم أو بريد إلكتروني مختلف."
                    : "سيظهر الطلاب هنا عند تسجيلهم في المنصة."}
                </EmptyDescription>
              </EmptyHeader>

              {search && (
                <EmptyContent>
                  <Button
                    asChild
                    variant="outline"
                  >
                    <Link href="/admin/students">
                      مسح البحث
                    </Link>
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table
               
                className="min-w-225"
              >
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">
                      الطالب
                    </TableHead>

                    <TableHead className="text-right">
                      المدرسة
                    </TableHead>

                    <TableHead className="text-right">
                      المستوى
                    </TableHead>

                    <TableHead className="text-right">
                      المستوى الحالي
                    </TableHead>

                    <TableHead className="text-right">
                      XP
                    </TableHead>

                    <TableHead className="w-37.5 text-center">
                      الإجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {students.map(
                    (student) => (
                      <TableRow
                        key={student.id}
                        className="group"
                      >
                        {/* Student */}

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={
                                 ""
                                }
                                alt={
                                  student?.name ??
                                  "Student"
                                }
                              />

                              <AvatarFallback>
                                {getInitials(
                                  student.name,
                                )}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {student.name ??
                                  "بدون اسم"}
                              </p>

                              <p className="max-w-55 truncate text-xs text-muted-foreground">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* School */}

                        <TableCell>
                          <span className="text-sm">
                            {student.school ??
                              "-"}
                          </span>
                        </TableCell>

                        {/* Level */}

                        <TableCell>
                          <LevelBadge
                            level={
                              student.level
                            }
                          />
                        </TableCell>

                        {/* Current Level */}

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {student.currentLevel}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              Level
                            </span>
                          </div>
                        </TableCell>

                        {/* XP */}

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-primary" />

                            <span className="font-semibold">
                              {student.xp.toLocaleString(
                                "en-US",
                              )}
                            </span>
                          </div>
                        </TableCell>

                        {/* Actions */}

                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            {/* View */}

                            <Button
                              asChild
                              size="icon"
                              variant="ghost"
                              title="عرض الطالب"
                            >
                              <Link
                                href={`/admin/users/${student.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>

                            {/* Message */}

                            <Button
                              asChild
                              size="icon"
                              variant="ghost"
                              title="مراسلة الطالب"
                            >
                              <Link
                                href={`/messages/start?userId=${student.id}`}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* =====================================================
   Level Badge
===================================================== */

function LevelBadge({
  level,
}: {
  level:
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED";
}) {
  const config = {
    BEGINNER: {
      label: "مبتدئ",
      variant: "secondary" as const,
    },

    INTERMEDIATE: {
      label: "متوسط",
      variant: "outline" as const,
    },

    ADVANCED: {
      label: "متقدم",
      variant: "default" as const,
    },
  };

  const current =
    config[level];

  return (
    <Badge variant={current.variant}>
      {current.label}
    </Badge>
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