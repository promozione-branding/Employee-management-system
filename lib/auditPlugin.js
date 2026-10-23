// lib/auditPlugin.js
import EditHistory from "@/models/admin/EditHistory";
import User from "@/models/admin/User";
import Employee from "@/models/employee/Employee";
import { auditContext } from "./auditContext";
import { diffObjects } from "./auditLog";

export function auditPlugin(schema, options) {
  const moduleName = options.module || "unknown";
  const clientIdPath = options.clientIdPath || "clientId";

  // --- HOOK 1: CREATE & UPDATE (via .save()) ---
  schema.pre("save", function () {
    if (!this.isNew) {
      // .toObject({ depopulate: true }) cleans up mongoose internal variables
      this.$locals.beforeData = this.toObject({ depopulate: true });
    }
  });

  schema.post("save", async function (doc) {
    const store = auditContext.getStore();
    if (!store || !store.user) return; // No user context, skip

    const isUpdate = !!doc.$locals.beforeData;
    const action = isUpdate ? "UPDATE" : "CREATE";
    const before = doc.$locals.beforeData || {};
    const after = doc.toObject({ depopulate: true });
    
    // Grab clientId (handles root level and nested meetingUpdate)
    let clientId = doc[clientIdPath] || doc._id;
    if (!clientId && doc.meetingUpdate && doc.meetingUpdate.length > 0) {
        clientId = doc.meetingUpdate[doc.meetingUpdate.length - 1].clientId;
    }

    if (!clientId) return;

    const changes = isUpdate ? diffObjects(before, after) : [];
    if (isUpdate && changes.length === 0) return; // Nothing changed

    const user = await User.findById(store.user._id).lean();
    const emp = user?.employeeId ? await Employee.findById(user.employeeId).lean() : null;

    await EditHistory.create({
      clientId,
      module: moduleName,
      entityId: doc._id,
      action,
      summary: `${action} ${moduleName}${isUpdate ? ` (${changes.length} fields changed)` : ""}`,
      changes,
      performedBy: store.user._id,
      performedByName: emp?.basicDetails?.name || user?.username || "Unknown",
      performedByEmail: user?.email || "",
      performedByRole: user?.role || "employee",
      isConfidential: doc.isConfidential || false,
      beforeSnapshot: isUpdate ? before : undefined,
      afterSnapshot: after,
      ipAddress: store.req?.headers?.get?.("x-forwarded-for") || "",
    });
  });

  // --- HOOK 2: UPDATE (via .findOneAndUpdate()) ---
  schema.pre("findOneAndUpdate", async function () {
    const docToUpdate = await this.model.findOne(this.getQuery()).lean();
    this._oldData = docToUpdate;
  });

  schema.post("findOneAndUpdate", async function (doc) {
    if (!doc || !this._oldData) return;
    const store = auditContext.getStore();
    if (!store || !store.user) return;

    const changes = diffObjects(this._oldData, doc.toObject({ depopulate: true }));
    if (changes.length === 0) return;

    const clientId = doc[clientIdPath] || doc._id;
    const user = await User.findById(store.user._id).lean();
    const emp = user?.employeeId ? await Employee.findById(user.employeeId).lean() : null;

    await EditHistory.create({
      clientId,
      module: moduleName,
      entityId: doc._id,
      action: "UPDATE",
      summary: `Updated ${moduleName} (${changes.length} fields changed)`,
      changes,
      performedBy: store.user._id,
      performedByName: emp?.basicDetails?.name || user?.username || "Unknown",
      performedByEmail: user?.email || "",
      performedByRole: user?.role || "employee",
      isConfidential: doc.isConfidential || false,
      beforeSnapshot: this._oldData,
      afterSnapshot: doc.toObject({ depopulate: true }),
    });
  });
}
