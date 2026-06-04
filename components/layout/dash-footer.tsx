// components/layout/dashboard-footer.tsx

import Link from "next/link";

import {
  Gamepad2,
  GraduationCap,
  Heart,
  Mail,
} from "lucide-react";

import { auth } from "@/auth";

import { UserRole } from "@/lib/generated/prisma/client";

export default async function DashboardFooter() {
  // =========================================
  // SESSION
  // =========================================

  const session =
    await auth();

  const role =
    session?.user
      ?.role as
      | UserRole
      | undefined;

  const isTeacher =
    role ===
    UserRole.TEACHER;

  const dashboardHref =
    isTeacher
      ? "/teacher"
      : "/student";

  // =========================================
  // UI
  // =========================================

  return (
    <footer
      className="
        mt-16
        border-t
        border-border/50
        bg-background/80
        backdrop-blur-xl
      "
    >

      <div
        className="
          container
          mx-auto
          px-4
          py-10
        "
      >

        <div
          className="
            flex
            flex-col
            gap-10
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          {/* BRAND */}

          <div className="space-y-4">

            <Link
              href={
                dashboardHref
              }
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

                {isTeacher ? (
                  <GraduationCap
                    className="
                      h-5
                      w-5
                      text-primary
                    "
                  />
                ) : (
                  <Gamepad2
                    className="
                      h-5
                      w-5
                      text-primary
                    "
                  />
                )}
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

                  {isTeacher
                    ? "Teacher Dashboard"
                    : "Student Dashboard"}
                </p>
              </div>
            </Link>

            <p
              className="
                max-w-md
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
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >

            {/* DASHBOARD */}

            <div className="space-y-4">

              <h4
                className="
                  text-sm
                  font-black
                "
              >

                لوحة التحكم
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
                  href={
                    dashboardHref
                  }
                  className="
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  الرئيسية
                </Link>

                <Link
                  href="/profile"
                  className="
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  الملف الشخصي
                </Link>

                <Link
                  href={
                    isTeacher
                      ? "/teacher/battles"
                      : "/student/battles"
                  }
                  className="
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  التحديات
                </Link>
              </div>
            </div>

            {/* LEARNING */}

            <div className="space-y-4">

              <h4
                className="
                  text-sm
                  font-black
                "
              >

                التعلم
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
                  href={
                    isTeacher
                      ? "/teacher/courses"
                      : "/student/courses"
                  }
                  className="
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  الدورات التعليمية
                </Link>

                <Link
                  href="/leaderboard"
                  className="
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  لوحة الصدارة
                </Link>

                <Link
                  href="/"
                  className="
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >

                  الصفحة الرئيسية
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}

        <div
          className="
            mt-10
            flex
            flex-col
            gap-4
            border-t
            border-border/50
            pt-6
            text-sm
            text-muted-foreground
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <p>

            ©{" "}
            {new Date().getFullYear()}{" "}
            Learn Game.
            جميع الحقوق محفوظة.
          </p>

          <p
            className="
              inline-flex
              items-center
              gap-2
            "
          >

            صُنع من أجل
            تجربة تعليمية أفضل
          </p>
        </div>
      </div>
    </footer>
  );
}