// app/track-employee-work/page.jsx
//
// Admin / manager timeline of employee work: who did what, on which client, when, and what changed.

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, BriefcaseBusiness, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Filter, RotateCcw, Search, UserRound, Users, X } from 'lucide-react';
import axiosInstance from '@/service/axiosInstance';

const ACTION_LABELS = {
    CLIENT_CREATED: 'Client created',
    CLIENT_UPDATED: 'Client updated',
    CLIENT_DELETED: 'Client deleted',
    PROJECT_ADDED: 'Project added',
    PROJECT_UPDATED: 'Project updated',
    WORK_ASSIGNED: 'Work assigned',
    EMPLOYEE_REMOVED_FROM_PROJECT: 'Employee removed',
    WORK_CHECKLIST_UPDATED: 'Checklist updated',
    SEO_KEYWORD_ADDED: 'Keyword added',
    SEO_KEYWORD_REMOVED: 'Keyword removed',
    SEO_RANKING_UPDATED: 'Ranking added',
    SEO_RANKING_EDITED: 'Ranking edited',
    ATTACHMENT_ADDED: 'Attachment added',
    TEAM_UPDATE_SENT: 'Team update sent',
    SALES_EXECUTIVE_CHANGED: 'Sales exec changed',
};

const ACTION_TONE = {
    CLIENT_DELETED: 'bg-red-50 text-red-700',
    SEO_KEYWORD_REMOVED: 'bg-red-50 text-red-700',
    EMPLOYEE_REMOVED_FROM_PROJECT: 'bg-red-50 text-red-700',
    CLIENT_CREATED: 'bg-emerald-50 text-emerald-700',
    PROJECT_ADDED: 'bg-emerald-50 text-emerald-700',
    SEO_KEYWORD_ADDED: 'bg-emerald-50 text-emerald-700',
    WORK_ASSIGNED: 'bg-violet-50 text-violet-700',
    WORK_CHECKLIST_UPDATED: 'bg-amber-50 text-amber-800',
};

// Keys already rendered in a dedicated way, or internal ids nobody needs to read.
const HIDDEN_DETAIL_KEYS = ['changes', 'items', 'employeeIds', 'assignedEmployees', 'keywordId', 'projectId'];

const actionLabel = (action) => ACTION_LABELS[action] || String(action || '').replaceAll('_', ' ').toLowerCase();
const humanize = (key) => String(key).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

const displayValue = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.length ? value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ') : '—';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value))) return new Date(value).toLocaleString();
    return String(value);
};

// YYYY-MM-DD in the viewer's local time zone.
const toInputDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return toInputDate(d);
};

const PRESETS = [
    { key: 'today', label: 'Today', from: () => daysAgo(0), to: () => daysAgo(0) },
    { key: 'yesterday', label: 'Yesterday', from: () => daysAgo(1), to: () => daysAgo(1) },
    { key: '7d', label: 'Last 7 days', from: () => daysAgo(6), to: () => daysAgo(0) },
    { key: '30d', label: 'Last 30 days', from: () => daysAgo(29), to: () => daysAgo(0) },
    { key: 'all', label: 'All time', from: () => '', to: () => '' },
];

const dayHeading = (date) => {
    const key = toInputDate(date);
    if (key === daysAgo(0)) return 'Today';
    if (key === daysAgo(1)) return 'Yesterday';
    return new Date(date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const clientLabel = (c) => [c?.company || c?.clientCompany, c?.name || c?.clientName].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · ');

function LogDetails({ log }) {
    const details = log.details || {};
    const changes = Array.isArray(details.changes) ? details.changes : [];
    const items = Array.isArray(details.items) ? details.items : [];
    const assigned = Array.isArray(details.assignedEmployees) ? details.assignedEmployees : [];
    const rest = Object.entries(details).filter(([key, value]) => !HIDDEN_DETAIL_KEYS.includes(key) && value !== '' && value !== null && value !== undefined);

    if (!changes.length && !items.length && !assigned.length && !rest.length) {
        return <p className="text-xs text-slate-500">No additional details were recorded for this action.</p>;
    }

    return (
        <div className="space-y-3 text-xs">
            {changes.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] border-collapse">
                        <thead>
                            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                                <th className="py-1.5 pr-3 font-semibold">Field</th>
                                <th className="py-1.5 pr-3 font-semibold">Before</th>
                                <th className="py-1.5 font-semibold">After</th>
                            </tr>
                        </thead>
                        <tbody>
                            {changes.map((change, i) => (
                                <tr key={`${change.field}-${i}`} className="border-t border-slate-200 align-top">
                                    <td className="py-1.5 pr-3 font-medium text-slate-700">{humanize(change.field)}</td>
                                    <td className="py-1.5 pr-3 break-words text-red-700/80 line-through decoration-red-300">{displayValue(change.oldValue)}</td>
                                    <td className="py-1.5 break-words text-emerald-800">{displayValue(change.newValue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {items.length > 0 && (
                <div>
                    <p className="mb-1 font-semibold text-slate-600">Checklist</p>
                    <ul className="space-y-1">
                        {items.map((item, i) => (
                            <li key={`${item.key}-${i}`} className="flex gap-2 text-slate-600">
                                <span className={item.completed ? 'text-emerald-600' : 'text-slate-400'}>{item.completed ? '✔' : '○'}</span>
                                <span>
                                    <span className="font-medium text-slate-700">{item.label || item.key}</span>
                                    {item.remarks ? <span className="text-slate-500"> — {item.remarks}</span> : null}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {assigned.length > 0 && (
                <p className="text-slate-600">
                    <span className="font-semibold">Employees: </span>
                    {assigned.join(', ')}
                </p>
            )}
            {rest.length > 0 && (
                <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[max-content_1fr]">
                    {rest.map(([key, value]) => (
                        <div key={key} className="contents">
                            <dt className="font-semibold text-slate-600">{humanize(key)}</dt>
                            <dd className="break-words text-slate-600">{displayValue(value)}</dd>
                        </div>
                    ))}
                </dl>
            )}
        </div>
    );
}

export default function TrackEmployeeWorkPage() {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState({});
    const [canViewAll, setCanViewAll] = useState(true);

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [from, setFrom] = useState(daysAgo(6));
    const [to, setTo] = useState(daysAgo(0));
    const [userId, setUserId] = useState('');
    const [clientId, setClientId] = useState('');
    const [action, setAction] = useState('');
    const [options, setOptions] = useState({ employees: [], clients: [], actions: [] });

    // Debounce typing so we don't hit the API on every keystroke.
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const filterParams = useMemo(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        // Send local-day boundaries as exact UTC instants, so "today" means today in the viewer's time zone.
        if (from) params.set('from', new Date(`${from}T00:00:00`).toISOString());
        if (to) params.set('to', new Date(`${to}T23:59:59.999`).toISOString());
        if (userId) params.set('userId', userId);
        if (clientId) params.set('clientId', clientId);
        if (action) params.set('action', action);
        return params;
    }, [search, from, to, userId, clientId, action]);

    const loadLogs = useCallback(
        async (nextPage = 1) => {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams(filterParams);
                params.set('page', String(nextPage));
                params.set('limit', '30');
                const { data } = await axiosInstance.get(`/api/track-employee-work?${params.toString()}`);
                if (!data?.success) throw new Error(data?.message || 'Could not load work history');
                setLogs(data.data || []);
                setTotal(data.total || 0);
                setPages(Math.max(1, data.pages || 1));
                setPage(nextPage);
                setCanViewAll(data.canViewAll !== false);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Could not load work history');
            } finally {
                setLoading(false);
            }
        },
        [filterParams]
    );

    const loadOptions = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get(`/api/track-employee-work/filters?${filterParams.toString()}`);
            if (data?.success) setOptions({ employees: data.employees || [], clients: data.clients || [], actions: data.actions || [] });
        } catch {
            // Dropdowns are a convenience; the timeline still works without them.
        }
    }, [filterParams]);

    useEffect(() => {
        loadLogs(1);
        loadOptions();
    }, [loadLogs, loadOptions]);

    const selectedEmployee = options.employees.find((e) => e.userId === userId);
    const selectedClient = options.clients.find((c) => c.clientId === clientId);
    const activePreset = PRESETS.find((p) => p.from() === from && p.to() === to)?.key;

    const groups = useMemo(() => {
        const map = new Map();
        for (const log of logs) {
            const key = toInputDate(log.createdAt);
            if (!map.has(key)) map.set(key, { key, date: log.createdAt, items: [] });
            map.get(key).items.push(log);
        }
        return [...map.values()];
    }, [logs]);

    const resetFilters = () => {
        setSearchInput('');
        setSearch('');
        setUserId('');
        setClientId('');
        setAction('');
        setFrom(daysAgo(6));
        setTo(daysAgo(0));
    };

    const hasFilters = Boolean(search || userId || clientId || action);
    const selectClass = 'h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-lg md:flex-row md:items-center md:p-8">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-200">
                            <Activity size={16} /> TEAM ACTIVITY
                        </div>
                        <h1 className="text-2xl font-bold md:text-3xl">Employee work tracking</h1>
                        <p className="mt-2 max-w-2xl text-sm text-blue-100">Who did what, on which client, and when. Click an employee or client name to see only their work.</p>
                    </div>
                    <div className="flex min-w-36 items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                        <div className="rounded-lg bg-white/15 p-2">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-blue-100">Actions in range</p>
                            <p className="text-xl font-bold">{total.toLocaleString()}</p>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <CalendarDays size={16} className="text-slate-400" />
                        {PRESETS.map((preset) => (
                            <button
                                key={preset.key}
                                type="button"
                                onClick={() => {
                                    setFrom(preset.from());
                                    setTo(preset.to());
                                }}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${activePreset === preset.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {preset.label}
                            </button>
                        ))}
                        <div className="flex flex-wrap items-center gap-2">
                            <input aria-label="From date" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm text-slate-700 outline-none focus:border-blue-500" />
                            <span className="text-xs text-slate-400">to</span>
                            <input aria-label="To date" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm text-slate-700 outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    <div className={`grid gap-3 ${canViewAll ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
                        <label className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search work, employee, client" className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                        </label>
                        {canViewAll && (
                            <select aria-label="Employee" value={userId} onChange={(e) => setUserId(e.target.value)} className={selectClass}>
                                <option value="">All employees</option>
                                {options.employees.map((emp) => (
                                    <option key={emp.userId} value={emp.userId}>
                                        {emp.name}
                                        {emp.designation ? ` (${emp.designation})` : emp.role ? ` (${emp.role})` : ''} — {emp.count}
                                    </option>
                                ))}
                            </select>
                        )}
                        <select aria-label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)} className={selectClass}>
                            <option value="">All clients</option>
                            {options.clients.map((client) => (
                                <option key={client.clientId} value={client.clientId}>
                                    {clientLabel(client) || 'Unnamed client'} — {client.count}
                                </option>
                            ))}
                        </select>
                        <select aria-label="Action" value={action} onChange={(e) => setAction(e.target.value)} className={selectClass}>
                            <option value="">All actions</option>
                            {options.actions.map((a) => (
                                <option key={a.action} value={a.action}>
                                    {actionLabel(a.action)} — {a.count}
                                </option>
                            ))}
                        </select>
                    </div>

                    {hasFilters && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <Filter size={14} className="text-slate-400" />
                            {selectedEmployee && (
                                <button type="button" onClick={() => setUserId('')} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                                    Employee: {selectedEmployee.name} <X size={12} />
                                </button>
                            )}
                            {clientId && (
                                <button type="button" onClick={() => setClientId('')} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                                    Client: {clientLabel(selectedClient) || 'selected'} <X size={12} />
                                </button>
                            )}
                            {action && (
                                <button type="button" onClick={() => setAction('')} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                                    {actionLabel(action)} <X size={12} />
                                </button>
                            )}
                            {search && (
                                <button type="button" onClick={() => setSearchInput('')} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                                    “{search}” <X size={12} />
                                </button>
                            )}
                            <button type="button" onClick={resetFilters} className="ml-1 flex items-center gap-1 text-slate-500 hover:text-slate-800">
                                <RotateCcw size={12} /> Reset
                            </button>
                        </div>
                    )}
                </section>

                {/* Focus summary when an employee or client is selected */}
                {(selectedEmployee || selectedClient) && (
                    <section className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500">{selectedEmployee ? 'Employee' : 'Client'}</p>
                            <p className="mt-1 truncate font-semibold text-slate-900">{selectedEmployee ? selectedEmployee.name : clientLabel(selectedClient)}</p>
                            {selectedEmployee && selectedClient && <p className="truncate text-xs text-slate-500">on {clientLabel(selectedClient)}</p>}
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500">Actions in range</p>
                            <p className="mt-1 text-xl font-bold text-slate-900">{total.toLocaleString()}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500">{selectedEmployee && !selectedClient ? 'Clients worked on' : 'People involved'}</p>
                            <p className="mt-1 text-xl font-bold text-slate-900">{selectedEmployee && !selectedClient ? options.clients.length : options.employees.length}</p>
                        </div>
                    </section>
                )}

                {/* Timeline */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-900">Work timeline</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Most recent activity first</p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{total.toLocaleString()} records</span>
                    </div>

                    {error && <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                    {loading ? (
                        <div className="p-12 text-center text-sm text-slate-500">Loading work history…</div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center">
                            <Activity className="mx-auto mb-3 text-slate-300" size={30} />
                            <p className="font-medium text-slate-700">No tracked work found</p>
                            <p className="mt-1 text-sm text-slate-500">Try another date range or clear the filters.</p>
                        </div>
                    ) : (
                        groups.map((group) => (
                            <div key={group.key}>
                                <div className="sticky top-[env(safe-area-inset-top,0px)] z-10 border-y border-slate-100 bg-slate-50/95 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">
                                    {dayHeading(group.date)} · {group.items.length}
                                </div>
                                <ol className="divide-y divide-slate-100">
                                    {group.items.map((log) => {
                                        const isOpen = !!expanded[log._id];
                                        const changeCount = Array.isArray(log.details?.changes) ? log.details.changes.length : 0;
                                        return (
                                            <li key={log._id} className="px-5 py-4">
                                                <div className="grid gap-3 md:grid-cols-[90px_minmax(170px,0.8fr)_minmax(220px,1.4fr)_minmax(170px,0.9fr)] md:items-start">
                                                    <time dateTime={log.createdAt} className="text-sm font-semibold tabular-nums text-slate-700" title={new Date(log.createdAt).toLocaleString()}>
                                                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </time>

                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                                            <UserRound size={17} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            {canViewAll ? (
                                                                <button type="button" onClick={() => setUserId(String(log.actorUserId))} className="block max-w-full truncate text-left text-sm font-semibold text-slate-900 hover:text-blue-700 hover:underline" title="Show only this employee's work">
                                                                    {log.employeeName}
                                                                </button>
                                                            ) : (
                                                                <p className="truncate text-sm font-semibold text-slate-900">{log.employeeName}</p>
                                                            )}
                                                            <p className="truncate text-xs text-slate-500">{[log.designation, log.actorRole].filter(Boolean).join(' · ') || 'Employee'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="min-w-0">
                                                        <span className={`inline-block rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${ACTION_TONE[log.action] || 'bg-blue-50 text-blue-700'}`}>{actionLabel(log.action)}</span>
                                                        <p className="mt-1.5 text-sm font-medium text-slate-800">{log.summary}</p>
                                                        <button type="button" onClick={() => setExpanded((prev) => ({ ...prev, [log._id]: !prev[log._id] }))} className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline" aria-expanded={isOpen}>
                                                            <ChevronDown size={14} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
                                                            {isOpen ? 'Hide details' : changeCount ? `What changed (${changeCount})` : 'Details'}
                                                        </button>
                                                    </div>

                                                    <div className="min-w-0 text-xs text-slate-500">
                                                        {log.clientId || log.clientName ? (
                                                            <button type="button" onClick={() => log.clientId && setClientId(String(log.clientId))} className="flex max-w-full items-center gap-2 text-left text-sm font-medium text-slate-700 hover:text-blue-700 hover:underline" title="Show only this client's work">
                                                                <BriefcaseBusiness size={15} className="shrink-0 text-slate-400" />
                                                                <span className="truncate">{clientLabel(log) || 'Client'}</span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-sm text-slate-400">No client attached</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {isOpen && (
                                                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:ml-[90px]">
                                                        <LogDetails log={log} />
                                                        <p className="mt-3 text-[11px] text-slate-400">Recorded {new Date(log.createdAt).toLocaleString()}</p>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>
                        ))
                    )}

                    <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Page {page} of {pages}
                        </p>
                        <div className="flex gap-2">
                            <button disabled={page <= 1 || loading} onClick={() => loadLogs(page - 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40" aria-label="Previous page">
                                <ChevronLeft size={17} />
                            </button>
                            <button disabled={page >= pages || loading} onClick={() => loadLogs(page + 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40" aria-label="Next page">
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </footer>
                </section>
            </div>
        </main>
    );
}
