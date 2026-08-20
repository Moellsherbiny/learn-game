"use client";

import Link from "next/link";
import { LayoutDashboard, Menu, Rocket, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ModeToggle } from "../layout/theme-toggle";

const navLinks = [
  {
    href: "#features",
    label: "المميزات",
  },
  {
    href: "#battle",
    label: "التحدي الجماعي",
  },
  {
    href: "#leaderboard",
    label: "لوحة الصدارة",
  },
];

export default function Navbar() {
  const { data: session, status } = useSession();

  const dashboardHref =
    session?.user?.role === "TEACHER"
      ? "/teacher"
      : session?.user?.role === "ADMIN"
        ? "/admin"
        : "/student";

  const isAuthenticated = status === "authenticated" && !!session?.user;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
        <nav
          dir="rtl"
          className={cn(
            "flex h-14 items-center justify-between gap-4",
            "rounded-2xl border border-border/50",
            "bg-background/80 backdrop-blur-xl",
            "supports-backdrop-filter:bg-background/65",
            "px-3 sm:h-16 sm:px-5",
            "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)]",
          )}
        >
          {/* =========================
              Logo
          ========================= */}

          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="relative">
              <div
                className={cn(
                  "absolute inset-0 rounded-xl",
                  "bg-linear-to-br from-primary to-accent",
                  "opacity-30 blur-lg",
                  "transition-opacity duration-300",
                  "group-hover:opacity-60",
                )}
              />

              <div
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center",
                  "rounded-xl",
                  "bg-linear-to-br from-primary to-accent",
                  "text-white",
                  "shadow-md",
                  "transition-transform duration-300",
                  "group-hover:scale-105",
                )}
              >
                <Rocket className="h-5 w-5" />
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center text-base font-black leading-none tracking-tight">
                <span>Learn</span>

                <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                  Game
                </span>
              </div>

              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                Gamified Learning
              </p>
            </div>
          </Link>

          {/* =========================
              Desktop Navigation
          ========================= */}

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex items-center rounded-full border border-border/40 bg-muted/30 p-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2",
                    "text-sm font-medium",
                    "text-muted-foreground",
                    "transition-all duration-200",
                    "hover:bg-background",
                    "hover:text-foreground",
                    "hover:shadow-sm",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* =========================
              Desktop Actions
          ========================= */}

          <div className="hidden items-center gap-2 md:flex">
            <ModeToggle />
            {isAuthenticated ? (
              <Button
                asChild
                size="sm"
                className={cn(
                  "rounded-full px-4",
                  "gap-2",
                  "font-semibold",
                  "shadow-sm",
                )}
              >
                <Link href={dashboardHref}>
                  <LayoutDashboard className="h-4 w-4" />
                  لوحة التحكم
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 font-medium"
                >
                  <Link href="/auth/login">تسجيل الدخول</Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "rounded-full px-5",
                    "font-semibold text-white",
                    "bg-linear-to-r from-primary to-accent",
                    "shadow-md",
                    "transition-all duration-200",
                    "hover:shadow-lg",
                    "hover:scale-[1.02]",
                  )}
                >
                  <Link href="/auth/register">
                    <Sparkles className="ml-2 h-4 w-4" />
                    ابدأ مجانًا
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* =========================
              Tablet / Mobile Menu
          ========================= */}

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-xl",
                    "border-border/60",
                    "bg-background/60",
                  )}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">فتح القائمة</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-64 rounded-2xl p-2"
              >
                {/* Navigation */}

                <div className="px-2 py-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    التنقل
                  </p>
                </div>

                {navLinks.map((link) => (
                  <DropdownMenuItem
                    key={link.href}
                    asChild
                    className="cursor-pointer rounded-xl py-2.5"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
                <div className="px-2 py-1">
                  <ModeToggle />
                </div>
                <DropdownMenuSeparator className="my-2" />

                {/* Actions */}

                {isAuthenticated ? (
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-xl py-2.5 font-medium"
                  >
                    <Link href={dashboardHref}>
                      <LayoutDashboard className="ml-2 h-4 w-4" />
                      لوحة التحكم
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-xl py-2.5"
                    >
                      <Link href="/auth/login">تسجيل الدخول</Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-xl bg-primary/10 py-2.5 font-semibold text-primary focus:bg-primary/15 focus:text-primary"
                    >
                      <Link href="/auth/register">
                        <Sparkles className="ml-2 h-4 w-4" />
                        ابدأ مجانًا
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </header>
  );
}
