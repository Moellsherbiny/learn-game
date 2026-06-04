"use client";

import { useState, useTransition } from "react";
import { Loader2, BookOpen, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { createLesson } from "@/actions/teacher/lesson";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GameType = "QUIZ" | "MATCHING" | "FILL_BLANKS" | "CONVERSATION";

interface LessonFormProps {
 courseId: string;

  moduleId: string;

  lesson?: {
    id: string;

    title: string;

    description: string | null;

    gameType:
      | "QUIZ"
      | "MATCHING"
      | "FILL_BLANKS"
      | "CONVERSATION";

    xpReward: number;

    minScore: number;

    maxStars: number;

    timeLimit: number | null;
  };
}

export default function LessonForm({ courseId, moduleId }: LessonFormProps) {
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gameType, setGameType] = useState<GameType>("QUIZ");
  const [xpReward, setXpReward] = useState(10);
  const [minScore, setMinScore] = useState(80);
  const [maxStars, setMaxStars] = useState(3);
  const [timeLimit, setTimeLimit] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await createLesson({
          courseId,
          moduleId,
          title,
          description,
          gameType,
          xpReward,
          minScore,
          maxStars,
          timeLimit: timeLimit ? Number(timeLimit) : undefined,
        });

        toast.success("تم إنشاء الدرس بنجاح.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الدرس.",
        );
      }
    });
  };

  return (
    <Card className="rounded-3xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-black">
          <BookOpen className="h-6 w-6 text-primary" />
          إنشاء درس جديد
        </CardTitle>
        <CardDescription>
          أضف درسًا تفاعليًا وحدد نوع اللعبة والمكافآت.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>عنوان الدرس</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="اختبار أساسيات JavaScript"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>نوع اللعبة</Label>
            <Select
              value={gameType}
              onValueChange={(value) => setGameType(value as GameType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["QUIZ", "MATCHING", "FILL_BLANKS", "CONVERSATION"].map(
                  (item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>XP Reward</Label>
              <Input
                type="number"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Minimum Score</Label>
              <Input
                type="number"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Maximum Stars</Label>
              <Input
                type="number"
                value={maxStars}
                onChange={(e) => setMaxStars(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Time Limit (seconds)</Label>
              <Input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl"
          >
            {isPending ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Sparkles className="ml-2 h-4 w-4" />
                إنشاء الدرس
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
