import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Gamepad2,
  Search,
  Trophy,
  Coins,
  Flame,
  Swords,
} from "lucide-react";

const stats = [
  { num: "+50,000", label: "طالب نشط" },
  { num: "+200", label: "مسار تعليمي" },
  { num: "96%", label: "نسبة الرضا" },
  { num: "+1M", label: "لعبة مكتملة" },
];

const highlights = [
  {
    icon: Trophy,
    label: "XP ومستويات",
  },
  {
    icon: Coins,
    label: "عملات ومكافآت",
  },
  {
    icon: Flame,
    label: "سلسلة يومية",
  },
  {
    icon: Swords,
    label: "تحديات جماعية",
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden px-6 pt-32 pb-20">
      {/* Background Effects */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-background"
      />

      <div
        aria-hidden
        className="absolute top-20 left-1/2 h-150 w-225 -translate-x-1/2 rounded-full bg-linear-to-r from-primary/20 via-accent/20 to-primary/10 blur-3xl"
      />

      <div
        aria-hidden
        className="absolute left-0 top-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />

      <div
        aria-hidden
        className="absolute right-0 bottom-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Content */}
          <div className="text-center lg:text-right">
            {/* Badge */}
            <div className="mb-8 flex justify-center lg:justify-start">
              <Badge
                variant="secondary"
                className="rounded-full border border-border/50 px-4 py-2 text-sm font-medium shadow-sm"
              >
                <span className="ml-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                منصة تعليمية تعتمد على التلعيب والتحديات التفاعلية
              </Badge>
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl md:text-7xl">
              التعلّم أصبح
              <br />
              <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                مغامرة لا تنتهي
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl lg:mx-0">
              حوّل الدراسة إلى تجربة ممتعة تشبه الألعاب. اجمع نقاط الخبرة،
              افتح مستويات جديدة، احصل على النجوم والعملات، وتنافس مع أصدقائك
              في تحديات جماعية مباشرة.
            </p>

            {/* Highlights */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                asChild
                className="rounded-full px-8 shadow-lg"
              >
                <Link href="#cta">
                  <Gamepad2 className="ml-2 h-5 w-5" />
                  ابدأ مغامرتك مجانًا
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full px-8"
              >
                <Link href="#features">
                  <Search className="ml-2 h-5 w-5" />
                  اكتشف المزيد
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/50 bg-card/70 p-4 text-center shadow-sm backdrop-blur-sm"
                >
                  <div className="text-2xl font-black sm:text-3xl">
                    {stat.num}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Card */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-linear-to-r from-primary/20 via-accent/20 to-primary/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
              {/* Top */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    المهمة الحالية
                  </p>
                  <p className="font-bold">Grammar Quest</p>
                </div>

                <Badge className="rounded-full px-3 py-1">
                  المستوى 12
                </Badge>
              </div>

              {/* XP */}
              <div className="mb-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span>التقدم</span>
                  <span className="font-semibold">2,450 XP</span>
                </div>

                <div className="h-3 rounded-full bg-muted">
                  <div className="h-3 w-[82%] rounded-full bg-linear-to-r from-primary to-accent" />
                </div>
              </div>

              {/* Reward Cards */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                {[
                  { icon: Trophy, value: "12", label: "مستوى" },
                  { icon: Coins, value: "850", label: "عملة" },
                  { icon: Flame, value: "21", label: "يوم" },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-border/50 bg-muted/40 p-4 text-center"
                    >
                      <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                      <div className="text-lg font-black">
                        {item.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Team Battle */}
              <div className="rounded-3xl bg-linear-to-r from-primary/10 to-accent/10 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <Swords className="h-5 w-5 text-primary" />
                    تحدي جماعي مباشر
                  </div>

                  <Badge variant="secondary" className="rounded-full">
                    LIVE
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-background/70 p-3 text-center">
                    <div className="text-sm text-muted-foreground">
                      الفريق الأول
                    </div>
                    <div className="text-2xl font-black">120</div>
                  </div>

                  <div className="rounded-2xl bg-background/70 p-3 text-center">
                    <div className="text-sm text-muted-foreground">
                      الفريق الثاني
                    </div>
                    <div className="text-2xl font-black">115</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}