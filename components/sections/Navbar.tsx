"use client";

import Link from "next/link";
import { Menu, Rocket, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const navLinks = [
  { href: "#features", label: "المميزات" },
  { href: "#battle", label: "التحدي الجماعي" },
  { href: "#leaderboard", label: "لوحة الصدارة" },
];

export default function Navbar() {
  const { data: session } = useSession();

  const dashboardHref =
    session?.user?.role === "TEACHER"
      ? "/teacher"
      : session?.user?.role === "ADMIN"
        ? "/admin"
        : "/student";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <nav
          className={cn(
            "flex h-16 items-center justify-between",
            "rounded-3xl border border-border/60",
            "bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60",
            "shadow-[0_10px_40px_-15px_rgba(0,0,0,0.25)]",
            "px-4 sm:px-6",
          )}
        >
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary to-accent blur-md opacity-60 transition-opacity group-hover:opacity-90" />

              {/* Logo Box */}
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-accent text-white shadow-lg">
                <Rocket className="h-5 w-5" />
              </div>
            </div>

            <div className="hidden sm:block">
              <h1 className="text-lg font-black leading-none tracking-widest">
                Learn
                <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                  Game
                </span>
              </h1>
              <p className="mt-1 text-[11px] uppercase tracking-widest font-black text-muted-foreground/50">
                Gamified Learning
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <ul className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2",
                    "text-sm font-semibold text-muted-foreground",
                    "transition-all duration-300",
                    "hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop */}

            <div className="hidden items-center gap-2 md:flex">
              {session?.user ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4"
                >
                  <Link href={dashboardHref}>لوحة التحكم</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="rounded-full px-4"
                  >
                    <Link href="/auth/login">تسجيل الدخول</Link>
                  </Button>

                  <Button
                    asChild
                    size="sm"
                    className="
            rounded-full
            px-5
            font-semibold
            text-white
            shadow-lg
            bg-linear-to-r
            from-primary
            to-accent
          "
                  >
                    <Link href="/auth/register">
                      <Sparkles className="ml-2 h-4 w-4" />
                      ابدأ مجانًا
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile */}

            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  {navLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}

                  <div className="my-1 border-t" />

                  {session?.user ? (
                    <DropdownMenuItem asChild>
                      <Link href={dashboardHref}>لوحة التحكم</Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/login">تسجيل الدخول</Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/auth/register">ابدأ مجانًا</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
