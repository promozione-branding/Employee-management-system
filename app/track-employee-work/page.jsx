// app/track-employee-work/page.jsx
//
// Admin / manager command centre for everything staff do in the ERP: who did what, on which client,
// and when, for every role (admin, manager, sales, employee). Entries are stored permanently in the
// EmployeeWorkLog collection and are searchable at any time.

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
    Activity,
    BarChart3,
    BookOpen,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    Clock3,
    DatabaseZap,
    Download,
    ExternalLink,
    FileText,
    Filter,
    Flame,
    FolderKanban,
    History,
    Layers,
    ListChecks,
    Loader2,
    LogIn,
    MessageSquareText,
    PhoneCall,
    Radio,
    Receipt,
    RotateCcw,
    Search,
    Settings,
    ShieldQuestion,
    TrendingUp,
    Trophy,
    Users,
    X,
} from 'lucide-react';
import axiosInstance from '@/service/axiosInstance';
import { WORK_CATEGORIES, actionLabel, categoryOf } from '@/lib/workTracking/categories';

const PAGE_SIZE = 50;
const LIVE_INTERVAL_MS = 30000;

const CATEGORY_ICONS = { clients: Building2, updates: MessageSquareText, calls: PhoneCall, proposals: FileText, invoices: Receipt, ledger: BookOpen, projects: FolderKanban, seo: TrendingUp, tasks: ListChecks, reports: BarChart3, team: Users, settings: Settings, access: LogIn, other: Activity };

const ROLES = [
    { key: '', label: 'Everyone' },
    { key: 'admin', label: 'Admins' },
    { key: 'manager', label: 'Managers' },
    { key: 'sales', label: 'Sales' },
    { key: 'employee', label: 'Employees' },
    { key: 'unknown', label: 'Not recorded' },
];

// Keys rendered in a dedicated way, or internal ids nobody needs to read.
const HIDDEN_DETAIL_KEYS = ['changes', 'items', 'employeeIds', 'assignedEmployees', 'keywordId', 'projectId'];

const actionTone = (action) => {
    if (/DELETED|REMOVED/.test(action)) return 'bg-red-50 text-red-700 ring-red-200';
    if (/CREATED|ADDED|SENT|ASSIGNED|COMPLETED|MADE|RECEIVED|LOGGED_IN|RANKING_UPDATED/.test(action)) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    if (/EDITED|UPDATED|CHANGED/.test(action)) return 'bg-amber-50 text-amber-800 ring-amber-200';
    return 'bg-blue-50 text-blue-700 ring-blue-200';
};
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
const timeOf = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const relative = (date) => {
    if (!date) return '';
    const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return days < 30 ? `${days}d ago` : formatDate(date);
};

const clientLabel = (c) =>
    [c?.company || c?.clientCompany, c?.name || c?.clientName]
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(' · ');

const URL_KEYS = ['search', 'from', 'to', 'userId', 'employeeId', 'clientId', 'action', 'category', 'role'];
const readUrlFilters = () => {
    if (typeof window === 'undefined') return {};
    const p = new URLSearchParams(window.location.search);
    return Object.fromEntries(URL_KEYS.filter((k) => p.has(k)).map((k) => [k, p.get(k)]));
};
const personKeyOf = (log) => String(log.employeeId || log.actorUserId || 'unknown');

/* ---------------------------------------------------------------------------------------------- */
/* Searchable dropdown                                                                            */
/* ---------------------------------------------------------------------------------------------- */
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
                <div className="absolute left-0 right-0 z-30 mt-1.5 min-w-[300px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
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
                    <ul role="listbox" className="max-h-80 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-6 text-center text-sm text-slate-500">{loading ? 'Searching…' : emptyText}</li>
                        ) : (
                            filtered.map((option, index) => {
                                const selected = value?.key === option.key;
                                return (
                                    <li key={option.key} role="option" aria-selected={selected} onMouseEnter={() => setHighlight(index)} onClick={() => choose(option)} className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm ${index === highlight ? 'bg-blue-50' : ''}`}>
                                        <Check size={14} className={`shrink-0 ${selected ? 'text-blue-600' : 'text-transparent'}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className={`truncate ${option.muted ? 'text-slate-500' : 'text-slate-800'}`}>{option.label}</p>
                                            {option.sublabel && <p className="truncate text-xs text-slate-500">{option.sublabel}</p>}
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${option.count ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>{(option.count || 0).toLocaleString()}</span>
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

/* ---------------------------------------------------------------------------------------------- */
/* Insights                                                                                       */
/* ---------------------------------------------------------------------------------------------- */
function Panel({ title, icon: Icon, hint, children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Icon size={15} className="text-slate-400" /> {title}
                </h3>
                {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

function TrendChart({ series }) {
    const [hover, setHover] = useState(null);
    const points = series?.points || [];
    const max = Math.max(1, ...points.map((p) => p.count));
    const unit = series?.unit || 'day';
    const label = (at) => {
        const d = new Date(at);
        if (unit === 'month') return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        if (unit === 'week') return `Week of ${d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
        return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    };
    const short = (at) => new Date(at).toLocaleDateString(undefined, unit === 'month' ? { month: 'short', year: '2-digit' } : { day: 'numeric', month: 'short' });

    if (!points.length) return <div className="flex h-64 items-center justify-center text-sm text-slate-400">No activity in this range</div>;
    return (
        <div>
            <div className="relative">
                <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-slate-200" />
                <span className="pointer-events-none absolute -top-2 right-0 bg-white pl-1 text-[10px] tabular-nums text-slate-400">{max.toLocaleString()}</span>
                <div className="flex h-72 items-end gap-[2px] pt-3" onMouseLeave={() => setHover(null)}>
                    {points.map((p, i) => (
                        <button
                            key={p.at}
                            type="button"
                            onMouseEnter={() => setHover(i)}
                            onFocus={() => setHover(i)}
                            onBlur={() => setHover(null)}
                            aria-label={`${label(p.at)}: ${p.count} actions`}
                            className="group flex h-full min-w-0 flex-1 items-end"
                        >
                            <span className={`block w-full rounded-t-[4px] transition-colors ${hover === i ? 'bg-blue-700' : 'bg-blue-500/80 group-hover:bg-blue-600'}`} style={{ height: `${Math.max(2, (p.count / max) * 100)}%` }} />
                        </button>
                    ))}
                </div>
                {hover !== null && points[hover] && (
                    <div className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg" style={{ left: `${((hover + 0.5) / points.length) * 100}%` }}>
                        <span className="font-semibold tabular-nums">{points[hover].count.toLocaleString()}</span> actions · {label(points[hover].at)}
                    </div>
                )}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
                <span>{short(points[0].at)}</span>
                {points.length > 2 && <span>{short(points[Math.floor(points.length / 2)].at)}</span>}
                <span>{short(points[points.length - 1].at)}</span>
            </div>
        </div>
    );
}

function CategoryBars({ counts, active, onPick }) {
    const rows = WORK_CATEGORIES.map((c) => ({ ...c, count: counts?.[c.key] || 0 }))
        .filter((c) => c.count)
        .sort((a, b) => b.count - a.count);
    const max = Math.max(1, ...rows.map((r) => r.count));
    if (!rows.length) return <p className="py-6 text-center text-sm text-slate-400">No activity in this range</p>;
    return (
        <ul className="space-y-1">
            {rows.map((row) => {
                const Icon = CATEGORY_ICONS[row.key] || Activity;
                const selected = active === row.key;
                return (
                    <li key={row.key}>
                        <button type="button" onClick={() => onPick(selected ? '' : row.key)} className={`grid w-full grid-cols-[18px_110px_1fr_auto] items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${selected ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`} title={`Show only ${row.label.toLowerCase()}`}>
                            <Icon size={14} className="text-slate-500" />
                            <span className="truncate font-medium text-slate-700">{row.label}</span>
                            <span className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <span className="block h-full rounded-full bg-blue-500" style={{ width: `${(row.count / max) * 100}%` }} />
                            </span>
                            <span className="w-12 text-right font-semibold tabular-nums text-slate-700">{row.count.toLocaleString()}</span>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

function Leaderboard({ people, activeKey, onPick }) {
    const top = people.filter((p) => p.count && !p.unknown).slice(0, 7);
    const max = Math.max(1, ...top.map((p) => p.count));
    if (!top.length) return <p className="py-6 text-center text-sm text-slate-400">No activity in this range</p>;
    return (
        <ol className="space-y-1">
            {top.map((p, i) => (
                <li key={p.key}>
                    <button type="button" onClick={() => onPick(p)} className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition ${activeKey === p.key ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`} title="Show only this person's work">
                        <span className={`w-4 text-center text-xs font-bold tabular-nums ${i === 0 ? 'text-amber-500' : 'text-slate-400'}`}>{i + 1}</span>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-bold text-white">{initials(p.name)}</span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-slate-800">{p.name}</span>
                            <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <span className="block h-full rounded-full bg-blue-500" style={{ width: `${(p.count / max) * 100}%` }} />
                            </span>
                        </span>
                        <span className="text-right">
                            <span className="block text-xs font-semibold tabular-nums text-slate-700">{p.count.toLocaleString()}</span>
                            <span className="block text-[10px] text-slate-400">{titleCase(p.role) || '—'}</span>
                        </span>
                    </button>
                </li>
            ))}
        </ol>
    );
}

const HEAT_STEPS = ['bg-slate-100', 'bg-blue-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600', 'bg-blue-800'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Heatmap({ cells }) {
    const [hover, setHover] = useState(null);
    const grid = useMemo(() => {
        const g = Array.from({ length: 7 }, () => Array(24).fill(0));
        for (const c of cells || []) if (c.day >= 1 && c.day <= 7 && c.hour >= 0 && c.hour < 24) g[c.day - 1][c.hour] = c.count;
        return g;
    }, [cells]);
    const max = Math.max(1, ...grid.flat());
    const step = (n) => (n === 0 ? 0 : Math.min(HEAT_STEPS.length - 1, 1 + Math.floor((n / max) * (HEAT_STEPS.length - 1.001))));
    const busiest = useMemo(() => {
        let best = null;
        grid.forEach((row, d) => row.forEach((n, h) => (!best || n > best.n) && n && (best = { d, h, n })));
        return best;
    }, [grid]);
    const hourLabel = (h) => `${String(h).padStart(2, '0')}:00`;

    return (
        <div>
            <div className="overflow-x-auto">
                <div className="min-w-[420px]" onMouseLeave={() => setHover(null)}>
                    {grid.map((row, d) => (
                        <div key={d} className="flex items-center gap-[2px] py-[2px]">
                            <span className="w-8 shrink-0 text-[10px] text-slate-400">{WEEKDAYS[d]}</span>
                            {row.map((n, h) => (
                                <span key={h} onMouseEnter={() => setHover({ d, h, n })} className={`h-7 flex-1 rounded-[3px] ${HEAT_STEPS[step(n)]} ${hover?.d === d && hover?.h === h ? 'ring-2 ring-slate-900/70' : ''}`} aria-label={`${WEEKDAYS[d]} ${hourLabel(h)}: ${n} actions`} />
                            ))}
                        </div>
                    ))}
                    <div className="flex gap-[2px] pl-8 text-[10px] text-slate-400">
                        {Array.from({ length: 24 }, (_, h) => (
                            <span key={h} className="flex-1 text-center">
                                {h % 6 === 0 ? h : ''}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <span className="tabular-nums">{hover ? `${WEEKDAYS[hover.d]} ${hourLabel(hover.h)} – ${hover.n.toLocaleString()} actions` : busiest ? `Busiest: ${WEEKDAYS[busiest.d]} around ${hourLabel(busiest.h)}` : 'No activity'}</span>
                <span className="flex items-center gap-1">
                    Less
                    {HEAT_STEPS.map((c) => (
                        <span key={c} className={`h-2.5 w-2.5 rounded-[2px] ${c}`} />
                    ))}
                    More
                </span>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------------------------------------- */
/* Details of one log entry                                                                       */
/* ---------------------------------------------------------------------------------------------- */
function LogDetails({ log }) {
    const details = log.details || {};
    const changes = Array.isArray(details.changes) ? details.changes : [];
    const items = Array.isArray(details.items) ? details.items : [];
    const assigned = Array.isArray(details.assignedEmployees) ? details.assignedEmployees : [];
    const rest = Object.entries(details).filter(([key, value]) => !HIDDEN_DETAIL_KEYS.includes(key) && value !== '' && value !== null && value !== undefined && !(Array.isArray(value) && !value.length));

    if (!changes.length && !items.length && !assigned.length && !rest.length) return <p className="text-xs text-slate-500">No additional details were recorded for this action.</p>;

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
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Icon size={14} className="text-slate-400" /> {label}
            </div>
            <p className="mt-1.5 truncate text-2xl font-bold tabular-nums text-slate-900" title={typeof value === 'string' ? value : undefined}>
                {value}
            </p>
            {hint && <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>}
        </div>
    );
}

// Folds runs of the same person doing the same thing on the same client (e.g. 40 keyword rankings)
// into one expandable row, so the timeline stays readable.
function groupRuns(logs) {
    const runs = [];
    for (const log of logs) {
        const last = runs[runs.length - 1];
        const key = `${toInputDate(log.createdAt)}|${personKeyOf(log)}|${log.action}|${log.clientId || log.clientName || ''}`;
        if (last && last.key === key) last.items.push(log);
        else runs.push({ key, id: log._id, items: [log] });
    }
    return runs;
}

/* ---------------------------------------------------------------------------------------------- */
/* Page                                                                                           */
/* ---------------------------------------------------------------------------------------------- */
export default function TrackEmployeeWorkPage() {
    const initial = useMemo(readUrlFilters, []);
    const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);

    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState({});
    const [openRuns, setOpenRuns] = useState({});
    const [viewer, setViewer] = useState({ canViewAll: true, isAdmin: false });
    const [live, setLive] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [showInsights, setShowInsights] = useState(true);

    const [searchInput, setSearchInput] = useState(initial.search || '');
    const [search, setSearch] = useState(initial.search || '');
    const [from, setFrom] = useState(initial.from ?? daysAgo(29));
    const [to, setTo] = useState(initial.to ?? daysAgo(0));
    const [person, setPerson] = useState(initial.employeeId || initial.userId ? { employeeId: initial.employeeId || '', userId: initial.userId || '' } : null);
    const [client, setClient] = useState(initial.clientId ? { clientId: initial.clientId } : null);
    const [action, setAction] = useState(initial.action || '');
    const [category, setCategory] = useState(initial.category || '');
    const [role, setRole] = useState(initial.role || '');

    const [facets, setFacets] = useState({ employees: [], actions: [], categories: {}, roles: {}, stats: null, series: null, heatmap: [], storage: null });
    const [clientOptions, setClientOptions] = useState({ clients: [], totalClients: 0, withActivity: 0 });
    const [clientQuery, setClientQuery] = useState('');
    const [clientsLoading, setClientsLoading] = useState(false);
    const [sync, setSync] = useState({ running: false, message: '' });

    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const filterParams = useMemo(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        // Local-day boundaries as exact UTC instants, so "today" means today in the viewer's time zone.
        if (from) params.set('from', new Date(`${from}T00:00:00`).toISOString());
        if (to) params.set('to', new Date(`${to}T23:59:59.999`).toISOString());
        if (person?.employeeId) params.set('employeeId', person.employeeId);
        else if (person?.userId) params.set('userId', person.userId);
        if (client?.clientId) params.set('clientId', client.clientId);
        if (action) params.set('action', action);
        if (category) params.set('category', category);
        if (role) params.set('role', role);
        return params;
    }, [search, from, to, person, client, action, category, role]);

    // Keep the URL in sync so a filtered view can be bookmarked or shared.
    useEffect(() => {
        const url = new URLSearchParams({ from, to });
        if (search) url.set('search', search);
        if (person?.employeeId) url.set('employeeId', person.employeeId);
        else if (person?.userId) url.set('userId', person.userId);
        if (client?.clientId) url.set('clientId', client.clientId);
        if (action) url.set('action', action);
        if (category) url.set('category', category);
        if (role) url.set('role', role);
        window.history.replaceState(null, '', `${window.location.pathname}?${url.toString()}`);
    }, [search, from, to, person, client, action, category, role]);

    const loadLogs = useCallback(
        async (nextPage = 1, { quiet = false } = {}) => {
            if (!quiet) setLoading(true);
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
                setLastRefresh(new Date());
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Could not load work history');
                if (!quiet) {
                    setLogs([]);
                    setTotal(0);
                }
            } finally {
                if (!quiet) setLoading(false);
            }
        },
        [filterParams]
    );

    const loadFacets = useCallback(async () => {
        try {
            const params = new URLSearchParams(filterParams);
            params.set('tz', timeZone);
            const { data } = await axiosInstance.get(`/api/track-employee-work/filters?${params.toString()}`);
            if (data?.success) {
                setFacets({ employees: data.employees || [], actions: data.actions || [], categories: data.categories || {}, roles: data.roles || {}, stats: data.stats || null, series: data.series || null, heatmap: data.heatmap || [], storage: data.storage || null });
                setViewer({ canViewAll: data.canViewAll !== false, isAdmin: !!data.isAdmin });
            }
        } catch {
            // Insights are a convenience; the timeline still works without them.
        }
    }, [filterParams, timeZone]);

    useEffect(() => {
        loadLogs(1);
        loadFacets();
    }, [loadLogs, loadFacets]);

    // Live mode: quietly refresh the first page and the insights.
    useEffect(() => {
        if (!live) return undefined;
        const timer = setInterval(() => {
            if (document.visibilityState !== 'visible') return;
            if (page === 1) loadLogs(1, { quiet: true });
            loadFacets();
        }, LIVE_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [live, page, loadLogs, loadFacets]);

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
            setSync({ running: false, message: data.imported ? `Imported ${data.imported.toLocaleString()} past work records.` : 'History is already up to date — nothing new to import.' });
            loadLogs(1);
            loadFacets();
        } catch (err) {
            setSync({ running: false, message: err.response?.data?.message || err.message || 'Import failed' });
        }
    };

    const exportCsv = () => {
        const params = new URLSearchParams(filterParams);
        params.set('tz', timeZone);
        window.location.href = `/api/track-employee-work/export?${params.toString()}`;
    };

    const employeeOptions = useMemo(
        () =>
            facets.employees.map((emp) => ({
                key: emp.key,
                employeeId: emp.employeeId,
                userId: emp.userId,
                role: emp.role,
                label: emp.name,
                sublabel: emp.unknown ? 'imported history with no recorded author' : [emp.designation ? titleCase(emp.designation) : titleCase(emp.role), emp.former ? 'former' : '', emp.lastAt ? `last active ${relative(emp.lastAt)}` : 'no activity in range'].filter(Boolean).join(' · '),
                count: emp.count,
                muted: !emp.count,
                unknown: emp.unknown,
                name: emp.name,
            })),
        [facets.employees]
    );

    const clientComboOptions = useMemo(
        () =>
            clientOptions.clients.map((c) => ({
                key: c.clientId,
                clientId: c.clientId,
                label: clientLabel(c) || 'Unnamed client',
                sublabel: [c.deleted ? 'deleted client' : '', c.lastAt ? `last work ${relative(c.lastAt)}` : ''].filter(Boolean).join(' · '),
                count: c.count,
                muted: !c.count,
            })),
        [clientOptions.clients]
    );

    const selectedPerson = person ? employeeOptions.find((o) => (person.employeeId && o.employeeId === person.employeeId) || (!person.employeeId && person.userId && o.userId === person.userId)) || (person.label ? person : null) : null;
    const selectedClient = client ? clientComboOptions.find((o) => o.clientId === client.clientId) || (client.label ? client : { key: client.clientId, clientId: client.clientId, label: 'Selected client' }) : null;
    const activePreset = PRESETS.find((p) => p.from() === from && p.to() === to)?.key;
    const pickPerson = (option) => setPerson(option ? { key: option.key, employeeId: option.employeeId, userId: option.userId, label: option.label } : null);

    const groups = useMemo(() => {
        const map = new Map();
        for (const log of logs) {
            const key = toInputDate(log.createdAt);
            if (!map.has(key)) map.set(key, { key, date: log.createdAt, items: [] });
            map.get(key).items.push(log);
        }
        return [...map.values()].map((g) => ({ ...g, runs: groupRuns(g.items) }));
    }, [logs]);

    const focusPerson = (log) => {
        if (!viewer.canViewAll) return;
        if (!log.employeeId && !log.actorUserId) return setPerson({ key: 'unknown', employeeId: '', userId: 'unknown', label: 'Not recorded' });
        setPerson({ key: personKeyOf(log), employeeId: log.employeeId ? String(log.employeeId) : '', userId: log.actorUserId ? String(log.actorUserId) : '', label: log.employeeName });
    };
    const focusClient = (log) => log.clientId && setClient({ key: String(log.clientId), clientId: String(log.clientId), label: clientLabel(log) || 'Client' });

    const resetFilters = () => {
        setSearchInput('');
        setSearch('');
        setPerson(null);
        setClient(null);
        setAction('');
        setCategory('');
        setRole('');
        setFrom(daysAgo(29));
        setTo(daysAgo(0));
    };

    const clientBase = viewer.isAdmin ? '/dashboard/customer' : viewer.canViewAll ? '/manager/customer' : null;
    const hasFilters = Boolean(search || person || client || action || category || role);
    const stats = facets.stats;
    const storageEmpty = facets.storage && facets.storage.total === 0;
    const categoryTotal = Object.values(facets.categories || {}).reduce((s, n) => s + n, 0);
    const topCategory = WORK_CATEGORIES.map((c) => ({ ...c, count: facets.categories?.[c.key] || 0 })).sort((a, b) => b.count - a.count)[0];
    const visibleActions = category ? facets.actions.filter((a) => categoryOf(a.action).key === category) : facets.actions;
    const rangeLabel = activePreset ? PRESETS.find((p) => p.key === activePreset)?.label : from || to ? `${formatDate(from)} – ${formatDate(to)}` : 'All time';
    const pageNumbers = useMemo(() => [...new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages))].sort((a, b) => a - b), [page, pages]);

    const renderRow = (log, { nested = false } = {}) => {
        const isOpen = !!expanded[log._id];
        const changeCount = Array.isArray(log.details?.changes) ? log.details.changes.length : 0;
        const cat = categoryOf(log.action);
        const CatIcon = CATEGORY_ICONS[cat.key] || Activity;
        const unknown = !log.employeeId && !log.actorUserId;
        return (
            <div className={nested ? 'py-3' : ''}>
                <div className="grid gap-3 md:grid-cols-[70px_minmax(180px,0.8fr)_minmax(260px,1.6fr)_minmax(180px,0.9fr)] md:items-start">
                    <time dateTime={log.createdAt} className="text-sm font-semibold tabular-nums text-slate-700" title={new Date(log.createdAt).toLocaleString()}>
                        {timeOf(log.createdAt)}
                    </time>

                    <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${unknown ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'}`}>{unknown ? <ShieldQuestion size={16} /> : initials(log.employeeName)}</div>
                        <div className="min-w-0">
                            {viewer.canViewAll ? (
                                <button type="button" onClick={() => focusPerson(log)} className={`block max-w-full truncate text-left text-sm font-semibold hover:text-blue-700 hover:underline ${unknown ? 'text-slate-500' : 'text-slate-900'}`} title="Show only this person's work">
                                    {log.employeeName}
                                </button>
                            ) : (
                                <p className="truncate text-sm font-semibold text-slate-900">{log.employeeName}</p>
                            )}
                            <p className="truncate text-xs text-slate-500">{unknown ? 'author not stored on the original record' : [log.designation ? titleCase(log.designation) : '', titleCase(log.actorRole)].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · ') || 'Staff'}</p>
                        </div>
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600" title={cat.label}>
                                <CatIcon size={12} /> {cat.label}
                            </span>
                            <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${actionTone(log.action)}`}>{actionLabel(log.action)}</span>
                            {log.source === 'history' && (
                                <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 ring-1 ring-inset ring-slate-200" title="Imported from records made before live tracking started">
                                    imported
                                </span>
                            )}
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
                            <span className="text-sm text-slate-400">—</span>
                        )}
                    </div>
                </div>

                {isOpen && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:ml-[82px]">
                        <LogDetails log={log} />
                        <p className="mt-3 text-[11px] text-slate-400">
                            {log.source === 'history' ? 'Done' : 'Recorded'} {new Date(log.createdAt).toLocaleString()} · {log.source === 'history' ? 'imported from existing records' : log.source === 'auto' ? 'captured automatically' : 'recorded by the app'}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
            <div className="mx-auto max-w-7xl space-y-5">
                {/* Header */}
                <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-lg md:p-8">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
                    <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-200">
                                <Activity size={15} /> TEAM ACTIVITY
                            </div>
                            <h1 className="text-2xl font-bold md:text-3xl">Work tracking</h1>
                            <p className="mt-2 max-w-2xl text-sm text-blue-100">Everything admins, managers, sales and employees do — clients, updates, calls, proposals, invoices, ledger, projects, SEO and more. Stored permanently and searchable any time.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button type="button" onClick={() => setLive((v) => !v)} aria-pressed={live} className={`flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition ${live ? 'border-emerald-300/40 bg-emerald-500/20 text-emerald-100' : 'border-white/20 bg-white/10 hover:bg-white/20'}`} title="Refresh automatically every 30 seconds">
                                <span className="relative flex h-2.5 w-2.5">
                                    {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                                    <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${live ? 'bg-emerald-400' : 'bg-white/40'}`} />
                                </span>
                                <Radio size={15} /> Live
                            </button>
                            {viewer.isAdmin && (
                                <button type="button" onClick={runSync} disabled={sync.running} className="flex h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-60" title="Import past work from existing records. Safe to run again — nothing is duplicated.">
                                    {sync.running ? <Loader2 size={16} className="animate-spin" /> : <History size={16} />}
                                    {sync.running ? 'Importing…' : 'Import past work'}
                                </button>
                            )}
                            <button type="button" onClick={exportCsv} disabled={!total} className="flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50 disabled:opacity-60">
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </div>
                    {lastRefresh && <p className="relative mt-4 text-[11px] text-blue-200/80">Updated {timeOf(lastRefresh)}{live ? ' · refreshing every 30s' : ''}</p>}
                </header>

                {sync.message && (
                    <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        <span>{sync.message}</span>
                        <button type="button" onClick={() => setSync((s) => ({ ...s, message: '' }))} aria-label="Dismiss">
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* KPIs */}
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    <StatCard icon={Activity} label="Actions" value={(stats?.total ?? total).toLocaleString()} hint={rangeLabel} />
                    <StatCard icon={Users} label={selectedPerson ? 'Person' : 'Active people'} value={selectedPerson ? selectedPerson.label : (stats?.people ?? 0).toLocaleString()} hint={selectedPerson ? selectedPerson.sublabel?.split(' · ')[0] : viewer.canViewAll ? `of ${facets.employees.filter((e) => !e.unknown).length} staff` : 'your own work'} />
                    <StatCard icon={BriefcaseBusiness} label={selectedClient ? 'Client' : 'Clients touched'} value={selectedClient ? selectedClient.label : (stats?.clients ?? 0).toLocaleString()} hint={selectedClient ? 'filtered' : clientOptions.totalClients ? `${clientOptions.totalClients.toLocaleString()} on file · incl. deleted` : ''} />
                    <StatCard icon={Flame} label="Top area" value={topCategory?.count ? topCategory.label : '—'} hint={topCategory?.count && categoryTotal ? `${Math.round((topCategory.count / categoryTotal) * 100)}% of activity` : 'nothing in range'} />
                    <StatCard icon={Clock3} label="Latest activity" value={stats?.lastAt ? relative(stats.lastAt) : '—'} hint={stats?.lastAt ? new Date(stats.lastAt).toLocaleString() : 'nothing in range'} />
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
                            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search anything — note, keyword, proposal no., client" className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                        </label>
                        {viewer.canViewAll && <Combobox label="Person" icon={Users} placeholder="All people" value={selectedPerson} options={employeeOptions} onSelect={pickPerson} footer={`${facets.employees.length} people · count = actions in the selected range`} emptyText="No one found" />}
                        <Combobox
                            label="Client"
                            icon={BriefcaseBusiness}
                            placeholder="All clients"
                            value={selectedClient}
                            options={clientComboOptions}
                            onSelect={(option) => setClient(option ? { key: option.key, clientId: option.clientId, label: option.label } : null)}
                            onQuery={setClientQuery}
                            loading={clientsLoading}
                            footer={clientOptions.totalClients ? `${clientOptions.withActivity} with activity in range · ${clientOptions.totalClients.toLocaleString()} clients — type to search` : 'Type to search clients'}
                            emptyText="No clients match"
                        />
                        <div className="relative">
                            <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select aria-label="Action" value={action} onChange={(e) => setAction(e.target.value)} className="h-11 w-full min-w-0 appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                                <option value="">All actions</option>
                                {visibleActions.map((a) => (
                                    <option key={a.action} value={a.action}>
                                        {actionLabel(a.action)} ({a.count.toLocaleString()})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {viewer.canViewAll && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="mr-1 text-xs font-medium text-slate-500">Role</span>
                            {ROLES.filter((r) => !r.key || facets.roles?.[r.key] || role === r.key).map((r) => {
                                const count = r.key ? facets.roles?.[r.key] || 0 : Object.values(facets.roles || {}).reduce((s, n) => s + n, 0);
                                const selected = role === r.key;
                                return (
                                    <button key={r.key || 'all'} type="button" onClick={() => setRole(r.key)} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${selected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                        {r.label} <span className={`tabular-nums ${selected ? 'text-white/70' : 'text-slate-400'}`}>{count.toLocaleString()}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Area tabs */}
                    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                        <button type="button" onClick={() => setCategory('')} className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${!category ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                            <Layers size={14} /> All areas <span className={`tabular-nums ${!category ? 'text-white/70' : 'text-slate-400'}`}>{categoryTotal.toLocaleString()}</span>
                        </button>
                        {WORK_CATEGORIES.filter((c) => facets.categories?.[c.key] || category === c.key).map((c) => {
                            const Icon = CATEGORY_ICONS[c.key] || Activity;
                            const selected = category === c.key;
                            return (
                                <button
                                    key={c.key}
                                    type="button"
                                    onClick={() => {
                                        setCategory(selected ? '' : c.key);
                                        setAction('');
                                    }}
                                    className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Icon size={14} /> {c.label} <span className={`tabular-nums ${selected ? 'text-white/70' : 'text-slate-400'}`}>{(facets.categories?.[c.key] || 0).toLocaleString()}</span>
                                </button>
                            );
                        })}
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
                            {category && (
                                <button type="button" onClick={() => setCategory('')} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 hover:bg-blue-100">
                                    {WORK_CATEGORIES.find((c) => c.key === category)?.label} <X size={12} />
                                </button>
                            )}
                            {role && (
                                <button type="button" onClick={() => setRole('')} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 hover:bg-blue-100">
                                    {ROLES.find((r) => r.key === role)?.label} <X size={12} />
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

                {/* Insights */}
                <section>
                    <button type="button" onClick={() => setShowInsights((v) => !v)} className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800" aria-expanded={showInsights}>
                        <ChevronDown size={14} className={`transition ${showInsights ? '' : '-rotate-90'}`} /> Insights
                    </button>
                    {showInsights && (
                        <div className="grid gap-4 lg:grid-cols-3">
                            <Panel title="Activity over time" icon={TrendingUp} hint={`per ${facets.series?.unit || 'day'}`} className="lg:col-span-2">
                                <TrendChart series={facets.series} />
                            </Panel>
                            <Panel title={viewer.canViewAll ? 'Most active' : 'Your areas'} icon={Trophy} hint={rangeLabel}>
                                {viewer.canViewAll ? <Leaderboard people={employeeOptions} activeKey={selectedPerson?.key} onPick={pickPerson} /> : <CategoryBars counts={facets.categories} active={category} onPick={setCategory} />}
                            </Panel>
                            {viewer.canViewAll && (
                                <Panel title="Where the work goes" icon={Layers} hint="click to filter">
                                    <CategoryBars counts={facets.categories} active={category} onPick={setCategory} />
                                </Panel>
                            )}
                            <Panel title="When work happens" icon={Clock3} hint={`your time zone (${timeZone})`} className={viewer.canViewAll ? 'lg:col-span-2' : 'lg:col-span-3'}>
                                <Heatmap cells={facets.heatmap} />
                            </Panel>
                        </div>
                    )}
                </section>

                {/* Timeline */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-900">Work timeline</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Most recent first · click a name or client to focus · repeated actions are grouped</p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{total.toLocaleString()} records</span>
                    </div>

                    <div className="hidden grid-cols-[70px_minmax(180px,0.8fr)_minmax(260px,1.6fr)_minmax(180px,0.9fr)] gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:grid">
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
                                    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">New work is recorded automatically from now on. {viewer.isAdmin ? 'Import past work to bring in everything done before tracking started.' : 'Ask an admin to import past work.'}</p>
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
                                    {group.runs.map((run) => {
                                        const [first, ...rest] = run.items;
                                        const isOpen = !!openRuns[run.id];
                                        return (
                                            <li key={run.id} className="px-5 py-4 transition hover:bg-slate-50/60">
                                                {renderRow(first)}
                                                {rest.length > 0 && (
                                                    <>
                                                        <div className="mt-2 md:ml-[82px]">
                                                            <button type="button" onClick={() => setOpenRuns((p) => ({ ...p, [run.id]: !p[run.id] }))} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200" aria-expanded={isOpen}>
                                                                <Layers size={12} />
                                                                {isOpen ? 'Hide' : `+${rest.length} more like this`} · {timeOf(rest[rest.length - 1].createdAt)}–{timeOf(first.createdAt)}
                                                            </button>
                                                        </div>
                                                        {isOpen && (
                                                            <div className="-mx-2 mt-2 divide-y divide-slate-200/70 rounded-xl bg-slate-50 px-2">
                                                                {rest.map((log) => (
                                                                    <div key={log._id}>{renderRow(log, { nested: true })}</div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
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
