import { notFound, redirect } from "next/navigation";
import { BookOpen, Trophy, Users, Layers, CheckCircle2 } from "lucide-react";

import { getCourseById } from "@/actions/courses/get-course-by-id";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import EnrollButton from "@/components/course/enrollment-btn";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardNavbar from "@/components/layout/navbar";
import DashboardFooter from "@/components/layout/dash-footer";

interface CoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  if (course.isEnrolled) {
    redirect(`/student/courses/${course.id}`);
  }
  const estimatedXp = course._count.modules * 250;

  return (
    <main className="min-h-screen bg-background">
      <DashboardNavbar />
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-background" />
        <div className="absolute left-1/2 top-10 h-105 w-200 -translate-x-1/2 rounded-full bg-linear-to-r from-primary/15 via-accent/15 to-primary/10 blur-3xl" />

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <Badge className="mb-6 rounded-full px-4 py-1.5">
              <BookOpen className="ml-2 h-4 w-4" />
              مسار تعليمي تفاعلي
            </Badge>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
              {course.title}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              {course.description ||
                "ابدأ رحلة تعليمية ممتعة تعتمد على الألعاب والمستويات والتحديات."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Badge variant="secondary" className="rounded-full px-4 py-2">
                {course._count.modules} مستوى
              </Badge>

              <Badge variant="secondary" className="rounded-full px-4 py-2">
                {course._count.enrollments.toLocaleString()} طالب
              </Badge>

              <Badge variant="secondary" className="rounded-full px-4 py-2">
                {estimatedXp.toLocaleString()} XP
              </Badge>

              <Badge variant="secondary" className="rounded-full px-4 py-2">
                المدرس: {course.teacher.name || "غير معروف"}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="rounded-3xl border-border/50">
              <CardContent className="p-8">
                <h2 className="mb-6 text-2xl font-bold">ماذا ستتعلم؟</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5 text-primary" />
                    <span>{course._count.modules} مستوى تفاعلي</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span>{estimatedXp.toLocaleString()} XP إجمالي</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span>
                      {course._count.enrollments.toLocaleString()} طالب
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>شهادة إتمام عند الانتهاء</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-24 rounded-3xl border-border/50">
              <CardContent className="p-6">
                <div className="mb-6 rounded-3xl bg-linear-to-br from-primary to-accent p-8 text-center text-white">
                  <Trophy className="mx-auto mb-4 h-10 w-10" />
                  <p className="text-3xl font-black">
                    {estimatedXp.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm opacity-90">نقاط خبرة محتملة</p>
                </div>

                {course.isEnrolled ? (
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-500" />
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      أنت مسجل بالفعل في هذا الدورة التعليمية
                    </p>
                    <Button asChild variant="default" className="mt-4">
                      <Link href={`/student/courses/${course.id}`}>
                        انتقل إلى الدورة التعليمية
                      </Link>
                    </Button>
                  </div>
                ) : (
                  session?.user.role === "STUDENT" && 
                  (
                    <EnrollButton courseId={course.id} />
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <DashboardFooter />
    </main>
  );
}
