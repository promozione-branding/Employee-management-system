import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.YOUR_EMAIL_ADDRESS,
      pass: process.env.YOUR_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Support Team" <${process.env.YOUR_EMAIL_ADDRESS}>`,
    to,
    subject,
    html,
  });
}
