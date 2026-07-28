import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return transporter.sendMail({
    from: `"Learn Game" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

/**
 * إرسال كود إعادة تعيين كلمة المرور
 */
export async function sendResetCodeEmail(email: string, code: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
</head>

<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table
width="600"
cellpadding="0"
cellspacing="0"
style="
background:#ffffff;
border-radius:16px;
overflow:hidden;
box-shadow:0 8px 30px rgba(0,0,0,.08);
">

<tr>
<td
style="
background:#2563eb;
padding:32px;
text-align:center;
color:white;
font-size:28px;
font-weight:bold;
">
Learn Game
</td>
</tr>

<tr>
<td style="padding:40px;">

<h2
style="
margin-top:0;
color:#111827;
">
Password Reset
</h2>

<p
style="
font-size:16px;
line-height:1.8;
color:#4b5563;
">
We received a request to reset your password.
Use the verification code below.
</p>

<div
style="
margin:35px 0;
text-align:center;
">

<span
style="
display:inline-block;
padding:18px 36px;
font-size:34px;
font-weight:bold;
letter-spacing:10px;
background:#eff6ff;
border:2px dashed #2563eb;
border-radius:12px;
color:#2563eb;
">
${code}
</span>

</div>

<p
style="
font-size:15px;
color:#6b7280;
line-height:1.8;
">
This verification code will expire in
<strong>10 minutes</strong>.
</p>

<p
style="
font-size:15px;
color:#6b7280;
line-height:1.8;
">
If you didn't request a password reset,
you can safely ignore this email.
</p>

</td>
</tr>

<tr>
<td
style="
background:#f9fafb;
padding:24px;
text-align:center;
font-size:13px;
color:#9ca3af;
">
© ${new Date().getFullYear()} Learn Game
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

  return sendEmail({
    to: email,
    subject: "Reset Your Password",
    html,
  });
}
