import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { getStudentPlacementTests } from "@/actions/placement/get-student-placement";

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

interface PlacementStudentPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function PlacementStudentPage({
  params,
}: PlacementStudentPageProps) {
  const { studentId } = await params;

  const result =
    await getStudentPlacementTests(
      studentId,
    );

  if (!result.success || !result.data) {
    return (
      <div
        dir="rtl"
        className="mx-auto w-full max-w-5xl px-4 py-8"
      >
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">
              {result.message ??
                "تعذر تحميل بيانات الطالب."}
            </p>

            <Button
              asChild
              variant="outline"
              className="mt-4"
            >
              <Link href="/placement-tests">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة إلى الاختبارات
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    student,
    results,
  } = result.data;

  // =========================================
  // Statistics
  // =========================================

  const totalTests = results.length;

  const averageScore =
    totalTests > 0
      ? results.reduce(
          (sum, result) =>
            sum + result.score,
          0,
        ) / totalTests
      : 0;

  const averageConfidence =
    totalTests > 0
      ? results.reduce(
          (sum, result) =>
            sum + result.confidence,
          0,
        ) / totalTests
      : 0;

  return (
    <div
      dir="rtl"
      className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8"
    >
      {/* =========================================
          Back
      ========================================= */}

      <Button
        asChild
        variant="ghost"
        className="w-fit"
      >
        <Link href="/placement-tests">
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة إلى الاختبارات القبلية
        </Link>
      </Button>

      {/* =========================================
          Student Header
      ========================================= */}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
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

              <AvatarFallback className="text-xl">
                {getInitials(
                  student.name,
                )}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {student.name ??
                    "بدون اسم"}
                </h1>

                <Badge variant="secondary">
                  طالب
                </Badge>
              </div>

              <p className="mt-1 text-muted-foreground">
                {student.email}
              </p>

              {student.school && (
                <p className="mt-1 text-sm text-muted-foreground">
                  المدرسة:{" "}
                  {student.school}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =========================================
          Statistics
      ========================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={
            <ClipboardCheck className="h-5 w-5" />
          }
          label="عدد الاختبارات"
          value={totalTests}
        />

        <StatCard
          icon={
            <BarChart3 className="h-5 w-5" />
          }
          label="متوسط النتائج"
          value={`${formatNumber(
            averageScore,
          )}%`}
        />

        <StatCard
          icon={
            <Target className="h-5 w-5" />
          }
          label="متوسط الثقة"
          value={`${formatNumber(
            averageConfidence,
          )}%`}
        />

        <StatCard
          icon={
            <TrendingUp className="h-5 w-5" />
          }
          label="المستوى الحالي"
          value={getLevelLabel(
            student.level,
          )}
        />
      </div>

      {/* =========================================
          Placement Results
      ========================================= */}

      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold">
            نتائج الاختبارات
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            نتائج الاختبارات القبلية التي
            أجراها الطالب
          </p>
        </div>

        {results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              لا توجد نتائج اختبارات.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {results.map((result) => (
              <PlacementResultCard
                key={result.id}
                result={result}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   Placement Result Card
===================================================== */

function PlacementResultCard({
  result,
}: {
  result: any;
}) {
  const score =
    Number(result.score) || 0;

  const confidence =
    Number(result.confidence) || 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="truncate text-lg">
              {result.course?.title ??
                "كورس غير معروف"}
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {result.course
                ?.placementTest
                ?.title ??
                "الاختبار القبلي"}
            </p>
          </div>

          <Badge
            variant={getScoreVariant(
              score,
            )}
          >
            {formatNumber(score)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-5">
        {/* Score */}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              المستوى المحدد
            </div>

            <p className="mt-2 text-xl font-bold">
              {getLevelLabel(
                result.level,
              )}
            </p>
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              مستوى الثقة
            </div>

            <p className="mt-2 text-xl font-bold">
              {formatNumber(
                confidence,
              )}
              %
            </p>
          </div>
        </div>

        {/* Strengths */}

        <InfoSection
          title="نقاط القوة"
          icon={
            <CheckCircle2 className="h-4 w-4" />
          }
          items={toStringArray(
            result.strengths,
          )}
        />

        {/* Weaknesses */}

        <InfoSection
          title="نقاط الضعف"
          icon={
            <XCircle className="h-4 w-4" />
          }
          items={toStringArray(
            result.weaknesses,
          )}
        />

        {/* Feedback */}

        {result.feedback && (
          <div>
            <h3 className="mb-2 text-sm font-semibold">
              التقييم والتوصية
            </h3>

            <div className="rounded-xl bg-muted/50 p-4 text-sm leading-7">
              {result.feedback}
            </div>
          </div>
        )}

        {/* Date */}

        <p className="text-xs text-muted-foreground">
          تاريخ الاختبار:{" "}
          {formatDate(
            result.createdAt,
          )}
        </p>

        {/* Details */}

        <Button
          asChild
          className="w-full"
        >
          <Link
            href={`/placement-tests/${result.studentId}/${result.id}`}
          >
            عرض تفاصيل الإجابات
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/* =====================================================
   Stat Card
===================================================== */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* =====================================================
   Info Section
===================================================== */

function InfoSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
          لا توجد بيانات.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map(
            (item, index) => (
              <li
                key={`${item}-${index}`}
                className="rounded-lg bg-muted/50 px-3 py-2 text-sm leading-6"
              >
                {item}
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

/* =====================================================
   Helpers
===================================================== */

function getLevelLabel(
  level:
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED",
) {
  switch (level) {
    case "BEGINNER":
      return "مبتدئ";

    case "INTERMEDIATE":
      return "متوسط";

    case "ADVANCED":
      return "متقدم";

    default:
      return "غير محدد";
  }
}

function getScoreVariant(
  score: number,
) {
  if (score >= 80) {
    return "default" as const;
  }

  if (score >= 50) {
    return "secondary" as const;
  }

  return "destructive" as const;
}

function formatNumber(
  value: number,
) {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);
}

function formatDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "ar-EG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(date));
}

function toStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string",
  );
}

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