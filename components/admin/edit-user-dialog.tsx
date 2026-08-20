"use client";

import { useEffect, useState, useTransition } from "react";

import {
  Edit,
  Loader2,
} from "lucide-react";

import { updateUser } from "@/actions/admin/edit-user";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import { toast } from "sonner";

type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

type StudentLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED";

interface EditUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  school: string | null;
  role: UserRole;
  level: StudentLevel;
}

interface EditUserDialogProps {
  user: EditUser;
}

export default function EditUserDialog({
  user,
}: EditUserDialogProps) {
  const [open, setOpen] = useState(false);

  const [isPending, startTransition] =
    useTransition();

  const [name, setName] = useState(
    user.name ?? "",
  );

  const [email, setEmail] = useState(
    user.email,
  );

  const [phone, setPhone] = useState(
    user.phone ?? "",
  );

  const [school, setSchool] = useState(
    user.school ?? "",
  );

  const [level, setLevel] =
    useState<StudentLevel>(
      user.level ?? "BEGINNER",
    );

  /*
   * Reset form whenever dialog opens
   * or the user data changes.
   */
  useEffect(() => {
    if (open) {
      setName(user.name ?? "");
      setEmail(user.email);
      setPhone(user.phone ?? "");
      setSchool(user.school ?? "");
      setLevel(
        user.level ?? "BEGINNER",
      );
    }
  }, [open, user]);

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedSchool = school.trim();

    if (!trimmedName) {
      toast.error("يرجى إدخال اسم المستخدم.");
      return;
    }

    if (!trimmedEmail) {
      toast.error(
        "يرجى إدخال البريد الإلكتروني.",
      );
      return;
    }

    startTransition(async () => {
      const result = await updateUser({
        userId: user.id,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone || null,
        school: trimmedSchool || null,
        level: user.role === "STUDENT"
          ? level
          : undefined,
      });

      if (!result.success) {
        toast.error(
          result.message ||
            "حدث خطأ أثناء تحديث البيانات.",
        );

        return;
      }

      toast.success(
        "تم تحديث بيانات المستخدم بنجاح.",
      );

      setOpen(false);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button>
          <Edit className="ml-2 h-4 w-4" />
          تعديل البيانات
        </Button>
      </DialogTrigger>

      <DialogContent
        dir="rtl"
        className="sm:max-w-130"
      >
        <DialogHeader className="text-right">
          <DialogTitle>
            تعديل بيانات المستخدم
          </DialogTitle>

          <DialogDescription>
            قم بتعديل البيانات الأساسية للحساب
            ثم اضغط على حفظ التغييرات.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Name */}

          <div className="space-y-2">
            <Label htmlFor="user-name">
              الاسم
            </Label>

            <Input
              id="user-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="أدخل اسم المستخدم"
              disabled={isPending}
            />
          </div>

          {/* Email */}

          <div className="space-y-2">
            <Label htmlFor="user-email">
              البريد الإلكتروني
            </Label>

            <Input
              id="user-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="example@email.com"
              disabled={isPending}
            />
          </div>

          {/* Phone */}

          <div className="space-y-2">
            <Label htmlFor="user-phone">
              رقم الهاتف
            </Label>

            <Input
              id="user-phone"
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="أدخل رقم الهاتف"
              disabled={isPending}
            />
          </div>

          {/* School */}

          <div className="space-y-2">
            <Label htmlFor="user-school">
              المدرسة
            </Label>

            <Input
              id="user-school"
              value={school}
              onChange={(event) =>
                setSchool(event.target.value)
              }
              placeholder="أدخل اسم المدرسة"
              disabled={isPending}
            />
          </div>

          {/* Student Level */}

          {user.role === "STUDENT" && (
            <>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="user-level">
                  المستوى التعليمي
                </Label>

                <Select
                  value={level}
                  onValueChange={(
                    value: StudentLevel,
                  ) =>
                    setLevel(value)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="user-level"
                    className="w-full"
                  >
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>

                  <SelectContent dir="rtl">
                    <SelectItem value="BEGINNER">
                      مبتدئ
                    </SelectItem>

                    <SelectItem value="INTERMEDIATE">
                      متوسط
                    </SelectItem>

                    <SelectItem value="ADVANCED">
                      متقدم
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Account Type */}

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  نوع الحساب
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  لا يمكن تغيير نوع الحساب من هنا.
                </p>
              </div>

              <div className="rounded-md bg-background px-3 py-1.5 text-sm font-medium">
                {user.role === "STUDENT"
                  ? "طالب"
                  : user.role === "TEACHER"
                    ? "مدرس"
                    : "مدير"}
              </div>
            </div>
          </div>

          {/* Footer */}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setOpen(false)
              }
              disabled={isPending}
            >
              إلغاء
            </Button>

            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}