// service/workflow/workflowRenewalCron.js
//
// Renewal reminders anchored on ProjectCycle.projectDuration.$.renewalEndDate.
// Only rows with status === "live" and a renewalEndDate are considered.
// Milestones fire once per subdoc via renewal.sentMilestones.
// Never throws. Runs every 1 hour.

import { connectDB } from "../../lib/db.js";
import ProjectCycle from "../../models/admin/ProjectCycle.js";
import Customer from "../../models/admin/Customer.js";
import { sendRenewalReminderMail } from "../../lib/mail/workflowMailer.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

await connectDB();

const DAY = 24 * 60 * 60 * 1000;

const MILESTONES = [
  { key: "3m", match: (d) => d <= 90 && d > 75 },
  { key: "2m_1", match: (d) => d <= 60 && d > 45 },
  { key: "2m_2", match: (d) => d <= 45 && d > 30 },
  { key: "1m_1", match: (d) => d <= 30 && d > 23 },
  { key: "1m_2", match: (d) => d <= 23 && d > 16 },
  { key: "1m_3", match: (d) => d <= 16 && d > 9 },
  { key: "1m_4", match: (d) => d <= 9 && d >= 0 },
];

async function checkProjectCycleRenewals() {
  try {
    const now = new Date();

    const cycles = await ProjectCycle.find({
      "projectDuration.status": "live",
      "projectDuration.renewalEndDate": { $gte: now },
    }).lean();

    if (!cycles.length) {
      console.log("[pc-renewal] no live project cycles");
      return;
    }

    let fired = 0;

    for (const cycle of cycles) {
      const customer = await Customer.findById(cycle.clientId)
        .select("name company email")
        .lean();

      for (const dur of cycle.projectDuration || []) {
        if (dur.status !== "live" || !dur.renewalEndDate) continue;

        const daysLeft = Math.ceil(
          (new Date(dur.renewalEndDate) - now) / DAY,
        );
        const alreadySent = new Set(dur?.renewal?.sentMilestones || []);

        const due = MILESTONES.find(
          (m) => m.match(daysLeft) && !alreadySent.has(m.key),
        );
        if (!due) continue;

        // Map subdoc → workflow-shaped object for the existing mailer
        const workflow = {
          _id: dur._id,
          customerId: cycle.clientId,
          proposalId: dur.proposalId || null,
          proposalNumber: dur.proposalNumber || "",
          category: dur.category || dur.service || "",
          categoryLabel: dur.categoryLabel || dur.service || "",
          startDate: dur.startDate,
          endDate: dur.renewalEndDate,
          clientName: customer?.name || "",
          clientCompany: customer?.company || "",
          clientEmail: customer?.email || "",
        };

        console.log(
          `[pc-renewal] firing ${due.key} for duration ${dur._id} (${daysLeft}d left)`,
        );

        try {
          await sendRenewalReminderMail({ workflow, milestone: due.key });

          await ProjectCycle.updateOne(
            { _id: cycle._id, "projectDuration._id": dur._id },
            {
              $addToSet: {
                "projectDuration.$.renewal.sentMilestones": due.key,
              },
              $set: {
                "projectDuration.$.renewal.lastReminderAt": now,
              },
            },
          );
          fired += 1;
        } catch (err) {
          console.error(
            `[pc-renewal] send failed for ${dur._id}:`,
            err.message,
          );
        }
      }
    }

    // Auto-complete rows whose renewalEndDate passed
    const autoComplete = await ProjectCycle.updateMany(
      {
        "projectDuration.status": "live",
        "projectDuration.renewalEndDate": { $lt: now },
      },
      {
        $set: { "projectDuration.$[el].status": "completed" },
      },
      {
        arrayFilters: [
          {
            "el.status": "live",
            "el.renewalEndDate": { $lt: now },
          },
        ],
      },
    );

    if (autoComplete.modifiedCount > 0) {
      console.log(
        `[pc-renewal] auto-completed ${autoComplete.modifiedCount} cycles`,
      );
    }

    console.log(`[pc-renewal] ✅ cycle complete (fired ${fired})`);
  } catch (error) {
    console.error("[pc-renewal] ❌ CRON ERROR:", error);
  }
}

checkProjectCycleRenewals();
setInterval(checkProjectCycleRenewals, 60 * 60 * 1000);

console.log("🚀 ProjectCycle Renewal Cron Started...");
