import { getCourses } from "@/actions/courses/get-courses";
import CoursesClient from "@/components/course/courses-client";
import DashboardNavbar from "@/components/layout/navbar";
import DashboardFooter from "@/components/layout/dash-footer";
export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <>
      <DashboardNavbar />
      <CoursesClient courses={courses} />
      <DashboardFooter />
    </>
  );
}
