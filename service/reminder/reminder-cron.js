import Meeting from "../../models/meeting/Meeting.js";
import User from "../../models/User.js"; // 👈 Register User model
import { connectDB } from "../../lib/db.js";
import { sendReminderEmail } from "./mailer.js";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import dotenv from "dotenv";
import Customer from "../../models/Customer.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

await connectDB();

const templatePath = path.join(__dirname, "reminder.html");
const templateSource = fs.readFileSync(templatePath, "utf8");
const template = Handlebars.compile(templateSource);

// today is the meeting
const meetingTemplatePath = path.join(__dirname, "meeting-reminder.html");
const meetingTemplateSource = fs.readFileSync(meetingTemplatePath, "utf8");
const meetingTemplate = Handlebars.compile(meetingTemplateSource);

async function checkReminders() {
  const meetings = await Meeting.find()
    .populate("meetingUpdate.salesPersonId")
    .populate("meetingUpdate.clientId");

  if (!meetings || meetings.length === 0) {
    console.log("⚠ No meetings found");
    return;
  }

  const now = new Date();
  const nowDate = now.toISOString().split("T")[0];
  const nowTime = now.toTimeString().slice(0, 5);

  console.log("⏳ Checking time:", nowDate, nowTime);

  for (const meeting of meetings) {
    let isModified = false;
    if (!meeting.meetingUpdate) continue;

    for (const entry of meeting.meetingUpdate) {
      const reminderDate = entry.reminderAt?.toISOString().split("T")[0];
      const reminderTime = entry.reminderAt?.toTimeString().slice(0, 5);

      if (
        !entry.reminderSent &&
        reminderDate === nowDate &&
        reminderTime === nowTime
      ) {
        const html = template({
          client: entry.clientId?.name || "Unknown Client",
          note: entry?.note,
          updateType: entry?.updateType,
        });

        await sendReminderEmail(
          entry?.salesPersonId?.email,
          `Reminder: Meeting with ${entry.clientId?.name || "Client"}`,
          html
        );

        entry.reminderSent = true;
        isModified = true;
        console.log("📨 Reminder email triggered!");
      }

      // ------meeting Update -------------------
      const meetingDate = entry.meetingAt?.toISOString().split("T")[0];
      const meetingTime = entry.meetingAt?.toTimeString().slice(0, 5);

      if (meetingDate === nowDate && meetingTime === nowTime) {
        const htmlForMeetingUpdateReminder = meetingTemplate({
          client: entry.clientId?.name || "Unknown Client",
          note: entry?.note,
          meetingAt: entry.meetingAt?.toLocaleString(),
          reminderAt: entry.reminderAt?.toLocaleString(),
        });
        await sendReminderEmail(
          entry?.salesPersonId?.email,
          `Reminder: Meeting with ${entry.clientId?.name || "Client"}`,
          htmlForMeetingUpdateReminder
        );
        console.log("📨 Reminder Meeting updated email triggered!");
      }
    }
    if (isModified) await meeting.save();
  }
}

checkReminders();
setInterval(checkReminders, 60 * 1000);

console.log("🚀 Reminder Cron Started...");
