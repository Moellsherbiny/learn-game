
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Search,
  Send,
  Users,
  Trophy,
  Zap,
  Award,
} from "lucide-react";
import { toast } from "sonner";

import {
  getChallengeStudentsAction,
  inviteStudentsToChallengeAction,
} from "@/actions/teacher/group-challenge-invitations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Students = Awaited<
  ReturnType<typeof getChallengeStudentsAction>
>;

export function ChallengeInvitationManager({
  challengeId,
}: {
  challengeId: string;
}) {
  const [students, setStudents] = useState<Students>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Initial data loading
  useEffect(() => {
    let isMounted = true;

    async function fetchStudents() {
      try {
        const result = await getChallengeStudentsAction(challengeId);

        if (isMounted) {
          setStudents(result);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error instanceof Error
              ? error.message
              : "تعذر تحميل الطلاب."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchStudents();

    return () => {
      isMounted = false;
    };
  }, [challengeId]);

  // Reload students after sending invitations
  async function loadStudents() {
    try {
      setIsLoading(true);

      const result = await getChallengeStudentsAction(challengeId);
      setStudents(result);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "تعذر تحميل الطلاب."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return students;

    return students.filter((student) =>
      `${student.name ?? ""} ${student.email}`
        .toLowerCase()
        .includes(value)
    );
  }, [students, search]);

  function toggleStudent(studentId: string) {
    setSelectedIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  }

  function toggleAll() {
    const selectableIds = filteredStudents
      .filter((student) => !student.invitationStatus)
      .map((student) => student.id);

    const allSelected =
      selectableIds.length > 0 &&
      selectableIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allSelected
        ? current.filter((id) => !selectableIds.includes(id))
        : [...new Set([...current, ...selectableIds])]
    );
  }

  async function handleInvite() {
    if (selectedIds.length === 0) {
      toast.error("اختر طالبًا واحدًا على الأقل.");
      return;
    }

    try {
      setIsSending(true);

      const result = await inviteStudentsToChallengeAction(
        challengeId,
        selectedIds
      );

      toast.success(result.message);
      setSelectedIds([]);

      await loadStudents();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "تعذر إرسال الدعوات."
      );
    } finally {
      setIsSending(false);
    }
  }

  function getInvitationStatus(status: string | null) {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary">
            في انتظار الرد
          </Badge>
        );

      case "ACCEPTED":
        return (
          <Badge className="bg-green-600">
            قبل الدعوة
          </Badge>
        );

      case "DECLINED":
        return (
          <Badge variant="destructive">
            رفض الدعوة
          </Badge>
        );

      default:
        return null;
    }
  }

  function getLevelLabel(level: string) {
    switch (level) {
      case "BEGINNER":
        return "مبتدئ";
      case "INTERMEDIATE":
        return "متوسط";
      case "ADVANCED":
        return "متقدم";
      default:
        return level;
    }
  }

  function getLevelStyle(level: string) {
    switch (level) {
      case "BEGINNER":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "INTERMEDIATE":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "ADVANCED":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="size-5 text-primary" />

          <CardTitle className="text-lg">
            دعوة الطلاب للتحدي
          </CardTitle>
        </div>

        <p className="text-sm text-muted-foreground">
          اختر الطلاب المسجلين في الكورس لإرسال دعوة للمشاركة.
          يمكنك مقارنة نقاطهم ومستوياتهم قبل الاختيار.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and selection */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث باسم الطالب أو البريد الإلكتروني..."
              className="pr-9"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={toggleAll}
            disabled={isLoading || filteredStudents.length === 0}
          >
            تحديد الكل
          </Button>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            الطلاب المتاحون: {students.length}
          </span>

          <Badge variant="secondary">
            محدد: {selectedIds.length}
          </Badge>
        </div>

        {/* Students */}
        {isLoading ? (
          <div className="flex min-h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {students.length === 0
              ? "لا يوجد طلاب متاحون للدعوة."
              : "لا توجد نتائج مطابقة للبحث."}
          </div>
        ) : (
          <div className="max-h-105 space-y-2 overflow-y-auto pe-1">
            {filteredStudents.map((student) => {
              const hasInvitation = Boolean(student.invitationStatus);
              const checked = selectedIds.includes(student.id);

              return (
                <label
                  key={student.id}
                  className={`
                    flex cursor-pointer items-center gap-3 rounded-xl
                    border p-3 transition-colors
                    ${
                      hasInvitation
                        ? "cursor-not-allowed bg-muted/30 opacity-80"
                        : checked
                          ? "border-primary/50 bg-primary/5"
                          : "hover:bg-muted/40"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={hasInvitation}
                    onChange={() => toggleStudent(student.id)}
                    className="size-4 shrink-0 accent-primary"
                  />

                  {/* Rank */}
                  <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted">
                    {student.rank <= 3 ? (
                      <Trophy
                        className={`size-4 ${
                          student.rank === 1
                            ? "text-amber-500"
                            : student.rank === 2
                              ? "text-slate-400"
                              : "text-orange-600"
                        }`}
                      />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">
                        #{student.rank}
                      </span>
                    )}

                    {student.rank <= 3 && (
                      <span className="text-[10px] font-bold">
                        #{student.rank}
                      </span>
                    )}
                  </div>

                  {/* Student info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {student.name || "طالب بدون اسم"}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {student.email}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`gap-1 ${getLevelStyle(student.level)}`}
                      >
                        <Award className="size-3" />
                        {getLevelLabel(student.level)}
                      </Badge>

                      <Badge
                        variant="secondary"
                        className="gap-1"
                      >
                        Level {student.currentLevel}
                      </Badge>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="flex shrink-0 flex-col items-center gap-1 rounded-lg bg-primary/5 px-3 py-2">
                    <div className="flex items-center gap-1 text-primary">
                      <Zap className="size-4" />
                      <span className="text-sm font-bold tabular-nums">
                        {student.xp.toLocaleString()}
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-foreground">
                      XP Points
                    </span>
                  </div>

                  {/* Invitation status */}
                  {getInvitationStatus(student.invitationStatus)}
                </label>
              );
            })}
          </div>
        )}

        {/* Invite button */}
        <Button
          type="button"
          className="w-full gap-2"
          onClick={handleInvite}
          disabled={
            isSending ||
            isLoading ||
            selectedIds.length === 0
          }
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}

          إرسال الدعوات ({selectedIds.length})
        </Button>
      </CardContent>
    </Card>
  );
}
