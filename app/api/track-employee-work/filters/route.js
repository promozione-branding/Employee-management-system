// app/api/track-employee-work/filters/route.js
//
// GET dropdown options + counts for the tracker page.
// Each facet ignores its own filter so the dropdown keeps listing every option
// (e.g. picking an employee still shows all employees, but client counts narrow to that employee).

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import EmployeeWorkLog from '@/models/admin/EmployeeWorkLog';
import { buildWorkLogQuery, resolveViewer } from '@/lib/employeeWorkQuery';

export async function GET(req) {
    try {
        await connectDB();
        const viewer = await resolveViewer(req);
        if (viewer.error) return NextResponse.json({ success: false, message: viewer.error.message }, { status: viewer.error.status });

        const params = new URL(req.url).searchParams;

        const [employees, clients, actions] = await Promise.all([
            EmployeeWorkLog.aggregate([
                { $match: buildWorkLogQuery(params, viewer, { skip: ['userId', 'employeeId'] }) },
                { $sort: { createdAt: -1 } },
                {
                    $group: {
                        _id: '$actorUserId',
                        name: { $first: '$employeeName' },
                        designation: { $first: '$designation' },
                        role: { $first: '$actorRole' },
                        count: { $sum: 1 },
                        lastAt: { $first: '$createdAt' },
                    },
                },
                { $sort: { name: 1 } },
            ]),
            EmployeeWorkLog.aggregate([
                { $match: { ...buildWorkLogQuery(params, viewer, { skip: ['clientId'] }) } },
                { $match: { clientId: { $ne: null } } },
                { $sort: { createdAt: -1 } },
                {
                    $group: {
                        _id: '$clientId',
                        name: { $first: '$clientName' },
                        company: { $first: '$clientCompany' },
                        count: { $sum: 1 },
                        lastAt: { $first: '$createdAt' },
                    },
                },
                { $sort: { company: 1, name: 1 } },
            ]),
            EmployeeWorkLog.aggregate([
                { $match: buildWorkLogQuery(params, viewer, { skip: ['action'] }) },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { _id: 1 } },
            ]),
        ]);

        return NextResponse.json({
            success: true,
            canViewAll: viewer.canViewAll,
            employees: employees.map((e) => ({ userId: String(e._id), name: e.name, designation: e.designation, role: e.role, count: e.count, lastAt: e.lastAt })),
            clients: clients.map((c) => ({ clientId: String(c._id), name: c.name, company: c.company, count: c.count, lastAt: c.lastAt })),
            actions: actions.map((a) => ({ action: a._id, count: a.count })),
        });
    } catch (error) {
        console.error('[track-employee-work/filters] GET failed:', error);
        return NextResponse.json({ success: false, message: 'Unable to fetch filters' }, { status: 500 });
    }
}
