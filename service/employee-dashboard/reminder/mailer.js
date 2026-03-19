

import nodemailer from "nodemailer"; // ✅ REQUIRED

let transporter;

export async function sendReminderEmail(to, subject, html, cc = []) {
  try {
    // ✅ Create transporter once
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

    // ✅ Clean TO
    const cleanTo =
      typeof to === "string" && to.trim() ? to.trim() : null;

    // ✅ Clean CC
    const cleanCc = Array.isArray(cc)
      ? cc
          .filter((e) => typeof e === "string" && e.trim())
          .map((e) => e.trim())
      : [];

    if (!cleanTo) {
      throw new Error("❌ No valid recipient email");
    }

    const mailOptions = {
      from: process.env.YOUR_EMAIL_ADDRESS,
      to: cleanTo,
      subject,
      html,
    };

    if (cleanCc.length) {
      mailOptions.cc = cleanCc.join(",");
    }

    console.log("📤 MAIL DATA:", mailOptions);

    const result = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", result.messageId);

    return result;
  } catch (error) {
    console.error("❌ MAIL ERROR:", error);
    throw error;
  }
}