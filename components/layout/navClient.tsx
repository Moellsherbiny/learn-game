"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gamepad2,
  GraduationCap,
  BookOpen,
  Swords,
  Trophy,
  PlusCircle,
  Home,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

type SessionUser = {
  name?: string | null;
  role?: UserRole | null;
};

type DashboardNavbarClientProps = {
  user: SessionUser;
};

const studentLinks = [
  { href: "/student", label: "الرئيسية", icon: Home },
  { href: "/courses", label: "الدورات", icon: BookOpen },
  { href: "/leaderboard", label: "لوحة الصدارة", icon: Trophy },
  { href: "/student/battles", label: "التحديات", icon: Swords },
];

const teacherLinks = [
  { href: "/teacher", label: "الرئيسية", icon: Home },
  {
    href: "/teacher/courses/new",
    label: "إنشاء دورة تعليمية",
    icon: PlusCircle,
  },
  { href: "/leaderboard", label: "لوحة الصدارة", icon: Trophy },
  {
    href: "/courses",
    label: "استعراض الدورات",
    icon: BookOpen,
  },
  {
    href: "/teacher/battles/new",
    label: "إنشاء تحدي",
    icon: Swords,
  },
];

const adminLinks = [
  { href: "/admin", label: "الرئيسية", icon: Home },
  { href: "/admin/teachers", label: "المعلمون", icon: GraduationCap },
  { href: "/courses", label: "الدورات", icon: BookOpen },
]
export default function DashboardNavbarClient({
  user,
}: DashboardNavbarClientProps) {
  const pathname = usePathname();

  const isTeacher = user.role === "TEACHER";
  const isAdmin = user.role === "ADMIN";

  const links = isAdmin
    ? adminLinks
    : isTeacher
    ? teacherLinks
    : studentLinks;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-2 lg:flex">
        {links.map((link) => {
          const Icon = link.icon;

          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(`${link.href}/`));

          return (
            <Button
              key={link.href}
              variant={isActive ? "secondary" : "ghost"}
              asChild
              className="rounded-full px-4"
            >
              <Link href={link.href}>
                <Icon className="ml-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={8} className="w-64">
            <DropdownMenuLabel>
              {isTeacher ? "لوحة المعلم" : isAdmin ? "لوحة الإدارة" : "لوحة الطالب"}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {links.map((link) => {
              const Icon = link.icon;

              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(`${link.href}/`));

              return (
                <DropdownMenuItem
                  key={link.href}
                  asChild
                  className={isActive ? "bg-muted" : ""}
                >
                  <Link href={link.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
