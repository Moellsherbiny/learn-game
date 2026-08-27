"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  CheckCircle2,
  Clock3,
  Crown,
  Flame,
  Keyboard,
  Shield,
  Swords,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  onDisconnect,
  onValue,
  ref,
  set,
  update,
} from "firebase/database";

import {
  realtimeDb,
} from "@/lib/firebase";

import {
  submitBattleAnswerAction,
} from "@/actions/student/battle";

import {
  cn,
} from "@/lib/utils";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

// =========================================
// TYPES
// =========================================

interface BattleQuestion {
  id: string;

  question: string;

  type: string;

  optionA?: string | null;

  optionB?: string | null;

  optionC?: string | null;

  optionD?: string | null;

  answer?: string | null;

  points: number;

  timeLimit: number;

  order: number;
}

interface Battle {
  id: string;

  title: string;

  code: string;

  status: string;

  teacher: string;

  questions: BattleQuestion[];
}

interface Props {
  battleId: string;

  participantId: string;

  studentId: string;

  studentName: string;

  studentImage: string;

  team:
    | "TEAM_A"
    | "TEAM_B";

  battle: Battle;
}

type AnswerState =
  | "idle"
  | "correct"
  | "wrong";

// =========================================
// COMPONENT
// =========================================

export default function StudentBattleGame({
  battleId,
  participantId,
  studentId,
  team,
  battle,
}: Props) {

  // =========================================
  // STATES
  // =========================================

  const [
    roomState,
    setRoomState,
  ] = useState<any>(
    null,
  );

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState<
    string | null
  >(null);

  const [
    answerState,
    setAnswerState,
  ] = useState<AnswerState>(
    "idle",
  );

  const [
    showFeedback,
    setShowFeedback,
  ] = useState(
    false,
  );

  const [
    timeLeft,
    setTimeLeft,
  ] = useState(0);

  const [
    combo,
    setCombo,
  ] = useState(0);

  const [
    streakCount,
    setStreakCount,
  ] = useState(0);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const feedbackTimeoutRef =
    useRef<
      NodeJS.Timeout | undefined
    >(undefined);

  // =========================================
  // FIREBASE LISTENER
  // =========================================

  useEffect(() => {
    const roomRef =
      ref(
        realtimeDb,
        `battles/${battleId}`,
      );

    const unsubscribe =
      onValue(
        roomRef,
        (
          snapshot,
        ) => {
          const value =
            snapshot.val();

          if (!value) {
            return;
          }

          setRoomState(
            value,
          );
        },
      );

    return () =>
      unsubscribe();
  }, [battleId]);

  // =========================================
  // PRESENCE
  // =========================================

  useEffect(() => {
    const presenceRef =
      ref(
        realtimeDb,
        `battles/${battleId}/presence/${studentId}`,
      );

    set(
      presenceRef,
      true,
    );

    onDisconnect(
      presenceRef,
    ).remove();

    return () => {
      set(
        presenceRef,
        null,
      );
    };
  }, [
    battleId,
    studentId,
  ]);

  // =========================================
  // PHASE
  // =========================================

  const phase =
    roomState?.phase ??
    "lobby";

  // =========================================
  // PARTICIPANTS
  // =========================================

  const participants =
    useMemo(() => {
      if (
        !roomState
          ?.participants
      ) {
        return [];
      }

      return Object.values(
        roomState
          .participants,
      ) as any[];
    }, [roomState]);

  // =========================================
  // PLAYER
  // =========================================

  const me =
    roomState
      ?.participants?.[
      studentId
    ];

  const isReady =
    me?.ready ??
    false;

  const answered =
    me?.answered ??
    false;

  // =========================================
  // SCORES
  // =========================================

  const teamAScore =
    participants
      .filter(
        (p) =>
          p.team ===
          "TEAM_A",
      )
      .reduce(
        (
          total,
          p,
        ) =>
          total +
          (p.score ?? 0),
        0,
      );

  const teamBScore =
    participants
      .filter(
        (p) =>
          p.team ===
          "TEAM_B",
      )
      .reduce(
        (
          total,
          p,
        ) =>
          total +
          (p.score ?? 0),
        0,
      );

  // =========================================
  // QUESTION
  // =========================================

  const currentQuestionIndex =
    roomState
      ?.currentQuestion ??
    0;

  const currentQuestion =
    battle.questions[
      currentQuestionIndex
    ];

  // =========================================
  // QUESTION GUARD
  // =========================================

  if (
    phase ===
      "playing" &&
    !currentQuestion
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">

        <div className="text-center">

          <Clock3 className="mx-auto mb-5 h-12 w-12 animate-spin text-primary" />

          <p className="text-lg font-medium text-muted-foreground">

            جاري تحميل السؤال...
          </p>
        </div>
      </main>
    );
  }

  // =========================================
  // OPTIONS
  // =========================================

  const options = [
    {
      key: "A",

      value:
        currentQuestion?.optionA,
    },

    {
      key: "B",

      value:
        currentQuestion?.optionB,
    },

    {
      key: "C",

      value:
        currentQuestion?.optionC,
    },

    {
      key: "D",

      value:
        currentQuestion?.optionD,
    },
  ].filter(
    (o) => !!o.value,
  ) as {
    key: string;

    value: string;
  }[];

  // =========================================
  // TIMER
  // =========================================

  useEffect(() => {
    if (
      phase !==
      "playing"
    ) {
      return;
    }

    if (
      !roomState?.questionEndsAt
    ) {
      return;
    }

    function updateTimer() {
      const remaining =
        Math.max(
          0,
          Math.floor(
            (
              roomState.questionEndsAt -
              Date.now()
            ) / 1000,
          ),
        );

      setTimeLeft(
        remaining,
      );
    }

    updateTimer();

    const interval =
      setInterval(
        updateTimer,
        1000,
      );

    return () =>
      clearInterval(
        interval,
      );
  }, [
    roomState?.questionEndsAt,
    phase,
  ]);

  // =========================================
  // RESET QUESTION STATES
  // =========================================

  useEffect(() => {
    setSelectedAnswer(
      null,
    );

    setShowFeedback(
      false,
    );

    setAnswerState(
      "idle",
    );

    setSubmitted(
      false,
    );

    if (
      feedbackTimeoutRef.current
    ) {
      clearTimeout(
        feedbackTimeoutRef.current,
      );
    }
  }, [
    currentQuestionIndex,
  ]);

  // =========================================
  // READY
  // =========================================

  async function handleReady() {
    try {
      await update(
        ref(
          realtimeDb,
          `battles/${battleId}/participants/${studentId}`,
        ),

        {
          id:
            participantId,

          studentId,

          ready: true,

          answered: false,

          score:
            me?.score ?? 0,

          team,
        },
      );

      toast.success(
        "أنت جاهز 🔥",
      );
    } catch {
      toast.error(
        "فشل تحديث الجاهزية",
      );
    }
  }

  // =========================================
  // ANSWER
  // =========================================

  async function handleAnswer(
    answer: string,
  ) {
    if (
      answered ||
      submitted ||
      isPending
    ) {
      return;
    }

    if (
      phase !==
      "playing"
    ) {
      return;
    }

    if (
      timeLeft <= 0
    ) {
      toast.error(
        "انتهى الوقت",
      );

      return;
    }

    if (
      !currentQuestion
    ) {
      return;
    }

    setSubmitted(
      true,
    );

    setSelectedAnswer(
      answer,
    );

    startTransition(
      async () => {
        try {
          const result =
            await submitBattleAnswerAction(
              {
                roomId:
                  battleId,

                questionId:
                  currentQuestion.id,

               

                answer,

                responseTime:
                  currentQuestion.timeLimit -
                  timeLeft,
              },
            );

          setAnswerState(
            result.data?.isCorrect
              ? "correct"
              : "wrong",
          );

          setShowFeedback(
            true,
          );

          if (
            result.data?.isCorrect
          ) {
            setCombo(
              (prev) =>
                Math.min(
                  prev + 1,
                  5,
                ),
            );

            setStreakCount(
              (
                prev,
              ) =>
                prev + 1,
            );

            toast.success(
              `+${result.data?.points} نقطة ⚡`,
            );
          } else {
            setCombo(0);

            setStreakCount(
              0,
            );

            toast.error(
              "إجابة خاطئة ❌",
            );
          }

          await update(
            ref(
              realtimeDb,
              `battles/${battleId}/participants/${studentId}`,
            ),

            {
              answered: true,
            },
          );

          feedbackTimeoutRef.current =
            setTimeout(
              () => {
                setShowFeedback(
                  false,
                );

                setAnswerState(
                  "idle",
                );
              },

              1200,
            );
        } catch (
          error
        ) {
          setSubmitted(
            false,
          );

          toast.error(
            error instanceof
              Error
              ? error.message
              : "حدث خطأ",
          );
        }
      },
    );
  }

  // =========================================
  // KEYBOARD
  // =========================================

  const keyboardHandler =
    useCallback(
      (
        e: KeyboardEvent,
      ) => {
        const map: Record<
          string,
          number
        > = {
          "1": 0,

          "2": 1,

          "3": 2,

          "4": 3,
        };

        const idx =
          map[e.key];

        if (
          idx ===
          undefined
        ) {
          return;
        }

        if (
          !options[idx]
        ) {
          return;
        }

        handleAnswer(
          options[idx]
            .value,
        );
      },

      [
        options,
        answered,
        submitted,
        isPending,
        timeLeft,
        phase,
      ],
    );

  useEffect(() => {
    window.addEventListener(
      "keydown",
      keyboardHandler,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        keyboardHandler,
      );
  }, [
    keyboardHandler,
  ]);

  // =========================================
  // LOADING
  // =========================================

  if (!roomState) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">

        <div className="text-center">

          <Clock3 className="mx-auto mb-5 h-12 w-12 animate-spin text-primary" />

          <p className="text-lg font-medium text-muted-foreground">

            جاري الاتصال بالغرفة...
          </p>
        </div>
      </main>
    );
  }

  // =========================================
  // FINISHED
  // =========================================

  if (
    phase ===
    "finished"
  ) {
    const winner =
      teamAScore >
      teamBScore
        ? "TEAM A"
        : teamBScore >
            teamAScore
          ? "TEAM B"
          : "DRAW";

    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">

        <Card className="w-full max-w-3xl rounded-[2rem] border bg-card">

          <CardContent className="p-12 text-center">

            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-yellow-500 text-black">

              <Trophy className="h-14 w-14" />
            </div>

            <h1 className="text-5xl font-black">

              انتهى التحدي 🎉
            </h1>

            <p className="mt-5 text-xl text-muted-foreground">

              الفائز:
              {" "}
              {winner}
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2">

              <div className="rounded-3xl bg-blue-600 p-8 text-white">

                <h2 className="text-3xl font-black">

                  TEAM A
                </h2>

                <div className="mt-4 text-6xl font-black">

                  {
                    teamAScore
                  }
                </div>
              </div>

              <div className="rounded-3xl bg-fuchsia-600 p-8 text-white">

                <h2 className="text-3xl font-black">

                  TEAM B
                </h2>

                <div className="mt-4 text-6xl font-black">

                  {
                    teamBScore
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // =========================================
  // READY SCREEN
  // =========================================

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">

        <Card className="w-full max-w-2xl rounded-[2rem] border bg-card">

          <CardContent className="p-12 text-center">

            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-primary">

              <Swords className="h-14 w-14 text-primary-foreground" />
            </div>

            <Badge className="rounded-xl px-5 py-2 text-lg">

              {team}
            </Badge>

            <h1 className="mt-6 text-4xl font-black leading-[1.7]">

              {
                battle.title
              }
            </h1>

            <p className="mt-5 text-lg text-muted-foreground">

              اضغط READY
              لتأكيد الجاهزية
            </p>

            <Button
              size="lg"
              onClick={
                handleReady
              }
              className="mt-10 h-16 rounded-2xl px-10 text-2xl font-black"
            >

              <Zap className="mr-3 h-6 w-6" />

              READY
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // =========================================
  // WAITING
  // =========================================

  if (
    phase ===
    "lobby"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">

        <div className="text-center">

          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-yellow-500 text-black">

            <Clock3 className="h-14 w-14 animate-spin" />
          </div>

          <h1 className="text-5xl font-black">

            Waiting...
          </h1>

          <p className="mt-5 text-xl text-muted-foreground">

            في انتظار بدء التحدي من المدرس
          </p>
        </div>
      </main>
    );
  }

  // =========================================
  // GUARD
  // =========================================

  if (
    phase !==
    "playing"
  ) {
    return null;
  }

  // =========================================
  // UI
  // =========================================

  return (
    <main className="min-h-screen bg-background text-foreground">

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6">

        {/* SCOREBOARD */}

        <div className="grid gap-5 lg:grid-cols-3">

          <Card className="rounded-3xl border-0 bg-blue-600 text-white">

            <CardContent className="p-6 text-center">

              <Shield className="mx-auto h-8 w-8" />

              <h2 className="mt-2 text-3xl font-black">

                TEAM A
              </h2>

              <div className="mt-3 text-6xl font-black">

                {
                  teamAScore
                }
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border bg-card">

            <CardContent className="p-6 text-center">

              <Clock3 className="mx-auto h-8 w-8 text-primary" />

              <div className="mt-3 text-7xl font-black">

                {timeLeft}
              </div>

              <p className="font-bold text-muted-foreground">

                ثانية
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 bg-fuchsia-600 text-white">

            <CardContent className="p-6 text-center">

              <Shield className="mx-auto h-8 w-8" />

              <h2 className="mt-2 text-3xl font-black">

                TEAM B
              </h2>

              <div className="mt-3 text-6xl font-black">

                {
                  teamBScore
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QUESTION */}

        <Card className="rounded-[2rem] border bg-card">

          <CardContent className="p-8 sm:p-12">

            {showFeedback && (

              <div className="mb-8 flex justify-center">

                <div
                  className={cn(
                    "flex h-24 w-24 items-center justify-center rounded-full",

                    answerState ===
                      "correct"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500",
                  )}
                >

                  {answerState ===
                  "correct" ? (
                    <CheckCircle2 className="h-14 w-14" />
                  ) : (
                    <XCircle className="h-14 w-14" />
                  )}
                </div>
              </div>
            )}

            <div className="mb-6 flex justify-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground">

                <Trophy className="h-8 w-8" />
              </div>
            </div>

            <h1 className="text-center text-3xl font-black leading-[1.8] sm:text-5xl">

              {
                currentQuestion.question
              }
            </h1>
          </CardContent>
        </Card>

        {/* OPTIONS */}

        <div className="grid gap-4 sm:grid-cols-2">

          {options.map(
            (
              option,
              idx,
            ) => {
              const isSelected =
                selectedAnswer ===
                option.value;

              return (
                <button
                  key={
                    option.key
                  }
                  disabled={
                    answered ||
                    submitted ||
                    isPending ||
                    timeLeft <= 0
                  }
                  onClick={() =>
                    handleAnswer(
                      option.value,
                    )
                  }
                  className={cn(
                    "rounded-3xl border p-6 text-right transition-all",

                    "hover:border-primary/30 hover:bg-primary/5",

                    isSelected
                      ? "border-primary bg-primary/10"
                      : "bg-card",
                  )}
                >

                  <div className="flex items-start gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted text-sm font-black">

                      {idx + 1}
                    </div>

                    <div className="flex-1">

                      <p className="text-xl font-bold leading-[1.9]">

                        {
                          option.value
                        }
                      </p>
                    </div>
                  </div>
                </button>
              );
            },
          )}
        </div>

        {/* STATS */}

        <div className="flex flex-wrap items-center justify-center gap-4">

          {combo >
            1 && (

            <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-500/10 px-4 py-2 text-orange-500">

              <Flame className="h-5 w-5" />

              <span className="font-bold">

                Combo ×
                {combo}
              </span>
            </div>
          )}

          {streakCount >
            0 && (

            <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-primary">

              <Zap className="h-5 w-5" />

              <span className="font-bold">

                {
                  streakCount
                }{" "}
                متتالية
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-2">

            <Crown className="h-5 w-5 text-yellow-400" />

            <span className="font-bold">

              {team}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-2 text-muted-foreground">

            <Keyboard className="h-5 w-5" />

            <span className="font-bold">

              استخدم 1-4
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}