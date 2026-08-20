"use client";

import { useState, useTransition } from "react";

import { Check, Copy, KeyRound, Loader2, RotateCcw } from "lucide-react";

import { resetUserPassword } from "@/actions/admin/reset-user-password";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Separator } from "@/components/ui/separator";

import { toast } from "sonner";

interface ResetPasswordDialogProps {
  userId: string;
  userName: string;
}

export default function ResetPasswordDialog({
  userId,
  userName,
}: ResetPasswordDialogProps) {
  const [open, setOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );

  const [copied, setCopied] = useState(false);

  const handleOpenChange = (value: boolean) => {
    if (isPending) return;

    setOpen(value);

    if (!value) {
      setTemporaryPassword(null);
      setCopied(false);
    }
  };

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetUserPassword(userId);

      if (!result.success) {
        toast.error(result.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور.");

        return;
      }

      setTemporaryPassword(result.temporaryPassword ?? null);

      toast.success("تمت إعادة تعيين كلمة المرور بنجاح.");
    });
  };

  const handleCopy = async () => {
    if (!temporaryPassword) return;

    try {
      await navigator.clipboard.writeText(temporaryPassword);

      setCopied(true);

      toast.success("تم نسخ كلمة المرور.");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error("تعذر نسخ كلمة المرور.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <KeyRound className="ml-2 h-4 w-4" />
          إعادة تعيين كلمة المرور
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent dir="rtl" className="sm:max-w-125">
        {!temporaryPassword ? (
          <>
            {/* Confirmation */}

            <AlertDialogHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>

              <AlertDialogTitle className="text-right">
                إعادة تعيين كلمة المرور؟
              </AlertDialogTitle>

              <AlertDialogDescription className="text-right leading-7">
                سيتم إعادة تعيين كلمة مرور المستخدم:
                <span className="mx-1 font-semibold text-foreground">
                  {userName}
                </span>
                وإنشاء كلمة مرور مؤقتة جديدة.
                <span className="mt-3 block">
                  بعد تنفيذ العملية، سيتم عرض كلمة المرور المؤقتة لك مرة واحدة
                  لتتمكن من إرسالها إلى المستخدم بشكل آمن.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel disabled={isPending}>إلغاء</AlertDialogCancel>

              <Button type="button" onClick={handleReset} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري إعادة التعيين...
                  </>
                ) : (
                  <>
                    <RotateCcw className="ml-2 h-4 w-4" />
                    تأكيد إعادة التعيين
                  </>
                )}
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            {/* Success */}

            <AlertDialogHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </div>

              <AlertDialogTitle className="text-right">
                تم إعادة تعيين كلمة المرور
              </AlertDialogTitle>

              <AlertDialogDescription className="text-right leading-7">
                تم إنشاء كلمة مرور مؤقتة للمستخدم:
                <span className="mx-1 font-semibold text-foreground">
                  {userName}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Separator />

            {/* Temporary Password */}

            <div className="space-y-3">
              <p className="text-sm font-medium">كلمة المرور المؤقتة</p>

              <div className="flex items-center gap-2">
                <div
                  dir="ltr"
                  className="flex-1 rounded-lg border bg-muted/50 px-4 py-3 text-center font-mono text-lg font-bold tracking-wider"
                >
                  {temporaryPassword}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  title="نسخ كلمة المرور"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <p className="text-xs leading-5 text-muted-foreground">
                احتفظ بكلمة المرور أو أرسلها للمستخدم بطريقة آمنة. لن يتم عرضها
                مرة أخرى بعد إغلاق هذه النافذة.
              </p>
            </div>

            <AlertDialogFooter>
              <Button type="button" onClick={() => setOpen(false)}>
                تم، إغلاق
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
