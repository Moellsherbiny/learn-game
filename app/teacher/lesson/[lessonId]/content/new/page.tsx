import { notFound } from "next/navigation";
import { getTeacherLesson } from "@/actions/teacher/lesson";
import LessonContentForm from "@/components/teacher/lesson-content-form";

interface PageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

export default async function LessonContentPage({
  params,
}: PageProps) {
  const { lessonId } = await params;

  const lesson = await getTeacherLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <LessonContentForm lesson={lesson} />
    </main>
  );
}