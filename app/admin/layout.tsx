import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

import DashboardNavbar from "@/components/layout/navbar";
import DashboardFooter from "@/components/layout/dash-footer";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const session = await auth();

  // التحقق من تسجيل الدخول
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  // التحقق من أن المستخدم أدمن
  if (session.user.role !== "ADMIN") {
    switch (session.user.role) {
      case "TEACHER":
        redirect("/teacher");

      case "STUDENT":
        redirect("/student");

      default:
        redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar الخاصة بالأدمن */}
      <DashboardNavbar />

      {/* محتوى صفحات الأدمن */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      <DashboardFooter />
    </div>
  );
}