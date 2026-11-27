// lib/workTracking/registry.js
//
// How each Mongoose model shows up on the work timeline: its action prefix, how to name a record,
// which client it belongs to, and which array fields hold individual items (call updates, to-dos,
// ledger entries...) that deserve their own timeline entry.
//
// Models not listed here are still tracked with generic wording, unless listed in EXCLUDED_MODELS,
// so new features are covered automatically.

const get = (obj, path) => String(path || '').split('.').reduce((value, key) => (value == null ? undefined : value[key]), obj);
const money = (n) => (Number.isFinite(Number(n)) && Number(n) !== 0 ? `₹${Number(n).toLocaleString('en-IN')}` : '');
const clip = (text, n = 70) => {
    const s = String(text || '').replace(/\s+/g, ' ').trim();
    return s.length > n ? `${s.slice(0, n - 1)}…` : s;
};
const titleCase = (s) => String(s || '').replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());

// Automated / internal collections: never shown as someone's work.
export const EXCLUDED_MODELS = new Set(['EmployeeWorkLog', 'EditHistory', 'AuditHistory', 'AdCreative', 'AdPerformanceDaily', 'AdSnapshotCoverage', 'SalesEmployee', 'SeoSheet']);

// Fields that never count as a change worth showing (bookkeeping, cron flags, webhook noise).
export const IGNORED_FIELDS = new Set(['_id', '__v', 'createdAt', 'updatedAt', 'editHistory', 'rawWebhookPayloads', 'lastEventAt', 'lastEventType', 'reminderSent', 'reminderSend', 'lastReminderAt', 'sentMilestones', 'loginOTP', 'loginOTPExpiry', 'resetPasswordOTP', 'resetPasswordOTPExpiry', 'resetPasswordExpiry']);

// Field names whose values must never be copied into the log.
export const SENSITIVE_FIELD = /pass(word)?|otp|token|secret|apikey|api_key|refresh|credential/i;

const updateItemAction = (item, verb) => `${String(item?.updateType || 'general').toUpperCase()}_UPDATE_${verb}`;

const meetingUpdates = {
    field: 'meetingUpdate',
    keyPrefix: 'meeting-update',
    client: (item) => item?.clientId,
    describe: (item, change) => {
        const kind = titleCase(item?.updateType || 'general');
        const note = clip(item?.note || item?.status || '', 90);
        if (change === 'added') return { action: updateItemAction(item, 'ADDED'), summary: `Added ${kind.toLowerCase()} update${note ? `: “${note}”` : ''}` };
        if (change === 'removed') return { action: updateItemAction(item, 'REMOVED'), summary: `Removed ${kind.toLowerCase()} update${note ? `: “${note}”` : ''}` };
        return { action: updateItemAction(item, 'EDITED'), summary: `Edited ${kind.toLowerCase()} update${note ? `: “${note}”` : ''}` };
    },
    details: (item) => ({ updateType: item?.updateType || '', status: item?.status || '', note: item?.note || '', reminderAt: item?.reminderAt || null, meetingAt: item?.meetingAt || null, location: item?.location?.address || '' }),
};

const simpleItems = (field, noun, prefix, titleOf, extra = {}) => ({
    field,
    keyPrefix: prefix.toLowerCase(),
    describe: (item, change, before) => {
        const title = clip(titleOf(item), 90);
        if (change === 'added') return { action: `${prefix}_ADDED`, summary: `Added ${noun}${title ? `: “${title}”` : ''}` };
        if (change === 'removed') return { action: `${prefix}_REMOVED`, summary: `Removed ${noun}${title ? `: “${title}”` : ''}` };
        return extra.edited?.(item, before, title) || { action: `${prefix}_EDITED`, summary: `Updated ${noun}${title ? `: “${title}”` : ''}` };
    },
    details: extra.details,
});

export const MODEL_REGISTRY = {
    Customer: {
        prefix: 'CLIENT',
        noun: 'client',
        client: (d) => d?._id,
        title: (d) => [d?.name, d?.company && d.company !== d.name ? `(${d.company})` : ''].filter(Boolean).join(' '),
    },
    ProposalNew: {
        prefix: 'PROPOSAL',
        noun: 'proposal',
        verbs: { created: 'Made' },
        client: 'clientId',
        title: (d) => [d?.proposalNumber, money(d?.grandTotal)].filter(Boolean).join(' · '),
        statusField: 'status',
    },
    Proposal: { prefix: 'PROPOSAL', noun: 'proposal', verbs: { created: 'Made' }, client: 'clientId', title: (d) => [d?.proposalNo, money(d?.totalAmount)].filter(Boolean).join(' · ') },
    InvoiceNew: {
        prefix: 'INVOICE',
        noun: 'invoice',
        verbs: { created: 'Generated' },
        client: 'clientId',
        title: (d) => [d?.invoiceNumber, money(d?.grandTotal)].filter(Boolean).join(' · '),
        statusField: 'status',
    },
    Invoice: { prefix: 'INVOICE', noun: 'invoice', verbs: { created: 'Generated' }, client: 'clientId', title: (d) => [d?.invoiceNo, money(d?.totalAmount)].filter(Boolean).join(' · ') },
    LedgerNew: {
        prefix: 'LEDGER',
        noun: 'ledger entry',
        verbs: { created: 'Added' },
        client: 'customerId',
        title: (d) => [clip(d?.particulars, 60), d?.credit ? `credit ${money(d.credit)}` : '', d?.debit ? `debit ${money(d.debit)}` : '', d?.voucher].filter(Boolean).join(' · '),
    },
    Ledger: {
        prefix: 'LEDGER',
        noun: 'ledger',
        client: 'customerId',
        container: true,
        arrays: [simpleItems('entries', 'ledger entry', 'LEDGER_ENTRY', (i) => [i?.particular?.description || i?.voucher, i?.credit ? `credit ${money(i.credit)}` : '', i?.debit ? `debit ${money(i.debit)}` : ''].filter(Boolean).join(' · '))],
    },
    Meeting: { noun: 'client update', container: true, arrays: [meetingUpdates] },
    SalesWork: { noun: 'client update', container: true, arrays: [meetingUpdates] },
    CallLog: { noun: 'call', special: 'call' },
    TeamUpdate: { prefix: 'TEAM_UPDATE', noun: 'team update', actions: { created: 'TEAM_UPDATE_SENT' }, verbs: { created: 'Sent' }, client: 'clientId', title: (d) => d?.title || d?.updateType },
    Attachment: { prefix: 'ATTACHMENT', noun: 'attachment', actions: { created: 'ATTACHMENT_ADDED' }, verbs: { created: 'Uploaded' }, client: 'clientId', title: (d) => d?.title },
    ClientBrandAsset: { prefix: 'BRAND_ASSET', noun: 'brand assets', client: 'clientId', title: () => '' },
    ProjectCycle: {
        prefix: 'PROJECT',
        noun: 'project',
        client: 'clientId',
        container: true,
        arrays: [
            {
                field: 'projectDuration',
                keyPrefix: 'project',
                describe: (item, change) => {
                    const name = clip(item?.projectName || item?.categoryLabel || item?.service || 'project', 60);
                    if (change === 'added') return { action: 'PROJECT_ADDED', summary: `Added project “${name}”` };
                    if (change === 'removed') return { action: 'PROJECT_REMOVED', summary: `Removed project “${name}”` };
                    return { action: 'PROJECT_UPDATED', summary: `Updated project “${name}”` };
                },
                details: (item) => ({ project: item?.projectName || '', service: item?.categoryLabel || item?.service || '', status: item?.status || '', startDate: item?.startDate || null, endDate: item?.endDate || null, proposalNumber: item?.proposalNumber || '' }),
            },
        ],
    },
    EmployeeWorkDetail: {
        prefix: 'WORK',
        noun: 'work',
        actions: { created: 'WORK_ASSIGNED' },
        verbs: { created: 'Assigned' },
        client: 'clientId',
        title: (d) => titleCase(d?.department),
        arrays: [
            {
                field: 'checklist',
                keyPrefix: 'checklist',
                describe: (item, change, before) => {
                    const label = clip(item?.label || item?.key, 80);
                    if (change === 'removed') return { action: 'WORK_CHECKLIST_UPDATED', summary: `Removed checklist item “${label}”` };
                    if (item?.completed && !before?.completed) return { action: 'WORK_CHECKLIST_UPDATED', summary: `Completed “${label}”` };
                    if (!item?.completed && before?.completed) return { action: 'WORK_CHECKLIST_UPDATED', summary: `Re-opened “${label}”` };
                    return { action: 'WORK_CHECKLIST_UPDATED', summary: `Updated checklist item “${label}”` };
                },
                details: (item) => ({ items: [{ key: item?.key, label: item?.label, completed: !!item?.completed, remarks: item?.remarks || '' }], proofUrl: item?.proofUrl || '' }),
            },
        ],
    },
    Keyword: {
        prefix: 'SEO_KEYWORD',
        noun: 'keyword',
        actions: { created: 'SEO_KEYWORD_ADDED', deleted: 'SEO_KEYWORD_REMOVED' },
        verbs: { created: 'Added' },
        title: (d) => (d?.keyword ? `“${d.keyword}”` : ''),
        resolveClient: async (doc, db) => (await db.collection('seosheets').findOne({ keywords: doc._id }, { projection: { clientId: 1 } }))?.clientId,
        arrays: [
            {
                field: 'rankings',
                keyPrefix: 'ranking',
                describe: (item, change, before, doc) => {
                    const where = `${item?.position ?? '—'}${item?.page ? ` (page ${item.page})` : ''}`;
                    if (change === 'added') return { action: 'SEO_RANKING_UPDATED', summary: `Ranked “${doc?.keyword}” at position ${where}` };
                    if (change === 'removed') return { action: 'SEO_RANKING_EDITED', summary: `Removed ranking for “${doc?.keyword}”` };
                    return { action: 'SEO_RANKING_EDITED', summary: `Changed ranking for “${doc?.keyword}” ${before?.position ?? '—'} → ${where}` };
                },
                details: (item, doc) => ({ keyword: doc?.keyword, position: item?.position ?? null, page: item?.page ?? '' }),
            },
        ],
    },
    Workflow: { prefix: 'WORKFLOW', noun: 'workflow', verbs: { created: 'Started' }, client: 'customerId', title: (d) => [d?.categoryLabel, d?.proposalNumber].filter(Boolean).join(' · ') },
    Employee: { prefix: 'EMPLOYEE', noun: 'employee', verbs: { created: 'Added' }, title: (d) => [d?.basicDetails?.name, titleCase(d?.basicDetails?.designation)].filter(Boolean).join(' · ') },
    User: { prefix: 'USER', noun: 'user account', verbs: { created: 'Added' }, title: (d) => [d?.username, d?.role].filter(Boolean).join(' · ') },
    Announcement: { prefix: 'ANNOUNCEMENT', noun: 'announcement', verbs: { created: 'Published' }, title: (d) => (d?.title ? `“${clip(d.title, 60)}”` : '') },
    EmployeeTodo: {
        noun: 'to-do',
        container: true,
        arrays: [
            simpleItems('todos', 'to-do', 'TODO', (i) => i?.description, {
                edited: (item, before, title) => (item?.status === 'COMPLETED' && before?.status !== 'COMPLETED' ? { action: 'TODO_COMPLETED', summary: `Completed to-do “${title}”` } : { action: 'TODO_EDITED', summary: `Updated to-do “${title}”${item?.status !== before?.status ? ` → ${titleCase(item?.status)}` : ''}` }),
                details: (i) => ({ description: i?.description || '', status: i?.status || '' }),
            }),
        ],
    },
    EmployeeReminder: { noun: 'reminder', container: true, arrays: [simpleItems('reminder', 'reminder', 'REMINDER', (i) => i?.description, { details: (i) => ({ description: i?.description || '', reminderAt: i?.reminderAt || null }) })] },
    AdminReminder: { noun: 'reminder', container: true, arrays: [simpleItems('reminder', 'reminder', 'REMINDER', (i) => i?.description, { details: (i) => ({ description: i?.description || '', reminderAt: i?.reminderAt || null }) })] },
    EmployeeCalendar: { noun: 'calendar event', container: true, arrays: [simpleItems('calendar', 'calendar event', 'CALENDAR', (i) => i?.title, { details: (i) => ({ title: i?.title || '', date: i?.date || null }) })] },
    AdminCalendar: { noun: 'calendar event', container: true, arrays: [simpleItems('calendar', 'calendar event', 'CALENDAR', (i) => i?.title, { details: (i) => ({ title: i?.title || '', date: i?.date || null }) })] },
    Report: {
        prefix: 'REPORT',
        noun: 'report',
        verbs: { created: 'Generated' },
        client: (d) => d?.data?.client?.customerId,
        clientName: (d) => d?.data?.client?.name,
        title: (d) => [titleCase(d?.periodType), d?.periodStart ? new Date(d.periodStart).toISOString().slice(0, 10) : '', d?.periodEnd ? `→ ${new Date(d.periodEnd).toISOString().slice(0, 10)}` : ''].filter(Boolean).join(' '),
        ignore: ['data'],
    },
    ReportClient: { prefix: 'REPORT_CLIENT', noun: 'report client', client: 'customerId', title: (d) => d?.name },
    ReportSetting: { prefix: 'SETTINGS', noun: 'report setting', title: (d) => d?.key, redactValues: true },
    MetaSetting: { prefix: 'SETTINGS', noun: 'Meta setting', title: (d) => d?.key, redactValues: true },
    AdminBasicDetail: { prefix: 'SETTINGS', noun: 'profile details', title: () => '' },
    Service: { prefix: 'SERVICE', noun: 'service', title: (d) => [d?.serviceTitle, money(d?.amount)].filter(Boolean).join(' · ') },
    InvoiceService: { prefix: 'SERVICE', noun: 'invoice service', title: (d) => [d?.serviceName, money(d?.price)].filter(Boolean).join(' · ') },
};

const VERB = { created: 'Created', updated: 'Updated', deleted: 'Deleted' };

/** Generic, readable wording for a whole-document event on any model. */
export function describeDocument(modelName, doc, kind, changes = []) {
    const cfg = MODEL_REGISTRY[modelName] || {};
    const prefix = cfg.prefix || String(modelName).replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
    const noun = cfg.noun || String(modelName).replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    const title = cfg.title ? cfg.title(doc) : doc?.name || doc?.title || '';
    const action = cfg.actions?.[kind] || `${prefix}_${kind.toUpperCase()}`;
    const verb = cfg.verbs?.[kind] || VERB[kind];

    let tail = '';
    if (kind === 'updated' && changes.length) {
        const status = cfg.statusField && changes.find((c) => c.field === cfg.statusField);
        tail = status ? `: ${titleCase(status.oldValue) || '—'} → ${titleCase(status.newValue)}` : `: ${changes.slice(0, 4).map((c) => c.field).join(', ')}${changes.length > 4 ? ` +${changes.length - 4} more` : ''}`;
    }
    return { action, summary: `${verb} ${noun}${title ? ` ${title}` : ''}${tail}`.trim() };
}

export function clientOf(modelName, doc, item) {
    const cfg = MODEL_REGISTRY[modelName] || {};
    const fromItem = item && (cfg.arrays || []).map((a) => a.client?.(item)).find(Boolean);
    if (fromItem) return fromItem;
    if (typeof cfg.client === 'function') return cfg.client(doc);
    if (typeof cfg.client === 'string') return get(doc, cfg.client);
    return doc?.clientId || doc?.customerId || null;
}
