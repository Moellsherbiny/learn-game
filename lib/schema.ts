import { z } from "zod";

export const registerStudentSchema =
  z.object({
    name: z
      .string()
      .min(3, "الاسم قصير جداً")
      .max(100),

    email: z
      .string()
      .email("البريد الإلكتروني غير صحيح"),

    phone: z
      .string()
      .regex(
        /^01[0125][0-9]{8}$/,
        "رقم الهاتف غير صحيح",
      ),

    school: z
      .string()
      .min(2, "اسم المدرسة مطلوب")
      .max(150),

    password: z
      .string()
      .min(
        8,
        "كلمة المرور يجب ألا تقل عن 8 أحرف",
      )
      .regex(
        /[A-Z]/,
        "يجب أن تحتوي على حرف كبير",
      )
      .regex(
        /[a-z]/,
        "يجب أن تحتوي على حرف صغير",
      )
    
      .regex(
        /[^A-Za-z0-9]/,
        "يجب أن تحتوي على رمز خاص",
      ),
  });

export type RegisterStudentInput =
  z.infer<
    typeof registerStudentSchema
  >;