import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import DashboardNavbar from "@/components/layout/navbar";
import DashboardFooter from "@/components/layout/dash-footer";

interface StudentLayoutProps {
  children: ReactNode;
}

export default async function StudentLayout({
  children,
}: StudentLayoutProps) {
  const session = await auth();

  // التحقق من تسجيل الدخول
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/student");
  }

  // التحقق من أن المستخدم طالب
  if (session.user.role !== "STUDENT") {
    // إذا كان مدرسًا يتم تحويله إلى لوحة المعلم
    if (session.user.role === "TEACHER") {
      redirect("/teacher");
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