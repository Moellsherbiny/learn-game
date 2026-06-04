import { notFound } from "next/navigation";
import { getTeacherCourse } from "@/actions/teacher/course";
import CourseSettingsForm from "@/components/teacher/course-settings-form";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function TeacherCoursePage({
  params,
}: PageProps) {
  const { courseId } = await params;

  const course = await getTeacherCourse(courseId);

  if (!course) {
    notFound();
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <CourseSettingsForm course={course} />
    </main>
  );
}