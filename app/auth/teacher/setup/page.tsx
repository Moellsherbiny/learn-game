import jwt from "jsonwebtoken";
import { notFound } from "next/navigation";

import SetupTeacherForm from "@/components/auth/teacher-setup-form";

interface PageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function TeacherSetupPage({
  searchParams,
}: PageProps) {
  const { token } =
    await searchParams;

  if (!token) {
    notFound();
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as {
      name: string;
      email: string;
      role: string;
    };

    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <SetupTeacherForm
          token={token}
          name={payload.name}
          email={payload.email}
        />
      </div>
    );
  } catch {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full rounded-2xl border p-8 text-center">
          <h1 className="mb-2 text-xl font-bold">
            رابط غير صالح
          </h1>

          <p className="text-muted-foreground">
            انتهت صلاحية الدعوة أو
            الرابط غير صحيح.
          </p>
        </div>
      </div>
    );
  }
}