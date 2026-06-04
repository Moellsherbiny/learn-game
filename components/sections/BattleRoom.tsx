import Reveal from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const teamA = {
  name: "الفريق الأزرق",
  emoji: "🔵",
  score: 7,
  label: "إجابات صحيحة",
  color: "text-game-purple-light",
  border: "border-game-purple/35",
  members: ["أح", "سا", "ري"],
  extra: { count: "+2", bg: "bg-game-purple/20", text: "text-game-purple-light" },
};

const teamB = {
  name: "الفريق الأحمر",
  emoji: "🔴",
  score: 5,
  label: "إجابات صحيحة",
  color: "text-red-400",
  border: "border-red-500/30",
  members: ["فا", "خا", "نو"],
  extra: { count: "+3", bg: "bg-red-500/15", text: "text-red-400" },
};

function TeamCard({ team }: { team: typeof teamA }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-game-card border p-7 text-center",
        team.border
      )}
    >
      <p className="text-xs uppercase tracking-widest font-bold mb-3 text-slate-400">
        {team.emoji} {team.name}
      </p>
      <p className={cn("text-6xl font-black mb-1", team.color)}>
        {team.name === teamA.name ? "🏆 " : ""}
        {team.score}
      </p>
      <p className="text-xs text-slate-500 mb-5">{team.label}</p>
      <div className="flex justify-center -space-x-2 space-x-reverse">
        {team.members.map((m) => (
          <div
            key={m}
            className="w-9 h-9 rounded-full bg-[#1E1E50] border-2 border-game-card flex items-center justify-center text-xs font-bold text-white"
          >
            {m}
          </div>
        ))}
        <div
          className={cn(
            "w-9 h-9 rounded-full border-2 border-game-card flex items-center justify-center text-xs font-bold",
            team.extra.bg,
            team.extra.text
          )}
        >
          {team.extra.count}
        </div>
      </div>
    </div>
  );
}

export default function BattleRoom() {
  return (
    <section id="battle" className="relative z-10 px-6 lg:px-16 py-20">
      <Reveal>
        <div className="max-w-4xl mx-auto rounded-3xl border border-game-purple/20 bg-linear-to-br from-game-purple/8 to-red-500/5 p-10">
          <p className="text-center text-xs tracking-widest uppercase font-bold text-game-purple-light mb-2">
            التحدي الجماعي
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-center mb-3">
            غرف القتال الحية
            <br />
            <span className="text-red-400">⚔️ Battle Rooms</span>
          </h2>
          <p className="text-center text-slate-400 text-lg max-w-xl mx-auto mb-10">
            المعلم يُنشئ التحدي، والطلاب يتنافسون في الوقت الحقيقي. الفريق
            الأكثر ذكاءً يفوز!
          </p>

          {/* Battle Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-6">
            <TeamCard team={teamA} />

            {/* VS */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-5xl font-black bg-linear-to-b from-game-purple-light to-red-400 bg-clip-text text-transparent">
                VS
              </p>
              <Badge variant="destructive" className="text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-slow" />
                LIVE
              </Badge>
            </div>

            <TeamCard team={teamB} />
          </div>

          {/* Current question */}
          <div className="bg-game-card border border-game-purple/20 rounded-2xl p-6 text-center">
            <p className="text-xs text-slate-500 mb-2">السؤال 8 من 15</p>
            <p className="text-lg font-bold mb-4">
              ما هي عاصمة المملكة العربية السعودية？
            </p>
            <div className="inline-flex items-center gap-2 bg-game-purple/15 border border-game-purple/30 rounded-full px-4 py-2 text-sm text-game-purple-light font-semibold">
              🔵 دور الفريق الأزرق للإجابة &nbsp; ⏱ 12 ث
            </div>
          </div>

          {/* How it works */}
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { icon: "📝", title: "المعلم ينشئ الغرفة", desc: "يضيف الأسئلة ويقسّم الطلاب لفريقين" },
              { icon: "⚡", title: "منافسة حية", desc: "كل فريق يجيب بدوره، والنقاط تُحتسب لحظياً" },
              { icon: "🏆", title: "فريق واحد يفوز", desc: "الفريق الأكثر إجابات صحيحة يحصل على المجد" },
            ].map((step) => (
              <div
                key={step.title}
                className="bg-white/3 border border-white/8 rounded-xl p-4 text-center"
              >
                <div className="text-2xl mb-2">{step.icon}</div>
                <p className="text-sm font-bold mb-1">{step.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
