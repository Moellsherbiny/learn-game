import Reveal from "@/components/ui/reveal";
import { Card, CardContent } from "@/components/ui/card";

const rewards = [
  { emoji: "⭐", name: "النجوم", desc: "اجمع 3 نجوم في كل درس بالإجابة بدقة وسرعة" },
  { emoji: "🪙", name: "العملات", desc: "عملات رقمية تُستبدل بمزايا ومحتوى إضافي" },
  { emoji: "🎖️", name: "الإنجازات", desc: "شارات حصرية تعكس مسيرتك التعليمية الفريدة" },
  { emoji: "🔥", name: "السلسلة", desc: "Streak يومي يُثبت التزامك ويمنحك مكافآت خاصة" },
];

export default function Rewards() {
  return (
    <section className="relative z-10 px-6 lg:px-16 py-20">
      <Reveal>
        <p className="text-center text-xs tracking-widest uppercase font-bold text-game-purple-light mb-2">
          نظام المكافآت
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
          كل جهد له{" "}
          <span className="text-game-amber">مكافأته</span>
        </h2>
        <p className="text-center text-slate-400 text-lg max-w-xl mx-auto mb-14">
          منظومة تحفيز تجعل كل درس مغامرة جديدة
        </p>
      </Reveal>

      <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
        {rewards.map((r, i) => (
          <Reveal key={r.name} delay={i * 80}>
            <Card className="text-center hover:-translate-y-1 transition-transform duration-300 cursor-default">
              <CardContent className="p-6">
                <div className="text-5xl mb-4">{r.emoji}</div>
                <h3 className="text-base font-bold mb-2">{r.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
