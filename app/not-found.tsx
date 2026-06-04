import Link from "next/link";

import {
  ArrowLeft,
  Home,
  Swords,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">

      {/* BACKGROUND */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.15),transparent_40%),radial-gradient(circle_at_bottom,rgba(236,72,153,0.12),transparent_40%)]" />

      <div className="absolute inset-0 bg-grid-white/[0.03]" />

      {/* GLOW */}

      <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

      {/* CONTENT */}

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">

        {/* ICON */}

        <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl animate-in zoom-in-50 duration-700">

          <Swords className="h-16 w-16 text-primary" />
        </div>

        {/* 404 */}

        <h1 className="bg-linear-to-r from-primary via-fuchsia-400 to-cyan-400 bg-clip-text text-8xl font-black text-transparent sm:text-9xl animate-in fade-in duration-700">

          404
        </h1>

        {/* TITLE */}

        <h2
          className="
            mt-6
            text-3xl
            sm:text-5xl
            font-black
            leading-[1.8]
            tracking-normal
            text-white
            animate-in
            slide-in-from-bottom-4
            duration-700
          "
          style={{
            wordSpacing: "4px",
          }}
        >
          يبدو أن هذه الصفحة
          <br />
          اختفت داخل المعركة ⚔️
        </h2>

        {/* DESCRIPTION */}

        <p className="mt-6 max-w-2xl text-lg leading-9 text-zinc-400 animate-in fade-in duration-1000">

          الصفحة التي تبحث عنها غير موجودة أو ربما
          تم نقلها إلى مكان آخر داخل النظام.
        </p>

        {/* ACTIONS */}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">

          <Button
            asChild
            size="lg"
            className="h-14 rounded-2xl px-8 text-lg font-bold shadow-2xl"
          >
            <Link href="/">

              <Home className="mr-2 h-5 w-5" />

              العودة للرئيسية
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 rounded-2xl border-white/10 bg-white/5 px-8 text-lg font-bold text-white backdrop-blur-xl hover:bg-white/10"
          >
            <Link href="/student/battles">

              <ArrowLeft className="mr-2 h-5 w-5" />

              الذهاب للتحديات
            </Link>
          </Button>
        </div>

        {/* FOOTER */}

        <div className="mt-16 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">

          <p className="text-sm text-zinc-400">

            Learn Game Platform © 2026
          </p>
        </div>
      </div>
    </main>
  );
}