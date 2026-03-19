import nodemailer from "nodemailer";

let transporter;

export async function sendAttachmentEmail({ to, cc = [], subject, html }) {
  try {
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

    const cleanTo =
      typeof to === "string" && to.trim() ? to.trim() : null;

    const cleanCc = Array.isArray(cc)
      ? cc.filter((e) => typeof e === "string" && e.trim()).map((e) => e.trim())
      : [];

    if (!cleanTo) {
      throw new Error("No valid primary recipient");
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

    console.log("📤 Attachment Email:", mailOptions);

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("❌ Attachment Email Error:", err);
  }
}