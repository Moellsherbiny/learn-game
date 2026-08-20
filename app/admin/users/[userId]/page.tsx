import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowRight,
  BookOpen,
  Coins,
  GraduationCap,
  Mail,
  Phone,
  School,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";

import { getUser } from "@/actions/admin/get-user";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import EditUserDialog from "@/components/admin/edit-user-dialog";
import DeleteUserDialog from "@/components/admin/delete-user-dialog";
import ResetPasswordDialog from "@/components/admin/reset-password-dialog";

interface UserPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { userId } = await params;

  const result = await getUser(userId);

  if (!result.success || !result.data) {
    notFound();
  }

  const user = result.data;

  const isStudent = user.role === "STUDENT";
  const isTeacher = user.role === "TEACHER";
  const isAdmin = user.role === "ADMIN";

  return (
    <div dir="rtl" className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href={isTeacher ? "/admin/teachers" : "/admin/students"}>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <div>
            <p className="text-sm text-muted-foreground">إدارة المستخدمين</p>

            <h1 className="text-3xl font-bold tracking-tight">
              {user.name ?? "مستخدم بدون اسم"}
            </h1>
          </div>
        </div>

        <EditUserDialog user={user} />
      </div>

      {/* Profile */}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-9 w-9 text-primary" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">
                  {user.name ?? "بدون اسم"}
                </h2>

                <Badge>
                  {isStudent ? "طالب" : isTeacher ? "مدرس" : "مدير"}
                </Badge>
              </div>

              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span dir="ltr">{user.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span dir="ltr">{user.phone ?? "-"}</span>
                </div>

                {user.school && (
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4" />
                    <span>{user.school}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>إجراءات الحساب</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ResetPasswordDialog
              userId={user.id}
              userName={user.name ?? "هذا المستخدم"}
            />

            <DeleteUserDialog
              userId={user.id}
              userName={user.name ?? "هذا المستخدم"}
              redirectTo={
                user.role === "TEACHER" ? "/admin/teachers" : "/admin/students"
              }
            />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            استخدم هذه الإجراءات بحذر، خاصة عند حذف الحساب لأن بعض البيانات قد
            تكون مرتبطة به.
          </p>
        </CardContent>
      </Card>
      {/* Student Gamification */}

      {isStudent && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="نقاط الخبرة" value={user.xp} icon={Zap} />

          <StatCard title="المستوى" value={user.currentLevel} icon={Trophy} />

          <StatCard
            title="سلسلة التعلم"
            value={`${user.streak} يوم`}
            icon={Sparkles}
          />

          <StatCard title="العملات" value={user.coins} icon={Coins} />
        </div>
      )}

      {/* Account Information */}

      <Card>
        <CardHeader>
          <CardTitle>معلومات الحساب</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="نوع الحساب"
              value={isStudent ? "طالب" : isTeacher ? "مدرس" : "مدير"}
              icon={ShieldCheck}
            />

            <InfoItem
              label="البريد الإلكتروني"
              value={user.email}
              icon={Mail}
            />

            <InfoItem label="الهاتف" value={user.phone ?? "-"} icon={Phone} />

            <InfoItem
              label="المدرسة"
              value={user.school ?? "-"}
              icon={School}
            />

            {isStudent && (
              <InfoItem
                label="المستوى التعليمي"
                value={user.level}
                icon={GraduationCap}
              />
            )}

            <InfoItem
              label="تاريخ إنشاء الحساب"
              value={new Intl.DateTimeFormat("ar-EG", {
                dateStyle: "medium",
              }).format(user.createdAt)}
              icon={User}
            />
          </div>
        </CardContent>
      </Card>

      {/* Teacher Courses */}

      {isTeacher && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>الدورات التي يدرسها</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  {user._count.coursesTeaching} دورة
                </p>
              </div>

              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            {user.coursesTeaching.length === 0 ? (
              <EmptyState message="لا توجد دورات لهذا المدرس حتى الآن." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {user.coursesTeaching.map((course) => (
                  <Card key={course.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium">{course.title}</p>

                          <p className="text-xs text-muted-foreground">
                            دورة تعليمية
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Courses */}

      {isStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>الدورات المسجل بها</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  {user._count.enrollments} دورة
                </p>
              </div>

              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            {user.enrollments.length === 0 ? (
              <EmptyState message="الطالب غير مسجل في أي دورة حتى الآن." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {user.enrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {enrollment.course.title}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            مسجل في الدورة
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   Components
============================================================ */

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>

          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>

      <p className="font-medium break-all">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
