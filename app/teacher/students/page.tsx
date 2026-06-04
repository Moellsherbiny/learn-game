"use client";

import { useEffect, useState } from "react";

import {
  Search,
  Users,
} from "lucide-react";

import { getAllStudents } from "@/actions/teacher/getAllStudents";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Input,
} from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type Student = {
  id: string;

  name: string | null;

  email: string;

  enrollments: {
    course: {
      id: string;

      title: string;
    };
  }[];
};

export default function StudentsPageClient() {
  // =========================================
  // STATES
  // =========================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    students,
    setStudents,
  ] = useState<
    Student[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  // =========================================
  // FETCH
  // =========================================

  useEffect(() => {
    async function fetchStudents() {
      try {
        const data =
          await getAllStudents();

        setStudents(
          data,
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );
      } finally {
        setLoading(
          false,
        );
      }
    }

    fetchStudents();
  }, []);

  // =========================================
  // FILTER
  // =========================================

  const filtered =
    students.filter(
      (student) =>
        student.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase(),
          ) ||
        student.email
          ?.toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent" />

          <p className="text-muted-foreground">

            جاري تحميل الطلاب...
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">

      {/* HERO */}

      <Card className="overflow-hidden border-0 bg-linear-to-br from-primary/20 via-primary/5 to-fuchsia-500/10 shadow-2xl">

        <CardContent className="relative p-8">

          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT */}

            <div>

              <div className="mb-4 flex items-center gap-3">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl">

                  <Users className="h-7 w-7" />
                </div>

                <Badge className="rounded-xl px-4 py-2 text-sm">

                  لوحة الطلاب
                </Badge>
              </div>

              <h1
                className="
                  text-4xl
                  sm:text-5xl
                  font-black
                  leading-[1.8]
                  tracking-normal
                  text-white
                  animate-in
                  fade-in
                  slide-in-from-bottom-4
                  duration-700
                "
                style={{
                  wordSpacing:
                    "4px",
                }}
              >
                إدارة الطلاب
                <br />
                ومتابعة الدورات
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-300">

                يمكنك البحث عن الطلاب ومشاهدة
                الدورات التعليمية المشتركين بها.
              </p>
            </div>

            {/* RIGHT */}

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-xl">

                <div className="text-5xl font-black text-white">

                  {
                    students.length
                  }
                </div>

                <p className="mt-2 text-sm text-zinc-300">

                  إجمالي الطلاب
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-xl">

                <div className="text-5xl font-black text-primary">

                  {
                    filtered.length
                  }
                </div>

                <p className="mt-2 text-sm text-zinc-300">

                  نتائج البحث
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEARCH */}

      <div className="relative">

        <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="ابحث عن طالب..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value,
            )
          }
          className="h-14 rounded-2xl border-white/10 bg-white/5 pr-12 text-lg backdrop-blur-xl"
        />
      </div>

      {/* TABLE */}

      {filtered.length >
      0 ? (
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">

          <Table>

            <TableHeader>

              <TableRow className="border-white/10 hover:bg-transparent">

                <TableHead className="h-16 text-right text-base font-black text-white">

                  الطالب
                </TableHead>

                <TableHead className="text-right text-base font-black text-white">

                  البريد الإلكتروني
                </TableHead>

                <TableHead className="text-right text-base font-black text-white">

                  الدورات
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {filtered.map(
                (
                  student,
                ) => (
                  <TableRow
                    key={
                      student.id
                    }
                    className="border-white/10 transition-all duration-200 hover:bg-white/5"
                  >

                    {/* NAME */}

                    <TableCell className="py-5">

                      <div>

                        <p className="text-lg font-bold text-white">

                          {
                            student.name
                          }
                        </p>

                        <p className="mt-1 text-sm text-zinc-400">

                          ID:{" "}
                          {
                            student.id
                          }
                        </p>
                      </div>
                    </TableCell>

                    {/* EMAIL */}

                    <TableCell className="text-zinc-300">

                      {
                        student.email
                      }
                    </TableCell>

                    {/* COURSES */}

                    <TableCell>

                      <div className="flex flex-wrap gap-2">

                        {student
                          .enrollments
                          .length >
                        0 ? (
                          student.enrollments.map(
                            (
                              enroll,
                            ) => (
                              <Badge
                                key={
                                  enroll
                                    .course
                                    .id
                                }
                                variant="secondary"
                                className="rounded-xl px-3 py-1 text-sm"
                              >
                                {
                                  enroll
                                    .course
                                    .title
                                }
                              </Badge>
                            ),
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">

                            لا يوجد دورات
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Empty className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 py-20 backdrop-blur-xl">

          <EmptyHeader>

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">

              <Users className="h-10 w-10 text-primary" />
            </div>

            <EmptyTitle className="text-2xl font-black text-white">

              لا يوجد طلاب
            </EmptyTitle>

            <EmptyDescription className="mt-3 text-base text-zinc-400">

              لم يتم العثور على أي طلاب مطابقين
              للبحث الحالي.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}