// app/api/track-employee-work/export/route.js
//
// GET the filtered work log as a CSV file (same filters as the timeline), for long-term records.

import { connectDB } from '@/lib/db';
import EmployeeWorkLog from '@/models/admin/EmployeeWorkLog';
import { buildWorkLogQuery, resolveViewer } from '@/lib/employeeWorkQuery';

const MAX_ROWS = 50000;

const cell = (value) => {
    const text = value === null || value === undefined ? '' : String(value);
    // Neutralise spreadsheet formulas and quote everything.
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
};

const describeDetails = (details = {}) => {
    const parts = [];
    if (Array.isArray(details.changes)) parts.push(...details.changes.map((c) => `${c.field}: ${JSON.stringify(c.oldValue ?? '')} -> ${JSON.stringify(c.newValue ?? '')}`));
    if (Array.isArray(details.items)) parts.push(...details.items.map((i) => `${i.completed ? '[x]' : '[ ]'} ${i.label || i.key}${i.remarks ? ` (${i.remarks})` : ''}`));
    if (Array.isArray(details.assignedEmployees) && details.assignedEmployees.length) parts.push(`Employees: ${details.assignedEmployees.join(', ')}`);
    return parts.join(' | ').slice(0, 5000);
};

export async function GET(req) {
    try {
        await connectDB();
        const viewer = await resolveViewer(req);
        if (viewer.error) return new Response(viewer.error.message, { status: viewer.error.status });

        const params = new URL(req.url).searchParams;
        const tz = params.get('tz') || 'UTC';
        let dateFmt;
        try {
            dateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
        } catch {
            dateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
        }

        const logs = await EmployeeWorkLog.find(buildWorkLogQuery(params, viewer)).sort({ createdAt: -1, _id: -1 }).limit(MAX_ROWS).lean();

        const header = ['Date & time', 'Employee', 'Designation', 'Role', 'Action', 'What was done', 'Client', 'Company', 'Details', 'Recorded as'];
        const rows = logs.map((log) => [dateFmt.format(new Date(log.createdAt)), log.employeeName, log.designation, log.actorRole, log.action, log.summary, log.clientName, log.clientCompany, describeDetails(log.details), log.source === 'history' ? 'Imported history' : 'Live'].map(cell).join(','));

        const csv = `﻿${header.map(cell).join(',')}\n${rows.join('\n')}`;
        const stamp = new Date().toISOString().slice(0, 10);
        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="employee-work-${stamp}.csv"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('[track-employee-work/export] GET failed:', error);
        return new Response('Unable to export work history', { status: 500 });
    }
}
