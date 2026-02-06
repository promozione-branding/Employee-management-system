import nodemailer from "nodemailer";

export async function sendAnnouncementEmail({
  to,
  subject,
  title,
  content,
}) {
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
    from: `"HR Announcements"`,
    to,
    subject,
    html: `
      <h2>${title}</h2>
      <p>${content}</p>
      <hr />
      <small>This is an internal announcement</small>
    `,
  });
}
