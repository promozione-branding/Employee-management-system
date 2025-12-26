import nodemailer from "nodemailer";
import Handlebars from "handlebars";

// EMAIL SETUP (same as yours)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "accounts@promozionebranding.com",
    pass: "lvxn hvnv mloe ilhq",
  },
});

async function sendReminderEmail(to, subject, html) {
  await transporter.sendMail({
    from: `"Reminder Service" `,
    to,
    subject,
    html,
  });
}

// ✉ Email template (basic)
const template = `
  <h3>Meeting Reminder</h3>
  <p>This is a scheduled test email sent at the hard-coded time.</p>
  <p>Note: {{note}}</p>
`;

// Compile template
const compiledTemplate = Handlebars.compile(template);

// 🔥 HARD-CODED REMINDER TIME
const reminderDateTime = new Date("2025-12-26T10:49"); // Change this to test

const data = {
  note: "This is a test reminder triggered at scheduled time",
};

const emailHTML = compiledTemplate(data);

console.log("⏳ Waiting for scheduled time:", reminderDateTime.toString());

function scheduleCheck() {
  const now = new Date();
  console.log("🕒 Checking time:", now.toString());

  if (now >= reminderDateTime) {
    console.log("📩 Time matched! Sending email now...");

    sendReminderEmail(
      "aalekh@promozionebranding.com", 
      "Scheduled Reminder Test",
      emailHTML
    )
      .then(() => {
        console.log("✅ Email sent successfully!");
        process.exit(0); // stop script after sending
      })
      .catch((err) => {
        console.error("❌ Email error:", err);
        process.exit(1);
      });
  } else {
    setTimeout(scheduleCheck, 1000); // check again after 1 sec
  }
}



scheduleCheck();
