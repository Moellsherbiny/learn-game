"use client";

import Link from "next/link";

import {
  ArrowRight,
  Crown,
  Sparkles,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";

interface XpInfo {
  level: number;
  label: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
}

interface StudentHUDProps {
  studentXp: number;
  xpInfo: XpInfo;
  courseName: string;
}

export function StudentHUD({
  studentXp,
  xpInfo,
  courseName,
}: StudentHUDProps) {
  return (
    <header
      className="
        sticky top-0 z-50
        border-b
        bg-background/90
        backdrop-blur
      "
    >
      <div
        className="
          mx-auto
          flex max-w-6xl
          items-center gap-4
          px-4 py-2
        "
      >
        {/* BACK */}
        <Link
          href="/student/courses"
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-xl border
            hover:bg-muted
          "
        >
          <ArrowRight className="h-4 w-4" />
        </Link>

        {/* COURSE */}
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold">
            {courseName}
          </h2>

          <p className="text-xs text-muted-foreground">
            {xpInfo.label}
          </p>
        </div>

        {/* XP */}
        <div className="mr-auto flex items-center gap-2">
          <div
            className="
              flex items-center gap-1
              rounded-xl
              bg-primary/10
              px-3 py-1
              text-primary
            "
          >
            <Crown className="h-4 w-4" />

            <span className="text-sm font-bold">
              Lv.{xpInfo.level}
            </span>
          </div>

          <div
            className="
              flex items-center gap-1
              rounded-xl
              bg-primary/10
              px-3 py-1
              text-primary
            "
          >
            <Sparkles className="h-4 w-4" />

            <span className="text-sm font-bold">
              {studentXp}
            </span>
          </div>
        </div>
      </div>

      <Progress
        value={xpInfo.progress}
        className="h-1 rounded-none"
      />
    </header>
  );
}