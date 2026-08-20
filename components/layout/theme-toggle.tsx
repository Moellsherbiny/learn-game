"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const THEMES = [
  {
    id: "light",
    label: "الوضع الفاتح",
    icon: Sun,
  },
  {
    id: "dark",
    label: "الوضع الداكن",
    icon: Moon,
  },
  {
    id: "system",
    label: "النظام",
    icon: Monitor,
  },
] as const;

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-muted sm:w-24" />
    );
  }

  const currentTheme =
    THEMES.find((item) => item.id === theme) ?? THEMES[2];

  const Icon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 rounded-full",
            "gap-2 px-2 sm:px-3",
            "font-medium",
            "text-muted-foreground",
            "hover:bg-muted",
            "hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />

          <span className="hidden text-xs font-semibold sm:inline">
            {currentTheme.label}
          </span>

          <span className="sr-only">
            تغيير المظهر
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-48 rounded-xl p-1"
      >
        {THEMES.map((item) => {
          const ItemIcon = item.icon;
          const isActive = theme === item.id;

          return (
            <DropdownMenuItem
              key={item.id}
              onClick={() => setTheme(item.id)}
              className={cn(
                "flex cursor-pointer items-center justify-between",
                "rounded-lg px-3 py-2.5",
                isActive &&
                  "bg-primary/10 font-medium text-primary",
              )}
            >
              <div className="flex items-center gap-3">
                <ItemIcon className="h-4 w-4" />

                <span className="text-sm">
                  {item.label}
                </span>
              </div>

              {isActive && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}