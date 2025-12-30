import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.YOUR_EMAIL_ADDRESS,
    pass: process.env.YOUR_APP_PASSWORD,
  },
});

export async function sendLoginOTP(email, otp) {
  await transporter.sendMail({
    from: `"OTP Service" <${process.env.YOUR_EMAIL_ADDRESS}>`,
    to: email,
    subject: "Your Login OTP Code",
    html: `<h2>Your OTP Code is: <b>${otp}</b></h2><p>Valid for 5 minutes</p>`,
  });
}
