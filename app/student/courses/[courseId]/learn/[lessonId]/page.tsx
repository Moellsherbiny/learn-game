import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";

import { getLessonWithContentsAction } from "@/actions/student/progress";

import { GameEngine } from "@/components/game/GameEngine";

interface PageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function LessonLearnPage({
  params,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const {
    courseId,
    lessonId,
  } = await params;

  const lesson =
    await getLessonWithContentsAction(
      lessonId,
    );

  if (!lesson) {
    notFound();
  }

  // SECURITY CHECK
  if (
    lesson.module.course.id !==
    courseId
  ) {
    notFound();
  }

  const existingProgress =
    lesson.progress[0] ?? null;

  return (
    <main
      className="
        min-h-screen
        bg-background
        text-foreground
      "
      dir="rtl"
    >
      {/* SOFT BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.03),transparent_40%)]" />

      <GameEngine
        lesson={{
          id: lesson.id,

          title: lesson.title,

          description:
            lesson.description ??
            undefined,

          gameType:
            lesson.gameType,

          xpReward:
            lesson.xpReward,

          minScore:
            lesson.minScore,

          maxStars:
            lesson.maxStars,

          timeLimit:
            lesson.timeLimit ??
            undefined,

          contents:
            lesson.contents,
        }}
        courseId={courseId}
        moduleName={
          lesson.module.title
        }
        existingProgress={
          existingProgress
            ? {
                completed:
                  existingProgress.completed,

                score:
                  existingProgress.score,

                stars:
                  existingProgress.stars,

                attempts:
                  existingProgress.attempts,
              }
            : null
        }
      />
    </main>
  );
}