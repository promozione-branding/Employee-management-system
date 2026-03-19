import { connectDB } from "../../../lib/db.js";
import Employee from "../../../models/employee/Employee.js";
import EmployeeReminder from "../../../models/employee/EmployeeReminder.js";
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
const templatePath = path.join(__dirname, "employee-reminder.html");
const templateSource = fs.readFileSync(templatePath, "utf8");
const template = Handlebars.compile(templateSource);

// 🚀 MAIN CRON FUNCTION
async function checkEmployeeReminders() {
  try {
    const reminders = await EmployeeReminder.find().populate({
      path: "employeeId",
      select: "basicDetails.email basicDetails.name",
    });

    if (!reminders.length) {
      console.log("⚠ No employee reminders found");
      return;
    }

    const now = new Date();

    // ✅ Use local time (more reliable than ISO)
    const nowDate = now.toLocaleDateString("en-CA"); // YYYY-MM-DD
    const nowTime = now.toTimeString().slice(0, 5); // HH:mm

    console.log("⏳ Checking reminders:", nowDate, nowTime);

    for (const reminderDoc of reminders) {
      let isModified = false;

      // ❗ Ensure employee exists
      if (!reminderDoc.employeeId) {
        console.log("❌ Missing employee reference:", reminderDoc._id);
        continue;
      }

      const rawEmail = reminderDoc.employeeId?.basicDetails?.email;
      const employeeName =
        reminderDoc.employeeId?.basicDetails?.name || "Employee";

      // ✅ Clean & validate email (CRITICAL FIX)
      const cleanEmail =
        typeof rawEmail === "string" ? rawEmail.trim() : "";

      if (!cleanEmail) {
        console.log("❌ Invalid employee email:", rawEmail);
        continue;
      }

      for (const reminder of reminderDoc.reminder) {
        if (!reminder.reminderAt) continue;

        const reminderDate = new Date(reminder.reminderAt).toLocaleDateString("en-CA");
        const reminderTime = new Date(reminder.reminderAt)
          .toTimeString()
          .slice(0, 5);

        // ✅ Match time
        if (
          !reminder.reminderSend &&
          reminderDate === nowDate &&
          reminderTime === nowTime
        ) {
          const html = template({
            name: employeeName,
            description: reminder.description,
            reminderAt: new Date(reminder.reminderAt).toLocaleString(),
          });

          // ✅ Clean CC emails
          const ccEmails = Array.isArray(reminder.cc_email)
            ? reminder.cc_email
                .filter((e) => typeof e === "string" && e.trim())
                .map((e) => e.trim())
            : [];

          // 🔍 Debug log
          console.log("📧 EMAIL DEBUG:", {
            to: cleanEmail,
            cc: ccEmails,
            reminderId: reminder._id,
          });

          // ✅ Send email
          await sendReminderEmail(
            cleanEmail,
            "⏰ Reminder Notification",
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
    console.error("❌ CRON ERROR:", error);
  }
}

// 🚀 Run immediately
checkEmployeeReminders();

// 🔁 Run every minute
setInterval(checkEmployeeReminders, 60 * 1000);

console.log("🚀 Employee Reminder Cron Started...");