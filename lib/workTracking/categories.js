// lib/workTracking/categories.js
//
// Groups work-log actions into areas of the ERP. Shared by the tracker page (client) and the
// API (server), so keep this file free of server-only imports.

export const WORK_CATEGORIES = [
    { key: 'clients', label: 'Clients', color: '#2563eb', pattern: '^(CLIENT_(CREATED|UPDATED|DELETED)|SALES_EXECUTIVE_CHANGED|ATTACHMENT_|BRAND_ASSET_)' },
    { key: 'updates', label: 'Client updates', color: '#7c3aed', pattern: '^(CALL|MEETING|GENERAL)_UPDATE_' },
    { key: 'calls', label: 'Calls', color: '#0891b2', pattern: '^CALL_(MADE|RECEIVED)' },
    { key: 'proposals', label: 'Proposals', color: '#db2777', pattern: '^PROPOSAL_' },
    { key: 'invoices', label: 'Invoices', color: '#ea580c', pattern: '^INVOICE_' },
    { key: 'ledger', label: 'Ledger', color: '#16a34a', pattern: '^LEDGER_' },
    { key: 'projects', label: 'Projects & work', color: '#ca8a04', pattern: '^(PROJECT_|WORK_|WORKFLOW_|EMPLOYEE_REMOVED_FROM_PROJECT)' },
    { key: 'seo', label: 'SEO', color: '#0d9488', pattern: '^SEO_' },
    { key: 'tasks', label: 'Tasks & reminders', color: '#9333ea', pattern: '^(TODO_|REMINDER_|CALENDAR_)' },
    { key: 'reports', label: 'Reports', color: '#4f46e5', pattern: '^REPORT' },
    { key: 'team', label: 'Team & HR', color: '#be123c', pattern: '^(TEAM_UPDATE_|ANNOUNCEMENT_|EMPLOYEE_(CREATED|UPDATED|DELETED)|USER_)' },
    { key: 'settings', label: 'Settings', color: '#64748b', pattern: '^(SETTINGS_|SERVICE_)' },
    { key: 'access', label: 'Logins', color: '#94a3b8', pattern: '^LOGGED_IN' },
];

const compiled = WORK_CATEGORIES.map((c) => ({ ...c, regex: new RegExp(c.pattern) }));
const OTHER = { key: 'other', label: 'Other', color: '#94a3b8' };

export function categoryOf(action) {
    return compiled.find((c) => c.regex.test(String(action || ''))) || OTHER;
}

export function categoryPattern(key) {
    return WORK_CATEGORIES.find((c) => c.key === key)?.pattern || null;
}

export const ACTION_LABELS = {
    CLIENT_CREATED: 'Client added',
    CLIENT_UPDATED: 'Client updated',
    CLIENT_DELETED: 'Client deleted',
    SALES_EXECUTIVE_CHANGED: 'Sales exec changed',
    ATTACHMENT_ADDED: 'Attachment added',
    ATTACHMENT_UPDATED: 'Attachment updated',
    ATTACHMENT_DELETED: 'Attachment deleted',
    CALL_UPDATE_ADDED: 'Call update',
    MEETING_UPDATE_ADDED: 'Meeting update',
    GENERAL_UPDATE_ADDED: 'General update',
    CALL_UPDATE_EDITED: 'Call update edited',
    MEETING_UPDATE_EDITED: 'Meeting update edited',
    GENERAL_UPDATE_EDITED: 'General update edited',
    CALL_UPDATE_REMOVED: 'Call update removed',
    MEETING_UPDATE_REMOVED: 'Meeting update removed',
    GENERAL_UPDATE_REMOVED: 'General update removed',
    CALL_MADE: 'Outgoing call',
    CALL_RECEIVED: 'Incoming call',
    PROPOSAL_CREATED: 'Proposal made',
    PROPOSAL_UPDATED: 'Proposal edited',
    PROPOSAL_DELETED: 'Proposal deleted',
    INVOICE_CREATED: 'Invoice generated',
    INVOICE_UPDATED: 'Invoice edited',
    INVOICE_DELETED: 'Invoice deleted',
    LEDGER_CREATED: 'Ledger entry',
    LEDGER_ENTRY_ADDED: 'Ledger entry',
    LEDGER_UPDATED: 'Ledger edited',
    LEDGER_ENTRY_EDITED: 'Ledger entry edited',
    LEDGER_DELETED: 'Ledger entry deleted',
    LEDGER_ENTRY_REMOVED: 'Ledger entry removed',
    PROJECT_ADDED: 'Project added',
    PROJECT_UPDATED: 'Project updated',
    PROJECT_REMOVED: 'Project removed',
    WORK_ASSIGNED: 'Work assigned',
    WORK_UPDATED: 'Work updated',
    WORK_CHECKLIST_UPDATED: 'Checklist work',
    WORKFLOW_CREATED: 'Workflow started',
    WORKFLOW_UPDATED: 'Workflow updated',
    EMPLOYEE_REMOVED_FROM_PROJECT: 'Removed from project',
    SEO_KEYWORD_ADDED: 'Keyword added',
    SEO_KEYWORD_UPDATED: 'Keyword updated',
    SEO_KEYWORD_REMOVED: 'Keyword removed',
    SEO_RANKING_UPDATED: 'Ranking added',
    SEO_RANKING_EDITED: 'Ranking edited',
    TODO_ADDED: 'To-do added',
    TODO_EDITED: 'To-do updated',
    TODO_COMPLETED: 'To-do completed',
    TODO_REMOVED: 'To-do removed',
    REMINDER_ADDED: 'Reminder set',
    REMINDER_EDITED: 'Reminder edited',
    REMINDER_REMOVED: 'Reminder removed',
    CALENDAR_ADDED: 'Calendar event',
    CALENDAR_EDITED: 'Calendar event edited',
    CALENDAR_REMOVED: 'Calendar event removed',
    REPORT_CREATED: 'Report generated',
    REPORT_UPDATED: 'Report updated',
    REPORT_DELETED: 'Report deleted',
    REPORT_CLIENT_CREATED: 'Report client added',
    REPORT_CLIENT_UPDATED: 'Report client updated',
    TEAM_UPDATE_SENT: 'Team update sent',
    ANNOUNCEMENT_CREATED: 'Announcement',
    ANNOUNCEMENT_UPDATED: 'Announcement edited',
    ANNOUNCEMENT_DELETED: 'Announcement deleted',
    EMPLOYEE_CREATED: 'Employee added',
    EMPLOYEE_UPDATED: 'Employee updated',
    EMPLOYEE_DELETED: 'Employee removed',
    USER_CREATED: 'User account added',
    USER_UPDATED: 'User account updated',
    USER_DELETED: 'User account removed',
    SETTINGS_UPDATED: 'Settings changed',
    SETTINGS_CREATED: 'Settings changed',
    SERVICE_CREATED: 'Service added',
    SERVICE_UPDATED: 'Service updated',
    SERVICE_DELETED: 'Service deleted',
    LOGGED_IN: 'Logged in',
};

export const actionLabel = (action) =>
    ACTION_LABELS[action] ||
    String(action || '')
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/^./, (c) => c.toUpperCase());
