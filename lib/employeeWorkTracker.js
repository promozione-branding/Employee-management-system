// lib/employeeWorkTracker.js
//
// Records "who did what, on which client, when" into the EmployeeWorkLog collection, for every
// role (admin, manager, sales, employee). Most writes are also captured automatically by
// lib/workTracking/plugin.js; routes call this directly when they can describe the work better.
// Tracking is best effort: it never throws, so a logging problem can never fail
// the business operation that called it.

import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/getAuthUser';
import User from '@/models/admin/User';
import Employee from '@/models/employee/Employee';
import Customer from '@/models/admin/Customer';
import EmployeeWorkLog from '@/models/admin/EmployeeWorkLog';

// Keeps a single log entry from bloating the collection (e.g. huge notes pasted into a field).
const MAX_STRING = 2000;
const MAX_ARRAY = 100;

export function sanitize(value, depth = 0) {
    if (value === null || value === undefined) return value ?? null;
    if (depth > 5) return '[nested]';
    if (typeof value === 'string') return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
    if (typeof value !== 'object') return value;
    if (value instanceof Date) return value;
    if (value?._bsontype === 'ObjectId' || value?.constructor?.name === 'ObjectId') return String(value);
    if (Array.isArray(value)) return value.slice(0, MAX_ARRAY).map((item) => sanitize(item, depth + 1));
    const out = {};
    for (const [key, val] of Object.entries(value)) out[key] = sanitize(val, depth + 1);
    return out;
}

/**
 * @param {object}  args
 * @param {Request} args.req            Incoming request (used to identify the logged-in user)
 * @param {string}  [args.actorUserId]  Log for this user instead of the request's cookie
 * @param {string}  [args.clientId]     Customer the work was done on
 * @param {string}  [args.clientName]   Fallback name when the customer no longer exists (e.g. deleted)
 * @param {string}  [args.clientCompany]
 * @param {string}  args.action         Machine-readable action, e.g. CLIENT_UPDATED
 * @param {string}  args.summary        Human-readable one-liner
 * @param {object}  [args.details]      Extra structured info ({ changes: [{field, oldValue, newValue}] }, ...)
 */
export async function recordEmployeeWork({ req, actorUserId, clientId, clientName = '', clientCompany = '', action, summary, details = {}, entityType = '', entityId = '' }) {
    try {
        if ((!req && !actorUserId) || !action || !summary) return;

        // actorUserId lets callers log for a user who has no cookie yet (e.g. right after login).
        const authUser = actorUserId ? { _id: String(actorUserId) } : await getAuthUser(req);
        if (!authUser?._id) return;

        await connectDB();

        const [user, client] = await Promise.all([
            User.findById(authUser._id).select('username role employeeId').lean(),
            clientId ? Customer.findById(clientId).select('name company').lean().catch(() => null) : null,
        ]);
        if (!user) return;

        const employee = user.employeeId ? await Employee.findById(user.employeeId).select('basicDetails.name basicDetails.designation').lean() : null;
        const designation = employee?.basicDetails?.designation || '';

        let eventDetails = details || {};
        if (Array.isArray(eventDetails.employeeIds) && eventDetails.employeeIds.length) {
            const assignees = await Employee.find({ _id: { $in: eventDetails.employeeIds } })
                .select('basicDetails.name')
                .lean();
            eventDetails = { ...eventDetails, assignedEmployees: assignees.map((item) => item.basicDetails?.name).filter(Boolean) };
        }

        await EmployeeWorkLog.create({
            actorUserId: user._id,
            employeeId: employee?._id || null,
            employeeName: employee?.basicDetails?.name || user.username || 'Unknown employee',
            designation,
            actorRole: user.role || authUser.role || '',
            clientId: client?._id || clientId || null,
            clientName: client?.name || clientName || '',
            clientCompany: client?.company || clientCompany || '',
            action,
            summary: String(summary).slice(0, 500),
            details: sanitize(eventDetails),
            entityType,
            entityId: entityId ? String(entityId) : '',
            source: 'live',
        });
    } catch (error) {
        console.error('[employee-work-tracker] Could not save work log:', error?.message || error);
    }
}

// Builds a [{ field, oldValue, newValue }] list for the given fields, skipping unchanged ones.
export function buildFieldChanges(before = {}, after = {}, fields = []) {
    return fields
        .filter((field) => JSON.stringify(before?.[field] ?? null) !== JSON.stringify(after?.[field] ?? null))
        .map((field) => ({ field, oldValue: before?.[field] ?? null, newValue: after?.[field] ?? null }));
}
