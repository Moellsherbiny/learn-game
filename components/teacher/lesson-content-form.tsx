// components/teacher/lesson-content-form.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Loader2,
  PlusCircle,
  Save,
} from "lucide-react";

import {
  createLessonContent,
  updateLessonContent,
} from "@/actions/teacher/lesson-content";

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

interface LessonContent {
  id: string;
  question: string;
  answer: string | null;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  leftText: string | null;
  rightText: string | null;
  sortOrder: number;
}

interface Lesson {
  id: string;
  title: string;
  gameType: string;
}

interface LessonContentFormProps {
  lesson: Lesson;
  // إذا تم تمرير content يصبح الفورم في وضع التعديل
  content?: LessonContent;
}

export default function LessonContentForm({
  lesson,
  content,
}: LessonContentFormProps) {
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!content;

  const [question, setQuestion] = useState(
    content?.question ?? ""
  );
  const [answer, setAnswer] = useState(
    content?.answer ?? ""
  );
  const [optionA, setOptionA] = useState(
    content?.optionA ?? ""
  );
  const [optionB, setOptionB] = useState(
    content?.optionB ?? ""
  );
  const [optionC, setOptionC] = useState(
    content?.optionC ?? ""
  );
  const [optionD, setOptionD] = useState(
    content?.optionD ?? ""
  );
  const [leftText, setLeftText] = useState(
    content?.leftText ?? ""
  );
  const [rightText, setRightText] = useState(
    content?.rightText ?? ""
  );

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (isEditMode && content) {
          await updateLessonContent({
            contentId: content.id,
            question,
            answer,
            optionA,
            optionB,
            optionC,
            optionD,
            leftText,
            rightText,
          });

          toast.success("تم حفظ التعديلات بنجاح.");
        } else {
          await createLessonContent({
            lessonId: lesson.id,
            question,
            answer,
            optionA,
            optionB,
            optionC,
            optionD,
            leftText,
            rightText,
          });

          // إعادة تعيين الحقول بعد الإضافة
          setQuestion("");
          setAnswer("");
          setOptionA("");
          setOptionB("");
          setOptionC("");
          setOptionD("");
          setLeftText("");
          setRightText("");

          toast.success("تمت إضافة المحتوى بنجاح.");
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء الحفظ."
        );
      }
    });
  };

  const isQuiz = lesson.gameType === "QUIZ";
  const isMatching =
    lesson.gameType === "MATCHING";

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {isEditMode
            ? "تعديل عنصر المحتوى"
            : "إضافة عنصر جديد"}
        </CardTitle>

        <CardDescription>
          نوع اللعبة: {lesson.gameType}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Question */}
          <div className="space-y-2">
            <Label>السؤال / النص</Label>
            <Textarea
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              required
            />
          </div>

          {/* Answer */}
          <div className="space-y-2">
            <Label>الإجابة الصحيحة</Label>
            <Input
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
            />
          </div>

          {/* Quiz Options */}
          {isQuiz && (
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="الخيار الأول"
                value={optionA}
                onChange={(e) =>
                  setOptionA(e.target.value)
                }
              />
              <Input
                placeholder="الخيار الثاني"
                value={optionB}
                onChange={(e) =>
                  setOptionB(e.target.value)
                }
              />
              <Input
                placeholder="الخيار الثالث"
                value={optionC}
                onChange={(e) =>
                  setOptionC(e.target.value)
                }
              />
              <Input
                placeholder="الخيار الرابع"
                value={optionD}
                onChange={(e) =>
                  setOptionD(e.target.value)
                }
              />
            </div>
          )}

          {/* Matching Fields */}
          {isMatching && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>النص الأيسر</Label>
                <Input
                  value={leftText}
                  onChange={(e) =>
                    setLeftText(e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>النص الأيمن</Label>
                <Input
                  value={rightText}
                  onChange={(e) =>
                    setRightText(e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl"
          >
            {isPending ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : isEditMode ? (
              <>
                <Save className="ml-2 h-4 w-4" />
                حفظ التعديلات
              </>
            ) : (
              <>
                <PlusCircle className="ml-2 h-4 w-4" />
                إضافة المحتوى
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}