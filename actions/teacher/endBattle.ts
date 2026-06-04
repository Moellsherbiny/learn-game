// actions/teacher/endBattle.ts

"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  prisma,
} from "@/lib/prisma";

import {
  realtimeDb,
} from "@/lib/firebase";

import {
  ref,
  update,
} from "firebase/database";

import { auth } from "@/auth";

async function requireTeacher() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("يجب تسجيل الدخول أولاً");
  }

  if (session.user.role !== "TEACHER") {
    throw new Error("غير مصرح لك");
  }

  return session.user.id;
}

export async function endBattleAction(
  battleId: string,
) {
  // AUTH

  const teacherId =
    await requireTeacher();

  // ROOM

  const room =
    await prisma.battleRoom.findUnique(
      {
        where: {
          id: battleId,
        },
      },
    );

  if (!room) {
    throw new Error(
      "الغرفة غير موجودة",
    );
  }

  if (
    room.teacherId !==
    teacherId
  ) {
    throw new Error(
      "غير مصرح لك",
    );
  }

  // UPDATE DB

  await prisma.battleRoom.update(
    {
      where: {
        id: battleId,
      },

      data: {
        status:
          "FINISHED",
      },
    },
  );

  // FIREBASE

  await update(
    ref(
      realtimeDb,
      `battleRooms/${battleId}`,
    ),

    {
      status:
        "FINISHED",
    },
  );

  // REVALIDATE

  revalidatePath(
    `/teacher/battles/${battleId}`,
  );

  revalidatePath(
    `/teacher/battles/${battleId}/live`,
  );

  return {
    success: true,
  };
}