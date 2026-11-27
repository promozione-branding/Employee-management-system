// app/api/track-employee-work/filters/route.js
//
// GET dropdown options, counts and insights for the tracker page.
// - employees: every staff member (admin, manager, sales, employee) with their activity count in the
//   current filters, plus a "Not recorded" bucket for imported history with no known author.
// - actions / categories / roles: facet counts.
// - stats, series (activity over time), heatmap (weekday x hour): insights for the current filters.
// Each facet ignores its own filter, so picking an employee still lists every employee.

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import EmployeeWorkLog from '@/models/admin/EmployeeWorkLog';
import Employee from '@/models/employee/Employee';
import User from '@/models/admin/User';
import { buildWorkLogQuery, resolveViewer } from '@/lib/employeeWorkQuery';
import { categoryOf } from '@/lib/workTracking/categories';

const personKey = { $ifNull: [{ $toString: { $ifNull: ['$employeeId', '$actorUserId'] } }, 'unknown'] };
const DAY = 24 * 60 * 60 * 1000;

function validTimeZone(tz) {
    try {
        new Intl.DateTimeFormat('en', { timeZone: tz });
        return tz;
    } catch {
        return 'UTC';
    }
}

export async function GET(req) {
    try {
        await connectDB();
        const viewer = await resolveViewer(req);
        if (viewer.error) return NextResponse.json({ success: false, message: viewer.error.message }, { status: viewer.error.status });

        const params = new URL(req.url).searchParams;
        const timezone = validTimeZone(params.get('tz') || 'UTC');
        const fullQuery = buildWorkLogQuery(params, viewer);

        // Pick a bucket size that keeps the trend chart readable for the chosen range.
        const fromParam = Date.parse(params.get('from') || '');
        const toParam = Date.parse(params.get('to') || '') || Date.now();

        const [peopleCounts, actions, [stats], roles, employees, staffUsers, [storage]] = await Promise.all([
            EmployeeWorkLog.aggregate([
                { $match: buildWorkLogQuery(params, viewer, { skip: ['userId', 'employeeId'] }) },
                { $sort: { createdAt: -1 } },
                { $group: { _id: personKey, name: { $first: '$employeeName' }, designation: { $first: '$designation' }, role: { $first: '$actorRole' }, employeeId: { $first: '$employeeId' }, userId: { $first: '$actorUserId' }, count: { $sum: 1 }, lastAt: { $first: '$createdAt' } } },
            ]),
            EmployeeWorkLog.aggregate([{ $match: buildWorkLogQuery(params, viewer, { skip: ['action', 'category'] }) }, { $group: { _id: '$action', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            EmployeeWorkLog.aggregate([
                { $match: fullQuery },
                { $group: { _id: null, total: { $sum: 1 }, people: { $addToSet: personKey }, clients: { $addToSet: '$clientId' }, firstAt: { $min: '$createdAt' }, lastAt: { $max: '$createdAt' } } },
                { $project: { total: 1, firstAt: 1, lastAt: 1, people: { $size: { $setDifference: ['$people', ['unknown']] } }, clients: { $size: { $setDifference: ['$clients', [null]] } } } },
            ]),
            viewer.canViewAll ? EmployeeWorkLog.aggregate([{ $match: buildWorkLogQuery(params, viewer, { skip: ['role'] }) }, { $group: { _id: '$actorRole', count: { $sum: 1 } } }]) : [],
            viewer.canViewAll ? Employee.find({}).select('basicDetails.name basicDetails.designation').lean() : [],
            viewer.canViewAll ? User.find({}).select('username role employeeId').lean() : [],
            viewer.canViewAll ? EmployeeWorkLog.aggregate([{ $group: { _id: null, total: { $sum: 1 }, imported: { $sum: { $cond: [{ $eq: ['$source', 'history'] }, 1, 0] } } } }]) : [null],
        ]);

        const spanDays = ((toParam - (fromParam || stats?.firstAt?.getTime?.() || toParam)) / DAY) | 0;
        const unit = spanDays <= 62 ? 'day' : spanDays <= 400 ? 'week' : 'month';

        const [series, heatmap] = await Promise.all([
            EmployeeWorkLog.aggregate([{ $match: fullQuery }, { $group: { _id: { $dateTrunc: { date: '$createdAt', unit, timezone, startOfWeek: 'monday' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
            EmployeeWorkLog.aggregate([{ $match: fullQuery }, { $group: { _id: { d: { $isoDayOfWeek: { date: '$createdAt', timezone } }, h: { $hour: { date: '$createdAt', timezone } } }, count: { $sum: 1 } } }]),
        ]);

        // Directory of everyone whose work is tracked, merged with activity counts.
        const counts = new Map(peopleCounts.map((p) => [String(p._id), p]));
        const userByEmployee = new Map(staffUsers.filter((u) => u.employeeId).map((u) => [String(u.employeeId), u]));
        const people = new Map();
        for (const emp of employees) {
            const user = userByEmployee.get(String(emp._id));
            people.set(String(emp._id), { key: String(emp._id), employeeId: String(emp._id), userId: user ? String(user._id) : '', name: emp.basicDetails?.name || user?.username || 'Unnamed employee', designation: emp.basicDetails?.designation || '', role: user?.role || 'employee' });
        }
        for (const user of staffUsers) {
            if (user.employeeId && people.has(String(user.employeeId))) continue;
            people.set(String(user._id), { key: String(user._id), employeeId: '', userId: String(user._id), name: user.username || 'Unnamed user', designation: '', role: user.role || '' });
        }
        for (const [key, p] of counts) {
            if (people.has(key)) continue;
            if (key === 'unknown') people.set(key, { key, employeeId: '', userId: 'unknown', name: 'Not recorded', designation: '', role: '', unknown: true });
            else people.set(key, { key, employeeId: p.employeeId ? String(p.employeeId) : '', userId: p.userId ? String(p.userId) : '', name: p.name, designation: p.designation || '', role: p.role || '', former: true });
        }
        const employeeOptions = [...people.values()].map((p) => ({ ...p, count: counts.get(p.key)?.count || 0, lastAt: counts.get(p.key)?.lastAt || null })).sort((a, b) => Number(!!a.unknown) - Number(!!b.unknown) || b.count - a.count || a.name.localeCompare(b.name));

        // Category counts are derived from the action facet (which ignores the category filter).
        const categories = new Map();
        for (const a of actions) {
            const cat = categoryOf(a._id);
            categories.set(cat.key, (categories.get(cat.key) || 0) + a.count);
        }

        return NextResponse.json({
            success: true,
            canViewAll: viewer.canViewAll,
            isAdmin: viewer.isAdmin,
            employees: viewer.canViewAll ? employeeOptions : [],
            actions: actions.map((a) => ({ action: a._id, count: a.count })),
            categories: Object.fromEntries(categories),
            roles: Object.fromEntries(roles.map((r) => [r._id || 'unknown', r.count])),
            stats: { total: stats?.total || 0, people: stats?.people || 0, clients: stats?.clients || 0, firstAt: stats?.firstAt || null, lastAt: stats?.lastAt || null },
            series: { unit, points: series.map((s) => ({ at: s._id, count: s.count })) },
            heatmap: heatmap.map((h) => ({ day: h._id.d, hour: h._id.h, count: h.count })),
            storage: viewer.canViewAll ? { total: storage?.total || 0, imported: storage?.imported || 0 } : null,
        });
    } catch (error) {
        console.error('[track-employee-work/filters] GET failed:', error);
        return NextResponse.json({ success: false, message: 'Unable to fetch filters' }, { status: 500 });
    }
}
