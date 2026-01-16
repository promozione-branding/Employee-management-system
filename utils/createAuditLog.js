import AuditHistory from "@/models/admin/AuditHistory";
import Customer from "@/models/Customer";

const IGNORED_FIELDS = ["_id", "__v", "createdAt", "updatedAt"];

export async function createAuditLog({
  clientId,
  entityType,
  entityId,
  action,
  oldData,
  newData,
  userId,
}) {
  let changes = [];

  // 🔄 UPDATE
  if (action === "UPDATE" && oldData && newData) {
    for (const key of Object.keys(newData)) {
      if (IGNORED_FIELDS.includes(key)) continue;

      const oldValue = oldData[key];
      const newValue = newData[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue,
        });
      }
    }

    // No real change → no audit
    if (!changes.length) return null;
  }

  // 🗑 DELETE
  if (action === "DELETE") {
    changes = [
      {
        field: "ALL",
        oldValue: oldData,
        newValue: null,
      },
    ];
  }

  // 🆕 CREATE → allow empty changes
 if (action === "CREATE") {
    changes.push({
      field: "ALL",
      oldValue: null,
      newValue: newData,
    });
  }

  // 🧾 CREATE AUDIT RECORD
  const auditHistory = await AuditHistory.create({
    clientId,
    entityType,
    entityId,
    action,
    changedBy: userId,
    changes,
  });

  // 🔗 LINK TO CUSTOMER
  if (entityType === "Customer") {
    await Customer.findByIdAndUpdate(entityId, {
      $push: { history: auditHistory._id },
    });
  }

  return auditHistory;
}
