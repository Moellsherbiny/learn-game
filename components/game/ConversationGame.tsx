"use client";

import {
  useState,
  useMemo,
  useCallback,
} from "react";

import {
  Bot,
  CheckCircle2,
  MessageCircle,
  SendHorizonal,
  Sparkles,
  User2,
  XCircle,
} from "lucide-react";

import {
  LessonContent,
  GameResult,
} from "./GameEngine";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

interface ConversationGameProps {
  contents: LessonContent[];

  onComplete: (
    result: GameResult,
  ) => void;
}

interface ChatMessage {
  id: string;

  role: "bot" | "user";

  text: string;

  correct?: boolean;
}

export function ConversationGame({
  contents,
  onComplete,
}: ConversationGameProps) {
  const questions =
    useMemo(
      () =>
        contents.filter(
          (c) =>
            c.question &&
            c.answer,
        ),
      [contents],
    );

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [input, setInput] =
    useState("");

  const [
    messages,
    setMessages,
  ] = useState<
    ChatMessage[]
  >([
    {
      id: "welcome",

      role: "bot",

      text: questions[0]
        ?.question,
    },
  ]);

  const [score, setScore] =
    useState(0);

  const [
    wrongAnswers,
    setWrongAnswers,
  ] = useState(0);

  const currentQuestion =
    questions[currentIndex];

  const progress =
    ((currentIndex + 1) /
      questions.length) *
    100;

  const submitAnswer =
    useCallback(() => {
      if (
        !input.trim() ||
        !currentQuestion
      ) {
        return;
      }

      const normalizedUser =
        input
          .trim()
          .toLowerCase();

      const normalizedAnswer =
        currentQuestion.answer
          ?.trim()
          .toLowerCase() ??
        "";

      const isCorrect =
        normalizedUser ===
        normalizedAnswer;

      // USER MESSAGE

      const userMessage: ChatMessage =
        {
          id: crypto.randomUUID(),

          role: "user",

          text: input,

          correct:
            isCorrect,
        };

      // BOT FEEDBACK

      const botMessage: ChatMessage =
        {
          id: crypto.randomUUID(),

          role: "bot",

          text: isCorrect
            ? "إجابة ممتازة 👏"
            : `الإجابة الصحيحة هي: ${currentQuestion.answer}`,

          correct:
            isCorrect,
        };

      setMessages(
        (prev) => [
          ...prev,
          userMessage,
          botMessage,
        ],
      );

      if (isCorrect) {
        setScore(
          (prev) =>
            prev + 1,
        );
      } else {
        setWrongAnswers(
          (prev) =>
            prev + 1,
        );
      }

      setInput("");

      // NEXT QUESTION

      setTimeout(() => {
        const nextIndex =
          currentIndex + 1;

        // FINISH

        if (
          nextIndex >=
          questions.length
        ) {
          const finalScore =
            Math.round(
              (score +
                (isCorrect
                  ? 1
                  : 0)) /
                questions.length *
                100,
            );

          onComplete({
            score:
              finalScore,

            correctAnswers:
              score +
              (isCorrect
                ? 1
                : 0),

            totalQuestions:
              questions.length,
          });

          return;
        }

        // NEXT BOT QUESTION

        setCurrentIndex(
          nextIndex,
        );

        setMessages(
          (prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),

              role: "bot",

              text: questions[
                nextIndex
              ].question,
            },
          ],
        );
      }, 1200);
    }, [
      input,
      currentQuestion,
      currentIndex,
      questions,
      score,
      onComplete,
    ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* HERO */}

      <div className="mb-8 rounded-[32px] border border-border/60 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT */}

          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <MessageCircle className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm font-bold text-primary">
                  Conversation Challenge
                </p>

                <h1 className="text-3xl font-black">
                  محادثة تفاعلية
                </h1>
              </div>
            </div>

            <p className="max-w-2xl leading-8 text-muted-foreground">
              أجب على الأسئلة
              وكأنك داخل
              محادثة حقيقية مع
              النظام التعليمي.
            </p>
          </div>

          {/* STATS */}

          <div className="grid grid-cols-2 gap-4">
            {/* SCORE */}

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mb-2 flex justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>

              <div className="text-3xl font-black text-emerald-600">
                {score}
              </div>

              <div className="text-sm text-emerald-700">
                صحيحة
              </div>
            </div>

            {/* WRONG */}

            <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-center">
              <div className="mb-2 flex justify-center">
                <XCircle className="h-7 w-7 text-red-500" />
              </div>

              <div className="text-3xl font-black text-red-600">
                {
                  wrongAnswers
                }
              </div>

              <div className="text-sm text-red-700">
                أخطاء
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESS */}

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              تقدمك في
              المحادثة
            </span>

            <span className="font-black text-primary">
              {
                currentIndex +
                  1
              }
              /
              {
                questions.length
              }
            </span>
          </div>

          <div className="h-4 overflow-hidden rounded-full bg-muted/30">
            <div
              className="
                h-full rounded-full
                bg-linear-to-r
                from-primary
                to-orange-400
                transition-all duration-500
              "
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* CHAT */}

      <div className="overflow-hidden rounded-[32px] border border-border/60 bg-white shadow-sm">
        {/* CHAT HEADER */}

        <div className="border-b border-border/60 p-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bot className="h-6 w-6" />
              </div>

              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div>
              <h2 className="font-black">
                AI Teacher
              </h2>

              <p className="text-sm text-muted-foreground">
                متصل الآن
              </p>
            </div>
          </div>
        </div>

        {/* MESSAGES */}

        <div className="max-h-125 space-y-5 overflow-y-auto bg-muted/10 p-6">
          {messages.map(
            (message) => (
              <div
                key={
                  message.id
                }
                className={cn(
                  "flex w-full",

                  message.role ===
                    "user"
                    ? "justify-start"
                    : "justify-end",
                )}
              >
                <div
                  className={cn(
                    `
                    flex max-w-[85%] items-start gap-3
                  `,

                    message.role ===
                      "user" &&
                      "flex-row-reverse",
                  )}
                >
                  {/* AVATAR */}

                  <div
                    className={cn(
                      `
                      flex h-10 w-10 shrink-0
                      items-center justify-center
                      rounded-2xl
                    `,

                      message.role ===
                        "bot"
                        ? "bg-primary/10 text-primary"
                        : "bg-orange-100 text-orange-500",
                    )}
                  >
                    {message.role ===
                    "bot" ? (
                      <Bot className="h-5 w-5" />
                    ) : (
                      <User2 className="h-5 w-5" />
                    )}
                  </div>

                  {/* BUBBLE */}

                  <div
                    className={cn(
                      `
                      rounded-[28px] px-5 py-4
                      leading-8 shadow-sm
                    `,

                      message.role ===
                        "bot" &&
                        `
                        rounded-tr-md
                        border border-border/60
                        bg-white
                      `,

                      message.role ===
                        "user" &&
                        `
                        rounded-tl-md
                        bg-primary text-white
                      `,

                      message.correct ===
                        false &&
                        message.role ===
                          "user" &&
                        `
                        bg-red-500
                      `,
                    )}
                  >
                    <p className="text-[15px] font-medium">
                      {
                        message.text
                      }
                    </p>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        {/* INPUT */}

        <div className="border-t border-border/60 bg-white p-5">
          <div className="flex items-center gap-3">
            <Input
              value={input}
              onChange={(e) =>
                setInput(
                  e.target
                    .value,
                )
              }
              onKeyDown={(
                e,
              ) => {
                if (
                  e.key ===
                  "Enter"
                ) {
                  submitAnswer();
                }
              }}
              placeholder="اكتب إجابتك هنا..."
              className="
                h-14 rounded-2xl
                border-border/60
                bg-muted/10
                text-base
              "
            />

            <Button
              onClick={
                submitAnswer
              }
              disabled={
                !input.trim()
              }
              className="
                h-14 rounded-2xl
                px-6
              "
            >
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </div>

          {/* HINT */}

          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />

            اضغط Enter أو زر
            الإرسال للإجابة.
          </div>
        </div>
      </div>
    </div>
  );
}