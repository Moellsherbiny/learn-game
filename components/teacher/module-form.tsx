"use client";

import { useState, useTransition } from "react";
import { Loader2, Layers, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createModule } from "@/actions/teacher/module";
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

type StudentLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface ModuleFormProps {
  courseId: string;
}

export default function ModuleForm({ courseId }: ModuleFormProps) {
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<StudentLevel>("BEGINNER");
  const [requiredXp, setRequiredXp] = useState(0);
  const [unlockScore, setUnlockScore] = useState(80);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await createModule({
          courseId,
          title,
          description,
          level,
          requiredXp,
        });

        toast.success("تم إنشاء المستوى بنجاح.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إنشاء المستوى.",
        );
      }
    });
  };

  return (
    <Card className="rounded-3xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-black">
          <Layers className="h-6 w-6 text-primary" />
          إنشاء مستوى جديد
        </CardTitle>
        <CardDescription>
          أضف مستوى جديدًا ضمن الدورة التعليمية وحدد شروط فتحه.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>عنوان المستوى</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="المستوى الأول: أساسيات البرمجة"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لما سيتعلمه الطالب."
            />
          </div>

          <div className="space-y-2">
            <Label>مستوى الطالب المطلوب</Label>
            <Select
              value={level}
              onValueChange={(value) => setLevel(value as StudentLevel)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>نقاط الخبرة المطلوبة</Label>
              <Input
                type="number"
                min={0}
                value={requiredXp}
                onChange={(e) => setRequiredXp(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>نسبة النجاح المطلوبة</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={unlockScore}
                onChange={(e) => setUnlockScore(Number(e.target.value))}
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
                إنشاء المستوى
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
