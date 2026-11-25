// lib/employeeWorkBackfill.js
//
// Imports past work into EmployeeWorkLog from the collections where it already lives, so the
// tracker shows history from before live tracking existed:
//   - client create / update / delete   (audithistories)
//   - completed checklist items          (employeeworkdetails.checklist)
//   - SEO keyword rankings               (keywords.rankings)
//   - attachments uploaded               (attachments)
//   - team updates sent                  (teamupdates)
//
// Safe to run any number of times: every imported entry carries a stable `sourceKey`
// (unique index), and anything the live tracker already recorded is skipped.
// Sales users are skipped, matching lib/employeeWorkTracker.js.

import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import EmployeeWorkLog from '@/models/admin/EmployeeWorkLog';
import { sanitize } from '@/lib/employeeWorkTracker';

const BATCH = 500;
// A live entry within this window of an imported one (same person, action, client) is the same event.
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;
// Audit fields nobody needs on a work timeline.
const NOISY_FIELDS = ['_id', '__v', 'createdAt', 'updatedAt', 'password'];

const str = (value) => (value === null || value === undefined ? '' : String(value));
const validDate = (value) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
};

async function loadDirectory(db) {
    const [users, employees, customers] = await Promise.all([
        db.collection('users').find({}, { projection: { username: 1, role: 1, employeeId: 1 } }).toArray(),
        db.collection('employees').find({}, { projection: { 'basicDetails.name': 1, 'basicDetails.designation': 1 } }).toArray(),
        db.collection('customers').find({}, { projection: { name: 1, company: 1 } }).toArray(),
    ]);
    const employeeById = new Map(employees.map((e) => [str(e._id), e]));
    const userById = new Map(users.map((u) => [str(u._id), u]));
    const userByEmployeeId = new Map(users.filter((u) => u.employeeId).map((u) => [str(u.employeeId), u]));
    const customerById = new Map(customers.map((c) => [str(c._id), c]));

    const build = (user, employee) => {
        if (!user && !employee) return null;
        if (String(user?.role || '').toLowerCase() === 'sales') return null;
        const designation = employee?.basicDetails?.designation || '';
        if (String(designation).toUpperCase() === 'SALES') return null;
        return {
            actorUserId: user?._id || null,
            employeeId: employee?._id || null,
            employeeName: employee?.basicDetails?.name || user?.username || 'Unknown employee',
            designation,
            actorRole: user?.role || (employee ? 'employee' : ''),
        };
    };

    return {
        actorFromUser(userId) {
            const user = userById.get(str(userId));
            return build(user, user?.employeeId ? employeeById.get(str(user.employeeId)) : null);
        },
        actorFromEmployee(employeeId) {
            const employee = employeeById.get(str(employeeId));
            return build(userByEmployeeId.get(str(employeeId)), employee);
        },
        client(clientId, fallback = {}) {
            const customer = clientId ? customerById.get(str(clientId)) : null;
            return {
                clientId: clientId && mongoose.Types.ObjectId.isValid(str(clientId)) ? new mongoose.Types.ObjectId(str(clientId)) : null,
                clientName: customer?.name || fallback.name || '',
                clientCompany: customer?.company || fallback.company || '',
            };
        },
    };
}

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
                ? `Created client ${label}`
                : row.action === 'DELETE'
                  ? `Deleted client ${label}`
                  : `Updated client ${label}: ${fieldChanges
                        .slice(0, 4)
                        .map((c) => c.field)
                        .join(', ')}${fieldChanges.length > 4 ? ` +${fieldChanges.length - 4} more` : ''}`;

        yield {
            sourceKey: `audit:${row._id}`,
            createdAt: at,
            ...actor,
            ...client,
            action,
            summary,
            details: fieldChanges.length ? { changes: fieldChanges } : snapshot?.category ? { category: snapshot.category } : {},
            entityType: 'Customer',
            entityId: str(row.entityId),
        };
    }
}

function* fromChecklists(rows, dir) {
    for (const work of rows) {
        const assignees = Array.isArray(work.employeeId) ? work.employeeId : work.employeeId ? [work.employeeId] : [];
        for (const item of work.checklist || []) {
            const at = validDate(item.completedAt);
            if (!item?.completed || !at) continue;
            // Older items have no completedBy; with a single assignee the author is unambiguous.
            const who = item.completedBy || (assignees.length === 1 ? assignees[0] : null);
            const actor = who && dir.actorFromEmployee(who);
            if (!actor) continue;

            yield {
                sourceKey: `checklist:${work._id}:${item._id || item.key}`,
                createdAt: at,
                ...actor,
                ...dir.client(work.clientId),
                action: 'WORK_CHECKLIST_UPDATED',
                summary: `Completed "${item.label || item.key}" (${String(work.department || 'work').replaceAll('_', ' ')})`,
                details: {
                    department: work.department || '',
                    items: [{ key: item.key, label: item.label, completed: true, remarks: item.remarks || '' }],
                    proofUrl: item.proofUrl || '',
                },
                entityType: 'EmployeeWorkDetail',
                entityId: str(work._id),
            };
        }
    }
}

function* fromRankings(rows, dir, clientByKeyword) {
    for (const keyword of rows) {
        for (const ranking of keyword.rankings || []) {
            const at = validDate(ranking.date);
            const actor = ranking.employeeID && dir.actorFromEmployee(ranking.employeeID);
            if (!actor || !at) continue;
            yield {
                sourceKey: `ranking:${ranking._id || `${keyword._id}:${at.getTime()}`}`,
                createdAt: at,
                ...actor,
                ...dir.client(clientByKeyword.get(str(keyword._id))),
                action: 'SEO_RANKING_UPDATED',
                summary: `Ranked "${keyword.keyword}" at position ${ranking.position ?? '—'}${ranking.page ? ` (page ${ranking.page})` : ''}`,
                details: { keyword: keyword.keyword, position: ranking.position ?? null, page: ranking.page ?? '', type: keyword.type || '' },
                entityType: 'Keyword',
                entityId: str(keyword._id),
            };
        }
    }
}

function* fromAttachments(rows, dir) {
    for (const file of rows) {
        const actor = dir.actorFromUser(file.uploadedBy);
        const at = validDate(file.createdAt);
        if (!actor || !at) continue;
        yield {
            sourceKey: `attachment:${file._id}`,
            createdAt: at,
            ...actor,
            ...dir.client(file.clientId),
            action: 'ATTACHMENT_ADDED',
            summary: `Uploaded ${file.assetType || 'file'} "${file.title || 'Untitled'}"`,
            details: { title: file.title || '', assetType: file.assetType || '', description: file.description || '', file: file.file || '', visibility: file.visibility || '' },
            entityType: 'Attachment',
            entityId: str(file._id),
        };
    }
}

function* fromTeamUpdates(rows, dir) {
    for (const update of rows) {
        const actor = dir.actorFromUser(update.createdBy);
        const at = validDate(update.createdAt);
        if (!actor || !at) continue;
        yield {
            sourceKey: `teamupdate:${update._id}`,
            createdAt: at,
            ...actor,
            ...dir.client(update.clientId),
            action: 'TEAM_UPDATE_SENT',
            summary: `Sent team update "${update.title || update.updateType || 'update'}"`,
            details: { title: update.title || '', updateType: update.updateType || '', description: update.description || '', link: update.link || '', recipients: update.recipients || [] },
            entityType: 'TeamUpdate',
            entityId: str(update._id),
        };
    }
}

/**
 * @param {{ dryRun?: boolean }} options  dryRun counts what would be imported without writing.
 * @returns {Promise<{ scanned: Record<string, number>, imported: number, skippedAsDuplicate: number, dryRun: boolean }>}
 */
export async function syncEmployeeWorkHistory({ dryRun = false } = {}) {
    await connectDB();
    const db = mongoose.connection.db;
    const dir = await loadDirectory(db);

    const [audits, checklists, keywords, sheets, attachments, teamUpdates, liveLogs] = await Promise.all([
        db.collection('audithistories').find({ entityType: 'Customer' }).toArray(),
        db.collection('employeeworkdetails').find({ 'checklist.completed': true }, { projection: { employeeId: 1, clientId: 1, department: 1, checklist: 1 } }).toArray(),
        db.collection('keywords').find({ 'rankings.0': { $exists: true } }, { projection: { keyword: 1, type: 1, rankings: 1 } }).toArray(),
        db.collection('seosheets').find({}, { projection: { clientId: 1, keywords: 1 } }).toArray(),
        db.collection('attachments').find({}).toArray(),
        db.collection('teamupdates').find({}).toArray(),
        EmployeeWorkLog.find({ source: { $ne: 'history' } })
            .select('action actorUserId employeeId clientId createdAt')
            .lean(),
    ]);

    const clientByKeyword = new Map();
    for (const sheet of sheets) for (const keywordId of sheet.keywords || []) clientByKeyword.set(str(keywordId), sheet.clientId);

    // Index live entries so an event the live tracker already captured is not imported twice.
    const liveIndex = new Map();
    for (const log of liveLogs) {
        const key = `${log.action}|${str(log.clientId)}`;
        if (!liveIndex.has(key)) liveIndex.set(key, []);
        liveIndex.get(key).push(log);
    }
    const capturedLive = (entry) =>
        (liveIndex.get(`${entry.action}|${str(entry.clientId)}`) || []).some(
            (log) => Math.abs(new Date(log.createdAt) - entry.createdAt) <= DUPLICATE_WINDOW_MS && ((entry.employeeId && str(log.employeeId) === str(entry.employeeId)) || (entry.actorUserId && str(log.actorUserId) === str(entry.actorUserId)))
        );

    const sources = {
        clients: fromAuditHistory(audits, dir),
        checklists: fromChecklists(checklists, dir),
        seoRankings: fromRankings(keywords, dir, clientByKeyword),
        attachments: fromAttachments(attachments, dir),
        teamUpdates: fromTeamUpdates(teamUpdates, dir),
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

    for (const [name, entries] of Object.entries(sources)) {
        scanned[name] = 0;
        for (const entry of entries) {
            scanned[name] += 1;
            if (capturedLive(entry)) {
                skippedAsDuplicate += 1;
                continue;
            }
            const doc = { ...entry, summary: entry.summary.slice(0, 500), details: sanitize(entry.details), source: 'history', updatedAt: entry.createdAt, __v: 0 };
            ops.push({ updateOne: { filter: { sourceKey: entry.sourceKey }, update: { $setOnInsert: doc }, upsert: true } });
            if (ops.length >= BATCH) await flush();
        }
    }
    await flush();

    if (dryRun) {
        const existing = new Set((await EmployeeWorkLog.find({ source: 'history' }).select('sourceKey').lean()).map((d) => d.sourceKey));
        const total = Object.values(scanned).reduce((sum, n) => sum + n, 0);
        imported = total - skippedAsDuplicate - existing.size;
    }

    return { scanned, imported: Math.max(0, imported), skippedAsDuplicate, dryRun };
}
