import Link from "next/link";

import {
  ArrowLeft,
  ArrowUpLeft,
  BookOpen,
  GraduationCap,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";

import { getAdminDashboard } from "@/actions/admin/getAdminDashboard";

import CreateTeacherDialog from "@/components/auth/create-teacher-dialog";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminPage() {
  const result = await getAdminDashboard();

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

  const data = result.data!;

  const {
    stats,
    latestStudents,
    latestTeachers,
  } = data;

  return (
    <div
      dir="rtl"
      className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8"
    >
      {/* =====================================================
          Header
      ====================================================== */}

      <section className="space-y-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <span>إدارة المنصة</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              لوحة الإدارة
            </h1>

            <p className="mt-2 text-muted-foreground">
              إدارة المستخدمين ومتابعة محتوى المنصة التعليمية.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/students">
                <Users className="ml-2 h-4 w-4" />
                إدارة الطلاب
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/admin/teachers">
                <GraduationCap className="ml-2 h-4 w-4" />
                إدارة المدرسين
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* =====================================================
          Statistics
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Students */}

        <Card className="transition-shadow hover:shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                إجمالي الطلاب
              </p>

              <p className="text-3xl font-bold tracking-tight">
                {stats.students}
              </p>

              <Link
                href="/admin/students"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                إدارة الطلاب
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Teachers */}

        <Card className="transition-shadow hover:shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                إجمالي المدرسين
              </p>

              <p className="text-3xl font-bold tracking-tight">
                {stats.teachers}
              </p>

              <Link
                href="/admin/teachers"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                إدارة المدرسين
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Courses */}

        <Card className="transition-shadow hover:shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                إجمالي الدورات
              </p>

              <p className="text-3xl font-bold tracking-tight">
                {stats.courses}
              </p>

              <Link
                href="/admin/courses"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                إدارة الدورات
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* =====================================================
          Quick Actions
      ====================================================== */}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            الإجراءات السريعة
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            الوصول السريع إلى أهم وظائف الإدارة.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Add Teacher */}

          <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>

              <h3 className="font-semibold">
                إضافة مدرس
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                إنشاء حساب مدرس جديد.
              </p>

              <div className="mt-4">
                <CreateTeacherDialog />
              </div>
            </CardContent>
          </Card>

          {/* Students */}

          <Link href="/admin/students">
            <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>

                <h3 className="font-semibold">
                  إدارة الطلاب
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  عرض ومتابعة جميع الطلاب.
                </p>

                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                  الانتقال
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Teachers */}

          <Link href="/admin/teachers">
            <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>

                <h3 className="font-semibold">
                  إدارة المدرسين
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  عرض وإدارة حسابات المدرسين.
                </p>

                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                  الانتقال
                  <ArrowLeft className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Courses */}

          <Link href="/admin/courses">
            <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>

                <h3 className="font-semibold">
                  إدارة الدورات
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  متابعة وإدارة الدورات التعليمية.
                </p>

                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                  الانتقال
                  <ArrowLeft className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* =====================================================
          Latest Teachers
      ====================================================== */}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>أحدث المدرسين</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              آخر المدرسين الذين تم تسجيلهم في المنصة.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/admin/teachers">
              عرض جميع المدرسين
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          {latestTeachers.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
              لا يوجد مدرسون حتى الآن.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">
                      الاسم
                    </TableHead>

                    <TableHead className="text-right">
                      البريد الإلكتروني
                    </TableHead>

                    <TableHead className="text-right">
                      عدد الدورات
                    </TableHead>

                    <TableHead className="text-left">
                      إجراء
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {latestTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        {teacher.name ?? "بدون اسم"}
                      </TableCell>

                      <TableCell>
                        {teacher.email}
                      </TableCell>

                      <TableCell>
                        {teacher._count.coursesTeaching}
                      </TableCell>

                      <TableCell className="text-left">
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                        >
                          <Link href={`/admin/users/${teacher.id}`}>
                            عرض
                            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          Latest Students
      ====================================================== */}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>أحدث الطلاب</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              آخر الطلاب الذين انضموا إلى المنصة.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/admin/students">
              عرض جميع الطلاب
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          {latestStudents.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
              لا يوجد طلاب حتى الآن.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">
                      الاسم
                    </TableHead>

                    <TableHead className="text-right">
                      البريد الإلكتروني
                    </TableHead>

                    <TableHead className="text-right">
                      المدرسة
                    </TableHead>

                    <TableHead className="text-left">
                      إجراء
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {latestStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name ?? "بدون اسم"}
                      </TableCell>

                      <TableCell>
                        {student.email}
                      </TableCell>

                      <TableCell>
                        {student.school ?? "-"}
                      </TableCell>

                      <TableCell className="text-left">
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                        >
                          <Link href={`/admin/users/${student.id}`}>
                            عرض
                            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          Admin Footer Information
      ====================================================== */}

      <Card className="bg-muted/40">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">
              إدارة المنصة
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              يمكنك من خلال لوحة الإدارة إدارة المستخدمين
              والمدرسين والدورات التعليمية.
            </p>
          </div>

          <Button asChild>
            <Link href="/admin/students">
              البدء بإدارة المستخدمين
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}