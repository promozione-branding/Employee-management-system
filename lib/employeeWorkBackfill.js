// lib/employeeWorkBackfill.js
//
// Imports past work into EmployeeWorkLog from the collections where it already lives, so the
// tracker shows history from before live tracking existed. Covers every role (admin, manager,
// sales, employee) and every area: clients, call / meeting / general updates, phone calls,
// proposals, invoices, ledger, projects, workflows, checklists, SEO, reports, to-dos, reminders,
// calendar, announcements, attachments, team updates, employees and user accounts.
//
// Safe to run any number of times: every imported entry carries a stable `sourceKey` (unique
// index) that matches the key the live tracker uses for the same event, and anything the live
// tracker already recorded is skipped. When a record does not say who did it, the entry is
// imported as "Not recorded" rather than guessed.

import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import EmployeeWorkLog from '@/models/admin/EmployeeWorkLog';
import { sanitize } from '@/lib/employeeWorkTracker';

const BATCH = 500;
// A live entry within this window of an imported one (same person, action, client) is the same event.
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;
const NOISY_FIELDS = ['_id', '__v', 'createdAt', 'updatedAt', 'password', 'editHistory', 'loginOTP', 'loginOTPExpiry'];

export const UNKNOWN_ACTOR = { actorUserId: null, employeeId: null, employeeName: 'Not recorded', designation: '', actorRole: '' };

const str = (value) => (value === null || value === undefined ? '' : String(value));
const validDate = (value) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
};
const idTime = (id) => {
    try {
        return id ? new mongoose.Types.ObjectId(str(id)).getTimestamp() : null;
    } catch {
        return null;
    }
};
const money = (n) => (Number(n) ? `₹${Number(n).toLocaleString('en-IN')}` : '');
const clip = (text, n = 90) => {
    const s = String(text || '').replace(/\s+/g, ' ').trim();
    return s.length > n ? `${s.slice(0, n - 1)}…` : s;
};
const titleCase = (s) => String(s || '').replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());

async function loadDirectory(db) {
    const [users, employees, customers] = await Promise.all([
        db.collection('users').find({}, { projection: { username: 1, role: 1, employeeId: 1, email: 1 } }).toArray(),
        db.collection('employees').find({}, { projection: { 'basicDetails.name': 1, 'basicDetails.designation': 1 } }).toArray(),
        db.collection('customers').find({}, { projection: { name: 1, company: 1 } }).toArray(),
    ]);
    const employeeById = new Map(employees.map((e) => [str(e._id), e]));
    const userById = new Map(users.map((u) => [str(u._id), u]));
    const userByEmployeeId = new Map(users.filter((u) => u.employeeId).map((u) => [str(u.employeeId), u]));
    const customerById = new Map(customers.map((c) => [str(c._id), c]));

    const build = (user, employee) => {
        if (!user && !employee) return null;
        return {
            actorUserId: user?._id || null,
            employeeId: employee?._id || null,
            employeeName: employee?.basicDetails?.name || user?.username || 'Unknown user',
            designation: employee?.basicDetails?.designation || '',
            actorRole: user?.role || (employee ? 'employee' : ''),
        };
    };
    const fromUser = (userId) => {
        const user = userById.get(str(userId));
        return build(user, user?.employeeId ? employeeById.get(str(user.employeeId)) : null);
    };
    const fromEmployee = (employeeId) => build(userByEmployeeId.get(str(employeeId)), employeeById.get(str(employeeId)));

    // Records that only store a display name (e.g. proposal.createdByName).
    const byName = new Map();
    for (const u of users) for (const key of [u.username, u.email]) if (key) byName.set(String(key).trim().toLowerCase(), () => fromUser(u._id));
    for (const e of employees) if (e.basicDetails?.name) byName.set(e.basicDetails.name.trim().toLowerCase(), () => fromEmployee(e._id));

    return {
        actorFromUser: fromUser,
        actorFromEmployee: fromEmployee,
        // Some collections store a User id, others an Employee id, under the same field name.
        actorFromAny: (id) => fromUser(id) || fromEmployee(id),
        actorFromName: (name) => (name ? byName.get(String(name).trim().toLowerCase())?.() || { ...UNKNOWN_ACTOR, employeeName: String(name) } : null),
        client(clientId, fallback = {}) {
            const customer = clientId ? customerById.get(str(clientId)) : null;
            return {
                clientId: clientId && mongoose.Types.ObjectId.isValid(str(clientId)) ? new mongoose.Types.ObjectId(str(clientId)) : null,
                clientName: customer?.name || fallback.name || '',
                clientCompany: customer?.company || fallback.company || '',
            };
        },
        employeeName: (id) => employeeById.get(str(id))?.basicDetails?.name || userById.get(str(id))?.username || '',
    };
}

const entry = (fields) => (fields.createdAt ? fields : null);

/* ------------------------------------------------------------------------------------------ */
/* Sources                                                                                     */
/* ------------------------------------------------------------------------------------------ */

function* fromAuditHistory(rows, dir) {
    const ACTIONS = { CREATE: 'CLIENT_CREATED', UPDATE: 'CLIENT_UPDATED', DELETE: 'CLIENT_DELETED' };
    for (const row of rows) {
        const action = ACTIONS[row.action];
        const actor = action && dir.actorFromUser(row.changedBy);
        const at = validDate(row.createdAt);
        if (!actor || !at) continue;

        const changes = Array.isArray(row.changes) ? row.changes : [];
        const snapshot = row.action === 'DELETE' ? changes[0]?.oldValue : row.action === 'CREATE' ? changes[0]?.newValue : null;
        const client = dir.client(row.clientId || row.entityId, snapshot || {});
        const label = client.clientName || client.clientCompany || 'client';

        const fieldChanges = row.action === 'UPDATE' ? changes.filter((c) => c?.field && !NOISY_FIELDS.includes(c.field)).map(({ field, oldValue, newValue }) => ({ field, oldValue, newValue })) : [];
        if (row.action === 'UPDATE' && !fieldChanges.length) continue;

        const summary =
            row.action === 'CREATE'
                ? `Added client ${label}`
                : row.action === 'DELETE'
                  ? `Deleted client ${label}`
                  : `Updated client ${label}: ${fieldChanges
                        .slice(0, 4)
                        .map((c) => c.field)
                        .join(', ')}${fieldChanges.length > 4 ? ` +${fieldChanges.length - 4} more` : ''}`;

        yield { sourceKey: `audit:${row._id}`, createdAt: at, ...actor, ...client, action, summary, details: fieldChanges.length ? { changes: fieldChanges } : snapshot?.category ? { category: snapshot.category } : {}, entityType: 'Customer', entityId: str(row.entityId) };
    }
}

function* fromMeetingUpdates(rows, dir) {
    for (const meeting of rows) {
        for (const item of meeting.meetingUpdate || []) {
            const actor = dir.actorFromAny(item.salesPersonId);
            const at = idTime(item._id) || validDate(meeting.createdAt);
            if (!actor || !at || !item._id) continue;
            const type = String(item.updateType || 'general').toUpperCase();
            const note = clip(item.note || item.status, 90);
            yield {
                sourceKey: `meeting-update:${item._id}`,
                createdAt: at,
                ...actor,
                ...dir.client(item.clientId),
                action: `${type}_UPDATE_ADDED`,
                summary: `Added ${titleCase(item.updateType || 'general').toLowerCase()} update${note ? `: “${note}”` : ''}`,
                details: { updateType: item.updateType || '', status: item.status || '', note: item.note || '', reminderAt: item.reminderAt || null, meetingAt: item.meetingAt || null, location: item.location?.address || '' },
                entityType: 'Meeting',
                entityId: str(meeting._id),
            };
        }
    }
}

function* fromCalls(rows, dir) {
    for (const call of rows) {
        const actor = dir.actorFromAny(call.agentErpUserId);
        const at = validDate(call.startedAt) || validDate(call.createdAt);
        if (!actor || !at) continue;
        const client = dir.client(call.customerId, { name: call.customerName });
        const inbound = call.direction === 'inbound';
        const who = call.customerName || client.clientName || call.customerPhone || (inbound ? call.fromNumber : call.toNumber) || 'unknown number';
        const secs = Number(call.durationSeconds) || 0;
        yield {
            sourceKey: `call:${call._id}`,
            createdAt: at,
            ...actor,
            ...client,
            action: inbound ? 'CALL_RECEIVED' : 'CALL_MADE',
            summary: `${inbound ? 'Call from' : 'Called'} ${who}${call.status ? ` (${call.status})` : ''}${secs ? ` · ${Math.floor(secs / 60)}m ${secs % 60}s` : ''}`,
            details: { status: call.status || '', connected: !!call.connected, durationSeconds: secs, direction: call.direction || '', phone: call.customerPhone || '', disposition: call.disposition || '', note: call.note || '', recording: call.recordingStoredUrl || call.recordingUrl || '' },
            entityType: 'CallLog',
            entityId: str(call._id),
        };
    }
}

// New-style proposals / invoices: creator by name, plus their embedded edit history.
function* fromSalesDocs(rows, dir, { model, prefix, noun, verb, numberField, totalField }) {
    for (const doc of rows) {
        const at = validDate(doc.createdAt);
        if (!at) continue;
        const client = dir.client(doc.clientId, { name: doc.clientName, company: doc.clientCompany });
        const title = [doc[numberField], money(doc[totalField])].filter(Boolean).join(' · ');
        const salesExecutive = doc.salesExecutive ? dir.employeeName(doc.salesExecutive) : '';
        yield entry({
            sourceKey: `create:${model}:${doc._id}`,
            createdAt: at,
            ...(dir.actorFromName(doc.createdByName) || UNKNOWN_ACTOR),
            ...client,
            action: `${prefix}_CREATED`,
            summary: `${verb} ${noun}${title ? ` ${title}` : ''}`,
            details: { number: doc[numberField] || '', total: doc[totalField] ?? null, status: doc.status || '', salesExecutive, proposalNumber: doc.proposalNumber || '' },
            entityType: model,
            entityId: str(doc._id),
        });
        for (const edit of doc.editHistory || []) {
            const editedAt = validDate(edit.editedAt);
            if (!editedAt || !edit._id) continue;
            yield { sourceKey: `${prefix.toLowerCase()}-edit:${edit._id}`, createdAt: editedAt, ...(dir.actorFromName(edit.editedByName) || UNKNOWN_ACTOR), ...client, action: `${prefix}_UPDATED`, summary: `Edited ${noun}${doc[numberField] ? ` ${doc[numberField]}` : ''}`, details: { number: doc[numberField] || '' }, entityType: model, entityId: str(doc._id) };
        }
    }
}

function* fromLedgerNew(rows, dir) {
    for (const row of rows) {
        const at = validDate(row.createdAt);
        if (!at) continue;
        const title = [clip(row.particulars, 60), row.credit ? `credit ${money(row.credit)}` : '', row.debit ? `debit ${money(row.debit)}` : '', row.voucher].filter(Boolean).join(' · ');
        yield { sourceKey: `create:LedgerNew:${row._id}`, createdAt: at, ...UNKNOWN_ACTOR, ...dir.client(row.customerId), action: 'LEDGER_CREATED', summary: `Added ledger entry ${title}`.trim(), details: { particulars: row.particulars || '', credit: row.credit ?? 0, debit: row.debit ?? 0, voucher: row.voucher || '', transactionId: row.transactionId || '', date: row.date || null }, entityType: 'LedgerNew', entityId: str(row._id) };
    }
}

function* fromLedgerOld(rows, dir) {
    for (const ledger of rows) {
        for (const e of ledger.entries || []) {
            const at = idTime(e._id) || validDate(e.date);
            if (!at || !e._id) continue;
            const title = [e.particular?.description || e.voucher, e.credit ? `credit ${money(e.credit)}` : '', e.debit ? `debit ${money(e.debit)}` : ''].filter(Boolean).join(' · ');
            yield { sourceKey: `ledger_entry:${e._id}`, createdAt: at, ...UNKNOWN_ACTOR, ...dir.client(ledger.customerId), action: 'LEDGER_ENTRY_ADDED', summary: `Added ledger entry${title ? `: “${clip(title)}”` : ''}`, details: { voucher: e.voucher || '', credit: e.credit ?? 0, debit: e.debit ?? 0, balance: e.balance ?? null, date: e.date || null }, entityType: 'Ledger', entityId: str(ledger._id) };
        }
    }
}

function* fromSimpleCreates(rows, dir, { model, action, actor, client, summary, details }) {
    for (const doc of rows) {
        const at = validDate(doc.createdAt) || idTime(doc._id);
        if (!at) continue;
        const who = actor ? actor(doc) : null;
        if (who === false) continue;
        yield { sourceKey: `create:${model}:${doc._id}`, createdAt: at, ...(who || UNKNOWN_ACTOR), ...dir.client(client?.(doc)), action, summary: summary(doc), details: details ? details(doc) : {}, entityType: model, entityId: str(doc._id) };
    }
}

function* fromItems(rows, dir, { model, field, keyPrefix, action, actor, client, summary, details, time }) {
    for (const doc of rows) {
        const who = actor(doc);
        for (const item of doc[field] || []) {
            const at = (time && time(item)) || validDate(item.createdAt) || idTime(item._id);
            if (!at || !item._id) continue;
            yield { sourceKey: `${keyPrefix}:${item._id}`, createdAt: at, ...(who || UNKNOWN_ACTOR), ...dir.client(client?.(doc, item)), action: typeof action === 'function' ? action(item) : action, summary: summary(item, doc), details: details ? details(item, doc) : {}, entityType: model, entityId: str(doc._id) };
        }
    }
}

function* fromTodoCompletions(rows, dir) {
    for (const doc of rows) {
        const who = dir.actorFromAny(doc.employeeId);
        for (const item of doc.todos || []) {
            const at = validDate(item.completedAt);
            if (!at || !item._id || item.status !== 'COMPLETED') continue;
            yield { sourceKey: `todo-done:${item._id}`, createdAt: at, ...(who || UNKNOWN_ACTOR), ...dir.client(null), action: 'TODO_COMPLETED', summary: `Completed to-do “${clip(item.description)}”`, details: { description: item.description || '' }, entityType: 'EmployeeTodo', entityId: str(doc._id) };
        }
    }
}

function* fromChecklists(rows, dir) {
    for (const work of rows) {
        const assignees = Array.isArray(work.employeeId) ? work.employeeId : work.employeeId ? [work.employeeId] : [];
        for (const item of work.checklist || []) {
            const at = validDate(item.completedAt);
            if (!item?.completed || !at) continue;
            const who = item.completedBy || (assignees.length === 1 ? assignees[0] : null);
            const actor = who && dir.actorFromEmployee(who);
            if (!actor) continue;
            yield { sourceKey: `checklist:${work._id}:${item._id || item.key}`, createdAt: at, ...actor, ...dir.client(work.clientId), action: 'WORK_CHECKLIST_UPDATED', summary: `Completed "${item.label || item.key}" (${String(work.department || 'work').replaceAll('_', ' ')})`, details: { department: work.department || '', items: [{ key: item.key, label: item.label, completed: true, remarks: item.remarks || '' }], proofUrl: item.proofUrl || '' }, entityType: 'EmployeeWorkDetail', entityId: str(work._id) };
        }
    }
}

function* fromRankings(rows, dir, clientByKeyword) {
    for (const keyword of rows) {
        for (const ranking of keyword.rankings || []) {
            const at = validDate(ranking.date);
            const actor = ranking.employeeID && dir.actorFromEmployee(ranking.employeeID);
            if (!actor || !at) continue;
            yield { sourceKey: `ranking:${ranking._id || `${keyword._id}:${at.getTime()}`}`, createdAt: at, ...actor, ...dir.client(clientByKeyword.get(str(keyword._id))), action: 'SEO_RANKING_UPDATED', summary: `Ranked "${keyword.keyword}" at position ${ranking.position ?? '—'}${ranking.page ? ` (page ${ranking.page})` : ''}`, details: { keyword: keyword.keyword, position: ranking.position ?? null, page: ranking.page ?? '', type: keyword.type || '' }, entityType: 'Keyword', entityId: str(keyword._id) };
        }
    }
}

function* fromAttachments(rows, dir) {
    for (const file of rows) {
        const actor = dir.actorFromUser(file.uploadedBy);
        const at = validDate(file.createdAt);
        if (!actor || !at) continue;
        yield { sourceKey: `attachment:${file._id}`, createdAt: at, ...actor, ...dir.client(file.clientId), action: 'ATTACHMENT_ADDED', summary: `Uploaded ${file.assetType || 'file'} "${file.title || 'Untitled'}"`, details: { title: file.title || '', assetType: file.assetType || '', description: file.description || '', file: file.file || '', visibility: file.visibility || '' }, entityType: 'Attachment', entityId: str(file._id) };
    }
}

function* fromTeamUpdates(rows, dir) {
    for (const update of rows) {
        const actor = dir.actorFromUser(update.createdBy);
        const at = validDate(update.createdAt);
        if (!actor || !at) continue;
        yield { sourceKey: `teamupdate:${update._id}`, createdAt: at, ...actor, ...dir.client(update.clientId), action: 'TEAM_UPDATE_SENT', summary: `Sent team update "${update.title || update.updateType || 'update'}"`, details: { title: update.title || '', updateType: update.updateType || '', description: update.description || '', link: update.link || '', recipients: update.recipients || [] }, entityType: 'TeamUpdate', entityId: str(update._id) };
    }
}

/* ------------------------------------------------------------------------------------------ */
/* Runner                                                                                      */
/* ------------------------------------------------------------------------------------------ */

/**
 * @param {{ dryRun?: boolean }} options  dryRun counts what would be imported without writing.
 */
export async function syncEmployeeWorkHistory({ dryRun = false } = {}) {
    await connectDB();
    const db = mongoose.connection.db;
    const dir = await loadDirectory(db);
    const all = (name, query = {}, projection) => db.collection(name).find(query, projection ? { projection } : undefined).toArray();

    const [audits, meetings, calls, proposalsNew, proposalsOld, invoicesNew, invoicesOld, ledgerNew, ledgerOld, workflows, reports, reportClients, todos, empReminders, adminReminders, empCalendars, adminCalendars, announcements, projectCycles, workDetails, checklists, keywords, sheets, attachments, teamUpdates, employees, users, liveLogs] = await Promise.all([
        all('audithistories', { entityType: 'Customer' }),
        all('meetings'),
        all('calllogs', {}, { rawWebhookPayloads: 0 }),
        all('proposalnews', {}, { proposalNumber: 1, grandTotal: 1, clientId: 1, status: 1, createdByName: 1, editHistory: 1, salesExecutive: 1, createdAt: 1 }),
        all('proposals', {}, { proposalNo: 1, totalAmount: 1, clientId: 1, clientName: 1, clientCompany: 1, createdAt: 1 }),
        all('invoicenews', {}, { invoiceNumber: 1, grandTotal: 1, clientId: 1, status: 1, createdByName: 1, editHistory: 1, proposalNumber: 1, createdAt: 1 }),
        all('invoices', {}, { invoiceNo: 1, totalAmount: 1, clientId: 1, clientName: 1, clientCompany: 1, createdAt: 1 }),
        all('ledgernews'),
        all('ledgers'),
        all('workflows'),
        all('reports', {}, { 'data.client.customerId': 1, 'data.client.name': 1, periodType: 1, periodStart: 1, periodEnd: 1, createdBy: 1, createdAt: 1, status: 1 }),
        all('reportclients'),
        all('employeetodos'),
        all('employeereminders'),
        all('adminreminders'),
        all('employeecalendars'),
        all('admincalendars'),
        all('announcements'),
        all('projectcycles'),
        all('employeeworkdetails', {}, { employeeId: 1, clientId: 1, department: 1, createdAt: 1 }),
        all('employeeworkdetails', { 'checklist.completed': true }, { employeeId: 1, clientId: 1, department: 1, checklist: 1 }),
        all('keywords', {}, { keyword: 1, type: 1, rankings: 1, createdAt: 1 }),
        all('seosheets', {}, { clientId: 1, keywords: 1 }),
        all('attachments'),
        all('teamupdates'),
        all('employees', {}, { 'basicDetails.name': 1, 'basicDetails.designation': 1, createdAt: 1 }),
        all('users', {}, { username: 1, role: 1, createdAt: 1 }),
        EmployeeWorkLog.find({ source: { $ne: 'history' } })
            .select('action actorUserId employeeId clientId createdAt')
            .lean(),
    ]);

    const clientByKeyword = new Map();
    for (const sheet of sheets) for (const keywordId of sheet.keywords || []) clientByKeyword.set(str(keywordId), sheet.clientId);

    const liveIndex = new Map();
    for (const log of liveLogs) {
        const key = `${log.action}|${str(log.clientId)}`;
        if (!liveIndex.has(key)) liveIndex.set(key, []);
        liveIndex.get(key).push(log);
    }
    const capturedLive = (e) =>
        (liveIndex.get(`${e.action}|${str(e.clientId)}`) || []).some((log) => Math.abs(new Date(log.createdAt) - e.createdAt) <= DUPLICATE_WINDOW_MS && ((e.employeeId && str(log.employeeId) === str(e.employeeId)) || (e.actorUserId && str(log.actorUserId) === str(e.actorUserId))));

    const sources = {
        clients: fromAuditHistory(audits, dir),
        clientUpdates: fromMeetingUpdates(meetings, dir),
        calls: fromCalls(calls, dir),
        proposals: fromSalesDocs(proposalsNew, dir, { model: 'ProposalNew', prefix: 'PROPOSAL', noun: 'proposal', verb: 'Made', numberField: 'proposalNumber', totalField: 'grandTotal' }),
        proposalsOld: fromSalesDocs(proposalsOld, dir, { model: 'Proposal', prefix: 'PROPOSAL', noun: 'proposal', verb: 'Made', numberField: 'proposalNo', totalField: 'totalAmount' }),
        invoices: fromSalesDocs(invoicesNew, dir, { model: 'InvoiceNew', prefix: 'INVOICE', noun: 'invoice', verb: 'Generated', numberField: 'invoiceNumber', totalField: 'grandTotal' }),
        invoicesOld: fromSalesDocs(invoicesOld, dir, { model: 'Invoice', prefix: 'INVOICE', noun: 'invoice', verb: 'Generated', numberField: 'invoiceNo', totalField: 'totalAmount' }),
        ledger: fromLedgerNew(ledgerNew, dir),
        ledgerOld: fromLedgerOld(ledgerOld, dir),
        workflows: fromSimpleCreates(workflows, dir, { model: 'Workflow', action: 'WORKFLOW_CREATED', actor: (d) => dir.actorFromUser(d.createdByAdminId), client: (d) => d.customerId, summary: (d) => `Started workflow ${[d.categoryLabel, d.proposalNumber].filter(Boolean).join(' · ')}`, details: (d) => ({ description: d.description || '', startDate: d.startDate || null, endDate: d.endDate || null, duration: d.duration || '' }) }),
        reports: fromSimpleCreates(reports, dir, { model: 'Report', action: 'REPORT_CREATED', actor: (d) => dir.actorFromUser(d.createdBy), client: (d) => d.data?.client?.customerId, summary: (d) => `Generated ${titleCase(d.periodType || '').toLowerCase()} report${d.periodStart ? ` ${new Date(d.periodStart).toISOString().slice(0, 10)} → ${new Date(d.periodEnd).toISOString().slice(0, 10)}` : ''}${d.data?.client?.name ? ` for ${d.data.client.name}` : ''}`, details: (d) => ({ status: d.status || '', periodType: d.periodType || '' }) }),
        reportClients: fromSimpleCreates(reportClients, dir, { model: 'ReportClient', action: 'REPORT_CLIENT_CREATED', actor: (d) => dir.actorFromUser(d.createdBy), client: (d) => d.customerId, summary: (d) => `Added report client ${d.name || ''}`.trim() }),
        todos: fromItems(todos, dir, { model: 'EmployeeTodo', field: 'todos', keyPrefix: 'todo', action: 'TODO_ADDED', actor: (d) => dir.actorFromAny(d.employeeId), summary: (i) => `Added to-do “${clip(i.description)}”`, details: (i) => ({ description: i.description || '', status: i.status || '' }) }),
        todoCompletions: fromTodoCompletions(todos, dir),
        reminders: fromItems(empReminders, dir, { model: 'EmployeeReminder', field: 'reminder', keyPrefix: 'reminder', action: 'REMINDER_ADDED', actor: (d) => dir.actorFromAny(d.employeeId), summary: (i) => `Set reminder “${clip(i.description)}”`, details: (i) => ({ description: i.description || '', reminderAt: i.reminderAt || null }) }),
        adminReminders: fromItems(adminReminders, dir, { model: 'AdminReminder', field: 'reminder', keyPrefix: 'reminder', action: 'REMINDER_ADDED', actor: (d) => dir.actorFromAny(d.userId), summary: (i) => `Set reminder “${clip(i.description)}”`, details: (i) => ({ description: i.description || '', reminderAt: i.reminderAt || null }) }),
        calendar: fromItems(empCalendars, dir, { model: 'EmployeeCalendar', field: 'calendar', keyPrefix: 'calendar', action: 'CALENDAR_ADDED', actor: (d) => dir.actorFromAny(d.employeeId), summary: (i) => `Added calendar event “${clip(i.title)}”`, details: (i) => ({ title: i.title || '', date: i.date || null }) }),
        adminCalendar: fromItems(adminCalendars, dir, { model: 'AdminCalendar', field: 'calendar', keyPrefix: 'calendar', action: 'CALENDAR_ADDED', actor: (d) => dir.actorFromAny(d.userId), summary: (i) => `Added calendar event “${clip(i.title)}”`, details: (i) => ({ title: i.title || '', date: i.date || null }) }),
        announcements: fromSimpleCreates(announcements, dir, { model: 'Announcement', action: 'ANNOUNCEMENT_CREATED', actor: (d) => dir.actorFromUser(d.author), summary: (d) => `Published announcement “${clip(d.title, 60)}”`, details: (d) => ({ title: d.title || '', content: d.content || '', targetDepartment: d.targetDepartment || '' }) }),
        projects: fromItems(projectCycles, dir, { model: 'ProjectCycle', field: 'projectDuration', keyPrefix: 'project', action: 'PROJECT_ADDED', actor: () => null, client: (d) => d.clientId, time: (i) => idTime(i._id), summary: (i) => `Added project “${clip(i.projectName || i.categoryLabel || i.service || 'project', 60)}”`, details: (i) => ({ project: i.projectName || '', service: i.categoryLabel || i.service || '', status: i.status || '', startDate: i.startDate || null, endDate: i.endDate || null, proposalNumber: i.proposalNumber || '' }) }),
        workAssigned: fromSimpleCreates(workDetails, dir, { model: 'EmployeeWorkDetail', action: 'WORK_ASSIGNED', client: (d) => d.clientId, summary: (d) => `Assigned ${titleCase(d.department || 'work').toLowerCase()} work to ${(Array.isArray(d.employeeId) ? d.employeeId : [d.employeeId]).map(dir.employeeName).filter(Boolean).join(', ') || 'employee'}`, details: (d) => ({ department: d.department || '', assignedEmployees: (Array.isArray(d.employeeId) ? d.employeeId : [d.employeeId]).map(dir.employeeName).filter(Boolean) }) }),
        checklists: fromChecklists(checklists, dir),
        seoKeywords: fromSimpleCreates(keywords, dir, { model: 'Keyword', action: 'SEO_KEYWORD_ADDED', client: (d) => clientByKeyword.get(str(d._id)), summary: (d) => `Added keyword “${d.keyword}”`, details: (d) => ({ keyword: d.keyword, type: d.type || '' }) }),
        seoRankings: fromRankings(keywords, dir, clientByKeyword),
        attachments: fromAttachments(attachments, dir),
        teamUpdates: fromTeamUpdates(teamUpdates, dir),
        employees: fromSimpleCreates(employees, dir, { model: 'Employee', action: 'EMPLOYEE_CREATED', summary: (d) => `Added employee ${[d.basicDetails?.name, titleCase(d.basicDetails?.designation)].filter(Boolean).join(' · ')}` }),
        users: fromSimpleCreates(users, dir, { model: 'User', action: 'USER_CREATED', summary: (d) => `Added user account ${[d.username, d.role].filter(Boolean).join(' · ')}` }),
    };

    const scanned = {};
    let imported = 0;
    let skippedAsDuplicate = 0;
    let ops = [];

    const flush = async () => {
        if (!ops.length) return;
        if (!dryRun) {
            // Raw driver write so `createdAt` keeps the original time of the work.
            const result = await EmployeeWorkLog.collection.bulkWrite(ops, { ordered: false });
            imported += result.upsertedCount || 0;
        }
        ops = [];
    };

    const seenKeys = new Set();
    for (const [name, entries] of Object.entries(sources)) {
        scanned[name] = 0;
        for (const e of entries) {
            if (!e || seenKeys.has(e.sourceKey)) continue;
            seenKeys.add(e.sourceKey);
            scanned[name] += 1;
            if (capturedLive(e)) {
                skippedAsDuplicate += 1;
                continue;
            }
            const doc = { ...e, summary: String(e.summary).slice(0, 500), details: sanitize(e.details), source: 'history', updatedAt: e.createdAt, __v: 0 };
            ops.push({ updateOne: { filter: { sourceKey: e.sourceKey }, update: { $setOnInsert: doc }, upsert: true } });
            if (ops.length >= BATCH) await flush();
        }
    }
    await flush();

    if (dryRun) {
        const existing = await EmployeeWorkLog.countDocuments({ sourceKey: { $in: [...seenKeys] } });
        const total = Object.values(scanned).reduce((sum, n) => sum + n, 0);
        imported = total - skippedAsDuplicate - existing;
    }

    return { scanned, imported: Math.max(0, imported), skippedAsDuplicate, dryRun };
}
