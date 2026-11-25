// app/ads-dashboard/page.jsx
//
// Ads performance centre: Google Ads + Meta Ads for every client, with Ads
// Manager-style columns (Results, Cost per result, Budget, Ends, Bid strategy,
// Attribution), ad copy & creatives, Ad Library / Transparency Center links,
// a timeline, and the existing PDF / WhatsApp / email reports.

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Activity, BarChart3, Building2, CalendarDays, CircleDollarSign, Copy, ExternalLink, FileText, History, Image as ImageIcon, KeyRound, Layers,
    List, Mail, Megaphone, MessageCircle, MousePointerClick, RefreshCw, Search, ShoppingCart, Table2, Target, Wallet,
} from 'lucide-react';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { campaignType, costPerResult, deliveryOf, perResultLabel, reportFileName, transparencyLinks, websiteDomains } from '@/lib/adsLabels';
import { Change, Empty, derive, fmtDate, input, int, money, num1, pane, pct } from '@/components/ads-dashboard/AdsUi';
import { AdsTab, CampaignsTab, GroupsTab, KeywordsTab, ProductsTab, RawTab, TimelineTab } from '@/components/ads-dashboard/AdsTabs';

// Local-time YYYY-MM-DD (toISOString would shift the day for IST users after midnight UTC).
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return ymd(d);
};
const RANGES = [
    { key: '1', label: 'Yesterday', range: () => [daysAgo(1), daysAgo(1)] },
    { key: '7', label: '7 days', range: () => [daysAgo(7), daysAgo(1)], period: 'weekly' },
    { key: '14', label: '14 days', range: () => [daysAgo(14), daysAgo(1)] },
    { key: '30', label: '30 days', range: () => [daysAgo(30), daysAgo(1)], period: 'monthly' },
    { key: 'month', label: 'This month', range: () => { const d = new Date(); return [ymd(new Date(d.getFullYear(), d.getMonth(), 1)), ymd(d)]; }, period: 'monthly' },
    { key: 'lastmonth', label: 'Last month', range: () => { const d = new Date(); return [ymd(new Date(d.getFullYear(), d.getMonth() - 1, 1)), ymd(new Date(d.getFullYear(), d.getMonth(), 0))]; }, period: 'monthly' },
    { key: 'custom', label: 'Custom' },
];
const cleanName = (name) => (name || 'All clients').replace(/ · (Google Ads|Meta Ads account)$/, '');
const fmtGoogleId = (id) => String(id).replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');

export default function AdsDashboard() {
    const [rangeKey, setRangeKey] = useState('7');
    const [from, setFrom] = useState(daysAgo(7));
    const [to, setTo] = useState(daysAgo(1));
    const [platform, setPlatform] = useState('all');
    const [clientId, setClientId] = useState('');
    const [clientQuery, setClientQuery] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [tab, setTab] = useState('campaigns');
    const [typeFilter, setTypeFilter] = useState('');
    const [showDayTable, setShowDayTable] = useState(false);
    const [reportPeriod, setReportPeriod] = useState('weekly');
    const [reportAction, setReportAction] = useState('');
    const [recipient, setRecipient] = useState('');
    const [reportBusy, setReportBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ from, to, platform: platform === 'all' ? '' : platform, clientId });
            const response = await fetch(`/api/ads-dashboard/overview?${params}`);
            const json = await response.json();
            if (!response.ok) throw new Error(json.error || 'Could not load ads performance.');
            setData(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [from, to, platform, clientId]);

    useEffect(() => {
        load();
    }, [load]);

    const pickRange = (key) => {
        setRangeKey(key);
        const preset = RANGES.find((r) => r.key === key);
        if (preset?.range) {
            const [f, t] = preset.range();
            setFrom(f);
            setTo(t);
        }
        setReportPeriod(preset?.period || '');
    };
    const pickClient = (id) => {
        setClientId(id);
        setTypeFilter('');
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clients = useMemo(() => data?.clients || [], [data]);
    const summaries = useMemo(() => data?.clientSummaries || {}, [data]);
    const selected = clients.find((c) => c._id === clientId);
    const showClient = !clientId;
    const campaigns = useMemo(() => (data?.campaigns || []).map(derive), [data]);
    const groups = useMemo(() => (data?.groups || []).map(derive), [data]);
    const ads = useMemo(() => (data?.ads || []).map(derive), [data]);
    const keywords = useMemo(() => (data?.keywords || []).map(derive), [data]);
    const products = useMemo(() => (data?.products || []).map(derive), [data]);
    const creatives = useMemo(() => data?.creatives || [], [data]);
    const totals = data?.totals?.all || { spend: 0, clicks: 0, impressions: 0, conversions: 0, reach: 0 };
    const prev = data?.prevTotals?.all || {};
    const currency = data?.totals?.all?.currency || campaigns.find((c) => c.currency)?.currency || '';
    const days = data?.days || 7;
    const resultTypes = [...new Set(campaigns.filter((c) => c.conversions > 0).map((c) => c.resultType || (c.platform === 'google' ? 'Conversions' : '')).filter(Boolean))];
    const resultLabel = resultTypes.length === 1 ? resultTypes[0] : 'Results';
    const reportClientName = cleanName(selected?.name);
    const fileBase = `ads-${reportClientName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${from}-to-${to}`;

    const sortedClients = useMemo(() => {
        const q = clientQuery.trim().toLowerCase();
        return clients
            .filter((c) => !q || `${c.name} ${(c.googleAdsCustomerIds || []).join(' ')} ${(c.metaAdAccountIds || []).join(' ')}`.toLowerCase().includes(q))
            .sort((a, b) => (summaries[b._id]?.spend || 0) - (summaries[a._id]?.spend || 0) || a.name.localeCompare(b.name));
    }, [clients, clientQuery, summaries]);

    const running = useMemo(() => {
        const map = new Map();
        for (const c of campaigns) {
            const type = campaignType(c);
            const item = map.get(type) || { type, platform: c.platform, total: 0, live: 0, spend: 0, conversions: 0, clicks: 0, impressions: 0, resultTypes: new Set(), currency: c.currency };
            item.total += 1;
            if (deliveryOf(c.platform, c.status).on) item.live += 1;
            item.spend += c.spend;
            item.conversions += c.conversions;
            item.clicks += c.clicks;
            item.impressions += c.impressions;
            if (c.resultType) item.resultTypes.add(c.resultType);
            map.set(type, item);
        }
        return [...map.values()].sort((a, b) => b.spend - a.spend);
    }, [campaigns]);

    const liveBudgets = useMemo(() => {
        const out = { google: 0, meta: 0 };
        for (const c of campaigns) if (deliveryOf(c.platform, c.status).on && ['daily', 'adset'].includes(c.budgetType)) out[c.platform] += Number(c.budget || 0);
        return out;
    }, [campaigns]);

    const chartRows = useMemo(() => {
        const map = new Map();
        const cursor = new Date(`${from}T00:00:00`);
        const end = new Date(`${to}T00:00:00`);
        for (let i = 0; cursor <= end && i < 400; i += 1) {
            const date = ymd(cursor);
            map.set(date, { date, googleSpend: 0, metaSpend: 0, results: 0, clicks: 0, impressions: 0, spend: 0 });
            cursor.setDate(cursor.getDate() + 1);
        }
        for (const d of data?.daily || []) {
            const row = map.get(d.date) || { date: d.date, googleSpend: 0, metaSpend: 0, results: 0, clicks: 0, impressions: 0, spend: 0 };
            row[`${d.platform}Spend`] += d.spend;
            row.spend += d.spend;
            row.results += d.conversions;
            row.clicks += d.clicks;
            row.impressions += d.impressions;
            map.set(d.date, row);
        }
        return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
    }, [data, from, to]);

    const sync = async () => {
        setSyncing(true);
        setError('');
        setNotice('');
        try {
            const response = await fetch('/api/ads-dashboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to }), signal: AbortSignal.timeout(270000) });
            const json = await response.json();
            if (!response.ok) throw new Error(json.error || 'Sync failed.');
            await load();
            if (json.errors?.length) setError(`${int(json.saved)} records saved; ${json.errors.length} account issue(s). ${json.errors[0].platform || ''} ${json.errors[0].accountId || ''}: ${json.errors[0].error || 'Sync failed.'}`);
            else if (!json.accountsDiscovered?.google && !json.accountsDiscovered?.meta) setError('No ad accounts were found. Check the connections in Reports → Discover, or assign accounts to clients there, then sync again.');
            else setNotice(`Synced ${json.accountsSynced?.google || 0} Google and ${json.accountsSynced?.meta || 0} Meta accounts.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSyncing(false);
        }
    };

    // ── Reports (unchanged behaviour) ──
    const reportUrl = () => `/api/ads-dashboard/report?${new URLSearchParams({ from, to, platform: platform === 'all' ? 'all' : platform, clientId, period: reportPeriod })}`;
    const submitReport = async () => {
        if (!recipient.trim()) return;
        setReportBusy(true);
        setError('');
        try {
            if (reportAction === 'email') {
                const response = await fetch('/api/ads-dashboard/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'email', from, to, platform, clientId, period: reportPeriod, recipient: recipient.trim() }) });
                const json = await response.json();
                if (!response.ok) throw new Error(json.error || 'Could not email the report.');
                setNotice(`Report emailed to ${recipient.trim()}.`);
            } else {
                const response = await fetch('/api/ads-dashboard/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'whatsapp', from, to, platform, clientId, period: reportPeriod, recipient: recipient.trim() }) });
                if (!response.ok) {
                    const json = await response.json().catch(() => ({}));
                    throw new Error(json.error || 'Could not prepare the WhatsApp report.');
                }
                const url = URL.createObjectURL(await response.blob());
                const link = document.createElement('a');
                link.href = url;
                link.download = reportFileName(reportClientName, from, to);
                link.click();
                URL.revokeObjectURL(url);
                const phone = recipient.replace(/\D/g, '');
                const label = reportPeriod === 'monthly' ? 'Monthly' : 'Weekly';
                const text = encodeURIComponent(`${label} ads performance report for ${reportClientName} (${from} to ${to}). Please find the attached PDF report.`);
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

    // Download (not just open) so the file is saved as "<Client> - <from> to <to>.pdf".
    const downloadPdf = async () => {
        setReportBusy(true);
        setError('');
        try {
            const response = await fetch(reportUrl());
            if (!response.ok) throw new Error((await response.text().catch(() => '')) || 'Could not generate the PDF report.');
            const url = URL.createObjectURL(await response.blob());
            const link = document.createElement('a');
            link.href = url;
            link.download = reportFileName(reportClientName, from, to);
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setReportBusy(false);
        }
    };

    const copy = (value, label) => {
        navigator.clipboard?.writeText(String(value)).then(() => setNotice(`${label} copied.`)).catch(() => {});
    };

    const cpr = costPerResult(totals.spend, totals.conversions, resultTypes.length === 1 ? resultTypes[0] : '');
    const prevCpr = costPerResult(prev.spend || 0, prev.conversions || 0, resultTypes.length === 1 ? resultTypes[0] : '');
    const kpis = [
        { title: 'Amount spent', value: money(totals.spend, currency), cur: totals.spend, prev: prev.spend, good: null, Icon: CircleDollarSign, tint: 'bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300' },
        { title: resultLabel, value: num1(totals.conversions), cur: totals.conversions, prev: prev.conversions, good: true, Icon: Target, tint: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', note: resultTypes.length > 1 ? resultTypes.join(' + ') : '' },
        { title: 'Cost per result', value: totals.conversions ? money(cpr, currency) : '—', cur: cpr, prev: prevCpr, good: false, Icon: Wallet, tint: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300', note: resultTypes.length === 1 ? perResultLabel(resultTypes[0]) : resultTypes.length > 1 ? 'Mixed result types' : '' },
        { title: 'Impressions', value: int(totals.impressions), cur: totals.impressions, prev: prev.impressions, good: true, Icon: BarChart3, tint: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300', note: totals.reach ? `Meta reach ${int(totals.reach)} (daily, summed)` : '' },
        { title: 'Clicks', value: int(totals.clicks), cur: totals.clicks, prev: prev.clicks, good: true, Icon: MousePointerClick, tint: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300', note: `CTR ${pct(totals.clicks, totals.impressions).toFixed(2)}%` },
        { title: 'Avg. CPC', value: totals.clicks ? money(totals.spend / totals.clicks, currency) : '—', cur: totals.clicks ? totals.spend / totals.clicks : 0, prev: prev.clicks ? prev.spend / prev.clicks : 0, good: false, Icon: Wallet, tint: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    ];

    const links = selected ? transparencyLinks({ name: cleanName(selected.name), websites: selected.websites || [], metaPageIds: selected.metaPageIds || [] }) : null;
    const hasGoogle = selected && ((selected.googleAdsCustomerIds || []).length || summaries[selected._id]?.platforms?.includes('google'));
    const hasMeta = selected && ((selected.metaAdAccountIds || []).length || summaries[selected._id]?.platforms?.includes('meta'));

    const TABS = [
        ['campaigns', 'Campaigns', Megaphone, campaigns.length],
        ['groups', 'Ad sets & ad groups', Layers, groups.length],
        ['ads', 'Ads & creatives', ImageIcon, Math.max(creatives.length, ads.length)],
        ['keywords', 'Keywords', KeyRound, keywords.length],
        ['products', 'Products', ShoppingCart, products.length],
        ['timeline', 'Timeline', History, null],
        ['raw', 'Daily rows', Table2, null],
    ];

    return (
        <main className="min-h-full bg-slate-50 px-4 py-6 text-slate-900 md:px-6 lg:px-8 dark:bg-[#0a1222] dark:text-slate-100">
            <div className="mx-auto grid max-w-[1700px] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                {/* ── Client list ── */}
                <aside className={`${pane} hidden max-h-[calc(100vh-3rem)] flex-col p-4 lg:sticky lg:top-6 lg:flex`} aria-label="Clients">
                    <h2 className="font-serif text-lg font-black">Clients</h2>
                    <p className="text-xs text-slate-500">{clients.length} clients and ad accounts</p>
                    <label className="relative mt-3">
                        <span className="sr-only">Find a client</span>
                        <Search size={15} className="absolute top-3 left-3 text-slate-400" />
                        <input value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} placeholder="Find a client or account ID" className={`${input} w-full pl-9`} />
                    </label>
                    <div className="-mx-2 mt-3 flex-1 space-y-1 overflow-auto px-2">
                        <ClientButton active={!clientId} onClick={() => pickClient('')} name="All clients" sub={`${money(Object.values(summaries).reduce((a, s) => a + s.spend, 0), currency, { compact: true })} in this range`} platforms={['google', 'meta']} />
                        {sortedClients.map((c) => {
                            const s = summaries[c._id];
                            return (
                                <ClientButton
                                    key={c._id}
                                    active={clientId === c._id}
                                    onClick={() => pickClient(c._id)}
                                    name={cleanName(c.name)}
                                    sub={`${s ? `${money(s.spend, s.currency || currency, { compact: true })} spent${s.conversions ? ` · ${num1(s.conversions)} results` : ''}` : 'No spend in this range'}${c.kind === 'account' ? ' · not linked to a client' : ''}`}
                                    platforms={s?.platforms || (c.platform ? [c.platform] : [])}
                                    dim={!s}
                                />
                            );
                        })}
                    </div>
                </aside>

                <div className="min-w-0 space-y-5">
                    <label className="lg:hidden">
                        <span className="sr-only">Client</span>
                        <select value={clientId} onChange={(e) => pickClient(e.target.value)} className={`${input} h-12 w-full font-bold`}>
                            <option value="">All clients and accounts</option>
                            {sortedClients.map((c) => <option key={c._id} value={c._id}>{cleanName(c.name)}{c.kind === 'account' ? ` (${c.platform === 'google' ? 'Google' : 'Meta'} account)` : ''}</option>)}
                        </select>
                    </label>

                    {/* ── Header ── */}
                    <section className="relative overflow-hidden rounded-3xl bg-[#0A2E66] px-6 py-7 text-white shadow-lg md:px-8">
                        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(59,105,173,.65),transparent_65%)] md:block" />
                        <div className="relative flex flex-wrap items-start justify-between gap-6">
                            <div className="min-w-0 max-w-3xl">
                                <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[.18em] text-orange-200"><Activity size={16} /> PERFORMANCE CENTER</div>
                                <h1 className="font-serif text-3xl font-black tracking-tight md:text-4xl">{selected ? cleanName(selected.name) : 'All clients'}</h1>
                                <p className="mt-2 text-sm text-blue-100">
                                    {fmtDate(from)} to {fmtDate(to)} · {platform === 'all' ? 'Google Ads + Meta Ads' : platform === 'google' ? 'Google Ads' : 'Meta Ads'}
                                    {selected?.kind === 'account' ? ' · This ad account is not linked to a client yet (link it in Reports).' : ''}
                                </p>
                                {selected && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(selected.googleAdsCustomerIds || []).map((id) => <AccountChip key={`g${id}`} color="#8FB2EA" label={`Google Ads ${fmtGoogleId(id)}`} onCopy={() => copy(id, 'Google Ads ID')} />)}
                                        {(selected.metaAdAccountIds || []).map((id) => (
                                            <AccountChip key={`m${id}`} color="#F27B1E" label={`Meta ${id}`} onCopy={() => copy(id, 'Meta ad account ID')} href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${String(id).replace(/^act_/, '')}`} hrefLabel="Open in Ads Manager" />
                                        ))}
                                        {websiteDomains(selected.websites).slice(0, 3).map((d) => <AccountChip key={d} color="#fff" label={d} href={`https://${d}`} hrefLabel="Open website" />)}
                                        {websiteDomains(selected.websites).length > 3 && <span className="inline-flex h-8 items-center rounded-lg border border-white/20 px-3 text-xs font-semibold text-blue-100">+{websiteDomains(selected.websites).length - 3} more sites</span>}
                                    </div>
                                )}
                                {selected && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {hasMeta && <TransparencyLinks title="Meta Ad Library" links={links.meta} />}
                                        {hasGoogle && <TransparencyLinks title="Google Ads Transparency Center" links={links.google} />}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <button type="button" onClick={sync} disabled={syncing} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#F27B1E] px-4 text-sm font-bold text-white shadow-md transition hover:bg-orange-500 disabled:opacity-60">
                                        <RefreshCw size={17} className={syncing ? 'animate-spin' : ''} />
                                        {syncing ? 'Syncing accounts…' : 'Sync ad data'}
                                    </button>
                                    <HeaderIcon onClick={downloadPdf} label={reportBusy ? 'Preparing PDF…' : 'Download PDF report'}><FileText size={17} className={reportBusy ? 'animate-pulse' : ''} /></HeaderIcon>
                                    <HeaderIcon onClick={() => { setReportAction('whatsapp'); setRecipient(''); }} label="Send report on WhatsApp"><MessageCircle size={17} /></HeaderIcon>
                                    <HeaderIcon onClick={() => { setReportAction('email'); setRecipient(''); }} label="Email PDF report"><Mail size={17} /></HeaderIcon>
                                </div>
                                {(liveBudgets.google > 0 || liveBudgets.meta > 0) && (
                                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right text-xs text-blue-100">
                                        <p className="font-bold text-white">Daily budget of active campaigns</p>
                                        {liveBudgets.google > 0 && <p>Google <b className="text-white">{money(liveBudgets.google, currency)}</b></p>}
                                        {liveBudgets.meta > 0 && <p>Meta <b className="text-white">{money(liveBudgets.meta, currency)}</b></p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ── Filters ── */}
                    <section className={`${pane} flex flex-wrap items-center gap-3 p-3`}>
                        <CalendarDays size={17} className="ml-1 text-orange-500" />
                        <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="Date range">
                            {RANGES.map((r) => (
                                <button key={r.key} type="button" onClick={() => pickRange(r.key)} aria-pressed={rangeKey === r.key} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${rangeKey === r.key ? 'bg-[#0A2E66] text-white dark:bg-orange-400 dark:text-slate-950' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                        {rangeKey === 'custom' && (
                            <div className="flex items-center gap-2">
                                <input aria-label="Start date" className={input} type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} />
                                <span className="text-slate-400">to</span>
                                <input aria-label="End date" className={input} type="date" value={to} min={from} max={ymd(new Date())} onChange={(e) => e.target.value && setTo(e.target.value)} />
                            </div>
                        )}
                        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="Platform">
                            {[['all', 'All'], ['google', 'Google'], ['meta', 'Meta']].map(([key, label]) => (
                                <button key={key} type="button" onClick={() => { setPlatform(key); setTypeFilter(''); }} aria-pressed={platform === key} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${platform === key ? 'bg-[#0A2E66] text-white dark:bg-orange-400 dark:text-slate-950' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                                    {key !== 'all' && <span className={`h-2 w-2 rounded-full ${key === 'google' ? 'bg-[#3B69AD]' : 'bg-[#F27B1E]'}`} />}
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className={`h-2 w-2 rounded-full ${loading || syncing ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'}`} />
                            {syncing ? 'Fetching latest account data…' : loading ? 'Updating view…' : data?.refreshedAt ? `Data last saved ${new Date(data.refreshedAt).toLocaleString('en-IN')}` : 'No saved data yet'}
                        </div>
                    </section>

                    {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{error}</div>}
                    {notice && !error && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{notice}</div>}

                    {/* ── KPIs ── */}
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                        {kpis.map(({ title, value, cur, prev: p, good, Icon, tint, note }) => (
                            <article key={title} className={`${pane} p-4`}>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</span>
                                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tint}`}><Icon size={17} /></span>
                                </div>
                                <div className="mt-3 text-2xl font-black tracking-tight tabular-nums">{loading && !data ? '…' : value}</div>
                                {note && <p className="truncate text-[11px] text-slate-500" title={note}>{note}</p>}
                                <Change current={cur} previous={p} goodWhenUp={good} days={days} />
                            </article>
                        ))}
                    </section>

                    {/* ── What's running ── */}
                    {running.length > 0 && (
                        <section>
                            <div className="mb-3">
                                <h2 className="font-serif text-lg font-black">What&apos;s running</h2>
                                <p className="text-sm text-slate-500">Grouped by campaign type. Click a card to see only those campaigns below.</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {running.map((r) => {
                                    const rt = r.resultTypes.size === 1 ? [...r.resultTypes][0] : '';
                                    const cprCard = costPerResult(r.spend, r.conversions, rt);
                                    return (
                                        <button key={r.type} type="button" onClick={() => { setTypeFilter(typeFilter === r.type ? '' : r.type); setTab('campaigns'); }} aria-pressed={typeFilter === r.type} className={`${pane} p-4 text-left transition hover:-translate-y-0.5 ${typeFilter === r.type ? 'ring-2 ring-orange-400' : ''} ${r.live ? '' : 'opacity-70'}`}>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full ${r.platform === 'google' ? 'bg-[#3B69AD]' : 'bg-[#F27B1E]'}`} />
                                                <b className="text-sm">{r.type}</b>
                                            </div>
                                            <p className="mt-2 text-3xl font-black">{r.live}<span className="ml-1.5 text-sm font-semibold text-slate-500">active of {r.total}</span></p>
                                            <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-dashed border-slate-200 pt-3 text-xs dark:border-slate-700">
                                                <div><dt className="text-slate-500">Spent</dt><dd className="font-bold">{money(r.spend, r.currency || currency, { compact: true })}</dd></div>
                                                <div><dt className="text-slate-500">{rt || 'Results'}</dt><dd className="truncate font-bold">{r.conversions ? num1(r.conversions) : '—'}</dd></div>
                                                <div><dt className="text-slate-500">Cost / result</dt><dd className="font-bold">{r.conversions ? money(cprCard, r.currency || currency, { compact: true }) : '—'}</dd></div>
                                            </dl>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* ── Day-wise chart ── */}
                    <section className={`${pane} p-5`}>
                        <div className="mb-4 flex flex-wrap items-start gap-3">
                            <div className="mr-auto">
                                <h2 className="font-serif text-lg font-black">Day-wise spend and results</h2>
                                <p className="text-sm text-slate-500">
                                    {chartRows.length > 62 ? 'Weekly totals. ' : ''}
                                    {totals.spend ? `${money(totals.spend, currency)} spent, ${money(totals.spend / Math.max(1, chartRows.length), currency)} a day on average.` : 'No spend in this range.'}
                                </p>
                            </div>
                            <button type="button" onClick={() => setShowDayTable((v) => !v)} aria-expanded={showDayTable} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                                <List size={15} /> {showDayTable ? 'Hide day-wise table' : 'Show day-wise table'}
                            </button>
                        </div>
                        <SpendChart rows={chartRows} currency={currency} loading={loading} />
                        {showDayTable && <DayTable rows={chartRows} currency={currency} />}
                    </section>

                    {/* ── Detail tabs ── */}
                    <section className={`${pane} overflow-hidden`}>
                        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 dark:border-slate-800" role="tablist">
                            {TABS.map(([key, label, Icon, count]) => (
                                <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`relative inline-flex h-12 shrink-0 items-center gap-2 px-3 text-sm font-bold ${tab === key ? 'text-slate-900 after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:rounded-t after:bg-orange-500 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                                    <Icon size={16} /> {label}
                                    {count !== null && <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 text-[11px] dark:border-slate-700 dark:bg-slate-800">{int(count)}</span>}
                                </button>
                            ))}
                        </div>
                        {loading && !data ? (
                            <Empty loading />
                        ) : tab === 'campaigns' ? (
                            <CampaignsTab rows={campaigns} currency={currency} typeFilter={typeFilter} clearType={() => setTypeFilter('')} fileBase={fileBase} showClient={showClient} />
                        ) : tab === 'groups' ? (
                            <GroupsTab rows={groups} currency={currency} fileBase={fileBase} showClient={showClient} />
                        ) : tab === 'ads' ? (
                            <AdsTab creatives={creatives} adRows={ads} currency={currency} clientName={reportClientName} fileBase={fileBase} />
                        ) : tab === 'keywords' ? (
                            <KeywordsTab rows={keywords} currency={currency} fileBase={fileBase} showClient={showClient} />
                        ) : tab === 'products' ? (
                            <ProductsTab rows={products} currency={currency} fileBase={fileBase} />
                        ) : tab === 'timeline' ? (
                            <TimelineTab campaigns={campaigns} keywords={keywords} creatives={creatives} from={from} to={to} />
                        ) : (
                            <RawTab from={from} to={to} platform={platform} clientId={clientId} currency={currency} fileBase={fileBase} />
                        )}
                    </section>
                    <p className="px-1 pb-4 text-xs text-slate-400">
                        Results follow each ad set&apos;s optimisation goal, the same way Ads Manager counts them. Budgets, end dates, bid strategy, attribution and ad copy fill in after the next sync. {data?.rowCount ? `${int(data.rowCount)} daily records in this view.` : ''}
                    </p>
                </div>
            </div>

            {reportAction && (
                <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !reportBusy) setReportAction(''); }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="ads-report-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                        <h2 id="ads-report-title" className="text-lg font-bold">{reportAction === 'email' ? 'Email PDF report' : 'Share report on WhatsApp'}</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{reportClientName} · {reportPeriod ? `${reportPeriod === 'monthly' ? 'Monthly' : 'Weekly'} report · ` : ''}{from} to {to} · {platform === 'all' ? 'Google + Meta' : platform === 'google' ? 'Google Ads' : 'Meta Ads'}</p>
                        <p className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">The PDF will carry the client name <b>{reportClientName}</b> and only the data for {from} to {to}. Pick 7 days or 30 days above for a weekly or monthly report.</p>
                        {reportAction === 'whatsapp' && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">The PDF will download first. WhatsApp opens with a prepared message; attach the downloaded PDF in the chat.</p>}
                        <label className="mt-5 block text-sm font-semibold" htmlFor="report-recipient">{reportAction === 'email' ? 'Recipient email' : 'WhatsApp number with country code'}</label>
                        <input id="report-recipient" autoFocus value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder={reportAction === 'email' ? 'name@example.com' : '919876543210'} className={`${input} mt-2 w-full`} />
                        <div className="mt-5 flex justify-end gap-2">
                            <button type="button" disabled={reportBusy} onClick={() => setReportAction('')} className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                            <button type="button" disabled={reportBusy || !recipient.trim()} onClick={submitReport} className="h-10 rounded-xl bg-[#0A2E66] px-4 text-sm font-bold text-white disabled:opacity-50">{reportBusy ? 'Preparing…' : reportAction === 'email' ? 'Generate and send' : 'Generate and continue'}</button>
                        </div>
                    </section>
                </div>
            )}
            <style jsx global>{`
                :root { --chart-grid: #e2e8f0; }
                .dark { --chart-grid: #26354d; }
            `}</style>
        </main>
    );
}

function ClientButton({ active, onClick, name, sub, platforms = [], dim }) {
    return (
        <button type="button" onClick={onClick} aria-current={active ? 'true' : undefined} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${active ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'} ${dim && !active ? 'opacity-60' : ''}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0A2E66] text-xs font-black text-white">{name === 'All clients' ? <Building2 size={16} /> : name.replace(/[^a-z0-9 ]/gi, '').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'}</span>
            <span className="min-w-0 flex-1">
                <b className="block truncate text-sm">{name}</b>
                <small className="block truncate text-[11px] text-slate-500">{sub}</small>
            </span>
            <span className="flex shrink-0 gap-1">{platforms.map((p) => <i key={p} title={p === 'google' ? 'Google Ads' : 'Meta Ads'} className={`h-2 w-2 rounded-full ${p === 'google' ? 'bg-[#3B69AD]' : 'bg-[#F27B1E]'}`} />)}</span>
        </button>
    );
}

function AccountChip({ color, label, onCopy, href, hrefLabel }) {
    return (
        <span className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/20 bg-white/10 pr-1 pl-3 text-xs font-semibold">
            <i className="h-2 w-2 rounded-full" style={{ background: color }} />
            {label}
            {onCopy && <button type="button" onClick={onCopy} aria-label={`Copy ${label}`} className="grid h-6 w-6 place-items-center rounded-md text-white/75 hover:bg-white/15 hover:text-white"><Copy size={13} /></button>}
            {href && <a href={href} target="_blank" rel="noopener noreferrer" aria-label={hrefLabel} title={hrefLabel} className="grid h-6 w-6 place-items-center rounded-md text-white/75 hover:bg-white/15 hover:text-white"><ExternalLink size={13} /></a>}
        </span>
    );
}

// One button per platform; several pages / domains open as a small menu.
function TransparencyLinks({ title, links }) {
    const button = 'inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#0A2E66] shadow-sm transition hover:bg-orange-50';
    if (links.length === 1) {
        return (
            <a href={links[0].url} target="_blank" rel="noopener noreferrer" className={button}>
                <ExternalLink size={14} className="text-orange-500" />
                <span>{title}<small className="block font-semibold text-slate-500">{links[0].label}</small></span>
            </a>
        );
    }
    return (
        <details className="relative">
            <summary className={`${button} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
                <ExternalLink size={14} className="text-orange-500" />
                <span>{title}<small className="block font-semibold text-slate-500">{links.length} pages / sites ▾</small></span>
            </summary>
            <div className="absolute left-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-1 text-slate-800 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                {links.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                        <span className="truncate">{l.label}</span>
                        <ExternalLink size={12} className="shrink-0 text-slate-400" />
                    </a>
                ))}
            </div>
        </details>
    );
}

function HeaderIcon({ onClick, label, children }) {
    return (
        <button type="button" onClick={onClick} title={label} aria-label={label} className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20">
            {children}
        </button>
    );
}

function SpendChart({ rows, currency, loading }) {
    const data = useMemo(() => {
        if (rows.length <= 62) return rows;
        const weeks = new Map();
        for (const row of rows) {
            const d = new Date(`${row.date}T00:00:00`);
            d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
            const key = ymd(d);
            const b = weeks.get(key) || { date: key, googleSpend: 0, metaSpend: 0, results: 0, spend: 0, clicks: 0, impressions: 0 };
            for (const k of ['googleSpend', 'metaSpend', 'results', 'spend', 'clicks', 'impressions']) b[k] += row[k];
            weeks.set(key, b);
        }
        return [...weeks.values()];
    }, [rows]);
    if (!data.some((r) => r.spend || r.results)) return <Empty loading={loading} text="No spend in this date range." />;
    return (
        <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid,#e2e8f0)" />
                    <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={24} tickFormatter={(v) => new Date(`${v}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="spend" tickFormatter={(v) => money(v, currency, { compact: true })} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={64} />
                    <YAxis yAxisId="results" orientation="right" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip
                        contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }}
                        labelFormatter={(v) => new Date(`${v}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        formatter={(value, name) => (name === 'Results' ? [num1(value), name] : [money(value, currency), name])}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Bar yAxisId="spend" dataKey="googleSpend" name="Google spend" stackId="s" fill="#3B69AD" maxBarSize={28} />
                    <Bar yAxisId="spend" dataKey="metaSpend" name="Meta spend" stackId="s" fill="#F27B1E" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Line yAxisId="results" dataKey="results" name="Results" type="monotone" stroke="#17845A" strokeWidth={2.5} dot={data.length <= 45 ? { r: 3, fill: '#17845A' } : false} activeDot={{ r: 5 }} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

function DayTable({ rows, currency }) {
    const total = rows.reduce((a, r) => ({ googleSpend: a.googleSpend + r.googleSpend, metaSpend: a.metaSpend + r.metaSpend, spend: a.spend + r.spend, impressions: a.impressions + r.impressions, clicks: a.clicks + r.clicks, results: a.results + r.results }), { googleSpend: 0, metaSpend: 0, spend: 0, impressions: 0, clicks: 0, results: 0 });
    const line = (label, r, key, cls = '') => (
        <tr key={key} className={cls}>
            <td className="px-3 py-2 whitespace-nowrap">{label}</td>
            <td className="px-3 py-2 text-right tabular-nums">{r.googleSpend ? money(r.googleSpend, currency) : '—'}</td>
            <td className="px-3 py-2 text-right tabular-nums">{r.metaSpend ? money(r.metaSpend, currency) : '—'}</td>
            <td className="px-3 py-2 text-right font-bold tabular-nums">{money(r.spend, currency)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{int(r.impressions)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{int(r.clicks)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{pct(r.clicks, r.impressions).toFixed(2)}%</td>
            <td className="px-3 py-2 text-right tabular-nums">{r.results ? num1(r.results) : '—'}</td>
            <td className="px-3 py-2 text-right tabular-nums">{r.results ? money(r.spend / r.results, currency) : '—'}</td>
        </tr>
    );
    return (
        <div className="mt-4 max-h-[60vh] overflow-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full min-w-[820px] text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs font-bold text-slate-500 dark:bg-slate-950">
                    <tr>{['Date', 'Google spend', 'Meta spend', 'Total spend', 'Impressions', 'Clicks', 'CTR', 'Results', 'Cost / result'].map((l, i) => <th key={l} className={`px-3 py-2 ${i ? 'text-right' : 'text-left'}`}>{l}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[...rows].reverse().map((r) => line(new Date(`${r.date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), r, r.date, r.spend ? '' : 'text-slate-400'))}
                </tbody>
                <tfoot className="sticky bottom-0 bg-slate-50 font-bold dark:bg-slate-950">{line('Total', total, 'total')}</tfoot>
            </table>
        </div>
    );
}
