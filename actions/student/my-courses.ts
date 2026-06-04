"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {prisma} from "@/lib/prisma";

export interface EnrolledCourseData {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  teacher: {
    name: string | null;
    image: string | null;
  };
  totalLessons: number;
  completedLessons: number;
  totalXpAvailable: number;
  xpEarned: number;
  totalStars: number;
  maxStars: number;
  lastActivityAt: Date | null;
  enrolledAt: Date;
  nextLesson: {
    id: string;
    title: string;
    moduleTitle: string;
  } | null;
  streakDays: number;
}
export interface MyCoursesStats {
  totalXp: number;
  completedLessons: number;
  totalStars: number;
  rank: number | null;

  level: number;
  levelLabel: string;
  levelProgress: number;
  nextLevelXp: number;

  totalCourses: number;
  streak: number;
  coins: number;
}

export async function getMyCoursesAction(): Promise<{
  courses: EnrolledCourseData[];
  stats: MyCoursesStats;
}> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const studentId = session.user.id;
  const student = await prisma.user.findUnique({
  where: { id: studentId },
  select: {
    coins: true,
    streak: true,
  },
});
  // Get all enrollments with full course data
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    orderBy: { updatedAt: "desc" },
    include: {
      course: {
        include: {
          teacher: { select: { name: true, image: true } },
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                include: {
                  progress: {
                    where: { studentId },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Global stats
  const globalProgress = await prisma.progress.aggregate({
    where: { studentId },
    _sum: { xpEarned: true, stars: true },
  });

  const completedCount = await prisma.progress.count({
    where: { studentId, completed: true },
  });

  const totalXp = globalProgress._sum.xpEarned ?? 0;
  const totalStars = globalProgress._sum.stars ?? 0;

  // Leaderboard rank
  const higherScoreCount = await prisma.leaderboard.count({
    where: { score: { gt: totalXp } },
  });
  const rank = higherScoreCount + 1;

  // XP level calculation
  const xpInfo = calcXpLevel(totalXp);

  // Per-course processing
  const courses: EnrolledCourseData[] = enrollments.map((enrollment) => {
    const course = enrollment.course;
    const allLessons = course.modules.flatMap((m) => m.lessons);

    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter(
      (l) => l.progress[0]?.completed
    ).length;
    const xpEarned = allLessons.reduce(
      (sum, l) => sum + (l.progress[0]?.xpEarned ?? 0),
      0
    );
    const totalXpAvailable = allLessons.reduce(
      (sum, l) => sum + l.xpReward,
      0
    );
    const totalStarsEarned = allLessons.reduce(
      (sum, l) => sum + (l.progress[0]?.stars ?? 0),
      0
    );
    const maxStars = allLessons.reduce((sum, l) => sum + l.maxStars, 0);

    // Last activity
    const progressDates = allLessons
      .filter((l) => l.progress[0])
      .map((l) => l.progress[0]!.updatedAt)
      .sort((a, b) => b.getTime() - a.getTime());
    const lastActivityAt = progressDates[0] ?? null;

    // Find next lesson (first incomplete, in order)
    let nextLesson: EnrolledCourseData["nextLesson"] = null;
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (!lesson.progress[0]?.completed) {
          nextLesson = {
            id: lesson.id,
            title: lesson.title,
            moduleTitle: mod.title,
          };
          break;
        }
      }
      if (nextLesson) break;
    }

    // Simple streak: count consecutive days with progress updates
    const streakDays = calcStreak(
      allLessons
        .filter((l) => l.progress[0])
        .map((l) => l.progress[0]!.updatedAt)
    );

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      teacher: course.teacher,
      totalLessons,
      completedLessons,
      totalXpAvailable,
      xpEarned,
      totalStars: totalStarsEarned,
      maxStars,
      lastActivityAt,
      enrolledAt: enrollment.createdAt,
      nextLesson,
      streakDays,
    };
  });

  return {
    courses,
    stats: {
      totalXp,
  completedLessons: completedCount,
  totalStars,
  rank,

  level: xpInfo.level,
  levelLabel: xpInfo.label,
  levelProgress: xpInfo.progress,
  nextLevelXp: xpInfo.nextLevelXp,

  totalCourses: enrollments.length,
  streak: student?.streak ?? 0,
  coins: student?.coins ?? 0,
    },
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function calcXpLevel(xp: number) {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 5000];
  const labels = ["مبتدئ", "متعلم", "محترف", "خبير", "أسطورة", "بطل", "الأبطال"];

  let level = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) { level = i; break; }
  }

  const cur = thresholds[level];
  const next = thresholds[level + 1] ?? thresholds[thresholds.length - 1];
  const progress = next === cur ? 100 : Math.round(((xp - cur) / (next - cur)) * 100);

  return { level: level + 1, label: labels[level] ?? labels[labels.length - 1], progress, nextLevelXp: next };
}

function calcStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const days = [...new Set(dates.map((d) => d.toDateString()))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();
  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff =
      (new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) /
      86_400_000;
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}
