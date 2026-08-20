import Link from "next/link";

import { auth } from "@/auth";

import {
  Gamepad2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { UserRole } from "@/lib/generated/prisma/client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import DashboardNavbarClient from "@/components/layout/navClient";
import { signOutAction } from "@/actions/auth/sign-out";
import { ModeToggle } from "./theme-toggle";

export default async function DashboardNavbar() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const role = session.user.role as UserRole;

  const isTeacher = role === UserRole.TEACHER;
  const isAdmin = role === UserRole.ADMIN;
  const isStudent = role === UserRole.STUDENT;

  const dashboardHref = isTeacher
    ? "/teacher"
    : isAdmin
      ? "/admin"
      : "/student";

  const roleLabel = isTeacher ? "مدرس" : isAdmin ? "مدير" : "طالب";

  const panelLabel = isTeacher
    ? "لوحة المدرس"
    : isAdmin
      ? "لوحة الإدارة"
      : "مساحة الطالب";

  const initials =
    session.user.name
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "LG";

  const RoleIcon = isTeacher ? GraduationCap : isAdmin ? ShieldCheck : Gamepad2;

  return (
    <header
      className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-border/60
        bg-background/95
        backdrop-blur
        supports-backdrop-filter:bg-background/80
      "
    >
      <div
        className="
          mx-auto
          flex
          h-16
          max-w-400
          items-center
          justify-between
          gap-4
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =========================================
            BRAND
        ========================================= */}

        <Link
          href={dashboardHref}
          className="
            group
            flex
            min-w-fit
            items-center
            gap-3
            rounded-xl
            px-1.5
            py-1
            transition-colors
            hover:bg-muted/50
          "
        >
          {/* Icon */}

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-primary/15
              bg-primary/10
              text-primary
              transition-colors
              group-hover:bg-primary/15
            "
          >
            <RoleIcon className="h-5 w-5" />
          </div>

          {/* Brand text */}

          <div className="hidden sm:block">
            <div className="flex items-center gap-1 text-[15px] font-bold leading-none tracking-tight">
              <span>Learn</span>

              <span className="text-primary">Game</span>
            </div>

            <p
              className="
                mt-1.5
                text-[10px]
                font-medium
                leading-none
                text-muted-foreground
              "
            >
              {panelLabel}
            </p>
          </div>
        </Link>

        {/* =========================================
            MAIN NAVIGATION
        ========================================= */}

        <div className="min-w-0 flex-1">
          <DashboardNavbarClient user={session.user} />
        </div>

        {/* =========================================
            USER AREA
        ========================================= */}

        <div className="flex shrink-0 items-center gap-2">
          <ModeToggle />
          <div className="hidden h-7 w-px bg-border sm:block" />
          {/* Profile */}

          <Link
            href="/profile"
            className="
              group
              flex
              items-center
              gap-2.5
              rounded-xl
              px-2
              py-1.5
              transition-colors
              hover:bg-muted/60
            "
          >
            {/* User info */}

            <div className="hidden text-right md:block">
              <p
                className="
                  max-w-35
                  truncate
                  text-sm
                  font-semibold
                  leading-5
                "
              >
                {session.user.name || "المستخدم"}
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  leading-4
                  text-muted-foreground
                "
              >
                {roleLabel}
              </p>
            </div>

            {/* Avatar */}

            <Avatar
              className="
                h-9
                w-9
                border
                border-border
                transition-colors
                group-hover:border-primary/40
              "
            >
              <AvatarImage
                src={session.user.image || ""}
                alt={session.user.name || "المستخدم"}
              />

              <AvatarFallback
                className="
                  bg-primary/10
                  text-xs
                  font-bold
                  text-primary
                "
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Divider */}

          <div className="hidden h-7 w-px bg-border sm:block" />

          {/* Logout */}

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="
                h-9
                w-9
                rounded-xl
                text-muted-foreground
                transition-colors
                hover:bg-destructive/10
                hover:text-destructive
              "
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
