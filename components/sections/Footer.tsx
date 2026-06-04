// components/layout/footer.tsx

import Link from "next/link";

import {
  Gamepad2,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="
        mt-24
        border-t
        border-border/50
        bg-background
      "
    >

      <div
        className="
          container
          mx-auto
          px-4
          py-12
        "
      >

        {/* TOP */}

        <div
          className="
            flex
            flex-col
            gap-10
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >

          {/* BRAND */}

          <div className="max-w-md">

            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-3
              "
            >

              {/* ICON */}

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  bg-muted
                "
              >

                <Gamepad2
                  className="
                    h-5
                    w-5
                    text-primary
                  "
                />
              </div>

              {/* TEXT */}

              <div>

                <h3
                  className="
                    text-lg
                    font-black
                    tracking-tight
                  "
                >

                  Learn Game
                </h3>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-muted-foreground
                  "
                >

                  Gamified Learning
                </p>
              </div>
            </Link>

            <p
              className="
                mt-5
                text-sm
                leading-7
                text-muted-foreground
              "
            >

              منصة تعليمية تفاعلية
              تحول التعلم إلى تجربة
              ممتعة مليئة بالتحديات،
              النقاط، والمكافآت.
            </p>
          </div>

          {/* LINKS */}

          <div
            className="
              grid
              gap-10
              sm:grid-cols-3
            "
          >

            {/* PLATFORM */}

            <div className="space-y-4">

              <h4
                className="
                  text-sm
                  font-black
                "
              >

                المنصة
              </h4>

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  text-sm
                "
              >

                <Link
                  href="/"
                  className="
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  الرئيسية
                </Link>

                <Link
                  href="/auth/login"
                  className="
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  تسجيل الدخول
                </Link>

                <Link
                  href="/auth/register"
                  className="
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  إنشاء حساب
                </Link>
              </div>
            </div>

            {/* FEATURES */}

            <div className="space-y-4">

              <h4
                className="
                  text-sm
                  font-black
                "
              >

                المميزات
              </h4>

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  text-sm
                "
              >

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-muted-foreground
                  "
                >

                  <Sparkles className="h-4 w-4" />

                  XP ومستويات
                </div>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-muted-foreground
                  "
                >

                  <Swords className="h-4 w-4" />

                  تحديات مباشرة
                </div>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-muted-foreground
                  "
                >

                  <Trophy className="h-4 w-4" />

                  لوحة الصدارة
                </div>
              </div>
            </div>

            {/* QUICK LINKS */}

            <div className="space-y-4">

              <h4
                className="
                  text-sm
                  font-black
                "
              >

                روابط سريعة
              </h4>

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  text-sm
                "
              >

                <Link
                  href="#features"
                  className="
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  المميزات
                </Link>

                <Link
                  href="#battle"
                  className="
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  التحديات
                </Link>

                <Link
                  href="#leaderboard"
                  className="
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  لوحة الصدارة
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}

        <div
          className="
            mt-10
            border-t
            border-border/50
            pt-6
            text-center
            text-sm
            text-muted-foreground
          "
        >

          ©{" "}
          {new Date().getFullYear()}{" "}
          Learn Game.
          جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}