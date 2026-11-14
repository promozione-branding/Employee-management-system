// service/workflow/workflowRenewalCron.OLD.js
//
// ⛔ DISABLED — superseded by ProjectCycle-based renewal (status === "live",
//    anchored on renewalEndDate). Kept for reference only. Do NOT import.
//
// The original file contents are preserved in git history. This stub exists
// so any lingering import points to a no-op instead of firing duplicate mails.

export async function checkWorkflowRenewals() {
  console.log("[workflow-renewal] disabled — use ProjectCycle cron instead");
  return;
}

export default { checkWorkflowRenewals };
