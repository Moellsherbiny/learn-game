"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";

import { deleteUser } from "@/actions/admin/delete-user";

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

import { toast } from "sonner";

interface DeleteUserDialogProps {
  userId: string;
  userName: string;
  redirectTo: string;
}

export default function DeleteUserDialog({
  userId,
  userName,
  redirectTo,
}: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] =
    useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUser(userId);

      if (!result.success) {
        toast.error(
          result.message ||
            "حدث خطأ أثناء حذف المستخدم.",
        );

        return;
      }

      toast.success(
        "تم حذف المستخدم بنجاح.",
      );

      setOpen(false);

      window.location.href = redirectTo;
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!isPending) {
          setOpen(value);
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full sm:w-auto"
        >
          <Trash2 className="ml-2 h-4 w-4" />
          حذف المستخدم
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent
        dir="rtl"
        className="sm:max-w-120"
      >
        <AlertDialogHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>

          <AlertDialogTitle className="text-right">
            حذف المستخدم؟
          </AlertDialogTitle>

          <AlertDialogDescription className="text-right leading-7">
            هل أنت متأكد من حذف المستخدم:

            <span className="mx-1 font-semibold text-foreground">
              {userName}
            </span>

            ؟

            <span className="mt-3 block">
              سيتم حذف الحساب والبيانات المرتبطة به
              وفقًا للعلاقات الموجودة في قاعدة البيانات.
            </span>

            <span className="mt-3 block font-medium text-destructive">
              لا يمكن التراجع عن هذه العملية بعد تنفيذها.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel
            disabled={isPending}
          >
            إلغاء
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              <>
                <Trash2 className="ml-2 h-4 w-4" />
                نعم، حذف المستخدم
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}