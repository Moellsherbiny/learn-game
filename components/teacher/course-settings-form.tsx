"use client";

import Link from "next/link";

import {
  useState,
  useTransition,
} from "react";

import { toast } from "sonner";

import {
  Save,
  Trash2,
  Loader2,
  Users,
  Layers3,
  Trophy,
  Sparkles,
  BookOpen,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";

import {
  updateCourse,
  deleteCourse,
} from "@/actions/teacher/course";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";

interface CourseSettingsFormProps {
  course: {
    id: string;

    title: string;

    description: string | null;

    thumbnail: string | null;

    _count: {
      modules: number;

      enrollments: number;
    };
  };
}

export default function CourseSettingsForm({
  course,
}: CourseSettingsFormProps) {
  const [isPending, startTransition] =
    useTransition();

  const [title, setTitle] =
    useState(course.title);

  const [
    description,
    setDescription,
  ] = useState(
    course.description || "",
  );

  const [
    thumbnail,
    setThumbnail,
  ] = useState(
    course.thumbnail || "",
  );

  const handleSave = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateCourse({
          courseId: course.id,

          title,

          description,

          thumbnail,
        });

        toast.success(
          "تم حفظ التعديلات بنجاح ✨",
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء الحفظ.",
        );
      }
    });
  };

  const handleDelete = () => {
    const confirmed =
      window.confirm(
        "هل أنت متأكد من حذف هذا الدورة التعليمية؟",
      );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteCourse(
          course.id,
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء الحذف.",
        );
      }
    });
  };

  return (
    <div
      className="space-y-8"
      dir="rtl"
    >
      {/* =====================================
          HERO
      ===================================== */}

      <Card className="overflow-hidden rounded-[32px] border-border/60 bg-white shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            {/* LEFT */}
            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap gap-3">
                <Badge className="rounded-full px-4 py-2">
                  <BookOpen className="ml-2 h-4 w-4" />
                  إعدادات الدورة التعليمية
                </Badge>

                <Badge
                  variant="secondary"
                  className="rounded-full px-4 py-2"
                >
                  <Sparkles className="ml-2 h-4 w-4" />
                  Teacher Dashboard
                </Badge>
              </div>

              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                {course.title}
              </h1>

              <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
                إدارة بيانات الدورة التعليمية，
                المستويات، والصورة
                التعريفية الخاصة به.
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-2xl"
              >
                <Link
                  href={`/teacher/courses/${course.id}/modules`}
                >
                  <Layers3 className="ml-2 h-5 w-5" />
                  إدارة المستويات
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-2xl"
              >
                <Link
                  href={`/teacher/courses/${course.id}`}
                >
                  <ArrowLeft className="ml-2 h-5 w-5" />
                  العودة للدورة التعليمية
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =====================================
          STATS
      ===================================== */}

      <div className="grid gap-5 md:grid-cols-3">
        {/* MODULES */}
        <Card className="rounded-[28px] border-border/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="p-7 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Layers3 className="h-8 w-8" />
            </div>

            <div className="text-4xl font-black">
              {
                course._count
                  .modules
              }
            </div>

            <div className="mt-2 text-muted-foreground">
              مستوى تعليمي
            </div>
          </CardContent>
        </Card>

        {/* STUDENTS */}
        <Card className="rounded-[28px] border-border/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="p-7 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Users className="h-8 w-8" />
            </div>

            <div className="text-4xl font-black">
              {
                course._count
                  .enrollments
              }
            </div>

            <div className="mt-2 text-muted-foreground">
              طالب مسجل
            </div>
          </CardContent>
        </Card>

        {/* XP */}
        <Card className="rounded-[28px] border-border/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="p-7 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Trophy className="h-8 w-8" />
            </div>

            <div className="text-4xl font-black">
              {course._count.modules *
                250}
            </div>

            <div className="mt-2 text-muted-foreground">
              إجمالي نقاط الخبرة الممنوحة
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================
          FORM
      ===================================== */}

      <Card className="overflow-hidden rounded-[32px] border-border/60 bg-white shadow-sm">
        {/* HEADER */}
        <div className="border-b border-border/60 p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <BookOpen className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-2xl font-black">
                بيانات الدورة التعليمية
              </h2>

              <p className="mt-1 text-muted-foreground">
                قم بتعديل المعلومات
                الأساسية للدورة التعليمية.
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <CardContent className="p-8">
          <form
            onSubmit={handleSave}
            className="space-y-8"
          >
            {/* TITLE */}
            <div className="space-y-3">
              <Label className="text-base font-bold">
                عنوان الدورة التعليمية
              </Label>

              <Input
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value,
                  )
                }
                placeholder="أدخل عنوان الدورة التعليمية"
                className="h-14 rounded-2xl text-lg"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-3">
              <Label className="text-base font-bold">
                الوصف
              </Label>

              <Textarea
                rows={6}
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value,
                  )
                }
                placeholder="اكتب وصفًا احترافيًا للدورة التعليمية..."
                className="rounded-2xl leading-8"
              />
            </div>

            {/* THUMBNAIL */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-base font-bold">
                <ImageIcon className="h-4 w-4 text-primary" />
                رابط الصورة
              </Label>

              <Input
                value={thumbnail}
                onChange={(e) =>
                  setThumbnail(
                    e.target.value,
                  )
                }
                placeholder="https://..."
                className="h-14 rounded-2xl"
              />

              {/* IMAGE PREVIEW */}
              {thumbnail && (
                <div className="overflow-hidden rounded-[28px] border border-border/60 bg-muted/20">
                  <img
                    src={thumbnail}
                    alt={title}
                    className="h-80 w-full object-cover transition-all duration-500 hover:scale-[1.02]"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* ACTIONS */}
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* SAVE */}
              <Button
                type="submit"
                disabled={isPending}
                size="lg"
                className="
                  h-14 flex-1 rounded-2xl
                  text-base font-bold
                "
              >
                {isPending ? (
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                ) : (
                  <Save className="ml-2 h-5 w-5" />
                )}

                حفظ التعديلات
              </Button>

              {/* DELETE */}
              <Button
                type="button"
                variant="destructive"
                onClick={
                  handleDelete
                }
                disabled={isPending}
                size="lg"
                className="
                  h-14 rounded-2xl
                  px-8 text-base font-bold
                "
              >
                <Trash2 className="ml-2 h-5 w-5" />
                حذف الدورة التعليمية
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}