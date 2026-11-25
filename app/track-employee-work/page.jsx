// app/track-employee-work/page.jsx
//
// Admin / manager timeline of employee work: who did what, on which client, when, and what changed.
// Every entry is stored permanently in the EmployeeWorkLog collection and is searchable at any time.

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Activity, BriefcaseBusiness, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Clock3, DatabaseZap, Download, ExternalLink, Filter, History, Loader2, RotateCcw, Search, Users, X } from 'lucide-react';
import axiosInstance from '@/service/axiosInstance';

const PAGE_SIZE = 30;

const ACTION_LABELS = {
    CLIENT_CREATED: 'Client created',
    CLIENT_UPDATED: 'Client updated',
    CLIENT_DELETED: 'Client deleted',
    PROJECT_ADDED: 'Project added',
    PROJECT_UPDATED: 'Project updated',
    WORK_ASSIGNED: 'Work assigned',
    EMPLOYEE_REMOVED_FROM_PROJECT: 'Employee removed',
    WORK_CHECKLIST_UPDATED: 'Checklist work',
    SEO_KEYWORD_ADDED: 'Keyword added',
    SEO_KEYWORD_REMOVED: 'Keyword removed',
    SEO_RANKING_UPDATED: 'Ranking added',
    SEO_RANKING_EDITED: 'Ranking edited',
    ATTACHMENT_ADDED: 'Attachment added',
    TEAM_UPDATE_SENT: 'Team update sent',
    SALES_EXECUTIVE_CHANGED: 'Sales exec changed',
};

const ACTION_TONE = {
    CLIENT_DELETED: 'bg-red-50 text-red-700 ring-red-200',
    SEO_KEYWORD_REMOVED: 'bg-red-50 text-red-700 ring-red-200',
    EMPLOYEE_REMOVED_FROM_PROJECT: 'bg-red-50 text-red-700 ring-red-200',
    CLIENT_CREATED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    PROJECT_ADDED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    SEO_KEYWORD_ADDED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    WORK_ASSIGNED: 'bg-violet-50 text-violet-700 ring-violet-200',
    WORK_CHECKLIST_UPDATED: 'bg-amber-50 text-amber-800 ring-amber-200',
    SEO_RANKING_UPDATED: 'bg-sky-50 text-sky-700 ring-sky-200',
    SEO_RANKING_EDITED: 'bg-sky-50 text-sky-700 ring-sky-200',
};

// Keys rendered in a dedicated way, or internal ids nobody needs to read.
const HIDDEN_DETAIL_KEYS = ['changes', 'items', 'employeeIds', 'assignedEmployees', 'keywordId', 'projectId'];

const actionLabel = (action) => ACTION_LABELS[action] || String(action || '').replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
const humanize = (key) => String(key).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
const titleCase = (value) => String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const initials = (name) =>
    String(name || '?')
        .split(/\s+|@/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || '?';

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
    { key: '7d', label: '7 days', from: () => daysAgo(6), to: () => daysAgo(0) },
    { key: '30d', label: '30 days', from: () => daysAgo(29), to: () => daysAgo(0) },
    { key: '90d', label: '90 days', from: () => daysAgo(89), to: () => daysAgo(0) },
    { key: '1y', label: '1 year', from: () => daysAgo(364), to: () => daysAgo(0) },
    { key: 'all', label: 'All time', from: () => '', to: () => '' },
];

const dayHeading = (date) => {
    const key = toInputDate(date);
    if (key === daysAgo(0)) return 'Today';
    if (key === daysAgo(1)) return 'Yesterday';
    return new Date(date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatDate = (date) => (date ? new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const clientLabel = (c) =>
    [c?.company || c?.clientCompany, c?.name || c?.clientName]
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(' · ');

const readUrlFilters = () => {
    if (typeof window === 'undefined') return {};
    const p = new URLSearchParams(window.location.search);
    return Object.fromEntries(['search', 'from', 'to', 'userId', 'employeeId', 'clientId', 'action'].filter((k) => p.has(k)).map((k) => [k, p.get(k)]));
};

/* ----------------------------------------------------------------------------------------------
 * Searchable dropdown
 * -------------------------------------------------------------------------------------------- */
function Combobox({ label, icon: Icon, placeholder, value, options, onSelect, onQuery, loading, footer, emptyText = 'No matches' }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlight, setHighlight] = useState(0);
    const rootRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const close = (event) => rootRef.current && !rootRef.current.contains(event.target) && setOpen(false);
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [open]);

    useEffect(() => {
        if (open) {
            setQuery('');
            setHighlight(0);
            onQuery?.('');
            requestAnimationFrame(() => inputRef.current?.focus());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const filtered = useMemo(() => {
        if (onQuery || !query.trim()) return options;
        const q = query.trim().toLowerCase();
        return options.filter((o) => `${o.label} ${o.sublabel || ''}`.toLowerCase().includes(q));
    }, [options, query, onQuery]);

    const choose = (option) => {
        onSelect(option);
        setOpen(false);
    };

    const onKeyDown = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlight((h) => Math.min(h + 1, filtered.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (filtered[highlight]) choose(filtered[highlight]);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <div ref={rootRef} className="relative min-w-0">
            <button type="button" aria-label={label} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={`flex h-11 w-full min-w-0 items-center gap-2 rounded-lg border bg-white px-3 text-left text-sm outline-none transition focus:ring-2 focus:ring-blue-100 ${open ? 'border-blue-500' : 'border-slate-200 hover:border-slate-300'}`}>
                <Icon size={16} className="shrink-0 text-slate-400" />
                <span className={`min-w-0 flex-1 truncate ${value ? 'font-medium text-slate-800' : 'text-slate-500'}`}>{value ? value.label : placeholder}</span>
                {value ? (
                    <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Clear ${label}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), onSelect(null))}
                        className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={14} />
                    </span>
                ) : (
                    <ChevronsUpDown size={15} className="shrink-0 text-slate-400" />
                )}
            </button>

            {open && (
                <div className="absolute left-0 right-0 z-30 mt-1.5 min-w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-3">
                        <Search size={15} className="text-slate-400" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setHighlight(0);
                                onQuery?.(e.target.value);
                            }}
                            onKeyDown={onKeyDown}
                            placeholder={`Search ${label.toLowerCase()}…`}
                            className="h-10 w-full bg-transparent text-sm outline-none"
                        />
                        {loading && <Loader2 size={15} className="animate-spin text-slate-400" />}
                    </div>
                    <ul role="listbox" className="max-h-72 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-6 text-center text-sm text-slate-500">{loading ? 'Searching…' : emptyText}</li>
                        ) : (
                            filtered.map((option, index) => {
                                const selected = value?.key === option.key;
                                return (
                                    <li
                                        key={option.key}
                                        role="option"
                                        aria-selected={selected}
                                        onMouseEnter={() => setHighlight(index)}
                                        onClick={() => choose(option)}
                                        className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm ${index === highlight ? 'bg-blue-50' : ''}`}
                                    >
                                        <Check size={14} className={`shrink-0 ${selected ? 'text-blue-600' : 'text-transparent'}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className={`truncate ${option.muted ? 'text-slate-500' : 'text-slate-800'}`}>{option.label}</p>
                                            {option.sublabel && <p className="truncate text-xs text-slate-500">{option.sublabel}</p>}
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${option.count ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>{option.count || 0}</span>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                    {footer && <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">{footer}</div>}
                </div>
            )}
        </div>
    );
}

/* ----------------------------------------------------------------------------------------------
 * Details of one log entry
 * -------------------------------------------------------------------------------------------- */
function LogDetails({ log }) {
    const details = log.details || {};
    const changes = Array.isArray(details.changes) ? details.changes : [];
    const items = Array.isArray(details.items) ? details.items : [];
    const assigned = Array.isArray(details.assignedEmployees) ? details.assignedEmployees : [];
    const rest = Object.entries(details).filter(([key, value]) => !HIDDEN_DETAIL_KEYS.includes(key) && value !== '' && value !== null && value !== undefined && !(Array.isArray(value) && !value.length));

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
                                    <td className="break-words py-1.5 pr-3 text-red-700/80 line-through decoration-red-300">{displayValue(change.oldValue)}</td>
                                    <td className="break-words py-1.5 text-emerald-800">{displayValue(change.newValue)}</td>
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
                            <dd className="break-words text-slate-600">
                                {typeof value === 'string' && /^https?:\/\//.test(value) ? (
                                    <a href={value} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                                        {value}
                                    </a>
                                ) : (
                                    displayValue(value)
                                )}
                            </dd>
                        </div>
                    ))}
                </dl>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, hint }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Icon size={14} className="text-slate-400" /> {label}
            </div>
            <p className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
            {hint && <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>}
        </div>
    );
}

/* ----------------------------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------------------------- */
export default function TrackEmployeeWorkPage() {
    const initial = useMemo(readUrlFilters, []);

    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState({});
    const [viewer, setViewer] = useState({ canViewAll: true, isAdmin: false });

    const [searchInput, setSearchInput] = useState(initial.search || '');
    const [search, setSearch] = useState(initial.search || '');
    const [from, setFrom] = useState(initial.from ?? daysAgo(29));
    const [to, setTo] = useState(initial.to ?? daysAgo(0));
    const [person, setPerson] = useState(initial.employeeId || initial.userId ? { employeeId: initial.employeeId || '', userId: initial.userId || '' } : null);
    const [client, setClient] = useState(initial.clientId ? { clientId: initial.clientId } : null);
    const [action, setAction] = useState(initial.action || '');

    const [facets, setFacets] = useState({ employees: [], actions: [], stats: null, storage: null });
    const [clientOptions, setClientOptions] = useState({ clients: [], totalClients: 0, withActivity: 0 });
    const [clientQuery, setClientQuery] = useState('');
    const [clientsLoading, setClientsLoading] = useState(false);
    const [sync, setSync] = useState({ running: false, message: '' });

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
        if (person?.employeeId) params.set('employeeId', person.employeeId);
        else if (person?.userId) params.set('userId', person.userId);
        if (client?.clientId) params.set('clientId', client.clientId);
        if (action) params.set('action', action);
        return params;
    }, [search, from, to, person, client, action]);

    // Keep the URL in sync so a filtered view can be bookmarked or shared.
    useEffect(() => {
        const url = new URLSearchParams();
        if (search) url.set('search', search);
        url.set('from', from);
        url.set('to', to);
        if (person?.employeeId) url.set('employeeId', person.employeeId);
        else if (person?.userId) url.set('userId', person.userId);
        if (client?.clientId) url.set('clientId', client.clientId);
        if (action) url.set('action', action);
        window.history.replaceState(null, '', `${window.location.pathname}?${url.toString()}`);
    }, [search, from, to, person, client, action]);

    const loadLogs = useCallback(
        async (nextPage = 1) => {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams(filterParams);
                params.set('page', String(nextPage));
                params.set('limit', String(PAGE_SIZE));
                const { data } = await axiosInstance.get(`/api/track-employee-work?${params.toString()}`);
                if (!data?.success) throw new Error(data?.message || 'Could not load work history');
                setLogs(data.data || []);
                setTotal(data.total || 0);
                setPages(Math.max(1, data.pages || 1));
                setPage(nextPage);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Could not load work history');
                setLogs([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        },
        [filterParams]
    );

    const loadFacets = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get(`/api/track-employee-work/filters?${filterParams.toString()}`);
            if (data?.success) {
                setFacets({ employees: data.employees || [], actions: data.actions || [], stats: data.stats || null, storage: data.storage || null });
                setViewer({ canViewAll: data.canViewAll !== false, isAdmin: !!data.isAdmin });
            }
        } catch {
            // Dropdowns are a convenience; the timeline still works without them.
        }
    }, [filterParams]);

    useEffect(() => {
        loadLogs(1);
        loadFacets();
    }, [loadLogs, loadFacets]);

    // Client list: server-side search across every client.
    useEffect(() => {
        let active = true;
        const timer = setTimeout(async () => {
            setClientsLoading(true);
            try {
                const params = new URLSearchParams(filterParams);
                if (clientQuery.trim()) params.set('q', clientQuery.trim());
                const { data } = await axiosInstance.get(`/api/track-employee-work/clients?${params.toString()}`);
                if (active && data?.success) setClientOptions({ clients: data.clients || [], totalClients: data.totalClients || 0, withActivity: data.withActivity || 0 });
            } catch {
                // keep previous options
            } finally {
                if (active) setClientsLoading(false);
            }
        }, 250);
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [clientQuery, filterParams]);

    const runSync = async () => {
        setSync({ running: true, message: '' });
        try {
            const { data } = await axiosInstance.post('/api/track-employee-work/sync', {});
            if (!data?.success) throw new Error(data?.message);
            setSync({ running: false, message: data.imported ? `Imported ${data.imported.toLocaleString()} past work records.` : 'History is already up to date.' });
            loadLogs(1);
            loadFacets();
        } catch (err) {
            setSync({ running: false, message: err.response?.data?.message || err.message || 'Import failed' });
        }
    };

    const exportCsv = () => {
        const params = new URLSearchParams(filterParams);
        params.set('tz', Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
        window.location.href = `/api/track-employee-work/export?${params.toString()}`;
    };

    const employeeOptions = useMemo(
        () =>
            facets.employees.map((emp) => ({
                key: emp.key,
                employeeId: emp.employeeId,
                userId: emp.userId,
                label: emp.name,
                sublabel: [emp.designation ? titleCase(emp.designation) : titleCase(emp.role), emp.former ? 'former' : '', emp.lastAt ? `last active ${formatDate(emp.lastAt)}` : 'no activity in range'].filter(Boolean).join(' · '),
                count: emp.count,
                muted: !emp.count,
            })),
        [facets.employees]
    );

    const clientComboOptions = useMemo(
        () =>
            clientOptions.clients.map((c) => ({
                key: c.clientId,
                clientId: c.clientId,
                label: clientLabel(c) || 'Unnamed client',
                sublabel: [c.deleted ? 'deleted client' : '', c.lastAt ? `last work ${formatDate(c.lastAt)}` : ''].filter(Boolean).join(' · '),
                count: c.count,
                muted: !c.count,
            })),
        [clientOptions.clients]
    );

    const selectedPerson = person ? employeeOptions.find((o) => (person.employeeId && o.employeeId === person.employeeId) || (!person.employeeId && person.userId && o.userId === person.userId)) || (person.label ? person : null) : null;
    const selectedClient = client ? clientComboOptions.find((o) => o.clientId === client.clientId) || (client.label ? client : { key: client.clientId, clientId: client.clientId, label: 'Selected client' }) : null;
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

    const focusPerson = (log) => {
        if (!viewer.canViewAll) return;
        setPerson({ key: String(log.employeeId || log.actorUserId), employeeId: log.employeeId ? String(log.employeeId) : '', userId: log.actorUserId ? String(log.actorUserId) : '', label: log.employeeName });
    };
    const focusClient = (log) => log.clientId && setClient({ key: String(log.clientId), clientId: String(log.clientId), label: clientLabel(log) || 'Client' });

    const resetFilters = () => {
        setSearchInput('');
        setSearch('');
        setPerson(null);
        setClient(null);
        setAction('');
        setFrom(daysAgo(29));
        setTo(daysAgo(0));
    };

    const clientBase = viewer.isAdmin ? '/dashboard/customer' : viewer.canViewAll ? '/manager/customer' : null;
    const hasFilters = Boolean(search || person || client || action);
    const stats = facets.stats;
    const storageEmpty = facets.storage && facets.storage.total === 0;
    const pageNumbers = useMemo(() => {
        const set = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
        return [...set].sort((a, b) => a - b);
    }, [page, pages]);

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
            <div className="mx-auto max-w-7xl space-y-5">
                {/* Header */}
                <header className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-lg lg:flex-row lg:items-center md:p-8">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-200">
                            <Activity size={15} /> TEAM ACTIVITY
                        </div>
                        <h1 className="text-2xl font-bold md:text-3xl">Employee work tracking</h1>
                        <p className="mt-2 max-w-2xl text-sm text-blue-100">Who did what, on which client, and when. Every action is stored permanently and can be searched at any time.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {viewer.isAdmin && (
                            <button type="button" onClick={runSync} disabled={sync.running} className="flex h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-60" title="Import past work (checklists, SEO rankings, client edits, attachments, team updates) into the tracker. Safe to run again.">
                                {sync.running ? <Loader2 size={16} className="animate-spin" /> : <History size={16} />}
                                {sync.running ? 'Importing…' : 'Import past work'}
                            </button>
                        )}
                        <button type="button" onClick={exportCsv} disabled={!total} className="flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50 disabled:opacity-60">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </header>

                {sync.message && (
                    <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        <span>{sync.message}</span>
                        <button type="button" onClick={() => setSync((s) => ({ ...s, message: '' }))} aria-label="Dismiss">
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* Stats */}
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard icon={Activity} label="Actions" value={(stats?.total ?? total).toLocaleString()} hint={activePreset ? PRESETS.find((p) => p.key === activePreset)?.label : from || to ? `${formatDate(from)} – ${formatDate(to)}` : 'All time'} />
                    <StatCard icon={Users} label={selectedPerson ? 'Employee' : 'Active employees'} value={selectedPerson ? selectedPerson.label : (stats?.people ?? 0).toLocaleString()} hint={selectedPerson ? selectedPerson.sublabel?.split(' · ')[0] : viewer.canViewAll ? `of ${facets.employees.length} tracked` : 'your own work'} />
                    <StatCard icon={BriefcaseBusiness} label={selectedClient ? 'Client' : 'Clients worked on'} value={selectedClient ? selectedClient.label : (stats?.clients ?? 0).toLocaleString()} hint={selectedClient ? 'filtered' : clientOptions.totalClients ? `of ${clientOptions.totalClients.toLocaleString()} clients` : ''} />
                    <StatCard icon={Clock3} label="Latest activity" value={stats?.lastAt ? new Date(stats.lastAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} hint={stats?.lastAt ? formatDate(stats.lastAt) : 'nothing in range'} />
                </section>

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
                        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                            <input aria-label="From date" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm text-slate-700 outline-none focus:border-blue-500" />
                            <span className="text-xs text-slate-400">to</span>
                            <input aria-label="To date" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm text-slate-700 outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    <div className={`grid gap-3 ${viewer.canViewAll ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
                        <label className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search work, keyword, employee, client" className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                        </label>
                        {viewer.canViewAll && (
                            <Combobox
                                label="Employee"
                                icon={Users}
                                placeholder="All employees"
                                value={selectedPerson}
                                options={employeeOptions}
                                onSelect={(option) => setPerson(option ? { key: option.key, employeeId: option.employeeId, userId: option.userId, label: option.label } : null)}
                                footer={`${facets.employees.length} people · count = actions in the selected range`}
                                emptyText="No employees found"
                            />
                        )}
                        <Combobox
                            label="Client"
                            icon={BriefcaseBusiness}
                            placeholder="All clients"
                            value={selectedClient}
                            options={clientComboOptions}
                            onSelect={(option) => setClient(option ? { key: option.key, clientId: option.clientId, label: option.label } : null)}
                            onQuery={setClientQuery}
                            loading={clientsLoading}
                            footer={clientOptions.totalClients ? `${clientOptions.withActivity} with activity in range · ${clientOptions.totalClients.toLocaleString()} clients total — type to search` : 'Type to search clients'}
                            emptyText="No clients match"
                        />
                        <div className="relative">
                            <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select aria-label="Action" value={action} onChange={(e) => setAction(e.target.value)} className="h-11 w-full min-w-0 appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                                <option value="">All actions</option>
                                {facets.actions.map((a) => (
                                    <option key={a.action} value={a.action}>
                                        {actionLabel(a.action)} ({a.count})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {hasFilters && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium text-slate-500">Filtered by</span>
                            {selectedPerson && (
                                <button type="button" onClick={() => setPerson(null)} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 hover:bg-blue-100">
                                    {selectedPerson.label} <X size={12} />
                                </button>
                            )}
                            {selectedClient && (
                                <button type="button" onClick={() => setClient(null)} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 hover:bg-blue-100">
                                    {selectedClient.label} <X size={12} />
                                </button>
                            )}
                            {action && (
                                <button type="button" onClick={() => setAction('')} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 hover:bg-blue-100">
                                    {actionLabel(action)} <X size={12} />
                                </button>
                            )}
                            {search && (
                                <button type="button" onClick={() => setSearchInput('')} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 hover:bg-blue-100">
                                    “{search}” <X size={12} />
                                </button>
                            )}
                            <button type="button" onClick={resetFilters} className="ml-1 flex items-center gap-1 text-slate-500 hover:text-slate-800">
                                <RotateCcw size={12} /> Reset
                            </button>
                        </div>
                    )}
                </section>

                {/* Timeline */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-900">Work timeline</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Most recent first · click a name or client to focus on it</p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{total.toLocaleString()} records</span>
                    </div>

                    {/* Column headings (desktop) */}
                    <div className="hidden grid-cols-[80px_minmax(180px,0.8fr)_minmax(240px,1.5fr)_minmax(180px,0.9fr)] gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:grid">
                        <span>When</span>
                        <span>Who</span>
                        <span>What</span>
                        <span>Client</span>
                    </div>

                    {error && <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                    {loading ? (
                        <div className="space-y-3 p-5" aria-busy="true">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center">
                            <DatabaseZap className="mx-auto mb-3 text-slate-300" size={32} />
                            {storageEmpty ? (
                                <>
                                    <p className="font-medium text-slate-700">No work has been recorded yet</p>
                                    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">New work is recorded automatically from now on. {viewer.isAdmin ? 'Import past work to bring in checklists, SEO rankings, client edits, attachments and team updates that were done before tracking started.' : 'Ask an admin to import past work.'}</p>
                                    {viewer.isAdmin && (
                                        <button type="button" onClick={runSync} disabled={sync.running} className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                                            {sync.running ? <Loader2 size={16} className="animate-spin" /> : <History size={16} />} Import past work
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p className="font-medium text-slate-700">No tracked work for these filters</p>
                                    <p className="mt-1 text-sm text-slate-500">Try a wider date range or clear the filters.</p>
                                    <div className="mt-4 flex justify-center gap-2">
                                        {activePreset !== 'all' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFrom('');
                                                    setTo('');
                                                }}
                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                            >
                                                Show all time
                                            </button>
                                        )}
                                        {hasFilters && (
                                            <button type="button" onClick={resetFilters} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                                Clear filters
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        groups.map((group) => (
                            <div key={group.key}>
                                <div className="sticky top-0 z-10 border-y border-slate-100 bg-slate-50/95 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">
                                    {dayHeading(group.date)} <span className="font-normal text-slate-400">· {group.items.length}</span>
                                </div>
                                <ol className="divide-y divide-slate-100">
                                    {group.items.map((log) => {
                                        const isOpen = !!expanded[log._id];
                                        const changeCount = Array.isArray(log.details?.changes) ? log.details.changes.length : 0;
                                        return (
                                            <li key={log._id} className="px-5 py-4 transition hover:bg-slate-50/60">
                                                <div className="grid gap-3 md:grid-cols-[80px_minmax(180px,0.8fr)_minmax(240px,1.5fr)_minmax(180px,0.9fr)] md:items-start">
                                                    <time dateTime={log.createdAt} className="text-sm font-semibold tabular-nums text-slate-700" title={new Date(log.createdAt).toLocaleString()}>
                                                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </time>

                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">{initials(log.employeeName)}</div>
                                                        <div className="min-w-0">
                                                            {viewer.canViewAll ? (
                                                                <button type="button" onClick={() => focusPerson(log)} className="block max-w-full truncate text-left text-sm font-semibold text-slate-900 hover:text-blue-700 hover:underline" title="Show only this employee's work">
                                                                    {log.employeeName}
                                                                </button>
                                                            ) : (
                                                                <p className="truncate text-sm font-semibold text-slate-900">{log.employeeName}</p>
                                                            )}
                                                            <p className="truncate text-xs text-slate-500">{[log.designation ? titleCase(log.designation) : '', titleCase(log.actorRole)].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · ') || 'Employee'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${ACTION_TONE[log.action] || 'bg-blue-50 text-blue-700 ring-blue-200'}`}>{actionLabel(log.action)}</span>
                                                            {log.source === 'history' && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500" title="Imported from records made before live tracking started">imported</span>}
                                                        </div>
                                                        <p className="mt-1.5 break-words text-sm font-medium text-slate-800">{log.summary}</p>
                                                        <button type="button" onClick={() => setExpanded((prev) => ({ ...prev, [log._id]: !prev[log._id] }))} className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline" aria-expanded={isOpen}>
                                                            <ChevronDown size={14} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
                                                            {isOpen ? 'Hide details' : changeCount ? `What changed (${changeCount})` : 'Details'}
                                                        </button>
                                                    </div>

                                                    <div className="min-w-0">
                                                        {log.clientId || log.clientName ? (
                                                            <div className="flex min-w-0 items-center gap-1.5">
                                                                <button type="button" onClick={() => focusClient(log)} className="flex min-w-0 items-center gap-2 text-left text-sm font-medium text-slate-700 hover:text-blue-700 hover:underline" title="Show only this client's work">
                                                                    <BriefcaseBusiness size={15} className="shrink-0 text-slate-400" />
                                                                    <span className="truncate">{clientLabel(log) || 'Client'}</span>
                                                                </button>
                                                                {clientBase && log.clientId && log.action !== 'CLIENT_DELETED' && (
                                                                    <Link href={`${clientBase}/${log.clientId}`} className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-700" title="Open client">
                                                                        <ExternalLink size={13} />
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-slate-400">No client attached</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {isOpen && (
                                                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:ml-[92px]">
                                                        <LogDetails log={log} />
                                                        <p className="mt-3 text-[11px] text-slate-400">
                                                            {log.source === 'history' ? 'Done' : 'Recorded'} {new Date(log.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>
                        ))
                    )}

                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
                        <p className="text-xs text-slate-500">{total ? `Showing ${((page - 1) * PAGE_SIZE + 1).toLocaleString()}–${Math.min(page * PAGE_SIZE, total).toLocaleString()} of ${total.toLocaleString()}` : 'No records'}</p>
                        <nav className="flex items-center gap-1" aria-label="Pagination">
                            <button disabled={page <= 1 || loading} onClick={() => loadLogs(page - 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40" aria-label="Previous page">
                                <ChevronLeft size={16} />
                            </button>
                            {pageNumbers.map((n, i) => (
                                <span key={n} className="flex items-center gap-1">
                                    {i > 0 && n - pageNumbers[i - 1] > 1 && <span className="px-1 text-xs text-slate-400">…</span>}
                                    <button disabled={loading} onClick={() => loadLogs(n)} aria-current={n === page ? 'page' : undefined} className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${n === page ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                        {n}
                                    </button>
                                </span>
                            ))}
                            <button disabled={page >= pages || loading} onClick={() => loadLogs(page + 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40" aria-label="Next page">
                                <ChevronRight size={16} />
                            </button>
                        </nav>
                    </footer>
                </section>
            </div>
        </main>
    );
}
