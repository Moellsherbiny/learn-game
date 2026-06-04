"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Label } from "@/components/ui/label";

import { submitPlacementTestAction } from "@/actions/placement/submit";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
interface Question {
  id: string;

  question: string;

  options: string[];

  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

interface Props {
  courseId: string;

  test: {
    id: string;

    title: string;

    questions: Question[];
  };
}

function shuffle<T>(array: T[]) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function LoadingStep({ done, text }: { done: boolean; text: string }) {
  return (
    <div
      className={`
        flex items-center gap-3
        rounded-xl border
        p-4
        transition-all duration-500
        ${done ? "border-green-500/20 bg-green-500/5" : "border-border"}
      `}
    >
      {done ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      )}

      <span className="font-medium">{text}</span>
    </div>
  );
}

export function PlacementTestClient({ courseId, test }: Props) {
  const router = useRouter();

  const [steps, setSteps] = useState({
    test: false,
    questions: false,
    redirect: false,
  });

  const [phase, setPhase] = useState<"loading" | "intro" | "exam">("loading");

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);

  const [pending, startTransition] = useTransition();

  const [questions] = useState(() =>
    shuffle(test.questions).map((q) => ({
      ...q,

      options: shuffle(q.options),
    })),
  );

  const currentQuestion = questions[currentIndex];

  const progress = ((currentIndex + 1) / questions.length) * 100;

  useEffect(() => {
    const run = async () => {
      await new Promise((r) => setTimeout(r, 1000));

      setSteps((s) => ({
        ...s,
        test: true,
      }));

      await new Promise((r) => setTimeout(r, 900));

      setSteps((s) => ({
        ...s,
        questions: true,
      }));

      await new Promise((r) => setTimeout(r, 900));

      setSteps((s) => ({
        ...s,
        redirect: true,
      }));

      await new Promise((r) => setTimeout(r, 700));

      setPhase("intro");
    };

    run();
  }, []);
  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = () => {
    setSubmitting(true);

    startTransition(async () => {
      try {
        await submitPlacementTestAction({
          courseId,
          answers,
        });

        router.push(`/student/courses/${courseId}/placement-result`);
      } finally {
        setSubmitting(false);
      }
    });
  };

  const allAnswered = test.questions.every((q) => answers[q.id]);

  if (phase === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>تجهيز الاختبار</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <LoadingStep
              done={steps.test}
              text="جاري إنشاء اختبار تحديد المستوى"
            />

            <LoadingStep done={steps.questions} text="جاري تجهيز الأسئلة" />

            <LoadingStep done={steps.redirect} text="جاري توجيهك للاختبار" />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (phase === "intro") {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>اختبار تحديد المستوى</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              سنقوم بتحديد مستواك وفتح المحتوى المناسب لك تلقائيًا.
            </p>

            <div className="space-y-2 rounded-xl border p-4">
              <p>
                عدد الأسئلة:
                {questions.length}
              </p>

              <p>نوع الأسئلة: اختيار من متعدد</p>

              <p>المدة: غير محددة</p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => setPhase("exam")}
            >
              بدء الاختبار
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  return (
    <main
      className="
        mx-auto
        max-w-4xl
        space-y-8
        px-4
        py-12
      "
      dir="rtl"
    >
      <div>
        <h1 className="text-4xl font-black">{test.title}</h1>

        <p className="mt-3 text-muted-foreground">
          أجب على جميع الأسئلة لتحديد مستواك.
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          السؤال {currentIndex + 1}
          من {questions.length}
        </span>

        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <Separator className="my-6" />
      <Badge variant="secondary">
        {currentQuestion.difficulty === "BEGINNER"
          ? "مبتدئ"
          : currentQuestion.difficulty === "INTERMEDIATE"
            ? "متوسط"
            : "متقدم"}
      </Badge>
      <Separator className="my-6" />
      <Card>
        <CardHeader>
          <CardTitle>
            السؤال {currentIndex + 1}
            من {questions.length}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="mb-6 text-lg font-medium">{currentQuestion.question}</p>

          <RadioGroup
            value={answers[currentQuestion.id]}
            onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
          >
            {currentQuestion.options.map((option) => (
              <Label
                key={option}
                className="
              flex cursor-pointer
              items-center gap-3
              rounded-xl border p-4
              transition-colors
              hover:bg-muted
            "
              >
                <RadioGroupItem value={option} />

                {option}
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
        >
          السابق
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button
            disabled={!answers[currentQuestion.id]}
            onClick={handleSubmit}
          >
            إنهاء الاختبار
          </Button>
        ) : (
          <Button
            disabled={!answers[currentQuestion.id]}
            onClick={() => setCurrentIndex((i) => i + 1)}
          >
            التالي
          </Button>
        )}
      </div>
      {submitting && (
        <div
          className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-background/80
      backdrop-blur
    "
        >
          <Card className="w-80">
            <CardContent className="py-8 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />

              <h3 className="font-bold">جاري تحليل إجاباتك</h3>

              <p className="mt-2 text-sm text-muted-foreground">
                يتم الآن تحديد مستواك المناسب...
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
