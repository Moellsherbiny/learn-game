import Link from "next/link";

import { BookOpen, GraduationCap, Users } from "lucide-react";

import { getAdminDashboard } from "@/actions/admin/getAdminDashboard";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateTeacherDialog from "@/components/auth/create-teacher-dialog";

export default async function AdminPage() {
  const result = await getAdminDashboard();

  if (!result.success) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{result.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = result.data!;

  const stats = data.stats;
  const latestStudents = data.latestStudents;
  const latestTeachers = data.latestTeachers;

  return (
    <div
      dir="rtl"
      className="
        mx-auto
        w-full
        max-w-7xl
        space-y-8
        px-4
        py-8
      "
    >
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">لوحة الإدارة</h1>

        <p className="mt-2 text-muted-foreground">نظرة عامة على المنصة</p>
      </div>

      {/* Stats */}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Users className="h-10 w-10 text-primary" />

            <div>
              <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>

              <p className="text-3xl font-bold">{stats.students}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <GraduationCap className="h-10 w-10 text-primary" />

            <div>
              <p className="text-sm text-muted-foreground">إجمالي المدرسين</p>

              <p className="text-3xl font-bold">{stats.teachers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <BookOpen className="h-10 w-10 text-primary" />

            <div>
              <p className="text-sm text-muted-foreground">إجمالي الدورات</p>

              <p className="text-3xl font-bold">{stats.courses}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers */}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>آخر المدرسين</CardTitle>

          <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/teachers">عرض الكل</Link>
          </Button>
          <CreateTeacherDialog />
          </div>
        </CardHeader>

        <CardContent>
          {latestTeachers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              لا يوجد مدرسون حتى الآن
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>

                    <TableHead className="text-right">
                      البريد الإلكتروني
                    </TableHead>

                    <TableHead className="text-right">عدد الدورات</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {latestTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="text-right font-medium">
                        {teacher.name}
                      </TableCell>

                      <TableCell className="text-right">
                        {teacher.email}
                      </TableCell>

                      <TableCell className="text-right">
                        {teacher._count.coursesTeaching}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students */}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>آخر الطلاب</CardTitle>

          <Button asChild variant="outline">
            <Link href="/admin/students">عرض الكل</Link>
          </Button>
        </CardHeader>

        <CardContent>
          {latestStudents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              لا يوجد طلاب حتى الآن
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>

                    <TableHead className="text-right">
                      البريد الإلكتروني
                    </TableHead>

                    <TableHead className="text-right">المدرسة</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {latestStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-right font-medium">
                        {student.name}
                      </TableCell>

                      <TableCell className="text-right">
                        {student.email}
                      </TableCell>

                      <TableCell className="text-right">
                        {student.school ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
