import { StudentLevel } from "@/lib/generated/prisma/client";

export function getLevelLabel(level: StudentLevel): string {
  const map: Record<StudentLevel, string> = {
    BEGINNER: "مبتدئ",
    INTERMEDIATE: "متوسط",
    ADVANCED: "متقدم",
  };
  return map[level];
}

export function getLevelColor(level: StudentLevel): string {
  const map: Record<StudentLevel, string> = {
    BEGINNER: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
    INTERMEDIATE: "text-amber-400 border-amber-400/40 bg-amber-400/10",
    ADVANCED: "text-purple-400 border-purple-400/40 bg-purple-400/10",
  };
  return map[level];
}

export function getGameTypeLabel(
  gameType: "QUIZ" | "MATCHING" | "FILL_BLANKS" | "CONVERSATION"
): string {
  const map = {
    QUIZ: "اختيار متعدد",
    MATCHING: "مطابقة",
    FILL_BLANKS: "ملء الفراغ",
    CONVERSATION: "محادثة",
  };
  return map[gameType];
}

export function getGameTypeIcon(
  gameType: "QUIZ" | "MATCHING" | "FILL_BLANKS" | "CONVERSATION"
): string {
  const map = {
    QUIZ: "🎯",
    MATCHING: "🔗",
    FILL_BLANKS: "✏️",
    CONVERSATION: "💬",
  };
  return map[gameType];
}

export function calcModuleUnlockStatus(
  moduleRequiredXp: number,
  studentXp: number,
  moduleOrder: number
): "locked" | "unlocked" | "available" {
  if (moduleOrder === 1) return "available";
  if (studentXp >= moduleRequiredXp) return "unlocked";
  return "locked";
}

export function calcLessonStatus(
  lessonOrder: number,
  previousLessonCompleted: boolean,
  moduleUnlockStatus: "locked" | "unlocked" | "available",
  lessonProgress?: { completed: boolean; score: number; stars: number } | null
): "locked" | "available" | "in_progress" | "completed" {
  if (moduleUnlockStatus === "locked") return "locked";
  if (lessonOrder > 1 && !previousLessonCompleted) return "locked";
  if (lessonProgress?.completed) return "completed";
  if (lessonProgress && lessonProgress.score > 0) return "in_progress";
  return "available";
}

export function getXpForLevel(xp: number): {
  level: number;
  label: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
} {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 5000];
  const labels = [
    "مبتدئ",
    "متعلم",
    "محترف",
    "خبير",
    "أسطورة",
    "بطل",
    "الأبطال",
  ];

  let level = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) {
      level = i;
      break;
    }
  }

  const currentLevelXp = thresholds[level];
  const nextLevelXp = thresholds[level + 1] ?? thresholds[thresholds.length - 1];
  const progress =
    nextLevelXp === currentLevelXp
      ? 100
      : Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);

  return {
    level: level + 1,
    label: labels[level] ?? labels[labels.length - 1],
    currentLevelXp,
    nextLevelXp,
    progress,
  };
}
