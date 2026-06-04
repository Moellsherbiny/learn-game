import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import DashboardNavbar from "@/components/layout/navbar";
import DashboardFooter from "@/components/layout/dash-footer";

interface TeacherLayoutProps {
  children: ReactNode;
}

export default async function TeacherLayout({
  children,
}: TeacherLayoutProps) {
  const session = await auth();

  // التحقق من تسجيل الدخول
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/teacher");
  }

  // التحقق من أن المستخدم مدرس
  if (session.user.role !== "TEACHER") {
    // إذا كان طالبًا يتم تحويله إلى لوحة الطالب
    if (session.user.role === "STUDENT") {
      redirect("/student");
    }

    // أي أدوار أخرى يتم تحويلها إلى الصفحة الرئيسية
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar الخاصة بالمعلم */}
      <DashboardNavbar />

      {/* محتوى صفحات المعلم */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
      <DashboardFooter />
    </div>
  );
}