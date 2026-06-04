import {
  notFound,
  redirect,
} from "next/navigation";

import {
  auth,
} from "@/auth";

import {
  prisma,
} from "@/lib/prisma";

import StudentBattleGame from "@/components/student/battle/student-battle-game";

export const dynamic =
  "force-dynamic";

interface PageProps {
  params: Promise<{
    battleId: string;
  }>;
}

export default async function StudentBattlePage({
  params,
}: PageProps) {

  // =========================================
  // SESSION
  // =========================================

  const session =
    await auth();

  if (
    !session?.user?.id
  ) {
    redirect(
      "/auth/login",
    );
  }

  // =========================================
  // PARAMS
  // =========================================

  const {
    battleId,
  } = await params;

  // =========================================
  // PARTICIPANT
  // =========================================

  const participant =
    await prisma.battleParticipant.findFirst(
      {
        where: {
          roomId:
            battleId,

          studentId:
            session.user.id,
        },

        include: {
          room: {
            include: {
              teacher: {
                select: {
                  name: true,
                },
              },

              questions: {
                orderBy: {
                  order:
                    "asc",
                },

                select: {
                  id: true,

                  question: true,

                  type: true,

                  answer: true,

                  optionA: true,

                  optionB: true,

                  optionC: true,

                  optionD: true,

                  leftText: true,

                  rightText: true,

                  points: true,

                  timeLimit: true,

                  order: true,
                },
              },
            },
          },

          student: {
            select: {
              id: true,

              name: true,

              image: true,
            },
          },
        },
      },
    );

  // =========================================
  // EXISTS
  // =========================================

  if (!participant) {
    notFound();
  }

  // =========================================
  // UI
  // =========================================

  return (
    <StudentBattleGame

      // battle

      battleId={
        participant.room.id
      }

      // participant

      participantId={
        participant.id
      }

      studentId={
        participant.studentId
      }

      studentName={
        participant.student
          .name ?? ""
      }

      studentImage={
        participant.student
          .image ?? ""
      }

      team={
        participant.team
      }

      // battle info

      battle={{

        id:
          participant
            .room.id,

        title:
          participant
            .room.title,

        code:
          participant
            .room.code,

        status:
          participant
            .room.status,

        teacher:
          participant
            .room.teacher
            ?.name ?? "",

        questions:
          participant
            .room.questions,
      }}
    />
  );
}