import Link from "next/link";

import { Search } from "lucide-react";

import { getStudents } from "@/actions/admin/get-students";

import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function StudentsPage() {
  const students =
    await getStudents();

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
            الطلاب
          </h1>

          <p className="text-muted-foreground">
            إدارة جميع الطلاب
          </p>
        </div>

        <Card className="w-fit">
          <CardContent className="px-6 py-4">
            <p className="text-sm text-muted-foreground">
              إجمالي الطلاب
            </p>

            <p className="text-2xl font-bold">
              {students.length}
            </p>
          </CardContent>
        </Card>
      </div>

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
          placeholder="ابحث عن طالب..."
          className="pr-10"
        />
      </div>

      {/* Table */}

      <Card>
        <CardHeader>
          <CardTitle>
            قائمة الطلاب
          </CardTitle>
        </CardHeader>

        <CardContent>
          {students.length ===
          0 ? (
            <div className="py-10 text-center text-muted-foreground">
              لا يوجد طلاب حتى الآن
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
                      المدرسة
                    </TableHead>

                    <TableHead className="text-right">
                      المستوى
                    </TableHead>

                    <TableHead className="text-right">
                      نقاط الخبرة 
                    </TableHead>

                
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {students.map(
                    (
                      student,
                    ) => (
                      <TableRow
                        key={
                          student.id
                        }
                      >
                        <TableCell className="text-right font-medium">
                          {
                            student.name
                          }
                        </TableCell>

                        <TableCell className="text-right">
                          {
                            student.email
                          }
                        </TableCell>

                        <TableCell className="text-right">
                          {student.school ??
                            "-"}
                        </TableCell>

                        <TableCell className="text-right">
                          {
                            student.currentLevel
                          }
                        </TableCell>

                        <TableCell className="text-right">
                          {
                            student.xp
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