import { connectDB } from "../../../lib/db.js";
import User from "../../../models/admin/User.js";
import AdminReminder from "../../../models/admin/adminDetails/AdminReminder.js";
import { sendReminderEmail } from "./mailer.js";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// __dirname setup (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, "../../../.env") });

// DB connect
await connectDB();

// Load email template
const templatePath = path.join(__dirname, "admin-reminder.html");
const templateSource = fs.readFileSync(templatePath, "utf8");
const template = Handlebars.compile(templateSource);

// 🚀 MAIN CRON FUNCTION
async function checkAdminReminders() {
  try {
    const reminders = await AdminReminder.find().populate({
      path: "userId",
      select: "email username",
    });

    if (!reminders.length) {
      console.log("⚠ No admin reminders found");
      return;
    }

    const now = new Date();

    // ✅ Local time
    const nowDate = now.toLocaleDateString("en-CA"); // YYYY-MM-DD
    const nowTime = now.toTimeString().slice(0, 5); // HH:mm

    console.log("⏳ Checking admin reminders:", nowDate, nowTime);

    for (const reminderDoc of reminders) {
      let isModified = false;

      // ❗ Ensure user exists
      if (!reminderDoc.userId) {
        console.log("❌ Missing user reference:", reminderDoc._id);
        continue;
      }

      const rawEmail = reminderDoc.userId?.email;
      const username = reminderDoc.userId?.username || "User";

      // ✅ Clean email
      const cleanEmail =
        typeof rawEmail === "string" ? rawEmail.trim() : "";

      if (!cleanEmail) {
        console.log("❌ Invalid user email:", rawEmail);
        continue;
      }

      for (const reminder of reminderDoc.reminder) {
        if (!reminder.reminderAt) continue;

        const reminderDate = new Date(reminder.reminderAt).toLocaleDateString("en-CA");
        const reminderTime = new Date(reminder.reminderAt)
          .toTimeString()
          .slice(0, 5);

        // ✅ Match exact time
        if (
          !reminder.reminderSend &&
          reminderDate === nowDate &&
          reminderTime === nowTime
        ) {
          const html = template({
            name: username,
            description: reminder.description,
            reminderAt: new Date(reminder.reminderAt).toLocaleString(),
          });

          // ✅ Clean CC emails
          const ccEmails = Array.isArray(reminder.cc_email)
            ? reminder.cc_email
                .filter((e) => typeof e === "string" && e.trim())
                .map((e) => e.trim())
            : [];

          // 🔍 Debug
          console.log("📧 ADMIN EMAIL DEBUG:", {
            to: cleanEmail,
            cc: ccEmails,
            reminderId: reminder._id,
          });

          // ✅ Send email
          await sendReminderEmail(
            cleanEmail,
            "⏰ Admin Reminder Notification",
            html,
            ccEmails
          );

          reminder.reminderSend = true;
          isModified = true;

          console.log(
            `📨 Sent → To: ${cleanEmail} | CC: ${
              ccEmails.length ? ccEmails.join(", ") : "None"
            }`
          );
        }
      }

      // ✅ Save only if modified
      if (isModified) {
        await reminderDoc.save();
      }
    }
  } catch (error) {
    console.error("❌ ADMIN CRON ERROR:", error);
  }
}

// 🚀 Run immediately
checkAdminReminders();

// 🔁 Run every minute
setInterval(checkAdminReminders, 60 * 1000);

console.log("🚀 Admin Reminder Cron Started...");