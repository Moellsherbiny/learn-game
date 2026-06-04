"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import Reveal from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle2, Flame, Zap } from "lucide-react";

const gameTypes = [
  { label: "اختبار سريع", color: "bg-game-purple-light" },
  { label: "مطابقة", color: "bg-game-amber" },
  { label: "أكمل الجملة", color: "bg-game-green" },
  { label: "محادثة تفاعلية", color: "bg-blue-400" },
  { label: "ترتيب الكلمات", color: "bg-pink-400" },
];

const modules = [
  { icon: "✅", name: "المتغيرات والثوابت", progress: 100, status: "done", color: "green" },
  { icon: "🧮", name: "المعادلات البسيطة", progress: 60, status: "active", color: "purple" },
  { icon: "📐", name: "المعادلات التربيعية", progress: 0, status: "locked", color: "amber" },
  { icon: "📊", name: "الرسم البياني", progress: 0, status: "locked", color: "red" },
];

const answers = [
  { text: "x = 6", correct: true },
  { text: "x = 4", correct: false },
  { text: "x = 14", correct: false },
  { text: "x = 10", correct: false },
];

export default function GamePreview() {
  const [selected, setSelected] = useState<number | null>(null);

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
  };

  return (
    <section id="preview" className="relative z-10 px-6 lg:px-16 py-20">
      <Reveal>
        <p className="text-center text-xs tracking-widest uppercase font-bold text-game-purple-light mb-2">
          تجربة التعلم
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
          ألعاب تعليمية{" "}
          <span className="text-gradient-primary">تشعل شغفك</span>
        </h2>
        <p className="text-center text-slate-400 text-lg max-w-xl mx-auto mb-10">
          بدلاً من مشاهدة الفيديوهات، تتفاعل مع المحتوى مباشرة من خلال ألعاب
          ذكية تُثبّت المعلومة في ذاكرتك
        </p>

        {/* Game type pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {gameTypes.map((g) => (
            <div
              key={g.label}
              className="flex items-center gap-2 bg-game-card border border-game-purple/25 rounded-full px-4 py-2 text-sm font-semibold hover:border-game-purple/50 hover:-translate-y-0.5 transition-all cursor-default"
            >
              <span className={cn("w-2 h-2 rounded-full", g.color)} />
              {g.label}
            </div>
          ))}
        </div>
      </Reveal>

      {/* Game UI */}
      <Reveal delay={150}>
        <div className="max-w-4xl mx-auto rounded-3xl border border-game-purple/25 bg-game-card overflow-hidden glow-purple-lg">
          {/* Header */}
          <div className="bg-[#1E1E50] px-6 py-4 border-b border-game-purple/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>🏠</span>
              <span>الرياضيات</span>
              <span>›</span>
              <span>الجبر</span>
              <span>›</span>
              <span className="text-white font-semibold">المعادلات</span>
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-game-amber" />
                <span className="text-xs font-bold text-game-amber">340 XP</span>
              </div>
              <Progress value={68} colorClass="bg-gradient-to-r from-game-purple to-game-purple-light" className="flex-1" />
              <span className="text-xs text-slate-500">500</span>
            </div>

            <div className="flex items-center gap-1.5 bg-game-amber/10 border border-game-amber/30 rounded-full px-3 py-1">
              <Flame className="w-4 h-4 text-game-amber" />
              <span className="text-xs font-bold text-game-amber">12 يوم</span>
            </div>
          </div>

          {/* Body */}
          <div className="grid md:grid-cols-2">
            {/* Quiz Area */}
            <div className="p-6 flex flex-col">
              <Badge variant="default" className="self-start mb-5">
                ✨ اختبار سريع
              </Badge>

              <h3 className="text-lg font-bold mb-5 leading-snug">
                ما هو حل المعادلة: 2x + 8 = 20 ？
              </h3>

              <div className="flex flex-col gap-3 flex-1">
                {answers.map((ans, i) => {
                  const isSelected = selected === i;
                  const showResult = selected !== null;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className={cn(
                        "w-full text-right px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                        !showResult &&
                          "bg-white/4 border-white/10 hover:bg-game-purple/15 hover:border-game-purple/40 hover:-translate-x-0.5",
                        showResult &&
                          ans.correct &&
                          "bg-game-green/15 border-game-green/50 text-game-green",
                        showResult &&
                          isSelected &&
                          !ans.correct &&
                          "bg-red-500/10 border-red-500/30 text-red-400",
                        showResult &&
                          !isSelected &&
                          !ans.correct &&
                          "bg-white/4 border-white/10 opacity-50"
                      )}
                    >
                      {showResult && ans.correct && "✅ "}
                      {showResult && isSelected && !ans.correct && "❌ "}
                      {ans.text}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 mt-5">
                <div className="flex gap-1">
                  <span>❤️</span>
                  <span>❤️</span>
                  <span>❤️</span>
                </div>
                <span className="text-xs text-slate-500">3 محاولات متبقية</span>
                <span className="text-xs font-bold text-game-amber mr-auto">+15 XP</span>
              </div>
            </div>

            {/* Module Tree */}
            <div className="p-6 border-t md:border-t-0 md:border-r border-game-purple/20">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-5">
                مسار التعلم
              </p>
              <div className="flex flex-col gap-3">
                {modules.map((mod) => (
                  <div
                    key={mod.name}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all",
                      mod.status === "active" &&
                        "bg-game-purple/20 border border-game-purple/35",
                      mod.status === "done" && "opacity-70",
                      mod.status === "locked" && "opacity-40"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0",
                        mod.color === "green" && "bg-game-green/15",
                        mod.color === "purple" && "bg-game-purple/20",
                        mod.color === "amber" && "bg-game-amber/15",
                        mod.color === "red" && "bg-red-500/15"
                      )}
                    >
                      {mod.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold mb-1.5">{mod.name}</p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={mod.progress}
                          colorClass={
                            mod.color === "green"
                              ? "bg-game-green"
                              : "bg-game-purple-light"
                          }
                          className="flex-1 h-1"
                        />
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {mod.status === "locked"
                            ? "مقفل"
                            : `${mod.progress}%`}
                        </span>
                      </div>
                    </div>
                    {mod.status === "locked" && (
                      <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    {mod.status === "done" && (
                      <CheckCircle2 className="w-4 h-4 text-game-green shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
