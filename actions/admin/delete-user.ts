"use server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export async function deleteUser(userId: string) {
  try {
    // =====================================================
    // Authentication
    // =====================================================
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        message: "غير مصرح لك بتنفيذ هذه العملية.",
      };
    }

    // =====================================================
    // Delete User
    // =====================================================
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return {
      success: true,
      message: "تم حذف المستخدم بنجاح.",
    };
  } catch (error) {
    console.error("Error deleting user:", error);

    return {
      success: false,
      message: "حدث خطأ أثناء حذف المستخدم.",
    };
  }
}