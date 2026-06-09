"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function CourseSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative flex-1">
      <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="ابحث عن دورة تعليمية..."
        className="h-12 rounded-full pr-11"
      />
    </div>
  );
}