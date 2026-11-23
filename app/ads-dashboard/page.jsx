// app/ads-dashboard/page.jsx

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Activity,
    ArrowDownToLine,
    BarChart3,
    CalendarDays,
    CircleDollarSign,
    MousePointerClick,
    Mail,
    MessageCircle,
    FileText,
    RefreshCw,
    Search,
    Target,
    TrendingUp,
    WalletCards,
} from 'lucide-react';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const dateValue = (date) => date.toISOString().slice(0, 10);
const money = (value, currency) => {
    const amount = Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${currency ? `${currency} ` : ''}${amount}`;
};
const metricSum = (rows, key) => rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
const pane = 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';
const input =
    'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200';

export default function AdsDashboard() {
    const [rows, setRows] = useState([]),
        [clients, setClients] = useState([]),
        [error, setError] = useState(''),
        [lastSynced, setLastSynced] = useState(null);
    const [loading, setLoading] = useState(true),
        [syncing, setSyncing] = useState(false);
    const [from, setFrom] = useState(dateValue(new Date(Date.now() - 6 * 86400000))),
        [to, setTo] = useState(dateValue(new Date(Date.now() - 86400000)));
    const [platform, setPlatform] = useState('all'),
        [clientId, setClientId] = useState(''),
        [campaignQuery, setCampaignQuery] = useState(''),
        [keywordQuery, setKeywordQuery] = useState(''),
        [detailLevel, setDetailLevel] = useState('campaign');
    const [reportAction, setReportAction] = useState('');
    const [recipient, setRecipient] = useState('');
    const [reportBusy, setReportBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ from, to, platform: platform === 'all' ? '' : platform, clientId });
            const response = await fetch(`/api/ads-dashboard?${params}`);
            const json = await response.json();
            if (!response.ok) throw new Error(json.error || 'Could not load ads performance.');
            setRows(json.rows || []);
            setClients(json.clients || []);
            setLastSynced(json.refreshedAt || null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [from, to, platform, clientId]);

    useEffect(() => {
        load();
    }, [load]);
    const campaignRows = useMemo(() => {
        const map = new Map();
        rows.filter((row) => row.level === 'campaign').forEach((row) => {
            const key = [row.platform, row.accountId, row.campaign, row.clientId].join('|');
            const item = map.get(key) || { ...row, impressions: 0, clicks: 0, spend: 0, conversions: 0, reach: 0, dates: 0 };
            item.impressions += Number(row.impressions || 0);
            item.clicks += Number(row.clicks || 0);
            item.spend += Number(row.spend || 0);
            item.conversions += Number(row.conversions || 0);
            item.reach += Number(row.reach || 0);
            item.dates += 1;
            item.ctr = item.impressions ? item.clicks / item.impressions : 0;
            item.cpc = item.clicks ? item.spend / item.clicks : 0;
            map.set(key, item);
        });
        return [...map.values()].sort((a, b) => b.spend - a.spend);
    }, [rows]);
    const totals = useMemo(
        () => ({
            spend: metricSum(campaignRows, 'spend'),
            clicks: metricSum(campaignRows, 'clicks'),
            impressions: metricSum(campaignRows, 'impressions'),
            conversions: metricSum(campaignRows, 'conversions'),
        }),
        [campaignRows]
    );
    const currency = campaignRows.find((row) => row.currency)?.currency || '';
    const selectedClient = clients.find((client) => client._id === clientId);
    const syncedAccounts = new Set(rows.map((row) => `${row.platform}:${row.accountId}`)).size;
    const platforms = useMemo(
        () =>
            ['google', 'meta'].map((name) => {
                const list = campaignRows.filter((row) => row.platform === name);
                return {
                    name,
                    spend: metricSum(list, 'spend'),
                    clicks: metricSum(list, 'clicks'),
                    impressions: metricSum(list, 'impressions'),
                    conversions: metricSum(list, 'conversions'),
                    campaigns: list.length,
                    currency: list.find((row) => row.currency)?.currency || '',
                };
            }),
        [campaignRows]
    );
    const chartRows = useMemo(() => {
        const days = new Map();
        const cursor = new Date(`${from}T00:00:00Z`);
        const rangeEnd = new Date(`${to}T00:00:00Z`);
        for (let count = 0; cursor <= rangeEnd && count < 3660; count += 1) {
            const date = cursor.toISOString().slice(0, 10);
            days.set(date, { date, googleSpend: 0, metaSpend: 0, googleConversions: 0, metaConversions: 0 });
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
        rows.filter((row) => row.level === 'campaign').forEach((row) => {
            const day = days.get(row.date) || { date: row.date, googleSpend: 0, metaSpend: 0, googleConversions: 0, metaConversions: 0 };
            day[`${row.platform}Spend`] += Number(row.spend || 0);
            day[`${row.platform}Conversions`] += Number(row.conversions || 0);
            days.set(row.date, day);
        });
        return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
    }, [rows, from, to]);
    const visibleCampaigns = useMemo(
        () =>
            campaignRows.filter(
                (row) => !campaignQuery || `${row.campaign} ${row.clientName} ${row.accountId}`.toLowerCase().includes(campaignQuery.toLowerCase())
            ),
        [campaignRows, campaignQuery]
    );
    const details = useMemo(
        () =>
            rows.filter(
                (row) =>
                    (detailLevel === 'all' || row.level === detailLevel) &&
                    (!keywordQuery ||
                        `${row.keyword} ${row.entity} ${row.campaign} ${row.adGroup} ${row.clientName} ${row.accountId}`
                            .toLowerCase()
                            .includes(keywordQuery.toLowerCase()))
            ),
        [rows, detailLevel, keywordQuery]
    );
    const sync = async () => {
        setSyncing(true);
        setError('');
        try {
            const response = await fetch('/api/ads-dashboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from, to }),
                signal: AbortSignal.timeout(270000),
            });
            const json = await response.json();
            if (!response.ok) throw new Error(json.error || 'Sync failed.');
            const syncMessage = json.errors?.length
                ? `${json.saved} records saved; ${json.errors.length} account issue(s). ${json.errors[0].platform || ''} ${json.errors[0].accountId || ''}: ${json.errors[0].error || 'Sync failed.'}`
                : !json.accountsDiscovered?.google && !json.accountsDiscovered?.meta
                  ? 'No ad accounts were found. Check the connections in Reports → Discover, or assign accounts to clients there, then sync again.'
                  : '';
            await load();
            if (syncMessage) setError(syncMessage);
        } catch (err) {
            setError(err.message);
        } finally {
            setSyncing(false);
        }
    };
    const exportCsv = () => {
        const columns = [
            'date',
            'clientName',
            'platform',
            'accountId',
            'level',
            'campaign',
            'adGroup',
            'entity',
            'keyword',
            'productId',
            'productBrand',
            'productType',
            'status',
            'currency',
            'impressions',
            'clicks',
            'spend',
            'cpc',
            'ctr',
            'conversions',
        ];
        const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
        const csv = [columns.join(','), ...details.map((row) => columns.map((key) => quote(row[key])).join(','))].join('\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        link.download = `ads-performance-${from}-to-${to}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };
    const reportUrl = () => `/api/ads-dashboard/report?${new URLSearchParams({ from, to, platform: platform === 'all' ? 'all' : platform, clientId })}`;
    const downloadReport = async () => {
        const response = await fetch(reportUrl());
        if (!response.ok) throw new Error(await response.text());
        const url = URL.createObjectURL(await response.blob());
        const link = document.createElement('a');
        link.href = url;
        link.download = `ads-report-${from}-to-${to}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };
    const submitReport = async () => {
        if (!recipient.trim()) return;
        setReportBusy(true);
        setError('');
        try {
            if (reportAction === 'email') {
                const response = await fetch('/api/ads-dashboard/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to, platform, clientId, recipient: recipient.trim() }) });
                const json = await response.json();
                if (!response.ok) throw new Error(json.error || 'Could not email the report.');
            } else {
                // Web WhatsApp cannot attach a local PDF from a regular page.
                // Download the PDF and open the chat with a prepared message.
                await downloadReport();
                const phone = recipient.replace(/\D/g, '');
                const name = selectedClient?.name || 'all clients';
                const text = encodeURIComponent(`Ads performance report for ${name} (${from} to ${to}). Please find the attached PDF report.`);
                window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
            }
            setReportAction('');
            setRecipient('');
        } catch (err) {
            setError(err.message);
        } finally {
            setReportBusy(false);
        }
    };
    const chooseRange = (days) => {
        setFrom(dateValue(new Date(Date.now() - days * 86400000)));
        setTo(dateValue(new Date(Date.now() - 86400000)));
    };
    const avgCpc = totals.clicks ? totals.spend / totals.clicks : 0;
    const cards = [
        {
            title: 'Ad spend',
            value: money(totals.spend, currency),
            note: 'Across connected campaigns',
            Icon: CircleDollarSign,
            tint: 'bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300',
        },
        {
            title: 'Impressions',
            value: totals.impressions.toLocaleString('en-IN'),
            note: 'Ads displayed',
            Icon: BarChart3,
            tint: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
        },
        {
            title: 'Clicks',
            value: totals.clicks.toLocaleString('en-IN'),
            note: `Average CPC ${money(avgCpc, currency)}`,
            Icon: MousePointerClick,
            tint: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
        },
        {
            title: 'Conversions',
            value: totals.conversions.toLocaleString('en-IN', { maximumFractionDigits: 1 }),
            note: 'Reported by ad platforms',
            Icon: Target,
            tint: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
        },
    ];

    return (
        <main className="min-h-full bg-slate-50 px-4 py-6 text-slate-900 md:px-7 lg:px-9 dark:bg-[#0a1222] dark:text-slate-100">
            <div className="mx-auto max-w-[1600px] space-y-5">
                <section className="relative overflow-hidden rounded-3xl bg-[#0A2E66] px-6 py-7 text-white shadow-lg md:px-8 md:py-8">
                    <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(59,105,173,.65),transparent_65%)] md:block" />
                    <div className="relative flex flex-wrap items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[.18em] text-orange-200">
                                <Activity size={16} /> PERFORMANCE CENTER
                            </div>
                            <h1 className="font-serif text-3xl font-black tracking-tight md:text-4xl">
                                Ads performance
                                {selectedClient ? (
                                    <span className="mt-2 block text-xl font-bold text-orange-200">
                                        {selectedClient.name.replace(/ · (Google Ads|Meta Ads account)$/, '')}
                                    </span>
                                ) : null}
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                                {selectedClient
                                    ? `Performance for ${selectedClient.name.replace(/ · (Google Ads|Meta Ads account)$/, '')}.`
                                    : 'A live view of Google Ads and Meta Ads data across connected client accounts.'}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                                    {campaignRows.length} campaigns
                                </span>
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                                    {clients.length} report clients/accounts
                                </span>
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                                    {syncedAccounts} ad accounts with saved data
                                </span>
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                                    {chartRows.filter((day) => day.googleSpend || day.metaSpend).length} days with activity
                                </span>
                            </div>
                        </div>
                        <div className="relative flex flex-wrap items-center gap-3">
                            <button
                                onClick={sync}
                                disabled={syncing}
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#F27B1E] px-4 text-sm font-bold text-white shadow-md transition hover:bg-orange-500 disabled:opacity-60"
                            >
                                <RefreshCw size={17} className={syncing ? 'animate-spin' : ''} />
                                {syncing ? 'Syncing accounts…' : 'Sync ad data'}
                            </button>
                            {syncing && (
                                <span className="max-w-48 text-xs text-blue-100">
                                    Fetching accounts in the background. Saved results appear as each account completes.
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                <section className={`${pane} flex flex-wrap items-center gap-3 p-4`}>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                        <CalendarDays size={17} className="text-orange-500" /> Date range
                    </div>
                    <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                        {[7, 30].map((days) => (
                            <button
                                key={days}
                                onClick={() => chooseRange(days)}
                                className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                {days} days
                            </button>
                        ))}
                    </div>
                    <input aria-label="Start date" className={input} type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
                    <span className="text-slate-400">to</span>
                    <input
                        aria-label="End date"
                        className={input}
                        type="date"
                        value={to}
                        min={from}
                        max={dateValue(new Date())}
                        onChange={(e) => setTo(e.target.value)}
                    />
                    <select
                        aria-label="Filter by client or ad account"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className={`${input} min-w-52`}
                    >
                        <option value="">All clients and accounts</option>
                        {clients.map((client) => (
                            <option key={client._id} value={client._id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                    <select aria-label="Filter by platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className={input}>
                        <option value="all">Google + Meta</option>
                        <option value="google">Google Ads</option>
                        <option value="meta">Meta Ads</option>
                    </select>
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => window.open(reportUrl(), '_blank', 'noopener,noreferrer')} title="View PDF report" aria-label="View PDF report" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><FileText size={17} /></button>
                        <button type="button" onClick={() => { setReportAction('whatsapp'); setRecipient(''); }} title="Send report on WhatsApp" aria-label="Send report on WhatsApp" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-slate-800"><MessageCircle size={17} /></button>
                        <button type="button" onClick={() => { setReportAction('email'); setRecipient(''); }} title="Email PDF report" aria-label="Email PDF report" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-blue-600 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800"><Mail size={17} /></button>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {syncing
                            ? 'Fetching latest account data…'
                            : loading
                              ? 'Updating view…'
                              : lastSynced
                                ? `Data last saved ${new Date(lastSynced).toLocaleString()}`
                                : 'No saved data yet'}
                    </div>
                </section>

                {error && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                        {error}
                    </div>
                )}

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map(({ title, value, note, Icon, tint }) => (
                        <article key={title} className={`${pane} p-5 transition hover:-translate-y-0.5 hover:shadow-md`}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</span>
                                <span className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}>
                                    <Icon size={19} />
                                </span>
                            </div>
                            <div className="mt-4 text-2xl font-black tracking-tight">{value}</div>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{note}</p>
                        </article>
                    ))}
                </section>

                <section className="grid gap-5 xl:grid-cols-2">
                    <PlatformChart
                        title="Google Ads"
                        subtitle="Daily Google spend and conversions"
                        data={chartRows}
                        spendKey="googleSpend"
                        conversionKey="googleConversions"
                        currency={platforms[0].currency || currency}
                        color="#3B69AD"
                        loading={loading}
                    />
                    <PlatformChart
                        title="Meta Ads"
                        subtitle="Daily Meta spend and conversions"
                        data={chartRows}
                        spendKey="metaSpend"
                        conversionKey="metaConversions"
                        currency={platforms[1].currency || currency}
                        color="#F27B1E"
                        loading={loading}
                    />
                </section>
                <section className={`${pane} grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4`}>
                    {platforms.map((item) => (
                        <div key={item.name} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
                            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                                <span className={`h-2.5 w-2.5 rounded-full ${item.name === 'google' ? 'bg-[#3B69AD]' : 'bg-[#F27B1E]'}`} />
                                {item.name === 'google' ? 'Google Ads' : 'Meta Ads'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Spend</div>
                            <b className="block text-lg">{money(item.spend, item.currency || currency)}</b>
                            <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>{item.clicks.toLocaleString('en-IN')} clicks</span>
                                <span>{item.conversions.toLocaleString('en-IN', { maximumFractionDigits: 1 })} conversions</span>
                            </div>
                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                Average CPC{' '}
                                <b className="text-slate-800 dark:text-slate-200">
                                    {money(item.clicks ? item.spend / item.clicks : 0, item.currency || currency)}
                                </b>
                            </div>
                        </div>
                    ))}
                </section>

                <section className={`${pane} flex h-[90vh] flex-col overflow-hidden`}>
                    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
                        <div className="mr-auto">
                            <h2 className="font-serif text-lg font-black">Campaign performance</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Aggregated campaign metrics · {from} to {to}
                            </p>
                        </div>
                        <button
                            onClick={exportCsv}
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <ArrowDownToLine size={16} /> Export
                        </button>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
                        <label className="relative w-full max-w-md">
                            <Search size={16} className="absolute top-3 left-3 text-slate-400" />
                            <input
                                value={campaignQuery}
                                onChange={(e) => setCampaignQuery(e.target.value)}
                                placeholder="Search campaign, client or account"
                                className={`${input} w-full pl-9`}
                            />
                        </label>
                        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">{visibleCampaigns.length} campaigns</span>
                    </div>
                    <div className="min-h-0 flex-1 overflow-auto">
                        <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                            <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-bold text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    {['Platform', 'Campaign / client', 'Status', 'Impressions', 'Clicks', 'Spend', 'Avg. CPC', 'CTR', 'Conversions'].map(
                                        (label) => (
                                            <th key={label} className="px-4 py-3 whitespace-nowrap">
                                                {label}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {visibleCampaigns.map((row) => (
                                    <tr
                                        key={`${row.platform}-${row.accountId}-${row.entityId}-${row.clientId}`}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.platform === 'google' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300'}`}
                                            >
                                                {row.platform === 'google' ? 'Google' : 'Meta'}
                                            </span>
                                        </td>
                                        <td className="max-w-72 px-4 py-3">
                                            <b className="block truncate" title={row.campaign}>
                                                {row.campaign || 'Unnamed campaign'}
                                            </b>
                                            <span className="block truncate text-xs text-slate-500">
                                                {row.clientName} · {row.accountId}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                <span
                                                    className={`h-2 w-2 rounded-full ${/PAUSED|OFF|ARCHIVED/i.test(row.status) ? 'bg-slate-400' : 'bg-emerald-500'}`}
                                                />
                                                {row.status ? row.status.toLowerCase().replaceAll('_', ' ') : 'Reported'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{row.impressions.toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3">{row.clicks.toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3 font-semibold whitespace-nowrap">{money(row.spend, row.currency || currency)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{money(row.cpc, row.currency || currency)}</td>
                                        <td className="px-4 py-3">{(row.ctr * 100).toFixed(2)}%</td>
                                        <td className="px-4 py-3">{row.conversions.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td>
                                    </tr>
                                ))}
                                {!loading && visibleCampaigns.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-5 py-12">
                                            <Empty text="No campaign records match these filters." />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-slate-800">
                        <span>
                            {visibleCampaigns.length} campaigns · {rows.length} daily records
                        </span>
                        <span>Spend totals use campaign rows to prevent counting ad breakdowns twice.</span>
                    </div>
                </section>

                <section className={`${pane} flex h-[90vh] flex-col overflow-hidden`}>
                    <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
                        <div className="mr-auto">
                            <h2 className="font-serif text-lg font-black">Daily account breakdown</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Campaign, ad group, ad and keyword rows, including date. Child levels repeat the same spend as their parent; use campaign rows
                                for totals.
                            </p>
                        </div>
                        <select value={detailLevel} onChange={(e) => setDetailLevel(e.target.value)} className={input}>
                            <option value="campaign">Campaign totals</option>
                            <option value="all">All data levels</option>
                            {['ad_group', 'ad_set', 'ad', 'keyword'].map((value) => (
                                <option key={value} value={value}>
                                    {value.replace('_', ' ')}
                                </option>
                            ))}
                            <option value="shopping_product">Shopping / PMax products</option>
                        </select>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
                        <label className="relative w-full max-w-md">
                            <Search size={16} className="absolute top-3 left-3 text-slate-400" />
                            <input
                                value={keywordQuery}
                                onChange={(e) => setKeywordQuery(e.target.value)}
                                placeholder="Search keyword, ad, campaign or client"
                                className={`${input} w-full pl-9`}
                            />
                        </label>
                        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">{details.length} rows</span>
                    </div>
                    <div className="min-h-0 flex-1 overflow-auto">
                        <table className="w-full min-w-[1300px] border-collapse text-left text-sm">
                            <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-bold text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    {[
                                        'Date',
                                        'Client',
                                        'Platform',
                                        'Level',
                                        'Campaign',
                                        'Ad group',
                                'Ad / keyword / product',
                                        'Impressions',
                                        'Reach',
                                        'Clicks',
                                        'Spend',
                                        'CPC',
                                        'Conversions',
                                    ].map((label) => (
                                        <th key={label} className="px-4 py-3 whitespace-nowrap">
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {details.map((row) => (
                                    <tr key={row._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-500">{row.date}</td>
                                        <td className="max-w-40 truncate px-4 py-3">{row.clientName}</td>
                                        <td className="px-4 py-3 capitalize">{row.platform}</td>
                                        <td className="px-4 py-3 capitalize">{row.level.replace('_', ' ')}</td>
                                        <td className="max-w-48 truncate px-4 py-3" title={row.campaign}>
                                            {row.campaign || '—'}
                                        </td>
                                        <td className="max-w-40 truncate px-4 py-3" title={row.adGroup}>
                                            {row.adGroup || '—'}
                                        </td>
                                        <td className="max-w-52 truncate px-4 py-3" title={row.keyword || row.entity}>
                                            {row.keyword || row.entity || '—'}
                                            {row.level === 'shopping_product' && <span className="mt-1 block text-[11px] text-blue-600 dark:text-blue-300">Shopping / Performance Max{row.productId ? ` · ID ${row.productId}` : ''}{row.productBrand ? ` · ${row.productBrand}` : ''}{row.productType ? ` · ${row.productType}` : ''}</span>}
                                        </td>
                                        <td className="px-4 py-3">{Number(row.impressions || 0).toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3">{row.platform === 'meta' ? Number(row.reach || 0).toLocaleString('en-IN') : '—'}</td>
                                        <td className="px-4 py-3">{Number(row.clicks || 0).toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{money(row.spend, row.currency || currency)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{money(row.cpc, row.currency || currency)}</td>
                                        <td className="px-4 py-3">{Number(row.conversions || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td>
                                    </tr>
                                ))}
                                {!loading && details.length === 0 && (
                                    <tr>
                                        <td colSpan={13} className="px-5 py-10 text-center text-sm text-slate-500">
                                            No detailed data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                <p className="px-1 pb-4 text-xs text-slate-400">Metrics reflect the fields available from each platform and the selected accounts.</p>
            </div>
            {reportAction && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !reportBusy) setReportAction(''); }}>
                <section role="dialog" aria-modal="true" aria-labelledby="ads-report-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                    <h2 id="ads-report-title" className="text-lg font-bold">{reportAction === 'email' ? 'Email PDF report' : 'Share report on WhatsApp'}</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedClient?.name || 'All clients'} · {from} to {to} · {platform === 'all' ? 'Google + Meta' : platform === 'google' ? 'Google Ads' : 'Meta Ads'}</p>
                    {reportAction === 'whatsapp' && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">The PDF will download first. WhatsApp opens with a prepared message; attach the downloaded PDF in the chat.</p>}
                    <label className="mt-5 block text-sm font-semibold" htmlFor="report-recipient">{reportAction === 'email' ? 'Recipient email' : 'WhatsApp number with country code'}</label>
                    <input id="report-recipient" autoFocus value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder={reportAction === 'email' ? 'name@example.com' : '919876543210'} className={`${input} mt-2 w-full`} />
                    <div className="mt-5 flex justify-end gap-2">
                        <button type="button" disabled={reportBusy} onClick={() => setReportAction('')} className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                        <button type="button" disabled={reportBusy || !recipient.trim()} onClick={submitReport} className="h-10 rounded-xl bg-[#0A2E66] px-4 text-sm font-bold text-white disabled:opacity-50">{reportBusy ? 'Preparing…' : reportAction === 'email' ? 'Generate and send' : 'Generate and continue'}</button>
                    </div>
                </section>
            </div>}
            <style jsx global>{`
                :root {
                    --chart-grid: #e2e8f0;
                }
                .dark {
                    --chart-grid: #26354d;
                }
            `}</style>
        </main>
    );
}

function PlatformChart({ title, subtitle, data, spendKey, conversionKey, currency, color, loading }) {
    const chartData = useMemo(() => {
        if (data.length <= 45) return data;
        const weeks = new Map();
        data.forEach((row) => {
            const day = new Date(`${row.date}T00:00:00Z`);
            day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
            const key = day.toISOString().slice(0, 10);
            const bucket = weeks.get(key) || { ...row, date: key, [spendKey]: 0, [conversionKey]: 0 };
            bucket[spendKey] += Number(row[spendKey] || 0);
            bucket[conversionKey] += Number(row[conversionKey] || 0);
            weeks.set(key, bucket);
        });
        return [...weeks.values()];
    }, [data, spendKey, conversionKey]);
    const hasResults = chartData.some((row) => Number(row[spendKey] || 0) || Number(row[conversionKey] || 0));
    return (
        <article className={`${pane} p-5`}>
            <div className="mb-4 flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ color, background: `${color}18` }}>
                    <TrendingUp size={19} />
                </span>
                <div>
                    <h2 className="font-serif text-lg font-black">{title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{data.length > 45 ? 'Weekly totals · ' : ''}{subtitle}</p>
                </div>
            </div>
            {hasResults ? (
                <div className="h-[330px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 14, right: 24, left: 18, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid,#e2e8f0)" />
                            <XAxis
                                dataKey="date"
                                interval="preserveStartEnd"
                                minTickGap={28}
                                tickFormatter={(value) => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                yAxisId="spend"
                                tickFormatter={(value) => Number(value).toLocaleString('en-IN')}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                width={58}
                                label={{ value: `Spend${currency ? ` (${currency})` : ''}`, angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                            />
                            <YAxis
                                yAxisId="conversions"
                                orientation="right"
                                allowDecimals
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                width={42}
                                label={{ value: 'Conversions', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }}
                                labelFormatter={(value) => `Date: ${value}`}
                                formatter={(value, name) => (name === 'Spend' ? [money(value, currency), name] : [Number(value).toLocaleString('en-IN'), name])}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                            <Bar yAxisId="spend" dataKey={spendKey} name="Spend" fill={color} radius={[4, 4, 0, 0]} maxBarSize={30} />
                            <Line
                                yAxisId="conversions"
                                dataKey={conversionKey}
                                name="Conversions"
                                type="monotone"
                                stroke="#17845A"
                                strokeWidth={2.5}
                                dot={{ r: 3, fill: '#17845A' }}
                                activeDot={{ r: 5 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <Empty loading={loading} text={`No ${title} performance data for this date range.`} />
            )}
        </article>
    );
}

function Empty({ loading, text }) {
    return (
        <div className="flex min-h-36 flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
            <BarChart3 size={30} strokeWidth={1.4} />
            <span>{loading ? 'Loading performance data…' : text}</span>
        </div>
    );
}
