// components/teacher/lesson-settings-form.tsx

"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import {
  Brain,
  Clock3,
  Loader2,
  MessageCircle,
  PenSquare,
  Save,
  Sparkles,
  Swords,
  Trophy,
  Star,
} from "lucide-react";

import { updateLesson } from "@/actions/teacher/lesson";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

interface LessonSettingsFormProps {
  lesson: {
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

const gameTypes = [
  {
    value: "QUIZ",

    label: "Quiz Game",

    description:
      "أسئلة اختيار من متعدد",

    icon: Brain,
  },

  {
    value: "MATCHING",

    label: "Matching Game",

    description:
      "لعبة المطابقة",

    icon: Swords,
  },

  {
    value: "FILL_BLANKS",

    label: "Fill Blanks",

    description:
      "املأ الفراغات",

    icon: PenSquare,
  },

  {
    value: "CONVERSATION",

    label: "Conversation",

    description:
      "محادثة تفاعلية",

    icon: MessageCircle,
  },
] as const;

export default function LessonSettingsForm({
  lesson,
}: LessonSettingsFormProps) {
  const [isPending, startTransition] =
    useTransition();

  const [title, setTitle] =
    useState(
      lesson.title,
    );

  const [
    description,
    setDescription,
  ] = useState(
    lesson.description ||
      "",
  );

  const [
    gameType,
    setGameType,
  ] = useState<
    | "QUIZ"
    | "MATCHING"
    | "FILL_BLANKS"
    | "CONVERSATION"
  >(lesson.gameType);

  const [
    xpReward,
    setXpReward,
  ] = useState(
    lesson.xpReward,
  );

  const [
    minScore,
    setMinScore,
  ] = useState(
    lesson.minScore,
  );

  const [
    maxStars,
    setMaxStars,
  ] = useState(
    lesson.maxStars,
  );

  const [
    timeLimit,
    setTimeLimit,
  ] = useState(
    lesson.timeLimit ||
      60,
  );

  const selectedGame =
    gameTypes.find(
      (g) =>
        g.value ===
        gameType,
    );

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateLesson({
          lessonId:
            lesson.id,

          title,

          description,

          gameType,

          xpReward,

          minScore,

          maxStars,

          timeLimit,
        });

        toast.success(
          "تم حفظ التعديلات بنجاح ✨",
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء الحفظ",
        );
      }
    });
  };

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-8"
      dir="rtl"
    >
      {/* =====================================
          BASIC INFO
      ===================================== */}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* TITLE */}
        <div className="space-y-3 lg:col-span-2">
          <Label className="text-base font-bold">
            عنوان الدرس
          </Label>

          <Input
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value,
              )
            }
            placeholder="مثال: أساسيات البرمجة الكائنية"
            className="h-14 rounded-2xl text-lg"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-3 lg:col-span-2">
          <Label className="text-base font-bold">
            وصف الدرس
          </Label>

          <Textarea
            rows={5}
            value={
              description
            }
            onChange={(e) =>
              setDescription(
                e.target.value,
              )
            }
            placeholder="اكتب وصفًا تعليميًا احترافيًا للدرس..."
            className="rounded-2xl leading-8"
          />
        </div>
      </div>

      {/* =====================================
          GAME TYPE
      ===================================== */}

      <div className="space-y-5">
        <div>
          <Label className="text-base font-bold">
            نوع اللعبة
          </Label>

          <p className="mt-1 text-sm text-muted-foreground">
            اختر نوع التجربة
            التعليمية التفاعلية.
          </p>
        </div>

        <Select
          value={gameType}
          onValueChange={(
            value,
          ) =>
            setGameType(
              value as any,
            )
          }
        >
          <SelectTrigger className="h-14 rounded-2xl">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {gameTypes.map(
              (type) => {
                const Icon =
                  type.icon;

                return (
                  <SelectItem
                    key={
                      type.value
                    }
                    value={
                      type.value
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-primary" />

                      <span>
                        {
                          type.label
                        }
                      </span>
                    </div>
                  </SelectItem>
                );
              },
            )}
          </SelectContent>
        </Select>

        {/* PREVIEW */}
        {selectedGame && (
          <Card className="rounded-3xl border-primary/10 bg-primary/5">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <selectedGame.icon className="h-7 w-7" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black">
                    {
                      selectedGame.label
                    }
                  </h3>

                  <Badge>
                    Interactive
                  </Badge>
                </div>

                <p className="mt-2 leading-7 text-muted-foreground">
                  {
                    selectedGame.description
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* =====================================
          GAME SETTINGS
      ===================================== */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* XP */}
        <Card className="rounded-3xl border-border/60">
          <CardContent className="p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7" />
            </div>

            <Label className="mb-3 block text-sm font-bold">
              XP Reward
            </Label>

            <Input
              type="number"
              min={0}
              value={
                xpReward
              }
              onChange={(e) =>
                setXpReward(
                  Number(
                    e.target
                      .value,
                  ),
                )
              }
              className="h-12 rounded-2xl"
            />
          </CardContent>
        </Card>

        {/* SCORE */}
        <Card className="rounded-3xl border-border/60">
          <CardContent className="p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Trophy className="h-7 w-7" />
            </div>

            <Label className="mb-3 block text-sm font-bold">
              Minimum Score %
            </Label>

            <Input
              type="number"
              min={0}
              max={100}
              value={
                minScore
              }
              onChange={(e) =>
                setMinScore(
                  Number(
                    e.target
                      .value,
                  ),
                )
              }
              className="h-12 rounded-2xl"
            />
          </CardContent>
        </Card>

        {/* STARS */}
        <Card className="rounded-3xl border-border/60">
          <CardContent className="p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Star className="h-7 w-7" />
            </div>

            <Label className="mb-3 block text-sm font-bold">
              Max Stars
            </Label>

            <Input
              type="number"
              min={1}
              max={5}
              value={
                maxStars
              }
              onChange={(e) =>
                setMaxStars(
                  Number(
                    e.target
                      .value,
                  ),
                )
              }
              className="h-12 rounded-2xl"
            />
          </CardContent>
        </Card>

        {/* TIME */}
        <Card className="rounded-3xl border-border/60">
          <CardContent className="p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Clock3 className="h-7 w-7" />
            </div>

            <Label className="mb-3 block text-sm font-bold">
              Time Limit
            </Label>

            <Input
              type="number"
              min={10}
              value={
                timeLimit
              }
              onChange={(e) =>
                setTimeLimit(
                  Number(
                    e.target
                      .value,
                  ),
                )
              }
              className="h-12 rounded-2xl"
            />
          </CardContent>
        </Card>
      </div>

      {/* =====================================
          ACTIONS
      ===================================== */}

      <div className="flex flex-col gap-4 pt-4 sm:flex-row">
        <Button
          type="submit"
          disabled={
            isPending
          }
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
      </div>
    </form>
  );
}