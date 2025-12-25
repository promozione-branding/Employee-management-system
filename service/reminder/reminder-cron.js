import Meeting from "@/models/meeting/Meeting";
import { connectDB } from "@/lib/db";
import { sendReminderEmail } from "./mailer";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

await connectDB();

const templatePath = path.join(process.cwd(), "/service/reminder/mailTemplate.html");
const templateSource = fs.readFileSync(templatePath, "utf8");
const template = Handlebars.compile(templateSource);

async function checkReminders() {
  const meetings = await Meeting.find({ "meetingUpdate.reminderSent": false }).populate("clientDetails");

  const nowDate = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  for (const meeting of meetings) {
    for (const entry of meeting.meetingUpdate) {
      if (entry.reminderSent) continue;

      if (entry.reminderDate === nowDate && entry.reminderTime === nowTime) {
        const html = template({
          client: meeting.clientDetails?.name || "Unknown Client",
          note: entry.note,
          meetingDate: entry.meetingDate,
          meetingTime: entry.meetingTime,
          reminderDate: entry.reminderDate,
          reminderTime: entry.reminderTime,
        });

        await sendReminderEmail(
          meeting.clientDetails?.email,
          `Reminder: Meeting with ${meeting.clientDetails?.name}`,
          html
        );

        entry.reminderSent = true;
      }
    }

    await meeting.save();
  }
}

await checkReminders();
setInterval(checkReminders, 60 * 1000);

console.log("🚀 Reminder Cron Started...");
