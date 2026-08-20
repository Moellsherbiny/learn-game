"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Loader2, MessageCircle, Search } from "lucide-react";

import { getOrCreateConversation } from "@/actions/messages/get-or-create-conversation";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  image: string | null;
  role: "STUDENT" | "TEACHER" | "ADMIN";
}

interface StartConversationDialogProps {
  users: User[];
  userRole: "STUDENT" | "TEACHER" | "ADMIN";
}

export default function StartConversationDialog({
  users,
  userRole,
}: StartConversationDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [isPending, startTransition] = useTransition();

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleStartConversation = (userId: string) => {
    startTransition(async () => {
      const result = await getOrCreateConversation(userId);

      if (!result.success || !result.data) {
        toast.error(result.message ?? "تعذر إنشاء المحادثة.");

        return;
      }

      setOpen(false);

      router.push(`/messages/${result.data.id}`);
    });
  };
  const roleLabels = {
  'TEACHER': "مدرس",
  'ADMIN': "مسؤول",
  'STUDENT': "طالب",
} as const;
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!isPending) {
          setOpen(value);

          if (!value) {
            setSearch("");
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <MessageCircle className="ml-2 h-4 w-4" />
          بدء محادثة
        </Button>
      </DialogTrigger>

      <DialogContent dir="rtl" className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>بدء محادثة</DialogTitle>

          <DialogDescription>
            اختر {userRole === "STUDENT" ? "المدرس" : "الطالب"} الذي تريد
            التواصل معه.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}

        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              userRole === "STUDENT" ? "ابحث عن مدرس..." : "ابحث عن طالب..."
            }
            className="pr-10"
            disabled={isPending}
          />
        </div>

        {/* Users */}

        <div className="max-h-87.5 space-y-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-medium">لا توجد نتائج</p>

              <p className="mt-1 text-sm text-muted-foreground">
                لم يتم العثور على مستخدم مطابق للبحث.
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                disabled={isPending}
                onClick={() => handleStartConversation(user.id)}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-right transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage
                    src={user.image ?? undefined}
                    alt={user.name ?? "User"}
                  />

                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {user.name ?? "مستخدم"}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {roleLabels[user.role]}
                  </p>
                </div>

                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getInitials(name: string | null) {
  if (!name) {
    return "U";
  }

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}
