import { connectDB } from "../../lib/db.js";
import Announcement from "../../models/admin/Announcement.js";
import Employee from "../../models/employee/Employee.js";
import { sendAnnouncementEmail } from "./mailer.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

await connectDB();

async function announcementCron() {
  console.log("📢 Announcement cron running...");

  const now = new Date();

  const announcements = await Announcement.find({
    sent: false,
  });

  if (!announcements.length) {
    console.log("⚠ No active announcements");
    return;
  }

  const employees = await Employee.find().select(
    "basicDetails.email basicDetails.designation",
  );

  for (const announcement of announcements) {
    const targetEmployees =
      announcement.targetDepartment === "ALL"
        ? employees
        : employees.filter(
            (emp) =>
              emp.basicDetails.designation === announcement.targetDepartment,
          );

    for (const emp of targetEmployees) {
      if (!emp.basicDetails.email) continue;

      await sendAnnouncementEmail({
        to: emp.basicDetails.email,
        subject: `📢 ${announcement.title}`,
        title: announcement.title,
        content: announcement.content,
      });

      console.log(`📨 Sent to ${emp.basicDetails.email}`);
    }

    announcement.sent = true;
    await announcement.save();
  }

  console.log("✅ Announcement cron completed");
}

announcementCron();
setInterval(announcementCron, 60 * 60 * 1000); // every 1 hour
