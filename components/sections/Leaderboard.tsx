import Reveal from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { Flame, Trophy } from "lucide-react";

const players = [
  { rank: 1, medal: "🥇", name: "سارة المنصوري", avatar: "👩", streak: 28, xp: 4820, rankClass: "text-yellow-400 text-xl" },
  { rank: 2, medal: "🥈", name: "أحمد الحربي", avatar: "👨", streak: 21, xp: 4150, rankClass: "text-slate-300" },
  { rank: 3, medal: "🥉", name: "ريم الشمري", avatar: "👩", streak: 15, xp: 3890, rankClass: "text-amber-600" },
  { rank: 4, medal: "4", name: "خالد العتيبي", avatar: "👨", streak: 9, xp: 3400, rankClass: "text-slate-500" },
];

export default function Leaderboard() {
  return (
    <section id="leaderboard" className="relative z-10 px-6 lg:px-16 py-20">
      <Reveal>
        <p className="text-center text-xs tracking-widest uppercase font-bold text-game-purple-light mb-2">
          لوحة الصدارة
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
          من سيكون{" "}
          <span className="text-gradient-primary">الأذكى هذا الأسبوع؟</span>
        </h2>
        <p className="text-center text-slate-400 text-lg max-w-xl mx-auto mb-14">
          تنافس مع زملائك ومع طلاب من كل مكان. الصدارة تنتظرك!
        </p>
      </Reveal>

      <Reveal delay={100}>
        <div className="max-w-2xl mx-auto rounded-3xl border border-game-purple/25 bg-game-card overflow-hidden glow-purple-lg">
          {/* Header */}
          <div className="bg-linear-to-r from-game-purple/30 to-game-purple-light/20 px-8 py-5 border-b border-game-purple/20 flex items-center justify-between">
            <h3 className="text-lg font-extrabold"><Trophy className="mr-2" /> لوحة الصدارة الأسبوعية</h3>
            <span className="text-xs text-slate-400 bg-white/6 rounded-full px-3 py-1">
              هذا الأسبوع
            </span>
          </div>

          {/* Players */}
          {players.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-4 px-8 py-4 border-b border-white/4 hover:bg-white/3 transition-colors"
            >
              <span className={cn("text-sm font-black min-w-7 text-center", p.rankClass)}>
                {p.medal}
              </span>
              <div className="w-10 h-10 rounded-full bg-[#1E1E50] flex items-center justify-center text-lg shrink-0">
                {p.avatar}
              </div>
              <div className="flex-1 font-semibold text-sm">{p.name}</div>
              <span className="text-xs text-game-amber bg-game-amber/10 rounded-full px-2 py-0.5">
                <Flame className="mr-1" /> {p.streak} يوم
              </span>
              <span className="text-sm font-extrabold text-game-purple-light">
                {p.xp.toLocaleString()} نقاط الخبرة
              </span>
            </div>
          ))}

          {/* You */}
          <div className="flex items-center gap-4 px-8 py-4 bg-game-purple/8 rounded-b-3xl">
            <span className="text-sm font-black min-w-7 text-center text-slate-500">12</span>
            <div className="w-10 h-10 rounded-full bg-game-purple/20 flex items-center justify-center text-xs font-bold text-game-purple-light shrink-0">
              أنت
            </div>
            <div className="flex-1 text-sm font-semibold text-game-purple-light">
              أنت — ارتقِ 8 مراكز! 💪
            </div>
            <span className="text-xs text-game-amber bg-game-amber/10 rounded-full px-2 py-0.5">
              <Flame className="mr-1" /> 5 أيام
            </span>
            <span className="text-sm font-extrabold text-slate-500">1,920 نقاط خبرة</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
