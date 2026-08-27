"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import {
    setBattlePlayerReady,
  updateBattlePlayer,
} from "@/lib/battle/realtime";

export async function acceptBattleInvitationAction(
  invitationId: string,
) {
  try {
    // =========================================
    // AUTH
    // =========================================

    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false as const,
        error: "يجب تسجيل الدخول أولًا",
      };
    }

    if (session.user.role !== "STUDENT") {
      return {
        success: false as const,
        error: "هذه الدعوة مخصصة للطلاب فقط",
      };
    }

    const studentId = session.user.id;

    // =========================================
    // VALIDATE INVITATION ID
    // =========================================

    if (!invitationId) {
      return {
        success: false as const,
        error: "معرف الدعوة غير صالح",
      };
    }

    // =========================================
    // GET INVITATION
    // =========================================

    const invitation =
      await prisma.battleInvitation.findUnique({
        where: {
          id: invitationId,
        },

        select: {
          id: true,
          roomId: true,
          studentId: true,
          team: true,
          status: true,

          room: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

    // =========================================
    // NOT FOUND
    // =========================================

    if (!invitation) {
      return {
        success: false as const,
        error: "الدعوة غير موجودة",
      };
    }

    // =========================================
    // SECURITY
    // =========================================

    if (
      invitation.studentId !==
      studentId
    ) {
      return {
        success: false as const,
        error:
          "غير مصرح لك بقبول هذه الدعوة",
      };
    }

    // =========================================
    // BATTLE STATUS
    // =========================================

    if (
      invitation.room.status !==
      "WAITING"
    ) {
      return {
        success: false as const,
        error:
          "لا يمكن الانضمام إلى التحدي بعد بدء المباراة",
      };
    }

    // =========================================
    // ALREADY ACCEPTED
    // =========================================

    if (
      invitation.status ===
      "ACCEPTED"
    ) {
      return {
        success: true as const,
        data: {
          roomId:
            invitation.roomId,
          team: invitation.team,
          alreadyAccepted: true,
        },
      };
    }

    // =========================================
    // DECLINED
    // =========================================

    if (
      invitation.status ===
      "DECLINED"
    ) {
      return {
        success: false as const,
        error:
          "لقد رفضت هذه الدعوة بالفعل",
      };
    }

    // =========================================
    // DATABASE TRANSACTION
    // =========================================

    const result =
      await prisma.$transaction(
        async (tx) => {
          // -----------------------------------------
          // ACCEPT INVITATION
          // -----------------------------------------

          const updatedInvitation =
            await tx.battleInvitation.update({
              where: {
                id: invitation.id,
              },

              data: {
                status: "ACCEPTED",
              },

              select: {
                id: true,
                roomId: true,
                studentId: true,
                team: true,
                status: true,
              },
            });

          // -----------------------------------------
          // CREATE PARTICIPANT
          // -----------------------------------------

          const participant =
            await tx.battleParticipant.upsert({
              where: {
                roomId_studentId: {
                  roomId:
                    invitation.roomId,

                  studentId:
                    studentId,
                },
              },

              create: {
                roomId:
                  invitation.roomId,

                studentId,

                team:
                  invitation.team,

                score: 0,

                isReady: false,
              },

              update: {
                team:
                  invitation.team,
              },

              select: {
                id: true,
                roomId: true,
                studentId: true,
                team: true,
                score: true,
                isReady: true,
              },
            });

          return {
            invitation:
              updatedInvitation,

            participant,
          };
        },
      );

    // =========================================
    // UPDATE REALTIME
    // =========================================

    try {
      await updateBattlePlayer(
        invitation.roomId,
        studentId,
        {
          connected: true,
          ready: false,
        },
      );
    } catch (realtimeError) {
      console.error(
        "ACCEPT_INVITATION_REALTIME_ERROR:",
        realtimeError,
      );

      /*
       * Prisma نجحت.
       *
       * لذلك لا نرجع فشل للطالب.
       * سنعمل recovery لاحقًا.
       */
    }

    // =========================================
    // SUCCESS
    // =========================================

    return {
      success: true as const,

      data: {
        roomId:
          invitation.roomId,

        team:
          result.participant.team,

        participantId:
          result.participant.id,

        alreadyAccepted: false,
      },
    };
  } catch (error) {
    console.error(
      "ACCEPT_BATTLE_INVITATION_ERROR:",
      error,
    );

    return {
      success: false as const,

      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء قبول الدعوة",
    };
  }
}


export async function setBattleReadyAction(
  battleId: string,
  ready: boolean = true,
) {
  try {
    // =====================================================
    // AUTH
    // =====================================================

    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false as const,
        error: "يجب تسجيل الدخول أولًا",
      };
    }

    if (session.user.role !== "STUDENT") {
      return {
        success: false as const,
        error: "هذا الإجراء متاح للطلاب فقط",
      };
    }

    const studentId = session.user.id;

    // =====================================================
    // VALIDATE BATTLE ID
    // =====================================================

    if (!battleId) {
      return {
        success: false as const,
        error: "معرف التحدي غير صالح",
      };
    }

    // =====================================================
    // GET PARTICIPANT
    // =====================================================

    const participant =
      await prisma.battleParticipant.findUnique({
        where: {
          roomId_studentId: {
            roomId: battleId,
            studentId,
          },
        },

        select: {
          id: true,
          roomId: true,
          studentId: true,
          team: true,
          isReady: true,

          room: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

    // =====================================================
    // NOT PARTICIPANT
    // =====================================================

    if (!participant) {
      return {
        success: false as const,
        error:
          "أنت لست مشاركًا في هذا التحدي",
      };
    }

    // =====================================================
    // BATTLE MUST BE WAITING
    // =====================================================

    if (
      participant.room.status !==
      "WAITING"
    ) {
      return {
        success: false as const,
        error:
          "لا يمكنك تغيير حالة الجاهزية بعد بدء التحدي",
      };
    }

    // =====================================================
    // NO CHANGE
    // =====================================================

    if (
      participant.isReady === ready
    ) {
      return {
        success: true as const,

        data: {
          battleId,
          ready,
          alreadyUpdated: true,
        },
      };
    }

    // =====================================================
    // UPDATE PRISMA
    // =====================================================

    const updatedParticipant =
      await prisma.battleParticipant.update({
        where: {
          id: participant.id,
        },

        data: {
          isReady: ready,
        },

        select: {
          id: true,
          roomId: true,
          studentId: true,
          team: true,
          isReady: true,
        },
      });

    // =====================================================
    // UPDATE FIREBASE
    // =====================================================

    try {
      await setBattlePlayerReady(
        battleId,
        studentId,
        ready,
      );
    } catch (realtimeError) {
      console.error(
        "SET_BATTLE_READY_REALTIME_ERROR:",
        realtimeError,
      );

      /*
       * Prisma نجحت.
       *
       * لا نعتبر العملية فاشلة للطالب.
       * Firebase سيتم التعامل معه لاحقًا
       * بواسطة recovery mechanism.
       */
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return {
      success: true as const,

      data: {
        battleId:
          updatedParticipant.roomId,

        studentId:
          updatedParticipant.studentId,

        team:
          updatedParticipant.team,

        ready:
          updatedParticipant.isReady,

        alreadyUpdated: false,
      },
    };
  } catch (error) {
    console.error(
      "SET_BATTLE_READY_ERROR:",
      error,
    );

    return {
      success: false as const,

      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحديث حالة الجاهزية",
    };
  }
}