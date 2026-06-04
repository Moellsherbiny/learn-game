import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendTeacherInviteEmailParams {
  name: string;
  email: string;
  inviteUrl: string;
}

export async function sendTeacherInviteEmail({
  email,
  name,
  inviteUrl,
}: SendTeacherInviteEmailParams) {
  const subject = "دعوة للانضمام كمدرس";

  const heading = "تمت دعوتك للانضمام كمدرس";

  const bodyText =
    "تم إنشاء دعوة لك للانضمام إلى المنصة كمدرس. اضغط على الزر التالي لإكمال إنشاء الحساب وتحديد كلمة المرور الخاصة بك.";
  const html = `
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>

<body
  style="
    margin:0;
    padding:32px 16px;
    background:#f8fafc;
    font-family:Inter,Segoe UI,Tahoma,sans-serif;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          style="
            max-width:560px;
            background:#ffffff;
            border:1px solid #e5e7eb;
            border-radius:20px;
            overflow:hidden;
            box-shadow:
              0 1px 2px rgba(0,0,0,.04),
              0 8px 24px rgba(0,0,0,.06);
          "
        >
          <!-- Top Bar -->

          <tr>
            <td
              style="
                height:6px;
                background:linear-gradient(
                  90deg,
                  #6366f1,
                  #8b5cf6
                );
              "
            ></td>
          </tr>

          <!-- Content -->

          <tr>
            <td
              style="
                padding:40px 36px;
              "
            >
              <!-- Logo -->

              <div
                style="
                  text-align:center;
                  margin-bottom:24px;
                "
              >
                <div
                  style="
                    width:64px;
                    height:64px;
                    line-height:64px;
                    border-radius:18px;
                    margin:auto;
                    background:#eef2ff;
                    font-size:32px;
                  "
                >
                  🎓
                </div>
              </div>

              <!-- Title -->

              <h1
                style="
                  margin:0;
                  color:#111827;
                  font-size:28px;
                  font-weight:700;
                  text-align:center;
                "
              >
                ${heading}
              </h1>

              <p
                style="
                  margin:16px 0 0;
                  text-align:center;
                  color:#6b7280;
                  font-size:15px;
                  line-height:1.8;
                "
              >
                ${bodyText}
              </p>

              <!-- User -->

              <div
                style="
                  margin:32px 0;
                  padding:16px;
                  background:#f9fafb;
                  border:1px solid #e5e7eb;
                  border-radius:14px;
                  text-align:center;
                "
              >
                <p
                  style="
                    margin:0;
                    color:#374151;
                    font-size:15px;
                  "
                >
                  مرحباً
                </p>

                <p
                  style="
                    margin:8px 0 0;
                    color:#111827;
                    font-size:20px;
                    font-weight:700;
                  "
                >
                  ${name}
                </p>
              </div>

              <!-- CTA -->

              <div
                style="
                  text-align:center;
                  margin-bottom:32px;
                "
              >
                <a
                  href="${inviteUrl}"
                  style="
                    display:inline-block;
                    background:#111827;
                    color:#ffffff;
                    text-decoration:none;
                    padding:14px 28px;
                    border-radius:12px;
                    font-weight:600;
                    font-size:14px;
                  "
                >
                  إكمال إنشاء الحساب
                </a>
              </div>

              <!-- Expire -->

              <div
                style="
                  text-align:center;
                  padding:14px;
                  background:#fffbeb;
                  border:1px solid #fde68a;
                  border-radius:12px;
                "
              >
                <p
                  style="
                    margin:0;
                    color:#92400e;
                    font-size:13px;
                  "
                >
                  ⏳ تنتهي صلاحية رابط الدعوة خلال
                  <strong>7 أيام</strong>
                </p>
              </div>

              <!-- Note -->

              <p
                style="
                  margin-top:24px;
                  color:#9ca3af;
                  text-align:center;
                  font-size:13px;
                  line-height:1.8;
                "
              >
                إذا كنت لا تتوقع هذه الدعوة
                يمكنك تجاهل هذه الرسالة بأمان.
              </p>
            </td>
          </tr>

          <!-- Footer -->

          <tr>
            <td
              style="
                border-top:1px solid #f3f4f6;
                padding:20px;
                text-align:center;
              "
            >
              <p
                style="
                  margin:0;
                  color:#9ca3af;
                  font-size:12px;
                "
              >
                © ${new Date().getFullYear()} Learn Game
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Learn Game" <${process.env.GMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
}
