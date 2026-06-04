import React from "react";

import Link from "next/link";

import {
  Coins,
  Flame,
  Gamepad2,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const features = [
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
      label: "تحديات مباشرة",
    },
  ];

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        bg-background
        text-foreground
        lg:grid
        lg:grid-cols-2
      "
    >

      {/* LEFT SIDE */}

      <aside
        className="
          relative
          hidden
          overflow-hidden
          border-l
          bg-muted/30
          lg:flex
        "
      >

        {/* LIGHT BACKGROUND */}

        <div className="absolute inset-0">

          <div
            className="
              absolute
              top-0
              left-1/2
              h-100
              w-100
              -translate-x-1/2
              rounded-full
              bg-primary/5
              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-0
              right-0
              h-75
              w-75
              rounded-full
              bg-primary/5
              blur-3xl
            "
          />
        </div>

        {/* FLOATING ICON */}

        <div
          className="
            absolute
            left-16
            top-20
            opacity-[0.04]
          "
        >

          <Gamepad2 className="h-56 w-56" />
        </div>

        {/* CONTENT */}

        <div
          className="
            relative
            z-10
            flex
            w-full
            flex-col
            justify-between
            p-14
          "
        >

          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                border
                bg-background
                shadow-sm
              "
            >

              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>

            <div>

              <h1
                className="
                  text-xl
                  font-black
                  tracking-tight
                "
              >

                Learn Game
              </h1>

              <p
                className="
                  mt-1
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

          {/* CENTER */}

          <div className="max-w-xl">

            <div
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                bg-background/80
                px-4
                py-2
                text-sm
                font-medium
                shadow-sm
              "
            >

              <Sparkles className="h-4 w-4 text-primary" />

              تعلم بطريقة تفاعلية
            </div>

            <h2
              className="
                text-5xl
                font-black
                leading-[1.4]
                tracking-tight
              "
            >

              التعليم أصبح
              أكثر متعة وتحفيزًا
            </h2>

            <p
              className="
                mt-6
                text-lg
                leading-8
                text-muted-foreground
              "
            >

              اجمع نقاط الخبرة،
              افتح مستويات جديدة،
              وتنافس مع أصدقائك
              داخل تحديات مباشرة.
            </p>

            {/* FEATURES */}

            <div className="mt-10 grid grid-cols-2 gap-3">

              {features.map(
                (
                  feature,
                ) => {
                  const Icon =
                    feature.icon;

                  return (
                    <div
                      key={
                        feature.label
                      }
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        bg-background/70
                        px-4
                        py-3
                        shadow-sm
                      "
                    >

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          bg-primary/10
                        "
                      >

                        <Icon
                          className="
                            h-5
                            w-5
                            text-primary
                          "
                        />
                      </div>

                      <span className="font-medium">

                        {
                          feature.label
                        }
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* FOOTER */}

          <div
            className="
              text-sm
              text-muted-foreground
            "
          >

            ©{" "}
            {new Date().getFullYear()}{" "}
            Learn Game
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE */}

      <main
        className="
          relative
          flex
          min-h-screen
          items-center
          justify-center
          px-6
          py-12
        "
      >

        {/* MOBILE BG */}

        <div className="absolute inset-0 lg:hidden">

          <div
            className="
              absolute
              top-20
              left-1/2
              h-72
              w-72
              -translate-x-1/2
              rounded-full
              bg-primary/5
              blur-3xl
            "
          />
        </div>

        {/* MOBILE LOGO */}

        <div
          className="
            absolute
            top-8
            left-1/2
            z-10
            -translate-x-1/2
            lg:hidden
          "
        >

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                border
                bg-background
                shadow-sm
              "
            >

              <Gamepad2 className="h-5 w-5 text-primary" />
            </div>

            <div>

              <h1
                className="
                  text-lg
                  font-black
                  tracking-tight
                "
              >

                Learn Game
              </h1>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.2em]
                  text-muted-foreground
                "
              >

                Gamified Learning
              </p>
            </div>
          </Link>
        </div>
        <Button asChild variant="outline" className="absolute top-4 left-4 lg:hidden">
          <Link href="/">رجوع</Link>
        </Button>

        {/* FORM */}

        <div
          className="
            relative
            z-10
            w-full
            max-w-md
            pt-20
            lg:pt-0
          "
        >

          {children}
        </div>
      </main>
    </div>
  );
}