import Link from "next/link";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/ui/reveal";
import { Rocket, GraduationCap } from "lucide-react";

export default function FinalCTA() {
  return (
    <section id="cta" className="relative z-10 px-6 lg:px-16 py-20">
      <Reveal>
        <div className="max-w-3xl mx-auto relative rounded-[2rem] border border-game-purple/30 bg-gradient-to-br from-game-purple/15 to-game-purple-light/8 p-16 text-center overflow-hidden">
          {/* Background glow */}
          <div
            aria-hidden
            className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-96 h-72 bg-[radial-gradient(ellipse,rgba(108,60,228,0.25)_0%,transparent_70%)] pointer-events-none"
          />

          <h2 className="relative text-4xl md:text-5xl font-black mb-4 leading-tight">
            ابدأ رحلتك التعليمية
            <br />
            <span className="text-gradient-primary">اليوم مجاناً 🚀</span>
          </h2>

          <p className="relative text-slate-400 text-lg mb-10 leading-relaxed">
            أكثر من 50,000 طالب بدأوا رحلتهم معنا. الآن دورك أنت.
          </p>

          <div className="relative flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" asChild>
              <Link href="/auth/register">
                <Rocket className="w-5 h-5" />
                انضم مجاناً الآن
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register/teacher">
                <GraduationCap className="w-5 h-5" />
                أنا معلم
              </Link>
            </Button>
          </div>

          <p className="relative text-xs text-slate-600">
            لا يُشترط بطاقة ائتمانية · تجربة مجانية كاملة · إلغاء في أي وقت
          </p>
        </div>
      </Reveal>
    </section>
  );
}
