// lib/employeeWorkQuery.js
//
// Shared auth + filter building for the /api/track-employee-work endpoints.

import mongoose from 'mongoose';
import { getAuthUser } from '@/lib/getAuthUser';
import User from '@/models/admin/User';

const VIEW_ALL_ROLES = ['admin', 'manager'];
const isId = (value) => typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);

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

/** Returns { user, canViewAll } or { error: NextResponse-like {status, message} }. */
export async function resolveViewer(req) {
    const authUser = await getAuthUser(req);
    if (!authUser?._id) return { error: { status: 401, message: 'Unauthorized' } };
    const user = await User.findById(authUser._id).select('role employeeId username').lean();
    if (!user) return { error: { status: 401, message: 'Unauthorized' } };
    return { user, canViewAll: VIEW_ALL_ROLES.includes(String(user.role).toLowerCase()) };
}

/**
 * Builds the Mongo filter from URL params.
 * @param {URLSearchParams} params
 * @param {{ user, canViewAll }} viewer
 * @param {{ skip?: string[] }} options  param names to ignore (used for facet counts)
 */
export function buildWorkLogQuery(params, viewer, { skip = [] } = {}) {
    const query = {};
    const active = (name) => !skip.includes(name) && params.get(name);

    if (!viewer.canViewAll) {
        // Non admin / manager users only ever see their own work.
        query.actorUserId = viewer.user._id;
    } else {
        if (active('userId') && isId(params.get('userId'))) query.actorUserId = new mongoose.Types.ObjectId(params.get('userId'));
        if (active('employeeId') && isId(params.get('employeeId'))) query.employeeId = new mongoose.Types.ObjectId(params.get('employeeId'));
    }

    if (active('clientId')) {
        query.clientId = isId(params.get('clientId')) ? new mongoose.Types.ObjectId(params.get('clientId')) : null;
    }
    if (active('action')) query.action = String(params.get('action'));

    const from = parseBound(params.get('from'), false);
    const to = parseBound(params.get('to'), true);
    if (from || to) {
        query.createdAt = {};
        if (from) query.createdAt.$gte = from;
        if (to) query.createdAt.$lte = to;
    }

    const search = params.get('search')?.trim();
    if (search) {
        const regex = new RegExp(search.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        query.$or = [{ summary: regex }, { action: regex }, { employeeName: regex }, { clientName: regex }, { clientCompany: regex }];
    }

    return query;
}
