import nodemailer from "nodemailer";

let transporter;

export async function sendReminderEmail(to, subject, html) {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.YOUR_EMAIL_ADDRESS,
        pass: process.env.YOUR_APP_PASSWORD,
      },
    });
  }
  await transporter.sendMail({
    from: `"Reminder Service"`,
    to,
    subject,
    html,
  });
}
