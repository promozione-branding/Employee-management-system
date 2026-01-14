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
  const changes = [];

  if (action === "UPDATE") {
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
  }

  // 🚫 Do not save useless audit logs
  if (!changes.length) return;

  const auditDataHistory = await AuditHistory.create({
    clientId,
    entityType,
    entityId,
    action,
    changedBy: userId,
    changes,
  });

  // 👇 PUSH INTO CUSTOMER
  if (entityType === "Customer") {
    await Customer.findByIdAndUpdate(entityId, {
      $push: { history: AuditHistory._id },
    });
  }

  return auditDataHistory;
}
