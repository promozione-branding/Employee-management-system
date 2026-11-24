// components/ads-dashboard/AdsUi.jsx
//
// Small presentational helpers shared by the ads dashboard.

'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, BarChart3 } from 'lucide-react';
import { costPerResult, deliveryOf, perResultLabel } from '@/lib/adsLabels';

export const pane = 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';
export const input =
    'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-blue-900';

const formatters = new Map();
export function money(value, currency, { compact = false } = {}) {
    const n = Number(value || 0);
    const code = /^[A-Z]{3}$/.test(currency || '') ? currency : '';
    const key = `${code}|${compact}`;
    if (!formatters.has(key)) {
        formatters.set(
            key,
            code
                ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: code, maximumFractionDigits: compact ? 1 : 2, minimumFractionDigits: compact ? 0 : 2, notation: compact ? 'compact' : 'standard' })
                : new Intl.NumberFormat('en-IN', { maximumFractionDigits: compact ? 1 : 2, minimumFractionDigits: compact ? 0 : 2, notation: compact ? 'compact' : 'standard' })
        );
    }
    return formatters.get(key).format(n);
}
export const int = (n) => Math.round(Number(n || 0)).toLocaleString('en-IN');
export const num1 = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 });
export const pct = (a, b) => (Number(b) ? (Number(a) / Number(b)) * 100 : 0);
export const fmtDate = (value) => {
    if (!value) return '';
    const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Adds derived metrics (CTR, CPC, cost per result) to a summed row. */
export function derive(row) {
    const spend = Number(row.spend || 0);
    const clicks = Number(row.clicks || 0);
    const impressions = Number(row.impressions || 0);
    const results = Number(row.conversions || 0);
    return { ...row, ctr: pct(clicks, impressions), cpc: clicks ? spend / clicks : 0, cpr: costPerResult(spend, results, row.resultType) };
}

export function PlatformTag({ platform }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${platform === 'google' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${platform === 'google' ? 'bg-[#3B69AD]' : 'bg-[#F27B1E]'}`} />
            {platform === 'google' ? 'Google' : 'Meta'}
        </span>
    );
}

export function Delivery({ platform, status }) {
    const d = deliveryOf(platform, status);
    return (
        <span title={d.raw || undefined} className="inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-slate-600 dark:text-slate-300">
            <span className={`h-2 w-2 rounded-full ${d.on ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {d.label}
        </span>
    );
}

/** "45" over "Messaging conversations started", like Ads Manager's Results column. */
export function Results({ value, type, platform }) {
    if (!Number(value)) return <span className="text-slate-400">—</span>;
    return (
        <span>
            <b>{num1(value)}</b>
            <span className="block text-[11px] text-slate-500">{type || (platform === 'google' ? 'Conversions' : 'Results')}</span>
        </span>
    );
}
export function CostPerResult({ row, currency }) {
    if (!row.cpr) return <span className="text-slate-400">—</span>;
    return (
        <span>
            <b className="whitespace-nowrap">{money(row.cpr, currency)}</b>
            <span className="block text-[11px] text-slate-500">{perResultLabel(row.resultType || (row.platform === 'google' ? 'Conversions' : ''))}</span>
        </span>
    );
}
export function Budget({ row, currency }) {
    if (row.budgetType === 'campaign') return <span className="text-xs text-slate-500">Using campaign budget</span>;
    if (!Number(row.budget)) return <span className="text-slate-400">—</span>;
    const label = row.budgetType === 'lifetime' ? 'Lifetime' : row.budgetType === 'adset' ? 'Ad set budgets (daily)' : 'Daily';
    return (
        <span>
            <b className="whitespace-nowrap">{money(row.budget, currency)}</b>
            <span className="block text-[11px] text-slate-500">{label}</span>
        </span>
    );
}

export function Change({ current, previous, goodWhenUp = true, days }) {
    if (!Number(previous)) return <p className="mt-1 text-[11px] text-slate-400">No data for the previous {days} days</p>;
    const change = ((Number(current) - Number(previous)) / Number(previous)) * 100;
    const up = change >= 0;
    const good = goodWhenUp === null ? null : up === goodWhenUp;
    return (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span className={`inline-flex items-center gap-0.5 font-bold ${good === null ? 'text-slate-500' : good ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                {Math.abs(change).toFixed(1)}%
            </span>
            vs previous {days} days
        </p>
    );
}

export function Empty({ loading, text, children }) {
    return (
        <div className="flex min-h-36 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-slate-400">
            <BarChart3 size={30} strokeWidth={1.4} />
            <span>{loading ? 'Loading performance data…' : text}</span>
            {children}
        </div>
    );
}

/** Sortable table state: click a header to sort, click again to flip. */
export function useSort(rows, initialKey, initialDir = -1) {
    const [sort, setSort] = useState({ key: initialKey, dir: initialDir });
    const sorted = useMemo(() => {
        const value = (row) => {
            const v = typeof sort.key === 'function' ? sort.key(row) : row[sort.key];
            return v ?? '';
        };
        return [...rows].sort((a, b) => {
            const x = value(a), y = value(b);
            const cmp = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
            return cmp * sort.dir;
        });
    }, [rows, sort]);
    const header = (key, label, { right = false, title } = {}) => (
        <th key={label} className={`px-3 py-3 whitespace-nowrap ${right ? 'text-right' : ''}`} aria-sort={sort.key === key ? (sort.dir > 0 ? 'ascending' : 'descending') : undefined} title={title}>
            <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? -s.dir : typeof rows[0]?.[key] === 'string' ? 1 : -1 }))} className={`inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white ${right ? 'flex-row-reverse' : ''}`}>
                {label}
                <span className={`text-[10px] ${sort.key === key ? 'text-orange-500' : 'opacity-0'}`}>{sort.dir > 0 ? '▲' : '▼'}</span>
            </button>
        </th>
    );
    return { sorted, header };
}

export function downloadCsv(filename, columns, rows) {
    const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [columns.map((c) => quote(c.label)).join(','), ...rows.map((row) => columns.map((c) => quote(typeof c.value === 'function' ? c.value(row) : row[c.value])).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
