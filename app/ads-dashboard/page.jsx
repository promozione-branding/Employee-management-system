'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownToLine, BarChart3, CalendarDays, ChevronDown, CircleDollarSign, MousePointerClick, RefreshCw, Search, Target, TrendingUp, WalletCards } from 'lucide-react';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const dateValue = (date) => date.toISOString().slice(0, 10);
const money = (value, currency) => {
    const amount = Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${currency ? `${currency} ` : ''}${amount}`;
};
const metricSum = (rows, key) => rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
const pane = 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';
const input = 'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200';

export default function AdsDashboard() {
    const [rows, setRows] = useState([]), [clients, setClients] = useState([]), [error, setError] = useState(''), [lastSynced, setLastSynced] = useState(null);
    const [loading, setLoading] = useState(true), [syncing, setSyncing] = useState(false);
    const [from, setFrom] = useState(dateValue(new Date(Date.now() - 6 * 86400000))), [to, setTo] = useState(dateValue(new Date(Date.now() - 86400000)));
    const [q, setQ] = useState(''), [platform, setPlatform] = useState('all'), [clientId, setClientId] = useState(''), [detailLevel, setDetailLevel] = useState('all');

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const params = new URLSearchParams({ from, to, q, platform: platform === 'all' ? '' : platform, clientId });
            const response = await fetch(`/api/ads-dashboard?${params}`);
            const json = await response.json();
            if (!response.ok) throw new Error(json.error || 'Could not load ads performance.');
            setRows(json.rows || []); setClients(json.clients || []); setLastSynced(json.refreshedAt || null);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    }, [from, to, q, platform, clientId]);

    useEffect(() => { load(); }, [load]);
    const campaignRows = useMemo(() => {
        const map = new Map();
        rows.filter((row) => row.level === 'campaign').forEach((row) => {
            const key = [row.platform, row.accountId, row.campaign, row.clientId].join('|');
            const item = map.get(key) || { ...row, impressions: 0, clicks: 0, spend: 0, conversions: 0, reach: 0, dates: 0 };
            item.impressions += Number(row.impressions || 0); item.clicks += Number(row.clicks || 0); item.spend += Number(row.spend || 0); item.conversions += Number(row.conversions || 0); item.reach += Number(row.reach || 0); item.dates += 1;
            item.ctr = item.impressions ? item.clicks / item.impressions : 0; item.cpc = item.clicks ? item.spend / item.clicks : 0;
            map.set(key, item);
        });
        return [...map.values()].sort((a, b) => b.spend - a.spend);
    }, [rows]);
    const totals = useMemo(() => ({
        spend: metricSum(campaignRows, 'spend'), clicks: metricSum(campaignRows, 'clicks'), impressions: metricSum(campaignRows, 'impressions'),
        conversions: metricSum(campaignRows, 'conversions'),
    }), [campaignRows]);
    const currency = campaignRows.find((row) => row.currency)?.currency || '';
    const platforms = useMemo(() => ['google', 'meta'].map((name) => {
        const list = campaignRows.filter((row) => row.platform === name);
        return { name, spend: metricSum(list, 'spend'), clicks: metricSum(list, 'clicks'), impressions: metricSum(list, 'impressions'), conversions: metricSum(list, 'conversions'), campaigns: list.length };
    }), [campaignRows]);
    const chartRows = useMemo(() => {
        const days = new Map();
        rows.filter((row) => row.level === 'campaign').forEach((row) => {
            const day = days.get(row.date) || { date: row.date, google: 0, meta: 0, conversions: 0 };
            day[row.platform] += Number(row.spend || 0); day.conversions += Number(row.conversions || 0); days.set(row.date, day);
        });
        return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
    }, [rows]);
    const details = useMemo(() => rows.filter((row) => detailLevel === 'all' || row.level === detailLevel), [rows, detailLevel]);
    const sync = async () => {
        setSyncing(true); setError('');
        try {
            const response = await fetch('/api/ads-dashboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to }) });
            const json = await response.json();
            if (!response.ok) throw new Error(json.error || 'Sync failed.');
            const syncMessage = json.errors?.length
                ? `${json.saved} records saved. ${json.errors.length} connected account(s) could not be synced.`
                : !json.accountsDiscovered?.google && !json.accountsDiscovered?.meta
                  ? 'No ad accounts were found. Check the connections in Reports → Discover, or assign accounts to clients there, then sync again.'
                  : '';
            await load();
            if (syncMessage) setError(syncMessage);
        } catch (err) { setError(err.message); }
        finally { setSyncing(false); }
    };
    const exportCsv = () => {
        const columns = ['date', 'clientName', 'platform', 'accountId', 'level', 'campaign', 'adGroup', 'entity', 'keyword', 'status', 'currency', 'impressions', 'clicks', 'spend', 'cpc', 'ctr', 'conversions'];
        const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
        const csv = [columns.join(','), ...details.map((row) => columns.map((key) => quote(row[key])).join(','))].join('\n');
        const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = `ads-performance-${from}-to-${to}.csv`; link.click(); URL.revokeObjectURL(link.href);
    };
    const chooseRange = (days) => { setFrom(dateValue(new Date(Date.now() - days * 86400000))); setTo(dateValue(new Date(Date.now() - 86400000))); };
    const avgCpc = totals.clicks ? totals.spend / totals.clicks : 0;
    const cards = [
        { title: 'Ad spend', value: money(totals.spend, currency), note: 'Across connected campaigns', Icon: CircleDollarSign, tint: 'bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300' },
        { title: 'Impressions', value: totals.impressions.toLocaleString('en-IN'), note: 'Ads displayed', Icon: BarChart3, tint: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
        { title: 'Clicks', value: totals.clicks.toLocaleString('en-IN'), note: `Average CPC ${money(avgCpc, currency)}`, Icon: MousePointerClick, tint: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300' },
        { title: 'Conversions', value: totals.conversions.toLocaleString('en-IN', { maximumFractionDigits: 1 }), note: 'Reported by ad platforms', Icon: Target, tint: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
    ];

    return <main className="min-h-full bg-slate-50 px-4 py-6 text-slate-900 dark:bg-[#0a1222] dark:text-slate-100 md:px-7 lg:px-9"><div className="mx-auto max-w-[1600px] space-y-5">
        <section className="relative overflow-hidden rounded-3xl bg-[#0A2E66] px-6 py-7 text-white shadow-lg md:px-8 md:py-8">
            <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(59,105,173,.65),transparent_65%)] md:block" />
            <div className="relative flex flex-wrap items-end justify-between gap-6"><div className="max-w-2xl"><div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[.18em] text-orange-200"><Activity size={16}/> PERFORMANCE CENTER</div><h1 className="font-serif text-3xl font-black tracking-tight md:text-4xl">Ads performance</h1><p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">A live view of the Google Ads and Meta Ads data connected to your client accounts.</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">{campaignRows.length} campaigns</span><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">{clients.length} active clients</span><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">{chartRows.length} days with data</span></div></div>
                <div className="relative flex flex-wrap items-center gap-3"><span className="text-xs text-blue-100">{syncing ? 'Fetching latest account data…' : lastSynced ? `Updated ${new Date(lastSynced).toLocaleString()}` : 'No saved sync yet'}</span><button onClick={sync} disabled={syncing} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#F27B1E] px-4 text-sm font-bold text-white shadow-md transition hover:bg-orange-500 disabled:opacity-60"><RefreshCw size={17} className={syncing ? 'animate-spin' : ''}/>{syncing ? 'Syncing accounts…' : 'Sync ad data'}</button></div>
            </div>
        </section>

        <section className={`${pane} flex flex-wrap items-center gap-3 p-4`}>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300"><CalendarDays size={17} className="text-orange-500"/> Date range</div>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">{[7, 30].map((days) => <button key={days} onClick={() => chooseRange(days)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700">{days} days</button>)}</div>
            <input aria-label="Start date" className={input} type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)}/><span className="text-slate-400">to</span><input aria-label="End date" className={input} type="date" value={to} min={from} max={dateValue(new Date())} onChange={(e) => setTo(e.target.value)}/>
            <div className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-500"/>{loading ? 'Updating…' : lastSynced ? `Last data update ${new Date(lastSynced).toLocaleString()}` : 'No saved data yet'}<button aria-label="Refresh data" onClick={load} className="ml-1 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><RefreshCw size={15}/></button></div>
        </section>

        {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{error}</div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ title, value, note, Icon, tint }) => <article key={title} className={`${pane} p-5 transition hover:-translate-y-0.5 hover:shadow-md`}><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</span><span className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}><Icon size={19}/></span></div><div className="mt-4 text-2xl font-black tracking-tight">{value}</div><p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{note}</p></article>)}</section>

        <section className="grid gap-5 xl:grid-cols-12">
            <article className={`${pane} p-5 xl:col-span-8`}><div className="mb-5 flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"><TrendingUp size={19}/></span><div><h2 className="font-serif text-lg font-black">Spend and conversions</h2><p className="text-sm text-slate-500 dark:text-slate-400">Daily results from the selected reporting period</p></div></div>
                {chartRows.length ? <div className="h-[290px] w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartRows} margin={{ top: 10, right: 8, left: 4, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid,#e2e8f0)"/><XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis yAxisId="spend" tickFormatter={(v) => Number(v).toLocaleString('en-IN')} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={54}/><YAxis yAxisId="conversions" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={35}/><Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }} formatter={(v, name) => name === 'Conversions' ? [Number(v).toFixed(1), name] : [money(v, currency), name]}/><Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }}/><Bar yAxisId="spend" dataKey="google" name="Google spend" stackId="spend" fill="#3B69AD" radius={[0,0,0,0]}/><Bar yAxisId="spend" dataKey="meta" name="Meta spend" stackId="spend" fill="#F27B1E" radius={[4,4,0,0]}/><Line yAxisId="conversions" dataKey="conversions" name="Conversions" type="monotone" stroke="#17845A" strokeWidth={2.5} dot={{ r: 3, fill: '#17845A' }}/></ComposedChart></ResponsiveContainer></div> : <Empty loading={loading} text="No daily ad data saved for these dates."/>}
            </article>
            <article className={`${pane} p-5 xl:col-span-4`}><div className="mb-5 flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300"><WalletCards size={19}/></span><div><h2 className="font-serif text-lg font-black">Google vs Meta</h2><p className="text-sm text-slate-500 dark:text-slate-400">Platform results for this date range</p></div></div>
                <div className="space-y-5">{platforms.map((item) => { const share = totals.spend ? item.spend / totals.spend * 100 : 0; const isGoogle = item.name === 'google'; return <div key={item.name}><div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-bold"><span className={`h-2.5 w-2.5 rounded-full ${isGoogle ? 'bg-[#3B69AD]' : 'bg-[#F27B1E]'}`}/>{isGoogle ? 'Google Ads' : 'Meta Ads'}</div><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{share.toFixed(1)}% of spend</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${isGoogle ? 'bg-[#3B69AD]' : 'bg-[#F27B1E]'}`} style={{ width: `${share}%` }}/></div><div className="mt-2 grid grid-cols-3 gap-2 text-xs"><div><span className="text-slate-400">Spend</span><b className="mt-0.5 block">{money(item.spend, currency)}</b></div><div><span className="text-slate-400">Clicks</span><b className="mt-0.5 block">{item.clicks.toLocaleString('en-IN')}</b></div><div><span className="text-slate-400">Conv.</span><b className="mt-0.5 block">{item.conversions.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</b></div></div></div>; })}</div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">{platforms.map((item) => <div key={`${item.name}-cpc`} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70"><span className="text-xs text-slate-500 dark:text-slate-400">{item.name === 'google' ? 'Google' : 'Meta'} average CPC</span><b className="mt-1 block text-sm">{money(item.clicks ? item.spend / item.clicks : 0, currency)}</b></div>)}</div>
            </article>
        </section>

        <section className={`${pane} overflow-hidden`}><div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5 dark:border-slate-800"><div className="mr-auto"><h2 className="font-serif text-lg font-black">Campaign performance</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Aggregated campaign metrics for the selected dates</p></div><button onClick={exportCsv} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><ArrowDownToLine size={16}/> Export</button></div>
            <div className="grid gap-3 border-b border-slate-100 p-4 dark:border-slate-800 md:grid-cols-[minmax(240px,1fr)_220px_180px]"><label className="relative"><Search size={16} className="absolute top-3 left-3 text-slate-400"/><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search campaign, keyword or client" className={`${input} w-full pl-9`}/></label><select value={clientId} onChange={(e) => setClientId(e.target.value)} className={input}><option value="">All clients</option>{clients.map((client) => <option key={client._id} value={client._id}>{client.name}</option>)}</select><select value={platform} onChange={(e) => setPlatform(e.target.value)} className={input}><option value="all">All platforms</option><option value="google">Google Ads</option><option value="meta">Meta Ads</option></select></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[1000px] border-collapse text-left text-sm"><thead className="bg-slate-50 text-xs font-bold text-slate-500 dark:bg-slate-950/60 dark:text-slate-400"><tr>{['Platform','Campaign / client','Status','Impressions','Clicks','Spend','Avg. CPC','CTR','Conversions'].map((label) => <th key={label} className="whitespace-nowrap px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{campaignRows.map((row) => <tr key={`${row.platform}-${row.accountId}-${row.entityId}-${row.clientId}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50"><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.platform === 'google' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300'}`}>{row.platform === 'google' ? 'Google' : 'Meta'}</span></td><td className="max-w-72 px-4 py-3"><b className="block truncate" title={row.campaign}>{row.campaign || 'Unnamed campaign'}</b><span className="block truncate text-xs text-slate-500">{row.clientName} · {row.accountId}</span></td><td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300"><span className={`h-2 w-2 rounded-full ${/PAUSED|OFF|ARCHIVED/i.test(row.status) ? 'bg-slate-400' : 'bg-emerald-500'}`}/>{row.status ? row.status.toLowerCase().replaceAll('_', ' ') : 'Reported'}</span></td><td className="px-4 py-3">{row.impressions.toLocaleString('en-IN')}</td><td className="px-4 py-3">{row.clicks.toLocaleString('en-IN')}</td><td className="whitespace-nowrap px-4 py-3 font-semibold">{money(row.spend, row.currency || currency)}</td><td className="whitespace-nowrap px-4 py-3">{money(row.cpc, row.currency || currency)}</td><td className="px-4 py-3">{(row.ctr * 100).toFixed(2)}%</td><td className="px-4 py-3">{row.conversions.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td></tr>)}{!loading && campaignRows.length === 0 && <tr><td colSpan={9} className="px-5 py-12"><Empty text="No campaign records for this range. Sync the connected ad accounts to get started."/></td></tr>}</tbody></table></div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-slate-800"><span>{campaignRows.length} campaigns · {rows.length} daily records</span><span>Spend totals use campaign rows to prevent counting ad breakdowns twice.</span></div>
        </section>

        <section className={`${pane} overflow-hidden`}><div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5 dark:border-slate-800"><div className="mr-auto"><h2 className="font-serif text-lg font-black">Daily account breakdown</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Campaign, ad group, ad and keyword details returned by connected APIs</p></div><select value={detailLevel} onChange={(e) => setDetailLevel(e.target.value)} className={input}><option value="all">All data levels</option>{['campaign','ad_group','ad_set','ad','keyword'].map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select></div><div className="overflow-x-auto"><table className="w-full min-w-[1300px] border-collapse text-left text-sm"><thead className="bg-slate-50 text-xs font-bold text-slate-500 dark:bg-slate-950/60 dark:text-slate-400"><tr>{['Date','Client','Platform','Level','Campaign','Ad group','Ad / keyword','Impressions','Reach','Clicks','Spend','CPC','Conversions'].map((label) => <th key={label} className="whitespace-nowrap px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{details.map((row) => <tr key={row._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50"><td className="whitespace-nowrap px-4 py-3 text-slate-500">{row.date}</td><td className="max-w-40 truncate px-4 py-3">{row.clientName}</td><td className="px-4 py-3 capitalize">{row.platform}</td><td className="px-4 py-3 capitalize">{row.level.replace('_', ' ')}</td><td className="max-w-48 truncate px-4 py-3" title={row.campaign}>{row.campaign || '—'}</td><td className="max-w-40 truncate px-4 py-3" title={row.adGroup}>{row.adGroup || '—'}</td><td className="max-w-52 truncate px-4 py-3" title={row.keyword || row.entity}>{row.keyword || row.entity || '—'}</td><td className="px-4 py-3">{Number(row.impressions || 0).toLocaleString('en-IN')}</td><td className="px-4 py-3">{row.platform === 'meta' ? Number(row.reach || 0).toLocaleString('en-IN') : '—'}</td><td className="px-4 py-3">{Number(row.clicks || 0).toLocaleString('en-IN')}</td><td className="whitespace-nowrap px-4 py-3">{money(row.spend, row.currency || currency)}</td><td className="whitespace-nowrap px-4 py-3">{money(row.cpc, row.currency || currency)}</td><td className="px-4 py-3">{Number(row.conversions || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td></tr>)}{!loading && details.length === 0 && <tr><td colSpan={13} className="px-5 py-10 text-center text-sm text-slate-500">No detailed data available.</td></tr>}</tbody></table></div></section>
        <p className="px-1 pb-4 text-xs text-slate-400">Metrics reflect the fields available from each platform and the selected accounts.</p>
    </div><style jsx global>{`:root { --chart-grid: #e2e8f0; } .dark { --chart-grid: #26354d; }`}</style></main>;
}

function Empty({ loading, text }) {
    return <div className="flex min-h-36 flex-col items-center justify-center gap-2 text-center text-sm text-slate-400"><BarChart3 size={30} strokeWidth={1.4}/><span>{loading ? 'Loading performance data…' : text}</span></div>;
}
