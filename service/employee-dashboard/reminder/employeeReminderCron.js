import { connectDB } from "../../../lib/db.js";
import EmployeeReminder from "../../../models/employee/EmployeeReminder.js";
import Employee from "../../../models/employee/Employee.js";
import { sendReminderEmail } from "./mailer.js";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../../.env") });

// DB connect
await connectDB();

// Load email template
const templatePath = path.join(__dirname, "employee-reminder.html");
const templateSource = fs.readFileSync(templatePath, "utf8");
const template = Handlebars.compile(templateSource);

async function checkEmployeeReminders() {
  const reminders = await EmployeeReminder.find()
    .populate({
      path: "employeeId",
      select: "basicDetails.email basicDetails.name",
    });

  if (!reminders.length) {
    console.log("⚠ No employee reminders found");
    return;
  }

  const now = new Date();
  const nowDate = now.toISOString().split("T")[0];
  const nowTime = now.toTimeString().slice(0, 5);

  console.log("⏳ Checking reminders:", nowDate, nowTime);

  for (const reminderDoc of reminders) {
    let isModified = false;

    const employeeEmail = reminderDoc.employeeId?.basicDetails?.email;
    const employeeName = reminderDoc.employeeId?.basicDetails?.name;

    if (!employeeEmail) continue;

    for (const reminder of reminderDoc.reminder) {
      const reminderDate = reminder.reminderAt
        ?.toISOString()
        .split("T")[0];
      const reminderTime = reminder.reminderAt
        ?.toTimeString()
        .slice(0, 5);

      if (
        !reminder.reminderSend &&
        reminderDate === nowDate &&
        reminderTime === nowTime
      ) {
        const html = template({
          name: employeeName || "Employee",
          description: reminder.description,
          reminderAt: reminder.reminderAt.toLocaleString(),
        });

        await sendReminderEmail(
          employeeEmail,
          "⏰ Reminder Notification",
          html
        );

        reminder.reminderSend = true;
        isModified = true;

        console.log(`📨 Reminder sent to ${employeeEmail}`);
      }
    }

    if (isModified) {
      await reminderDoc.save();
    }
  }
}

// Run immediately
checkEmployeeReminders();

// Run every minute
setInterval(checkEmployeeReminders, 60 * 1000);

console.log("🚀 Employee Reminder Cron Started...");
