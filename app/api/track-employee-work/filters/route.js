// app/api/track-employee-work/filters/route.js
//
// GET dropdown options, counts and summary stats for the tracker page.
// - employees: the whole (non-sales) team plus admins / managers, each with their activity count
//   in the current filters, so the dropdown is never empty just because nobody worked yet.
// - actions: every action type seen, with counts.
// - stats: totals for the current filters.
// Each facet ignores its own filter, so picking an employee still lists every employee.

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import EmployeeWorkLog from '@/models/admin/EmployeeWorkLog';
import Employee from '@/models/employee/Employee';
import User from '@/models/admin/User';
import { buildWorkLogQuery, resolveViewer } from '@/lib/employeeWorkQuery';

const personKey = { $toString: { $ifNull: ['$employeeId', '$actorUserId'] } };

export async function GET(req) {
    try {
        await connectDB();
        const viewer = await resolveViewer(req);
        if (viewer.error) return NextResponse.json({ success: false, message: viewer.error.message }, { status: viewer.error.status });

        const params = new URL(req.url).searchParams;
        const fullQuery = buildWorkLogQuery(params, viewer);

        const [peopleCounts, actions, [stats], employees, staffUsers, [history]] = await Promise.all([
            EmployeeWorkLog.aggregate([
                { $match: buildWorkLogQuery(params, viewer, { skip: ['userId', 'employeeId'] }) },
                { $sort: { createdAt: -1 } },
                { $group: { _id: personKey, name: { $first: '$employeeName' }, designation: { $first: '$designation' }, role: { $first: '$actorRole' }, employeeId: { $first: '$employeeId' }, userId: { $first: '$actorUserId' }, count: { $sum: 1 }, lastAt: { $first: '$createdAt' } } },
            ]),
            EmployeeWorkLog.aggregate([{ $match: buildWorkLogQuery(params, viewer, { skip: ['action'] }) }, { $group: { _id: '$action', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            EmployeeWorkLog.aggregate([
                { $match: fullQuery },
                { $group: { _id: null, total: { $sum: 1 }, people: { $addToSet: personKey }, clients: { $addToSet: '$clientId' }, firstAt: { $min: '$createdAt' }, lastAt: { $max: '$createdAt' } } },
                { $project: { total: 1, firstAt: 1, lastAt: 1, people: { $size: '$people' }, clients: { $size: { $setDifference: ['$clients', [null]] } } } },
            ]),
            viewer.canViewAll ? Employee.find({ 'basicDetails.designation': { $ne: 'SALES' } }).select('basicDetails.name basicDetails.designation').lean() : [],
            viewer.canViewAll ? User.find({ role: { $in: ['admin', 'manager', 'employee'] } }).select('username role employeeId').lean() : [],
            EmployeeWorkLog.aggregate([{ $group: { _id: null, total: { $sum: 1 }, imported: { $sum: { $cond: [{ $eq: ['$source', 'history'] }, 1, 0] } } } }]),
        ]);

        // Directory of everyone whose work can be tracked, merged with activity counts.
        const counts = new Map(peopleCounts.map((p) => [String(p._id), p]));
        const userByEmployee = new Map(staffUsers.filter((u) => u.employeeId).map((u) => [String(u.employeeId), u]));
        const people = new Map();
        for (const emp of employees) {
            const user = userByEmployee.get(String(emp._id));
            people.set(String(emp._id), { key: String(emp._id), employeeId: String(emp._id), userId: user ? String(user._id) : '', name: emp.basicDetails?.name || user?.username || 'Unnamed employee', designation: emp.basicDetails?.designation || '', role: user?.role || 'employee' });
        }
        for (const user of staffUsers) {
            if (user.employeeId && people.has(String(user.employeeId))) continue;
            if (user.role === 'employee' && user.employeeId) continue; // sales employee: not tracked here
            people.set(String(user._id), { key: String(user._id), employeeId: '', userId: String(user._id), name: user.username || 'Unnamed user', designation: '', role: user.role });
        }
        // People who appear in the log but are no longer in the directory (e.g. left the company).
        for (const [key, p] of counts) {
            if (!people.has(key)) people.set(key, { key, employeeId: p.employeeId ? String(p.employeeId) : '', userId: p.userId ? String(p.userId) : '', name: p.name, designation: p.designation || '', role: p.role || '', former: true });
        }
        const employeeOptions = [...people.values()]
            .map((p) => ({ ...p, count: counts.get(p.key)?.count || 0, lastAt: counts.get(p.key)?.lastAt || null }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

        return NextResponse.json({
            success: true,
            canViewAll: viewer.canViewAll,
            isAdmin: viewer.isAdmin,
            employees: viewer.canViewAll ? employeeOptions : [],
            actions: actions.map((a) => ({ action: a._id, count: a.count })),
            stats: { total: stats?.total || 0, people: stats?.people || 0, clients: stats?.clients || 0, firstAt: stats?.firstAt || null, lastAt: stats?.lastAt || null },
            storage: viewer.canViewAll ? { total: history?.total || 0, imported: history?.imported || 0 } : null,
        });
    } catch (error) {
        console.error('[track-employee-work/filters] GET failed:', error);
        return NextResponse.json({ success: false, message: 'Unable to fetch filters' }, { status: 500 });
    }
}
