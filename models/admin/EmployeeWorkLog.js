// models/admin/EmployeeWorkLog.js
//
// Append-only, permanent timeline of work done by employees / managers / admins.
// Written by lib/employeeWorkTracker.js (live) and lib/employeeWorkBackfill.js (history import),
// read by /api/track-employee-work. There is intentionally no TTL: records are kept forever.

import mongoose from 'mongoose';

const EmployeeWorkLogSchema = new mongoose.Schema(
    {
        // Who (actorUserId may be null for imported history done by an employee without a login)
        actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null, index: true },
        employeeName: { type: String, required: true, trim: true },
        designation: { type: String, default: '' },
        actorRole: { type: String, default: '' },

        // On which client (names are snapshotted so history survives renames / deletes)
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null, index: true },
        clientName: { type: String, default: '', trim: true },
        clientCompany: { type: String, default: '', trim: true },

        // What
        action: { type: String, required: true, trim: true, index: true },
        summary: { type: String, required: true, trim: true },
        details: { type: mongoose.Schema.Types.Mixed, default: {} },
        entityType: { type: String, default: '' },
        entityId: { type: String, default: '' },

        // Where the record came from: 'live' (tracked as it happened) or 'history' (imported).
        source: { type: String, default: 'live' },
        // Stable id of the imported source record, so re-running the import never duplicates.
        sourceKey: { type: String },
        // When = createdAt (timestamps)
    },
    { timestamps: true }
);

EmployeeWorkLogSchema.index({ createdAt: -1 });
EmployeeWorkLogSchema.index({ actorUserId: 1, createdAt: -1 });
EmployeeWorkLogSchema.index({ employeeId: 1, createdAt: -1 });
EmployeeWorkLogSchema.index({ clientId: 1, createdAt: -1 });
EmployeeWorkLogSchema.index({ sourceKey: 1 }, { unique: true, partialFilterExpression: { sourceKey: { $type: 'string' } } });

export default mongoose.models.EmployeeWorkLog || mongoose.model('EmployeeWorkLog', EmployeeWorkLogSchema);
