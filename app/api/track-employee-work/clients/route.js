// app/api/track-employee-work/clients/route.js
//
// GET searchable client list for the tracker's client filter.
// Query: q (search text) + the page's usual filters (used for the per-client activity counts).
// Without q: clients with activity first (most active on top), then the rest alphabetically.

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import EmployeeWorkLog from '@/models/admin/EmployeeWorkLog';
import Customer from '@/models/admin/Customer';
import { buildWorkLogQuery, escapeRegex, resolveViewer } from '@/lib/employeeWorkQuery';

const LIMIT = 100;

export async function GET(req) {
    try {
        await connectDB();
        const viewer = await resolveViewer(req);
        if (viewer.error) return NextResponse.json({ success: false, message: viewer.error.message }, { status: viewer.error.status });

        const params = new URL(req.url).searchParams;
        const q = params.get('q')?.trim().slice(0, 100) || '';
        const regex = q ? new RegExp(escapeRegex(q), 'i') : null;

        const activity = await EmployeeWorkLog.aggregate([
            { $match: buildWorkLogQuery(params, viewer, { skip: ['clientId'] }) },
            { $match: { clientId: { $ne: null } } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: '$clientId', name: { $first: '$clientName' }, company: { $first: '$clientCompany' }, count: { $sum: 1 }, lastAt: { $first: '$createdAt' } } },
        ]);
        const counts = new Map(activity.map((a) => [String(a._id), a]));

        // Employees only see clients they actually worked on; admins / managers can pick any client.
        const customerFilter = {};
        if (regex) customerFilter.$or = [{ name: regex }, { company: regex }, { email: regex }];
        if (!viewer.canViewAll) customerFilter._id = { $in: activity.map((a) => a._id) };

        const [customers, totalClients] = await Promise.all([
            Customer.find(customerFilter).select('name company').sort({ company: 1, name: 1 }).limit(viewer.canViewAll && !regex ? 2000 : 500).lean(),
            viewer.canViewAll ? Customer.countDocuments({}) : activity.length,
        ]);

        const list = new Map();
        for (const c of customers) {
            const stat = counts.get(String(c._id));
            list.set(String(c._id), { clientId: String(c._id), name: c.name || '', company: c.company || '', count: stat?.count || 0, lastAt: stat?.lastAt || null });
        }
        // Clients that only exist in the log now (deleted later) stay searchable.
        for (const [id, a] of counts) {
            if (list.has(id)) continue;
            if (regex && !regex.test(a.name || '') && !regex.test(a.company || '')) continue;
            list.set(id, { clientId: id, name: a.name || '', company: a.company || '', count: a.count, lastAt: a.lastAt, deleted: true });
        }

        const clients = [...list.values()].sort((a, b) => b.count - a.count || (a.company || a.name).localeCompare(b.company || b.name)).slice(0, LIMIT);

        return NextResponse.json({ success: true, clients, totalClients, withActivity: activity.length });
    } catch (error) {
        console.error('[track-employee-work/clients] GET failed:', error);
        return NextResponse.json({ success: false, message: 'Unable to fetch clients' }, { status: 500 });
    }
}
