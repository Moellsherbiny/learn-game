import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { auth } from "@/auth";

import { getMessages } from "@/actions/messages/get-messages";

import MessageInput from "@/components/messages/message-input";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Card } from "@/components/ui/card";

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { conversationId } = await params;

  const result =
    await getMessages(conversationId);

  if (!result.success || !result.data) {
    return (
      <div
        dir="rtl"
        className="mx-auto w-full max-w-4xl px-4 py-8"
      >
        <Card className="p-8 text-center text-destructive">
          {result.message ??
            "المحادثة غير موجودة."}
        </Card>
      </div>
    );
  }

  const {
    conversation,
    messages,
  } = result.data;

  const currentUserId =
    session.user.id;

  // =========================================
  // Get other user
  // =========================================

  const otherUser =
    getOtherUser(
      conversation,
      currentUserId,
    );

  if (!otherUser) {
    return (
      <div
        dir="rtl"
        className="mx-auto w-full max-w-4xl px-4 py-8"
      >
        <Card className="p-8 text-center text-destructive">
          لا يمكن تحديد المستخدم الآخر في
          المحادثة.
        </Card>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-5xl flex-col"
    >
      {/* =========================================
          Header
      ========================================= */}

      <Card className="shrink-0 rounded-none border-x-0 border-t-0 shadow-none">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Back */}

          <Link
            href="/messages"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>

          {/* Avatar */}

          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage
              src={
                otherUser.image ??
                undefined
              }
              alt={
                otherUser.name ??
                "User"
              }
            />

            <AvatarFallback>
              {getInitials(
                otherUser.name,
              )}
            </AvatarFallback>
          </Avatar>

          {/* User info */}

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold">
              {otherUser.name ??
                "مستخدم"}
            </h1>

            <p className="text-xs text-muted-foreground">
              {getRoleLabel(
                otherUser.role,
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* =========================================
          Messages
      ========================================= */}

      <div className="flex-1 overflow-y-auto bg-muted/20 px-4 py-6">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end gap-3">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-20 text-center">
              <div>
                <p className="font-medium">
                  لا توجد رسائل بعد
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  ابدأ المحادثة بإرسال أول رسالة.
                </p>
              </div>
            </div>
          ) : (
            messages.map(
              (message) => {
                const isMine =
                  message.senderId ===
                  currentUserId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isMine
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`flex max-w-[80%] flex-col sm:max-w-[65%] ${
                        isMine
                          ? "items-start"
                          : "items-end"
                      }`}
                    >
                      {/* Message bubble */}

                      <div
                        className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                          isMine
                            ? "rounded-tr-md bg-primary text-primary-foreground"
                            : "rounded-tl-md bg-background"
                        }`}
                      >
                        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6">
                          {message.content}
                        </p>
                      </div>

                      {/* Time */}

                      <p className="mt-1 px-1 text-[10px] text-muted-foreground">
                        {formatMessageTime(
                          message.createdAt,
                        )}
                      </p>
                    </div>
                  </div>
                );
              },
            )
          )}
        </div>
      </div>

      {/* =========================================
          Input
      ========================================= */}

      <MessageInput
        conversationId={
          conversationId
        }
      />
    </div>
  );
}

/* =====================================================
   Get Other User
===================================================== */

function getOtherUser(
  conversation: {
    studentId: string | null;
    teacherId: string | null;
    adminId: string | null;

    student: User | null;
    teacher: User | null;
    admin: User | null;
  },
  currentUserId: string,
) {
  // Current user is Admin
  if (
    conversation.adminId ===
    currentUserId
  ) {
    return (
      conversation.student ??
      conversation.teacher
    );
  }

  // Current user is Student
  if (
    conversation.studentId ===
    currentUserId
  ) {
    return (
      conversation.teacher ??
      conversation.admin
    );
  }

  // Current user is Teacher
  if (
    conversation.teacherId ===
    currentUserId
  ) {
    return (
      conversation.student ??
      conversation.admin
    );
  }

  return null;
}

/* =====================================================
   User Type
===================================================== */

interface User {
  id: string;
  name: string | null;
  image: string | null;
  role:
    | "STUDENT"
    | "TEACHER"
    | "ADMIN";
}

/* =====================================================
   Role Label
===================================================== */

function getRoleLabel(
  role: User["role"],
) {
  switch (role) {
    case "ADMIN":
      return "إدارة المنصة";

    case "TEACHER":
      return "مدرس";

    case "STUDENT":
      return "طالب";

    default:
      return "مستخدم";
  }
}

/* =====================================================
   Initials
===================================================== */

function getInitials(
  name: string | null,
) {
  if (!name) {
    return "U";
  }

  const words = name
    .trim()
    .split(/\s+/);

  if (words.length === 1) {
    return words[0]
      .charAt(0)
      .toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
}

/* =====================================================
   Message Time
===================================================== */

function formatMessageTime(
  date: Date,
) {
  const messageDate =
    new Date(date);

  const now = new Date();

  const isToday =
    messageDate.toDateString() ===
    now.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat(
      "ar-EG",
      {
        hour: "numeric",
        minute: "2-digit",
      },
    ).format(messageDate);
  }

  return new Intl.DateTimeFormat(
    "ar-EG",
    {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(messageDate);
}