import { APIError } from "better-auth/api";
import { Resend } from "resend";

export async function sendChangeEmailVerification(
  resend: Resend,
  email: string,
  url: string,
) {
  const res = await resend.emails.send({
    from: "Steeeee <mr.steven7@gmail.com>",
    to: email,
    subject: "Approve email change",
    html: `<div><h1>Welcome, ${url}!</h1></div>`,
  });
  if (res.error)
    throw new APIError("FORBIDDEN", {
      message: res.error.message,
      code: res.error.name,
    });
}
