import Link from "next/link";

import {
  Plus,
  Search,
} from "lucide-react";

import { getTeachers } from "@/actions/admin/get-teachers";

import CreateTeacherDialog from "@/components/auth/create-teacher-dialog";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function TeachersPage() {
  const teachers =
    await getTeachers();

  return (
    <div
      dir="rtl"
      className="
        mx-auto
        w-full
        max-w-7xl
        space-y-6
        px-4
        py-8
      "
    >
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            المدرسون
          </h1>

          <p className="text-muted-foreground">
            إدارة جميع المدرسين
          </p>
        </div>

        <CreateTeacherDialog />
        
      </div>

      {/* Stats */}

      <Card>
        <CardContent className="py-6">
          <div>
            <p className="text-sm text-muted-foreground">
              إجمالي المدرسين
            </p>

            <p className="text-3xl font-bold">
              {teachers.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search */}

      <div className="relative max-w-md">
        <Search
          className="
            absolute
            right-3
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            text-muted-foreground
          "
        />

        <Input
          placeholder="ابحث عن مدرس..."
          className="pr-10"
        />
      </div>

      {/* Table */}

      <Card>
        <CardHeader>
          <CardTitle>
            قائمة المدرسين
          </CardTitle>
        </CardHeader>

        <CardContent>
          {teachers.length ===
          0 ? (
            <div className="py-10 text-center text-muted-foreground">
              لا يوجد مدرسون حتى الآن
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">
                      الاسم
                    </TableHead>

                    <TableHead className="text-right">
                      البريد الإلكتروني
                    </TableHead>

                    <TableHead className="text-right">
                      عدد الدورات التي يدرسها
                    </TableHead>

                  
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {teachers.map(
                    (
                      teacher,
                    ) => (
                      <TableRow
                        key={
                          teacher.id
                        }
                      >
                        <TableCell className="text-right font-medium">
                          {
                            teacher.name
                          }
                        </TableCell>

                        <TableCell className="text-right">
                          {
                            teacher.email
                          }
                        </TableCell>

                        <TableCell className="text-right">
                          {
                            teacher
                              ._count
                              .coursesTeaching
                          }
                        </TableCell>

                      
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}