import Link from "next/link";
import { auth } from "@/auth";
import { UserRole } from "@/lib/generated/prisma/client";
import { Gamepad2, GraduationCap, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import DashboardNavbarClient from "@/components/layout/navClient";
import { signOutAction } from "@/actions/auth/sign-out";

export default async function DashboardNavbar() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const role = session.user.role as UserRole;
  const isTeacher = role === UserRole.TEACHER;
  const isAdmin = role === UserRole.ADMIN;
  const dashboardHref = isTeacher ? "/teacher" : isAdmin ? "/admin" : "/student";

  const initials =
    session.user.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "LG";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={dashboardHref} className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary to-accent blur-md opacity-60" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent text-white shadow-lg">
              {isTeacher ? (
                <GraduationCap className="h-5 w-5" />
              ) : (
                <Gamepad2 className="h-5 w-5" />
              )}
            </div>
          </div>

          <div className="hidden sm:block">
            <p className="text-lg font-black tracking-widest leading-none">Learn Game</p>
            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/50">
              {isTeacher ? "Teacher Panel" : isAdmin ? "Admin Dashboard" : "Student Dashboard"}
            </p>
          </div>
        </Link>

        {/* Client Navigation */}
        <DashboardNavbarClient user={session.user} />

        {/* User Menu */}
        <div className="flex items-center gap-3">
          {/* PROFILE LINK */}

          <Link
            href="/profile"
            className="
      flex
      items-center
      gap-3
      rounded-2xl
      px-2
      py-1.5
      transition-colors
      hover:bg-muted/60
    "
          >
            {/* USER INFO */}

            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold">
                {session.user.name || "المستخدم"}
              </p>

              <p className="text-xs text-muted-foreground">
                {isTeacher ? "مدرس" : isAdmin ? "مدير" : "طالب"}
              </p>
            </div>

            {/* AVATAR */}

            <Avatar className="h-10 w-10 border">
              <AvatarImage
                src={session.user.image || ""}
                alt={session.user.name || "User"}
              />

              <AvatarFallback
                className="
          bg-primary/10
          font-bold
          text-primary
        "
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* LOGOUT */}

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
