// lib/auditLog.js

import EditHistory from "@/models/admin/EditHistory";
import User from "@/models/admin/User";
import Employee from "@/models/employee/Employee";

export async function recordEdit(opts) {
  try {
    const {
      clientId,
      module,
      entityId,
      summary,
      action,
      changes = [],
      actor = {},
      isConfidential = false,
      beforeSnapshot,
      afterSnapshot,
      req,
    } = opts;

    if (!clientId || !module || !summary || !action) {
      console.warn("[auditLog] skipped — missing required fields");
      return null;
    }

    let name = actor.name;
    let email = actor.email;
    let role = actor.role;
    let employeeId = actor.employeeId;
    let performedBy = actor.userId || null;

    if (actor.userId && (!name || !email || !role)) {
      const user = await User.findById(actor.userId).lean();
      if (user) {
        name = name || user.username;
        email = email || user.email;
        role = role || user.role;

        if (!employeeId && user.employeeId) {
          const emp = await Employee.findById(user.employeeId).lean();
          employeeId = emp?._id;
          name = name || emp?.basicDetails?.name;
          email = email || emp?.basicDetails?.email;
        }
      }
    }

    if (!performedBy && !name) {
      name = "System";
      role = "system";
    }

    // 👇 THE CRITICAL FIX 👇
    const SYSTEM_USER_ID = "000000000000000000000000";
    if (!performedBy) performedBy = SYSTEM_USER_ID;

    const doc = await EditHistory.create({
      clientId,
      module,
      entityId,
      summary,
      action,
      changes,
      performedBy: performedBy,
      performedByName: name || "System",
      performedByEmail: email || "",
      performedByRole: role || "system",
      performedByEmployeeId: employeeId,
      isConfidential,
      beforeSnapshot,
      afterSnapshot,
      ipAddress:
        req?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ||
        req?.ip ||
        "",
      userAgent: req?.headers?.get?.("user-agent") || "",
    });

    return doc;
  } catch (err) {
    console.error("[auditLog] failed to record:", err?.message);
    return null;
  }
}

export function diffObjects(before = {}, after = {}) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changes = [];

  for (const k of keys) {
    const a = before[k];
    const b = after[k];

    const aStr = a instanceof Date ? a.toISOString() : JSON.stringify(a);
    const bStr = b instanceof Date ? b.toISOString() : JSON.stringify(b);

    if (aStr !== bStr) {
      changes.push({ field: k, oldValue: a, newValue: b });
    }
  }

  return changes;
}
