"use client";

import { useState, useTransition } from "react";

import { Loader2, Mail, Plus, User } from "lucide-react";
import { toast } from "sonner";

import { sendTeacherInvite } from "@/actions/admin/send-teacher-invite";

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

export default function CreateTeacherDialog() {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const result = await sendTeacherInvite({
        name,
        email,
      });

      if (!result.success) {
        toast.error(result.message);

        return;
      }

      toast.success("تم إرسال الدعوة بنجاح");

      setName("");
      setEmail("");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="ml-2 h-4 w-4" />
          إضافة مدرس
        </Button>
      </DialogTrigger>

      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader className="space-y-2 pl-10 text-center">
          <DialogTitle>دعوة مدرس جديد</DialogTitle>

          <DialogDescription>
            سيتم إرسال رابط إلى البريد الإلكتروني ليقوم المدرس بإكمال إنشاء
            حسابه وتحديد كلمة المرور الخاصة به.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}

          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>

            <div className="relative">
              <User
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
                id="name"
                dir="rtl"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسم المدرس الكامل"
                className="
                  pr-10
                  text-right
                "
                required
              />
            </div>
          </div>

          {/* Email */}

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>

            <div className="relative">
              <Mail
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-muted-foreground
                "
              />

              <Input
                id="email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@example.com"
                className="
                  pl-10
                  text-left
                "
                required
              />
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                "إرسال الدعوة"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
