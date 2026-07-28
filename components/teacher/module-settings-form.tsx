// components/teacher/module-settings-form.tsx

"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import {
  Layers3,
  Loader2,
  Save,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import { updateModule } from "@/actions/teacher/module";

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

interface ModuleSettingsFormProps {
  module: {
    id: string;

    title: string;

    description: string | null;

    level:
      | "BEGINNER"
      | "INTERMEDIATE"
      | "ADVANCED";

    requiredXp: number;

    order: number;
  };
}

const levels = [
  {
    value: "BEGINNER",

    label:
      "Beginner Level",

    description:
      "مناسب للمبتدئين",

    color:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
  },

  {
    value:
      "INTERMEDIATE",

    label:
      "Intermediate Level",

    description:
      "مستوى متوسط",

    color:
      "bg-amber-100 text-amber-700 border-amber-200",
  },

  {
    value: "ADVANCED",

    label:
      "Advanced Level",

    description:
      "مستوى متقدم",

    color:
      "bg-red-100 text-red-700 border-red-200",
  },
] as const;

export default function ModuleSettingsForm({
  module,
}: ModuleSettingsFormProps) {
  const [isPending, startTransition] =
    useTransition();

  const [title, setTitle] =
    useState(
      module.title,
    );

  const [
    description,
    setDescription,
  ] = useState(
    module.description ||
      "",
  );

  const [
    level,
    setLevel,
  ] = useState<
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED"
  >(module.level);

  const [
    requiredXp,
    setRequiredXp,
  ] = useState(
    module.requiredXp,
  );

  const [order, setOrder] =
    useState(module.order);

  const selectedLevel =
    levels.find(
      (l) =>
        l.value ===
        level,
    );

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateModule({
          moduleId:
            module.id,

          title,

          description,

          level,

          requiredXp,
        });

        toast.success(
          "تم تحديث المستوى بنجاح ✨",
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء التحديث",
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
            اسم المستوى
          </Label>

          <Input
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value,
              )
            }
            placeholder="مثال: أساسيات البرمجة"
            className="h-14 rounded-2xl text-lg"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-3 lg:col-span-2">
          <Label className="text-base font-bold">
            وصف المستوى
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
            placeholder="اكتب وصفًا احترافيًا للمستوى..."
            className="rounded-2xl leading-8"
          />
        </div>
      </div>

      {/* =====================================
          LEVEL TYPE
      ===================================== */}

      <div className="space-y-5">
        <div>
          <Label className="text-base font-bold">
            نوع المستوى
          </Label>

          <p className="mt-1 text-sm text-muted-foreground">
            اختر صعوبة ومستوى
            المحتوى التعليمي.
          </p>
        </div>

        <Select
          value={level}
          onValueChange={(
            value,
          ) =>
            setLevel(
              value as any,
            )
          }
        >
          <SelectTrigger className="h-14 rounded-2xl">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {levels.map(
              (item) => (
                <SelectItem
                  key={
                    item.value
                  }
                  value={
                    item.value
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${item.color}`}
                    />

                    <span>
                      {
                        item.label
                      }
                    </span>
                  </div>
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        {/* LEVEL PREVIEW */}
        {selectedLevel && (
          <Card
            className={`rounded-3xl border ${selectedLevel.color}`}
          >
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60">
                <Layers3 className="h-7 w-7" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black">
                    {
                      selectedLevel.label
                    }
                  </h3>

                  <Badge>
                    Level
                  </Badge>
                </div>

                <p className="mt-2 leading-7 opacity-80">
                  {
                    selectedLevel.description
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* =====================================
          SETTINGS
      ===================================== */}

      <div className="grid gap-6 md:grid-cols-3">
        {/* XP */}
        <Card className="rounded-3xl border-border/60">
          <CardContent className="p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7" />
            </div>

            <Label className="mb-3 block text-sm font-bold">
              مقدار نقاط الخبرة المطلوبة
            </Label>

            <Input
              type="number"
              min={0}
              value={
                requiredXp
              }
              onChange={(e) =>
                setRequiredXp(
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

        {/* ORDER */}
        <Card className="rounded-3xl border-border/60">
          <CardContent className="p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Star className="h-7 w-7" />
            </div>

            <Label className="mb-3 block text-sm font-bold">
              ترتيب المستوى
            </Label>

            <Input
              type="number"
              min={1}
              value={order}
              onChange={(e) =>
                setOrder(
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

        {/* LEVEL NUMBER */}
        <Card className="rounded-3xl border-border/60">
          <CardContent className="p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Trophy className="h-7 w-7" />
            </div>

            <Label className="mb-3 block text-sm font-bold">
              Preview
            </Label>

            <div className="flex h-12 items-center rounded-2xl border bg-muted/20 px-4 font-bold">
              المستوى #{order}
            </div>
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