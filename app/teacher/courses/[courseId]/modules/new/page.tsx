import ModuleForm from "@/components/teacher/module-form";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function NewModulePage({ params }: PageProps) {
  const { courseId } = await params;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <ModuleForm courseId={courseId} />
    </main>
  );
}
