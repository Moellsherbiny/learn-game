"use server";

import jwt from "jsonwebtoken";
import { hash } from "bcrypt";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    token: z.string(),

    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),

    confirmPassword:
      z.string(),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      path: [
        "confirmPassword",
      ],
      message:
        "كلمتا المرور غير متطابقتين",
    },
  );

export async function completeTeacherRegistration(
  data: z.infer<
    typeof schema
  >,
) {
  try {
    const parsed =
      schema.parse(data);

    const payload =
      jwt.verify(
        parsed.token,
        process.env.JWT_SECRET!,
      ) as {
        name: string;
        email: string;
        role: string;
      };

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email:
            payload.email,
        },
      });

    if (existingUser) {
      return {
        success: false,
        message:
          "تم استخدام الدعوة مسبقاً",
      };
    }

    const hashedPassword =
      await hash(
        parsed.password,
        12,
      );

    await prisma.user.create({
      data: {
        name: payload.name,
        email:
          payload.email,
        password:
          hashedPassword,
        role: "TEACHER",
      },
    });

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      message:
        "رابط الدعوة غير صالح",
    };
  }
}