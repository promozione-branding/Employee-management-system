// lib/employeeWorkQuery.js
//
// Shared auth + filter building for the /api/track-employee-work endpoints.

import mongoose from 'mongoose';
import { getAuthUser } from '@/lib/getAuthUser';
import User from '@/models/admin/User';
import { categoryPattern } from '@/lib/workTracking/categories';

const VIEW_ALL_ROLES = ['admin', 'manager'];
export const isId = (value) => typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
const toId = (value) => new mongoose.Types.ObjectId(String(value));
export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Accepts a full ISO timestamp (preferred: the browser sends local-day bounds already
// converted to UTC) or a plain YYYY-MM-DD date.
function parseBound(value, endOfDay) {
    if (!value || Number.isNaN(Date.parse(value))) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const date = new Date(`${value}T00:00:00`);
        if (endOfDay) date.setHours(23, 59, 59, 999);
        return date;
    }
    return new Date(value);
}

/** Returns { user, canViewAll, isAdmin } or { error: { status, message } }. */
export async function resolveViewer(req) {
    const authUser = await getAuthUser(req);
    if (!authUser?._id) return { error: { status: 401, message: 'Unauthorized' } };
    const user = await User.findById(authUser._id).select('role employeeId username').lean();
    if (!user) return { error: { status: 401, message: 'Unauthorized' } };
    const role = String(user.role).toLowerCase();
    return { user, canViewAll: VIEW_ALL_ROLES.includes(role), isAdmin: role === 'admin' };
}

/**
 * Builds the Mongo filter from URL params.
 * @param {URLSearchParams} params  page filters: from, to, userId ('unknown' = not recorded), employeeId,
 *                                  clientId, action, category, role, search
 * @param {{ user, canViewAll }} viewer
 * @param {{ skip?: string[] }} options  param names to ignore (used for facet counts)
 */
export function buildWorkLogQuery(params, viewer, { skip = [] } = {}) {
    const and = [];
    const active = (name) => !skip.includes(name) && params.get(name);

    if (!viewer.canViewAll) {
        // Non admin / manager users only ever see their own work.
        const own = [{ actorUserId: viewer.user._id }];
        if (viewer.user.employeeId) own.push({ employeeId: viewer.user.employeeId });
        and.push({ $or: own });
    } else {
        // An employee is matched by their Employee record or by their login, so work recorded
        // either way (live tracking vs. imported history) shows up under the same person.
        const people = [];
        if (active('userId') && params.get('userId') === 'unknown') people.push({ actorUserId: null, employeeId: null });
        if (active('employeeId') && isId(params.get('employeeId'))) people.push({ employeeId: toId(params.get('employeeId')) });
        if (active('userId') && isId(params.get('userId'))) people.push({ actorUserId: toId(params.get('userId')) });
        if (people.length) and.push({ $or: people });
    }

    if (active('clientId')) {
        and.push({ clientId: isId(params.get('clientId')) ? toId(params.get('clientId')) : null });
    }
    if (active('action')) and.push({ action: String(params.get('action')) });
    if (active('category')) {
        const pattern = categoryPattern(params.get('category'));
        if (pattern) and.push({ action: { $regex: pattern } });
    }
    if (active('role') && viewer.canViewAll) {
        const role = String(params.get('role')).toLowerCase();
        and.push({ actorRole: role === 'unknown' ? { $in: ['', null] } : role });
    }

    const from = parseBound(params.get('from'), false);
    const to = parseBound(params.get('to'), true);
    if (from || to) {
        const createdAt = {};
        if (from) createdAt.$gte = from;
        if (to) createdAt.$lte = to;
        and.push({ createdAt });
    }

    const search = params.get('search')?.trim();
    if (search) {
        const regex = new RegExp(escapeRegex(search.slice(0, 100)), 'i');
        and.push({ $or: [{ summary: regex }, { action: regex }, { employeeName: regex }, { designation: regex }, { clientName: regex }, { clientCompany: regex }, { 'details.keyword': regex }, { 'details.title': regex }, { 'details.note': regex }, { 'details.number': regex }, { 'details.description': regex }, { 'details.phone': regex }] });
    }

    if (!and.length) return {};
    return and.length === 1 ? and[0] : { $and: and };
}
