"use client";

import { useState, useMemo, useCallback, useEffect } from "react";

import { CheckCircle2, Link2, Trophy, XCircle, ArrowLeft } from "lucide-react";

import { GameResult, LessonContent } from "./GameEngine";

import { cn } from "@/lib/utils";

interface MatchingGroup {
  question: string;

  pairs: {
    id: string;

    leftText?: string | null;

    rightText?: string | null;
  }[];
}

interface MatchingGameProps {
  groups: MatchingGroup[];

  onComplete: (result: GameResult) => void;
}

interface MatchItem {
  id: string;

  text: string;

  pairId: string;
}

const MATCH_COLORS = [
  "border-blue-300 bg-blue-50 text-blue-700",

  "border-orange-300 bg-orange-50 text-orange-700",

  "border-emerald-300 bg-emerald-50 text-emerald-700",

  "border-violet-300 bg-violet-50 text-violet-700",

  "border-pink-300 bg-pink-50 text-pink-700",
];

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function MatchingGame({ groups, onComplete }: MatchingGameProps) {
  // =========================
  // STATES
  // =========================

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const [matched, setMatched] = useState<Set<string>>(new Set());

  const [mistakes, setMistakes] = useState(0);

  const [correctMatches, setCorrectMatches] = useState(0);

  const [matchedColors, setMatchedColors] = useState<Record<string, number>>(
    {},
  );

  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);

  // =========================
  // CURRENT GROUP
  // =========================

  const currentGroup = groups[currentGroupIndex];

  const pairs = useMemo(
    () =>
      currentGroup?.pairs.filter((pair) => pair.leftText && pair.rightText) ??
      [],
    [currentGroup],
  );

  // =========================
  // LEFT ITEMS
  // =========================

  const leftItems = useMemo<MatchItem[]>(
    () =>
      pairs.map((pair) => ({
        id: `left-${pair.id}`,

        text: pair.leftText ?? "",

        pairId: pair.id,
      })),
    [pairs],
  );

  // =========================
  // RIGHT ITEMS SHUFFLED
  // =========================

  const rightItems = useMemo<MatchItem[]>(() => {
    const items = pairs.map((pair) => ({
      id: `right-${pair.id}`,

      text: pair.rightText ?? "",

      pairId: pair.id,
    }));

    // Fisher-Yates Shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [items[i], items[j]] = [items[j], items[i]];
    }

    return items;
  }, [pairs]);

  // =========================
  // RESET GROUP STATE
  // =========================

  useEffect(() => {
    setSelectedLeft(null);

    setSelectedRight(null);

    setMatched(new Set());

    setMatchedColors({});

    setWrongPair(null);
  }, [currentGroupIndex]);

  // =========================
  // TRY MATCH
  // =========================

  const tryMatch = useCallback(
    (leftId: string, rightId: string) => {
      const leftItem = leftItems.find((item) => item.id === leftId);

      const rightItem = rightItems.find((item) => item.id === rightId);

      if (!leftItem || !rightItem) {
        return;
      }

      // =========================
      // CORRECT
      // =========================

      if (leftItem.pairId === rightItem.pairId) {
        const newMatched = new Set(matched);

        newMatched.add(leftId);

        newMatched.add(rightId);

        setMatched(newMatched);

        const newCorrectMatches = correctMatches + 1;

        setCorrectMatches(newCorrectMatches);

        // COLOR INDEX
        const colorIndex = newMatched.size / 2 - 1;

        setMatchedColors((prev) => ({
          ...prev,

          [leftId]: colorIndex,

          [rightId]: colorIndex,
        }));

        setSelectedLeft(null);

        setSelectedRight(null);

        // =========================
        // GROUP COMPLETE
        // =========================

        if (newMatched.size === pairs.length * 2) {
          setIsTransitioning(true);

          setTimeout(() => {
            // NEXT GROUP
            if (currentGroupIndex < groups.length - 1) {
              setCurrentGroupIndex((prev) => prev + 1);

              setIsTransitioning(false);
            }

            // GAME COMPLETE
            else {
              const totalPairs = groups.reduce(
                (sum, group) => sum + group.pairs.length,
                0,
              );

              const finalScore = Math.round(
                (newCorrectMatches / totalPairs) * 100,
              );

              onComplete({
                score: finalScore,

                correctAnswers: correctMatches,

                totalQuestions: totalPairs,
              });
            }
          }, 1500);
        }
      }

      // =========================
      // WRONG
      // =========================
      else {
        setWrongPair([leftId, rightId]);

        setMistakes((prev) => prev + 1);

        setTimeout(() => {
          setWrongPair(null);

          setSelectedLeft(null);

          setSelectedRight(null);
        }, 700);
      }
    },
    [
      leftItems,
      rightItems,
      matched,
      correctMatches,
      pairs.length,
      currentGroupIndex,
      groups,
      onComplete,
    ],
  );

  // =========================
  // LEFT CLICK
  // =========================

  const handleLeftClick = useCallback(
    (id: string) => {
      if (matched.has(id)) {
        return;
      }

      const newLeft = selectedLeft === id ? null : id;

      setSelectedLeft(newLeft);

      if (newLeft && selectedRight) {
        tryMatch(newLeft, selectedRight);
      }
    },
    [matched, selectedLeft, selectedRight, tryMatch],
  );

  // =========================
  // RIGHT CLICK
  // =========================

  const handleRightClick = useCallback(
    (id: string) => {
      if (matched.has(id)) {
        return;
      }

      const newRight = selectedRight === id ? null : id;

      setSelectedRight(newRight);

      if (selectedLeft && newRight) {
        tryMatch(selectedLeft, newRight);
      }
    },
    [matched, selectedLeft, selectedRight, tryMatch],
  );

  // =========================
  // PROGRESS
  // =========================

  const progress = ((currentGroupIndex + 1) / groups.length) * 100;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-8 rounded-[32px] border border-border/60 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT */}

          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Link2 className="h-8 w-8" />
            </div>

            <div>
              <p className="mb-2 text-sm font-bold text-primary">
                Matching Game
              </p>

              <h1 className="text-3xl font-black leading-tight md:text-5xl">
                {currentGroup.question}
              </h1>

              <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
                اختر العنصر الصحيح من العمود الأيسر ثم قم بمطابقته مع الوصف
                المناسب من العمود الأيمن.
              </p>
            </div>
          </div>

          {/* STATS */}

          <div className="grid grid-cols-2 gap-4">
            {/* CORRECT */}

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-7 w-7 text-emerald-500" />

              <div className="text-4xl font-black text-emerald-600">
                {correctMatches}
              </div>

              <div className="mt-1 text-sm text-emerald-700">صحيحة</div>
            </div>

            {/* WRONG */}

            <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-center">
              <XCircle className="mx-auto mb-3 h-7 w-7 text-red-500" />

              <div className="text-4xl font-black text-red-600">{mistakes}</div>

              <div className="mt-1 text-sm text-red-700">أخطاء</div>
            </div>
          </div>
        </div>

        {/* PROGRESS */}

        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              تقدمك في اللعبة
            </span>

            <span className="text-lg font-black text-primary">
              {currentGroupIndex + 1}/{groups.length}
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

      {/* =========================
          GAME BOARD
      ========================= */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* =========================
            LEFT COLUMN
        ========================= */}

        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-primary" />

            <h2 className="text-2xl font-black">العناصر</h2>
          </div>

          <div className="space-y-4">
            {leftItems.map((item) => {
              const isMatched = matched.has(item.id);

              const isSelected = selectedLeft === item.id;

              const isWrong = wrongPair?.[0] === item.id;

              const colorIndex = matchedColors[item.id];

              return (
                <button
                  key={item.id}
                  onClick={() => handleLeftClick(item.id)}
                  disabled={isMatched}
                  className={cn(
                    `
                      w-full rounded-3xl border p-6
                      text-right transition-all duration-300
                    `,

                    !isMatched &&
                      `
                        hover:scale-[1.02]
                        hover:shadow-lg
                      `,

                    isSelected &&
                      `
                        scale-[1.02]
                        border-primary
                        bg-primary/10
                        shadow-xl
                      `,

                    isWrong &&
                      `
                        border-red-300
                        bg-red-50
                        text-red-600
                      `,

                    isMatched && MATCH_COLORS[colorIndex % MATCH_COLORS.length],

                    !isMatched &&
                      !isSelected &&
                      !isWrong &&
                      `
                        border-border/60
                        bg-white
                      `,
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xl font-bold">{item.text}</span>

                    {isMatched && <CheckCircle2 className="h-5 w-5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================
            RIGHT COLUMN
        ========================= */}

        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-orange-400" />

            <h2 className="text-2xl font-black">الإجابات</h2>
          </div>

          <div className="space-y-4">
            {rightItems.map((item) => {
              const isMatched = matched.has(item.id);

              const isSelected = selectedRight === item.id;

              const isWrong = wrongPair?.[1] === item.id;

              const colorIndex = matchedColors[item.id];

              return (
                <button
                  key={item.id}
                  onClick={() => handleRightClick(item.id)}
                  disabled={isMatched}
                  className={cn(
                    `
                      w-full rounded-3xl border p-6
                      text-right transition-all duration-300
                    `,

                    !isMatched &&
                      `
                        hover:scale-[1.02]
                        hover:shadow-lg
                      `,

                    isSelected &&
                      `
                        scale-[1.02]
                        border-orange-300
                        bg-orange-50
                        shadow-xl
                      `,

                    isWrong &&
                      `
                        border-red-300
                        bg-red-50
                        text-red-600
                      `,

                    isMatched && MATCH_COLORS[colorIndex % MATCH_COLORS.length],

                    !isMatched &&
                      !isSelected &&
                      !isWrong &&
                      `
                        border-border/60
                        bg-white
                      `,
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xl font-bold">{item.text}</span>

                    {isMatched && <CheckCircle2 className="h-5 w-5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================
          TRANSITION
      ========================= */}

      {isTransitioning && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/40 backdrop-blur-sm
          "
        >
          <div className="rounded-[32px] bg-white p-10 text-center shadow-2xl">
            <Trophy className="mx-auto mb-5 h-16 w-16 text-primary" />

            <h2 className="text-3xl font-black">أحسنت 🎉</h2>

            <p className="mt-3 text-muted-foreground">
              جاري الانتقال للسؤال التالي...
            </p>

            <ArrowLeft className="mx-auto mt-6 h-6 w-6 animate-bounce text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}
