// components/teacher/battle/battle-participants-manager.tsx

"use client";

import { useState, useTransition } from "react";

import { Loader2, Plus, Trash2, Users, Shield } from "lucide-react";

import { toast } from "sonner";

import {
  addStudentToBattleAction,
  removeStudentFromBattleAction,
} from "@/actions/teacher/battle";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface BattleParticipantsManagerProps {
  battle: {
    id: string;

    participants: {
      id: string;

      score: number;

      team: "TEAM_A" | "TEAM_B";

      student: {
        id: string;

        name: string | null;

        image: string | null;

        level?: string;

        xp?: number;
      };
    }[];
  };
  students: {
    id: string;

    name: string | null;

    image: string | null;

    xp: number;

    level: string;
  }[];
}

export default function BattleParticipantsManager({
  battle,
  students,
}: BattleParticipantsManagerProps) {
  // =========================================
  // STATE
  // =========================================

  const [studentId, setStudentId] = useState("");

  const [selectedTeam, setSelectedTeam] = useState<"TEAM_A" | "TEAM_B">(
    "TEAM_A",
  );

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // =========================================
  // FILTER TEAMS
  // =========================================

  const teamA = battle.participants.filter(
    (participant) => participant.team === "TEAM_A",
  );

  const teamB = battle.participants.filter(
    (participant) => participant.team === "TEAM_B",
  );

  // =========================================
  // ADD STUDENT
  // =========================================

  async function handleAddStudent() {
    if (!studentId.trim()) {
      toast.error("أدخل ID الطالب");

      return;
    }

    startTransition(async () => {
      try {
        await addStudentToBattleAction({
          roomId: battle.id,

          studentId,

          team: selectedTeam,
        });

        toast.success("تم إضافة الطالب 🔥");

        setStudentId("");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "حدث خطأ");
      }
    });
  }

  // =========================================
  // REMOVE
  // =========================================

  async function handleRemove(participantId: string) {
    const confirmed = confirm("هل تريد حذف الطالب من التحدي؟");

    if (!confirmed) {
      return;
    }

    setDeletingId(participantId);

    startTransition(async () => {
      try {
        await removeStudentFromBattleAction(participantId);

        toast.success("تم حذف الطالب");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "حدث خطأ");
      } finally {
        setDeletingId(null);
      }
    });
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="space-y-8">
      {/* ========================================= */}
      {/* ADD STUDENT */}
      {/* ========================================= */}

      <div className="rounded-3xl border bg-muted/20 p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Plus className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-black">إضافة طالب</h3>

            <p className="text-sm text-muted-foreground">أضف طالب لفريق معين</p>
          </div>
        </div>

        {/* FORM */}

        <div className="space-y-5">
          {/* STUDENT ID */}

          <div className="space-y-2">
            <Label>اختر الطالب</Label>

            <Select value={studentId} onValueChange={setStudentId} dir="rtl" >
              <SelectTrigger className="h-12 rounded-2xl">
                <SelectValue placeholder="اختر طالب" />
              </SelectTrigger>

              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                        {student.name?.charAt(0)}
                      </div>

                      <div className="flex flex-col">
                        <span className="font-medium">{student.name}</span>

                        <span className="text-xs text-muted-foreground">
                          XP:
                          {student.xp}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TEAM */}

          <div className="space-y-2">
            <Label>الفريق</Label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTeam("TEAM_A")}
                className={`rounded-2xl border p-4 text-sm font-bold transition-all ${
                  selectedTeam === "TEAM_A"
                    ? "border-red-500 bg-red-500 text-white"
                    : "bg-background hover:border-red-500/40"
                }`}
              >
                🔴 TEAM A
              </button>

              <button
                type="button"
                onClick={() => setSelectedTeam("TEAM_B")}
                className={`rounded-2xl border p-4 text-sm font-bold transition-all ${
                  selectedTeam === "TEAM_B"
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "bg-background hover:border-blue-500/40"
                }`}
              >
                🔵 TEAM B
              </button>
            </div>
          </div>

          {/* SUBMIT */}

          <Button
            onClick={handleAddStudent}
            disabled={isPending}
            className="w-full rounded-2xl"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                جاري الإضافة...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-5 w-5" />
                إضافة الطالب
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ========================================= */}
      {/* TEAM A */}
      {/* ========================================= */}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-500/10 p-3 text-red-500">
              <Shield className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-lg font-black text-red-500">🔴 TEAM A</h3>

              <p className="text-sm text-muted-foreground">
                {teamA.length} طالب
              </p>
            </div>
          </div>

          <Badge className="rounded-xl bg-red-500">
            {teamA.reduce((total, participant) => total + participant.score, 0)}{" "}
            نقطة
          </Badge>
        </div>

        {teamA.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            لا يوجد طلاب
          </div>
        ) : (
          <div className="space-y-3">
            {teamA.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-2xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 font-black text-red-500">
                    {participant.student.name?.charAt(0)}
                  </div>

                  <div>
                    <p className="font-bold">{participant.student.name}</p>

                    <p className="text-xs text-muted-foreground">
                      {participant.score} نقطة
                    </p>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="destructive"
                  className="rounded-xl"
                  disabled={deletingId === participant.id}
                  onClick={() => handleRemove(participant.id)}
                >
                  {deletingId === participant.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* TEAM B */}
      {/* ========================================= */}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-500">
              <Shield className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-lg font-black text-blue-500">🔵 TEAM B</h3>

              <p className="text-sm text-muted-foreground">
                {teamB.length} طالب
              </p>
            </div>
          </div>

          <Badge className="rounded-xl bg-blue-500">
            {teamB.reduce((total, participant) => total + participant.score, 0)}{" "}
            نقطة
          </Badge>
        </div>

        {teamB.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            لا يوجد طلاب
          </div>
        ) : (
          <div className="space-y-3">
            {teamB.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-2xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 font-black text-blue-500">
                    {participant.student.name?.charAt(0)}
                  </div>

                  <div>
                    <p className="font-bold">{participant.student.name}</p>

                    <p className="text-xs text-muted-foreground">
                      {participant.score} نقطة
                    </p>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="destructive"
                  className="rounded-xl"
                  disabled={deletingId === participant.id}
                  onClick={() => handleRemove(participant.id)}
                >
                  {deletingId === participant.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* TOTAL */}
      {/* ========================================= */}

      <div className="rounded-3xl border bg-primary/5 p-5">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Users className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">إجمالي المشاركين</p>

            <h3 className="text-3xl font-black">
              {battle.participants.length}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
