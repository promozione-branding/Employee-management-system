// service/workflow/workflowRenewalCron.js
//
// Standalone renewal reminder cron (matches admin-reminder-cron.js pattern).
//
// Rules based on days-left until workflow.endDate:
//   • 3 months before end  → 1 reminder  (milestone "3m")
//   • 2 months remaining    → every 15 days  ("2m_1", "2m_2")
//   • 1 month remaining     → every 7 days   ("1m_1" ... "1m_4")
//
// Idempotent: each milestone fires ONCE per workflow via renewal.sentMilestones.
// Never throws. Runs every 1 hour.

import { connectDB } from "../../lib/db.js";
import Workflow from "../../models/admin/Workflow.js";
import { sendRenewalReminderMail } from "../../lib/mail/workflowMailer.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

await connectDB();

const DAY = 24 * 60 * 60 * 1000;

// Milestone definitions in order of priority
// Each: { key, whenDaysLeft(daysLeft) -> boolean }
const MILESTONES = [
  // ~3 months before end (90 days window → fire once when crossing 90d)
  { key: "3m",   match: (d) => d <= 90 && d > 75 },
  // 2 months remaining → every 15 days  (~60d → 30d)
  { key: "2m_1", match: (d) => d <= 60 && d > 45 },
  { key: "2m_2", match: (d) => d <= 45 && d > 30 },
  // 1 month remaining → every 7 days  (~30d → 0)
  { key: "1m_1", match: (d) => d <= 30 && d > 23 },
  { key: "1m_2", match: (d) => d <= 23 && d > 16 },
  { key: "1m_3", match: (d) => d <= 16 && d > 9  },
  { key: "1m_4", match: (d) => d <= 9  && d >= 0 },
];

async function checkWorkflowRenewals() {
  try {
    const now = new Date();

    // Only active workflows whose endDate is in the future OR today
    const workflows = await Workflow.find({
      status: "active",
      endDate: { $gte: now },
    }).lean();

    if (!workflows.length) {
      console.log("[workflow-renewal] no active workflows");
      return;
    }

    console.log(`[workflow-renewal] checking ${workflows.length} workflows...`);

    for (const wf of workflows) {
      const daysLeft = Math.ceil((new Date(wf.endDate) - now) / DAY);

      const alreadySent = new Set(wf?.renewal?.sentMilestones || []);

      // Find the milestone that matches this daysLeft and hasn't been sent
      const dueMilestone = MILESTONES.find(
        (m) => m.match(daysLeft) && !alreadySent.has(m.key),
      );

      if (!dueMilestone) continue;

      console.log(
        `[workflow-renewal] firing ${dueMilestone.key} for workflow ${wf._id} (${daysLeft}d left)`,
      );

      try {
        await sendRenewalReminderMail({
          workflow: wf,
          milestone: dueMilestone.key,
        });

        await Workflow.updateOne(
          { _id: wf._id },
          {
            $addToSet: { "renewal.sentMilestones": dueMilestone.key },
            $set: {
              "renewal.lastReminderAt": now,
            },
          },
        );
      } catch (err) {
        console.error(
          `[workflow-renewal] send failed for ${wf._id}:`,
          err.message,
        );
      }
    }

    // Auto-complete workflows whose endDate has passed
    const completed = await Workflow.updateMany(
      { status: "active", endDate: { $lt: now } },
      { $set: { status: "completed" } },
    );
    if (completed.modifiedCount > 0) {
      console.log(
        `[workflow-renewal] auto-completed ${completed.modifiedCount} workflows`,
      );
    }

    console.log("[workflow-renewal] ✅ cycle complete");
  } catch (error) {
    console.error("[workflow-renewal] ❌ CRON ERROR:", error);
  }
}

// Run immediately
checkWorkflowRenewals();

// Then every 1 hour
setInterval(checkWorkflowRenewals, 60 * 60 * 1000);

console.log("🚀 Workflow Renewal Cron Started...");
