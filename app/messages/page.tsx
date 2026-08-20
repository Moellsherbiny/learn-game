import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, Send } from "lucide-react";
import { auth } from "@/auth";

import { getConversations } from "@/actions/messages/get-conversations";
import { getMessageUsers } from "@/actions/messages/get-message-users";

import StartConversationDialog from "@/components/messages/start-conversation-dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Card, CardContent } from "@/components/ui/card";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const currentUserId = session.user.id;
  const currentUserRole = session.user.role;

  // Get conversations and available users in parallel
  const [conversationsResult, usersResult] = await Promise.all([
    getConversations(),
    getMessageUsers(),
  ]);

  // =========================================
  // Error
  // =========================================

  if (!conversationsResult.success) {
    return (
      <div dir="rtl" className="mx-auto w-full max-w-6xl px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">
              {conversationsResult.message ?? "حدث خطأ أثناء تحميل المحادثات."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const conversations = conversationsResult.data ?? [];

  const incomingConversations = conversations.filter((conversation) => {
    const lastMessage = conversation.messages[0];

    return lastMessage && lastMessage.senderId !== currentUserId;
  });

  const outgoingConversations = conversations.filter((conversation) => {
    const lastMessage = conversation.messages[0];

    return lastMessage && lastMessage.senderId === currentUserId;
  });
  const users = usersResult.success ? (usersResult.data ?? []) : [];

  const canStartConversation =
    currentUserRole === "STUDENT" ||
    currentUserRole === "TEACHER" ||
    currentUserRole === "ADMIN";

  return (
    <div dir="rtl" className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      {/* =========================================
          Header
      ========================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الرسائل</h1>

          <p className="mt-1 text-muted-foreground">
            تواصل مع المدرسين والطلاب وإدارة المنصة
          </p>
        </div>

        {canStartConversation && users?.length > 0 && (
          <StartConversationDialog
            users={users}
            userRole={currentUserRole as "STUDENT" | "TEACHER" | "ADMIN"}
          />
        )}
      </div>

      {/* =========================================
          Conversations
      ========================================= */}

      {/* =========================================
    Messages
========================================= */}

      <Card className="overflow-hidden px-4">
        <Tabs defaultValue="incoming" dir="rtl">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="incoming" className="gap-2">
              <Inbox className="h-4 w-4" />
              الوارد
              {incomingConversations.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {incomingConversations.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger value="outgoing" className="gap-2">
              <Send className="h-4 w-4" />
              الصادر
              {outgoingConversations.length > 0 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {outgoingConversations.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="mt-0">
            {incomingConversations.length === 0 ? (
              <Empty className="min-h-105 border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Inbox />
                  </EmptyMedia>

                  <EmptyTitle>لا توجد رسائل واردة</EmptyTitle>

                  <EmptyDescription>
                    لا توجد محادثات واردة حاليًا.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="divide-y">
                {incomingConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="mt-0">
            {outgoingConversations.length === 0 ? (
              <Empty className="min-h-105 border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Send />
                  </EmptyMedia>

                  <EmptyTitle>لا توجد رسائل صادرة</EmptyTitle>

                  <EmptyDescription>
                    لم تقم بإرسال أي رسائل حاليًا.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="divide-y">
                {outgoingConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

/* =====================================================
   Get Other User
===================================================== */

function getOtherUser(conversation: any, currentUserId: string) {
  // Current user is Admin
  if (conversation.adminId === currentUserId) {
    return conversation.student ?? conversation.teacher;
  }

  // Current user is Student
  if (conversation.studentId === currentUserId) {
    return conversation.teacher ?? conversation.admin;
  }

  // Current user is Teacher
  if (conversation.teacherId === currentUserId) {
    return conversation.student ?? conversation.admin;
  }

  return null;
}

/* =====================================================
   Initials
===================================================== */

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

/* =====================================================
   Role Label
===================================================== */

function getRoleLabel(role: string) {
  switch (role) {
    case "ADMIN":
      return "إدارة";

    case "TEACHER":
      return "مدرس";

    case "STUDENT":
      return "طالب";

    default:
      return "مستخدم";
  }
}

/* =====================================================
   Message Time
===================================================== */

function formatMessageTime(date: Date) {
  const messageDate = new Date(date);

  const now = new Date();

  const isToday = messageDate.toDateString() === now.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat("ar-EG", {
      hour: "numeric",
      minute: "2-digit",
    }).format(messageDate);
  }

  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "short",
  }).format(messageDate);
}

function ConversationItem({
  conversation,
  currentUserId,
}: {
  conversation: any;
  currentUserId: string;
}) {
  const otherUser = getOtherUser(conversation, currentUserId);

  if (!otherUser) {
    return null;
  }

  const lastMessage = conversation.messages[0];

  const isOwnMessage = lastMessage?.senderId === currentUserId;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="
        block
        transition-colors
        hover:bg-muted/50
      "
    >
      <div className="flex items-center gap-4 p-4">
        {/* Avatar */}

        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage
            src={otherUser.image ?? undefined}
            alt={otherUser.name ?? "User"}
          />

          <AvatarFallback>{getInitials(otherUser.name)}</AvatarFallback>
        </Avatar>

        {/* Conversation */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate font-semibold">
                {otherUser.name ?? "مستخدم"}
              </h3>

              <span
                className="
                  shrink-0
                  rounded-full
                  bg-muted
                  px-2
                  py-0.5
                  text-[10px]
                  text-muted-foreground
                "
              >
                {getRoleLabel(otherUser.role)}
              </span>
            </div>

            {lastMessage && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatMessageTime(lastMessage.createdAt)}
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-sm text-muted-foreground">
            {lastMessage ? (
              <>
                {isOwnMessage && <span className="font-medium">أنت: </span>}

                {lastMessage.content}
              </>
            ) : (
              "لا توجد رسائل بعد"
            )}
          </p>
        </div>

        <MessageCircle
          className="
            h-4
            w-4
            shrink-0
            text-muted-foreground
          "
        />
      </div>
    </Link>
  );
}
