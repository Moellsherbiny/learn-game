
import { getTeacherCoursesForChallengeAction } from "@/actions/teacher/group-challenge-form";
import { CreateGroupChallengeForm } from "@/components/teacher/group-challenges/create-group-challenge-form";

export const metadata = {
  title: "إنشاء تحدٍ جديد | لوحة المعلم",
  description: "إنشاء تحدٍ جماعي جديد للطلاب.",
};

export default async function NewGroupChallengePage() {
  const courses = await getTeacherCoursesForChallengeAction();

  const serializedCourses = courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    modulesCount: course._count.modules,
    studentsCount: course._count.enrollments,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <CreateGroupChallengeForm courses={serializedCourses} />
    </div>
  );
}
