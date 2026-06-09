"use client";

import Link from "next/link";

import {
  Award,
  Brain,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

interface Props {
  courseId: string;

  result: {
    level: string;

    score: number;

    confidence: number;

    strengths: unknown;

    weaknesses: unknown;

    feedback: string | null;
  };
}

export function PlacementResultView({
  courseId,
  result,
}: Props) {
  const strengths =
    (result.strengths as string[]) ??
    [];

  const weaknesses =
    (result.weaknesses as string[]) ??
    [];

  const levelLabel =
    result.level === "ADVANCED"
      ? "متقدم"
      : result.level ===
          "INTERMEDIATE"
        ? "متوسط"
        : "مبتدئ";

  return (
    <main
      dir="rtl"
      className="
        mx-auto
        max-w-5xl
        px-4
        py-10
      "
    >
      <div className="mb-10 text-center">
        <div className="mb-4 flex justify-center">
          <Award className="h-16 w-16 text-primary" />
        </div>

        <h1 className="text-4xl font-black">
          تم تحديد مستواك 🎉
        </h1>

        <p className="mt-4 text-muted-foreground">
          بناءً على نتائج الاختبار
          قمنا بتحديد مستواك
          الحالي.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              المستوى
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-black text-primary">
              {levelLabel}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              النتيجة
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-black">
              {result.score}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              الثقة
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-black">
              {result.confidence}%
            </p>
          </CardContent>
        </Card>
      </div>

      {result.feedback && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              تحليل الأداء
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-8">
              {result.feedback}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              نقاط القوة
            </CardTitle>
          </CardHeader>

          <CardContent>
            {strengths.length === 0 ? (
              <p className="text-muted-foreground">
                لا توجد بيانات.
              </p>
            ) : (
              <ul className="space-y-2">
                {strengths.map(
                  (skill) => (
                    <li
                      key={skill}
                    >
                      • {skill}
                    </li>
                  ),
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              المهارات التي تحتاج
              تطوير
            </CardTitle>
          </CardHeader>

          <CardContent>
            {weaknesses.length === 0 ? (
              <p className="text-muted-foreground">
                لا توجد بيانات.
              </p>
            ) : (
              <ul className="space-y-2">
                {weaknesses.map(
                  (skill) => (
                    <li
                      key={skill}
                    >
                      • {skill}
                    </li>
                  ),
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <Brain className="h-12 w-12 text-primary" />

          <h3 className="text-2xl font-black">
            جاهز لبدء رحلتك
            التعليمية؟
          </h3>

          <p className="text-center text-muted-foreground">
            سنقوم بفتح المحتوى
            المناسب لمستواك تلقائيًا.
          </p>

          <Button asChild size="lg">
            <Link
              href={`/student/courses/${courseId}`}
            >
              الانتقال إلى الدورة التعليمية

              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}