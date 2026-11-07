
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  FileQuestion,
  Plus,
  Search,
  Trophy,
  Users,
  XCircle,
  Swords,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ============================================
// Types
// ============================================

type ChallengeStatus =
  | "WAITING"
  | "LIVE"
  | "FINISHED"
  | "CANCELLED";

type Challenge = {
  id: string;
  title: string;
  code: string;
  status: ChallengeStatus;
  createdAt: string;

  course: {
    id: string;
    title: string;
  };

  counts: {
    questions: number;
    participants: number;
  };
};

type Props = {
  challenges: Challenge[];
};

type FilterStatus = "ALL" | ChallengeStatus;

// ============================================
// Status Configuration
// ============================================

const statusConfig: Record<
  ChallengeStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
    icon: typeof Clock3;
  }
> = {
  WAITING: {
    label: "في انتظار الطلاب",
    variant: "secondary",
    icon: Clock3,
  },

  LIVE: {
    label: "جاري الآن",
    variant: "default",
    icon: Activity,
  },

  FINISHED: {
    label: "منتهي",
    variant: "outline",
    icon: CheckCircle2,
  },

  CANCELLED: {
    label: "ملغي",
    variant: "destructive",
    icon: XCircle,
  },
};

// ============================================
// Helpers
// ============================================

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// ============================================
// Dashboard
// ============================================

export function GroupChallengesDashboard({
  challenges,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  // Dashboard Statistics
  const stats = useMemo(() => {
    return {
      total: challenges.length,

      waiting: challenges.filter(
        (item) => item.status === "WAITING"
      ).length,

      live: challenges.filter(
        (item) => item.status === "LIVE"
      ).length,

      finished: challenges.filter(
        (item) => item.status === "FINISHED"
      ).length,

      participants: challenges.reduce(
        (total, item) => total + item.counts.participants,
        0
      ),
    };
  }, [challenges]);

  // Search and Filter
  const filteredChallenges = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return challenges.filter((challenge) => {
      const matchesSearch =
        !normalizedSearch ||
        challenge.title.toLowerCase().includes(normalizedSearch) ||
        challenge.code.toLowerCase().includes(normalizedSearch) ||
        challenge.course.title.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        filter === "ALL" || challenge.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [challenges, search, filter]);

  // Copy Challenge Code
  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("تم نسخ كود التحدي بنجاح.");
    } catch {
      toast.error("تعذر نسخ كود التحدي.");
    }
  }

  return (
    <div dir="rtl" className="space-y-8">
      {/* ================================= */}
      {/* Header */}
      {/* ================================= */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Swords className="size-4" />

            <span>مساحة المعلم</span>

            <span>/</span>

            <span className="text-foreground">
              التحديات الجماعية
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              التحديات الجماعية
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              أنشئ التحديات الجماعية وأدرها وتابع أداء الفرق والطلاب.
            </p>
          </div>
        </div>

        <Button asChild className="gap-2">
          <Link href="/teacher/group-challenges/new">
            <Plus className="size-4" />
            إنشاء تحدٍ جديد
          </Link>
        </Button>
      </div>

      {/* ================================= */}
      {/* Statistics */}
      {/* ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="إجمالي التحديات"
          value={stats.total}
          icon={Trophy}
          description="جميع التحديات التي أنشأتها"
        />

        <StatCard
          title="في الانتظار"
          value={stats.waiting}
          icon={Clock3}
          description="في انتظار انضمام الطلاب"
        />

        <StatCard
          title="جارية الآن"
          value={stats.live}
          icon={Activity}
          description="التحديات التي يتم تنفيذها"
        />

        <StatCard
          title="منتهية"
          value={stats.finished}
          icon={CheckCircle2}
          description="التحديات المكتملة"
        />

        <StatCard
          title="المشاركون"
          value={stats.participants}
          icon={Users}
          description="إجمالي الطلاب المشاركين"
        />
      </div>

      {/* ================================= */}
      {/* Search and Filters */}
      {/* ================================= */}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              التحديات الخاصة بك
            </h2>

            <p className="text-sm text-muted-foreground">
              استعرض وأدر جميع التحديات الجماعية.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                dir="rtl"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث عن تحدٍ..."
                className="pr-9 pl-9"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="مسح البحث"
                >
                  <XCircle className="size-4" />
                </button>
              )}
            </div>

            <select
              dir="rtl"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as FilterStatus)
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              aria-label="تصفية التحديات حسب الحالة"
            >
              <option value="ALL">كل الحالات</option>
              <option value="WAITING">في الانتظار</option>
              <option value="LIVE">جاري الآن</option>
              <option value="FINISHED">منتهي</option>
              <option value="CANCELLED">ملغي</option>
            </select>
          </div>
        </div>

        {/* ================================= */}
        {/* Challenge Cards */}
        {/* ================================= */}

        {filteredChallenges.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onCopyCode={copyCode}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            hasChallenges={challenges.length > 0}
            onClear={() => {
              setSearch("");
              setFilter("ALL");
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// Statistics Card
// ============================================

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: typeof Trophy;
  description: string;
}) {
  return (
    <Card className="gap-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold tabular-nums">
          {value.toLocaleString("ar-EG")}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================
// Challenge Card
// ============================================

function ChallengeCard({
  challenge,
  onCopyCode,
}: {
  challenge: Challenge;
  onCopyCode: (code: string) => void;
}) {
  const config = statusConfig[challenge.status];
  const StatusIcon = config.icon;

  return (
    <Card className="group flex flex-col overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Swords className="size-5" />
          </div>

          <Badge variant={config.variant} className="gap-1.5">
            <StatusIcon className="size-3" />
            {config.label}
          </Badge>
        </div>

        <div className="space-y-1">
          <CardTitle className="line-clamp-1 text-lg">
            {challenge.title}
          </CardTitle>

          <p className="line-clamp-1 text-sm text-muted-foreground">
            {challenge.course.title}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        {/* Challenge Code */}

        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2.5">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">
              كود الانضمام
            </p>

            <p
              dir="ltr"
              className="font-mono text-sm font-semibold tracking-widest"
            >
              {challenge.code}
            </p>
          </div>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => onCopyCode(challenge.code)}
            aria-label="نسخ كود التحدي"
          >
            <Copy className="size-4" />
          </Button>
        </div>

        {/* Metadata */}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <FileQuestion className="size-4 shrink-0 text-muted-foreground" />

            <span className="text-muted-foreground">
              {challenge.counts.questions.toLocaleString("ar-EG")} أسئلة
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="size-4 shrink-0 text-muted-foreground" />

            <span className="text-muted-foreground">
              {challenge.counts.participants.toLocaleString("ar-EG")} طالب
            </span>
          </div>

          <div className="col-span-2 flex items-center gap-2 text-sm">
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" />

            <span className="text-muted-foreground">
              تاريخ الإنشاء: {formatDate(challenge.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}

        <div className="mt-auto grid grid-cols-2 gap-2 border-t pt-4">
          <Button asChild variant="outline" className="gap-2">
            <Link
              href={`/teacher/group-challenges/${challenge.id}`}
            >
              التفاصيل
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          {challenge.status === "WAITING" ||
          challenge.status === "LIVE" ? (
            <Button asChild className="gap-2">
              <Link
                href={`/teacher/group-challenges/${challenge.id}/live`}
              >
                <Activity className="size-4" />
                {challenge.status === "LIVE"
                  ? "التحكم المباشر"
                  : "إدارة التحدي"}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="secondary" className="gap-2">
              <Link
                href={`/teacher/group-challenges/${challenge.id}/results`}
              >
                <Trophy className="size-4" />
                النتائج
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Empty State
// ============================================

function EmptyState({
  hasChallenges,
  onClear,
}: {
  hasChallenges: boolean;
  onClear: () => void;
}) {
  if (hasChallenges) {
    return (
      <Card className="flex min-h-64 items-center justify-center border-dashed">
        <div className="space-y-3 p-8 text-center">
          <Search className="mx-auto size-8 text-muted-foreground" />

          <h3 className="font-semibold">
            لا توجد نتائج مطابقة
          </h3>

          <p className="text-sm text-muted-foreground">
            جرّب تغيير كلمات البحث أو خيارات التصفية.
          </p>

          <Button variant="outline" onClick={onClear}>
            مسح عوامل التصفية
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex min-h-80 items-center justify-center border-dashed">
      <div className="max-w-sm space-y-4 p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Swords className="size-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            لا توجد تحديات حتى الآن
          </h3>

          <p className="text-sm text-muted-foreground">
            أنشئ أول تحدٍ جماعي لك، واجعل الطلاب يتنافسون في فرق.
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link href="/teacher/group-challenges/new">
            <Plus className="size-4" />
            أنشئ أول تحدٍ لك
          </Link>
        </Button>
      </div>
    </Card>
  );
}
