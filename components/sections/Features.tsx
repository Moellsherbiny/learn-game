import { Card, CardContent } from "@/components/ui/card";
import Reveal from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import {
  Map,
  Zap,
  Flame,
  Trophy,
  BarChart3,
  Coins,
} from "lucide-react";

const features = [
  {
    icon: Map,
    title: "مسار تعلم ذكي",
    desc: "اختبار تحديد مستوى يضعك في المكان الصحيح مباشرةً، ويقترح المسار الأنسب لقدراتك وأهدافك.",
    iconBg: "bg-game-purple/18",
    iconColor: "text-game-purple-light",
    accent: "hover:border-game-purple/50",
    topLine: "from-game-purple-light",
  },
  {
    icon: Zap,
    title: "نقاط الخبرة",
    desc: "اكسب نقاطاً مع كل درس تجتازه وارتقِ في المستويات. كلما أتقنت أكثر، كلما فتحت محتوى أعمق.",
    iconBg: "bg-game-amber/15",
    iconColor: "text-game-amber",
    accent: "hover:border-game-amber/40",
    topLine: "from-game-amber",
  },
  {
    icon: Flame,
    title: "سلسلة التعلم اليومي",
    desc: "حافظ على streak يومي وأثبت ثباتك. حتى 30 دقيقة في اليوم تُحدث فرقاً لا تتخيله.",
    iconBg: "bg-game-green/13",
    iconColor: "text-game-green",
    accent: "hover:border-game-green/40",
    topLine: "from-game-green",
  },
  {
    icon: Trophy,
    title: "نظام الإنجازات",
    desc: "شارات ومكافآت لكل منعطف في رحلتك. أول درس، أول أسبوع، أعلى نقاط — كل لحظة تستحق احتفالاً.",
    iconBg: "bg-red-500/13",
    iconColor: "text-red-400",
    accent: "hover:border-red-500/35",
    topLine: "from-red-400",
  },
  {
    icon: BarChart3,
    title: "تحليل التقدم",
    desc: "لوحة تحكم تفصيلية للمعلمين لمتابعة كل طالب، تحليل نتائجه، وتحديد نقاط الضعف بدقة.",
    iconBg: "bg-blue-400/13",
    iconColor: "text-blue-400",
    accent: "hover:border-blue-400/35",
    topLine: "from-blue-400",
  },
  {
    icon: Coins,
    title: "العملات الرقمية",
    desc: "اجمع عملات واستبدلها بمميزات إضافية داخل المنصة. الاستمرار في التعلم له ثمنه الجميل.",
    iconBg: "bg-violet-400/13",
    iconColor: "text-violet-400",
    accent: "hover:border-violet-400/35",
    topLine: "from-violet-400",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative z-10 px-6 lg:px-16 py-20">
      <Reveal>
        <p className="text-center text-xs tracking-widest uppercase font-bold text-game-purple-light mb-2">
          لماذا رحلتي؟
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
          كل ما تحتاجه للتعلم{" "}
          <span className="text-gradient-primary">بمتعة حقيقية</span>
        </h2>
        <p className="text-center text-slate-400 text-lg max-w-xl mx-auto mb-14">
          منظومة تعليمية متكاملة تجمع بين العلم والترفيه والتحفيز المستمر
        </p>
      </Reveal>

      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={f.title} delay={i * 80}>
              <Card
                className={cn(
                  "relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]",
                  f.accent
                )}
              >
                {/* Top accent line */}
                <div
                  className={cn(
                    "absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
                    f.topLine
                  )}
                />
                <CardContent className="p-7">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-5",
                      f.iconBg
                    )}
                  >
                    <Icon className={cn("w-7 h-7", f.iconColor)} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
