// components/ads-dashboard/AdsTabs.jsx
//
// The detail tabs of the ads dashboard: campaigns, ad sets / ad groups, ads &
// creatives, keywords, Shopping products, timeline and raw daily rows.

'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, ExternalLink, Image as ImageIcon, Phone, PlayCircle, Search, X } from 'lucide-react';
import { bidStrategyLabel, campaignType, deliveryOf, splitKeyword } from '@/lib/adsLabels';
import { Budget, CostPerResult, Delivery, Empty, PlatformTag, Results, downloadCsv, fmtDate, input, int, money, num1, pct, useSort } from './AdsUi';

const td = 'px-3 py-3 align-top';
const tdNum = `${td} text-right whitespace-nowrap tabular-nums`;
const thead = 'sticky top-0 z-10 bg-slate-50 text-left text-xs font-bold text-slate-500 dark:bg-slate-950 dark:text-slate-400';

function Toolbar({ query, setQuery, placeholder, children, count, noun }) {
    return (
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
            <label className="relative w-full max-w-sm">
                <span className="sr-only">{placeholder}</span>
                <Search size={16} className="absolute top-3 left-3 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} className={`${input} w-full pl-9`} />
            </label>
            {children}
            <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                {int(count)} {noun}
            </span>
        </div>
    );
}

function ExportButton({ onClick }) {
    return (
        <button type="button" onClick={onClick} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <ArrowDownToLine size={16} /> Export
        </button>
    );
}

function ActiveToggle({ value, onChange, label = 'Hide off / zero-spend' }) {
    return (
        <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-orange-500" />
            {label}
        </label>
    );
}

const matches = (q, ...values) => !q || values.join(' ').toLowerCase().includes(q.toLowerCase());
const isLive = (row) => deliveryOf(row.platform, row.status).on || Number(row.spend) > 0 || Number(row.conversions) > 0;
const endLabel = (row) => (row.endTime ? fmtDate(row.endTime) : row.startTime ? 'Ongoing' : '—');

/* ───────────────────────── Campaigns ───────────────────────── */
export function CampaignsTab({ rows, currency, typeFilter, clearType, fileBase, showClient }) {
    const [query, setQuery] = useState('');
    const [activeOnly, setActiveOnly] = useState(true);
    const list = useMemo(
        () => rows.filter((r) => (!activeOnly || isLive(r)) && (!typeFilter || campaignType(r) === typeFilter) && matches(query, r.campaign, r.entity, r.clientName, r.accountId)),
        [rows, activeOnly, typeFilter, query]
    );
    const { sorted, header } = useSort(list, 'spend');
    const total = list.reduce((a, r) => ({ spend: a.spend + r.spend, impressions: a.impressions + r.impressions, clicks: a.clicks + r.clicks, conversions: a.conversions + r.conversions, reach: a.reach + r.reach }), { spend: 0, impressions: 0, clicks: 0, conversions: 0, reach: 0 });
    const resultTypes = [...new Set(list.map((r) => r.resultType).filter(Boolean))];
    const exportRows = () =>
        downloadCsv(`${fileBase}-campaigns.csv`, [
            { label: 'Platform', value: 'platform' }, { label: 'Client', value: 'clientName' }, { label: 'Account', value: 'accountId' }, { label: 'Campaign', value: (r) => r.campaign || r.entity },
            { label: 'Type', value: campaignType }, { label: 'Delivery', value: (r) => deliveryOf(r.platform, r.status).label }, { label: 'Results', value: 'conversions' }, { label: 'Result type', value: 'resultType' },
            { label: 'Cost per result', value: (r) => r.cpr.toFixed(2) }, { label: 'Budget', value: 'budget' }, { label: 'Budget type', value: 'budgetType' }, { label: 'Amount spent', value: (r) => r.spend.toFixed(2) },
            { label: 'Impressions', value: 'impressions' }, { label: 'Reach (sum of daily)', value: 'reach' }, { label: 'Clicks', value: 'clicks' }, { label: 'CTR %', value: (r) => r.ctr.toFixed(2) }, { label: 'Avg CPC', value: (r) => r.cpc.toFixed(2) },
            { label: 'Ends', value: endLabel }, { label: 'Bid strategy', value: (r) => bidStrategyLabel(r.platform, r.bidStrategy) }, { label: 'Attribution setting', value: 'attributionSetting' }, { label: 'First delivery', value: 'firstActive' }, { label: 'Last delivery', value: 'lastActive' },
        ], sorted);

    return (
        <>
            <Toolbar query={query} setQuery={setQuery} placeholder="Search campaign, client or account" count={list.length} noun="campaigns">
                <ActiveToggle value={activeOnly} onChange={setActiveOnly} />
                {typeFilter && (
                    <button type="button" onClick={clearType} className="inline-flex items-center gap-1 rounded-full bg-[#0A2E66] px-3 py-1 text-xs font-bold text-white dark:bg-orange-500 dark:text-slate-950">
                        {typeFilter} <X size={12} />
                    </button>
                )}
                <ExportButton onClick={exportRows} />
            </Toolbar>
            {sorted.length ? (
                <div className="max-h-[75vh] overflow-auto">
                    <table className="w-full min-w-[1500px] border-collapse text-sm">
                        <thead className={thead}>
                            <tr>
                                {header((r) => r.campaign || r.entity, 'Campaign')}
                                {header((r) => deliveryOf(r.platform, r.status).label, 'Delivery')}
                                {header('conversions', 'Results', { right: true })}
                                {header((r) => r.cpr || Infinity, 'Cost per result', { right: true })}
                                {header('budget', 'Budget', { right: true })}
                                {header('spend', 'Amount spent', { right: true })}
                                {header('impressions', 'Impressions', { right: true })}
                                {header('reach', 'Reach', { right: true, title: 'Meta reach is reported per day; this is the sum of daily reach' })}
                                {header('clicks', 'Clicks', { right: true })}
                                {header('ctr', 'CTR', { right: true })}
                                {header((r) => r.endTime || 'zzzz', 'Ends')}
                                {header((r) => bidStrategyLabel(r.platform, r.bidStrategy), 'Bid strategy')}
                                {header('attributionSetting', 'Attribution setting')}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sorted.map((r) => (
                                <tr key={`${r.platform}-${r.accountId}-${r.entityId}`} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${deliveryOf(r.platform, r.status).on ? '' : 'text-slate-500'}`}>
                                    <td className={`${td} max-w-80`}>
                                        <b className="block truncate text-slate-900 dark:text-slate-100" title={r.campaign || r.entity}>{r.campaign || r.entity || 'Unnamed campaign'}</b>
                                        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                                            <PlatformTag platform={r.platform} />
                                            {(r.channelType || r.objective) && <span>{campaignType(r).replace(/^(Google|Meta) /, '')}</span>}
                                            {showClient && <span className="truncate">· {r.clientName}</span>}
                                        </span>
                                    </td>
                                    <td className={td}><Delivery platform={r.platform} status={r.status} /></td>
                                    <td className={tdNum}><Results value={r.conversions} type={r.resultType} platform={r.platform} /></td>
                                    <td className={tdNum}><CostPerResult row={r} currency={r.currency || currency} /></td>
                                    <td className={tdNum}><Budget row={r} currency={r.currency || currency} /></td>
                                    <td className={`${tdNum} font-semibold`}>{money(r.spend, r.currency || currency)}</td>
                                    <td className={tdNum}>{int(r.impressions)}</td>
                                    <td className={tdNum}>{r.platform === 'meta' && r.reach ? int(r.reach) : '—'}</td>
                                    <td className={tdNum}>{int(r.clicks)}</td>
                                    <td className={tdNum}>{r.ctr.toFixed(2)}%</td>
                                    <td className={`${td} whitespace-nowrap`}>{endLabel(r)}</td>
                                    <td className={`${td} whitespace-nowrap`}>{bidStrategyLabel(r.platform, r.bidStrategy) || '—'}</td>
                                    <td className={`${td} whitespace-nowrap`}>{r.attributionSetting || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="sticky bottom-0 bg-slate-50 text-sm font-bold dark:bg-slate-950">
                            <tr>
                                <td className={td}>Results from {list.length} campaign{list.length === 1 ? '' : 's'}</td>
                                <td className={td} />
                                <td className={tdNum}>
                                    {num1(total.conversions)}
                                    <span className="block text-[11px] font-normal text-slate-500">{resultTypes.length === 1 ? resultTypes[0] : resultTypes.length ? 'Multiple result types' : ''}</span>
                                </td>
                                <td className={tdNum}>{total.conversions && resultTypes.length <= 1 ? money(total.spend / total.conversions, currency) : '—'}</td>
                                <td className={td} />
                                <td className={tdNum}>{money(total.spend, currency)}</td>
                                <td className={tdNum}>{int(total.impressions)}</td>
                                <td className={tdNum}>{total.reach ? int(total.reach) : '—'}</td>
                                <td className={tdNum}>{int(total.clicks)}</td>
                                <td className={tdNum}>{pct(total.clicks, total.impressions).toFixed(2)}%</td>
                                <td colSpan={3} />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ) : (
                <Empty text="No campaigns match these filters." />
            )}
        </>
    );
}

/* ───────────────────── Ad sets & ad groups ───────────────────── */
export function GroupsTab({ rows, currency, fileBase, showClient }) {
    const [query, setQuery] = useState('');
    const [activeOnly, setActiveOnly] = useState(true);
    const list = useMemo(() => rows.filter((r) => (!activeOnly || isLive(r)) && matches(query, r.entity, r.adGroup, r.campaign, r.clientName)), [rows, activeOnly, query]);
    const { sorted, header } = useSort(list, 'spend');
    return (
        <>
            <Toolbar query={query} setQuery={setQuery} placeholder="Search ad set, ad group or campaign" count={list.length} noun="ad sets / ad groups">
                <ActiveToggle value={activeOnly} onChange={setActiveOnly} />
                <ExportButton
                    onClick={() =>
                        downloadCsv(`${fileBase}-ad-sets-ad-groups.csv`, [
                            { label: 'Platform', value: 'platform' }, { label: 'Client', value: 'clientName' }, { label: 'Campaign', value: 'campaign' }, { label: 'Ad set / ad group', value: (r) => r.entity || r.adGroup },
                            { label: 'Delivery', value: (r) => deliveryOf(r.platform, r.status).label }, { label: 'Results', value: 'conversions' }, { label: 'Result type', value: 'resultType' }, { label: 'Cost per result', value: (r) => r.cpr.toFixed(2) },
                            { label: 'Budget', value: 'budget' }, { label: 'Amount spent', value: (r) => r.spend.toFixed(2) }, { label: 'Impressions', value: 'impressions' }, { label: 'Clicks', value: 'clicks' }, { label: 'CTR %', value: (r) => r.ctr.toFixed(2) },
                        ], sorted)
                    }
                />
            </Toolbar>
            {sorted.length ? (
                <div className="max-h-[75vh] overflow-auto">
                    <table className="w-full min-w-[1200px] border-collapse text-sm">
                        <thead className={thead}>
                            <tr>
                                {header((r) => r.entity || r.adGroup, 'Ad set / ad group')}
                                {header((r) => deliveryOf(r.platform, r.status).label, 'Delivery')}
                                {header('conversions', 'Results', { right: true })}
                                {header((r) => r.cpr || Infinity, 'Cost per result', { right: true })}
                                {header('budget', 'Budget', { right: true })}
                                {header('spend', 'Amount spent', { right: true })}
                                {header('impressions', 'Impressions', { right: true })}
                                {header('clicks', 'Clicks', { right: true })}
                                {header('ctr', 'CTR', { right: true })}
                                {header('attributionSetting', 'Attribution')}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sorted.map((r) => (
                                <tr key={`${r.platform}-${r.accountId}-${r.entityId}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className={`${td} max-w-80`}>
                                        <b className="block truncate" title={r.entity || r.adGroup}>{r.entity || r.adGroup || 'Unnamed'}</b>
                                        <span className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500"><PlatformTag platform={r.platform} /><span className="truncate">{r.campaign}{showClient ? ` · ${r.clientName}` : ''}</span></span>
                                    </td>
                                    <td className={td}><Delivery platform={r.platform} status={r.status} /></td>
                                    <td className={tdNum}><Results value={r.conversions} type={r.resultType} platform={r.platform} /></td>
                                    <td className={tdNum}><CostPerResult row={r} currency={r.currency || currency} /></td>
                                    <td className={tdNum}><Budget row={r} currency={r.currency || currency} /></td>
                                    <td className={`${tdNum} font-semibold`}>{money(r.spend, r.currency || currency)}</td>
                                    <td className={tdNum}>{int(r.impressions)}</td>
                                    <td className={tdNum}>{int(r.clicks)}</td>
                                    <td className={tdNum}>{r.ctr.toFixed(2)}%</td>
                                    <td className={`${td} whitespace-nowrap`}>{r.attributionSetting || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <Empty text="No ad sets or ad groups for these filters." />
            )}
        </>
    );
}

/* ───────────────────── Ads & creatives ───────────────────── */
const CTA = (value) => String(value || '').toLowerCase().replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());
const host = (url) => String(url || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

const AD_TYPE_LABEL = { CALL_AD: 'Call ad', SHOPPING_PRODUCT_AD: 'Shopping product ad', VIDEO_RESPONSIVE_AD: 'YouTube video ad', RESPONSIVE_DISPLAY_AD: 'Display ad', DEMAND_GEN_MULTI_ASSET_AD: 'Demand Gen ad' };

function GooglePreview({ ad, clientName }) {
    if (!ad.headlines?.length && !ad.descriptions?.length) {
        const label = AD_TYPE_LABEL[ad.adType] || (ad.adType ? String(ad.adType).toLowerCase().replaceAll('_', ' ') : 'Google ad');
        return (
            <div className="grid min-h-32 place-items-center rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500 dark:bg-slate-800">
                <span><b className="block text-sm text-slate-700 capitalize dark:text-slate-200">{label}</b>{ad.adType === 'SHOPPING_PRODUCT_AD' ? 'Built from the product feed; see the Products tab.' : 'Google Ads does not share this ad\'s text through its API. Open Google Ads to see it.'}</span>
            </div>
        );
    }
    const headlines = ad.headlines?.length ? ad.headlines : [ad.title || ad.name || 'Ad'];
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 font-sans text-[#202124]">
            <div className="text-xs font-bold">Sponsored</div>
            <div className="mt-1 text-xs text-[#4d5156]">{clientName}<span className="block">{ad.finalUrl ? `${host(ad.finalUrl)}${ad.displayPath ? ` › ${ad.displayPath}` : ''}` : ''}</span></div>
            <h4 className="mt-1 text-lg leading-snug text-[#1a0dab]">{headlines.slice(0, 3).join(' | ')}</h4>
            <p className="mt-0.5 text-sm text-[#4d5156]">{ad.descriptions?.[0] || ad.body}</p>
            {ad.phone && <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e8f0fe] px-3 py-1 text-sm font-semibold text-[#1a73e8]"><Phone size={14} />Call {ad.phone}</span>}
            {(ad.headlines?.length > 3 || ad.descriptions?.length > 1) && (
                <details className="mt-2 text-xs text-[#4d5156]">
                    <summary className="cursor-pointer font-semibold text-[#1a73e8]">All {ad.headlines.length} headlines and {ad.descriptions.length} descriptions</summary>
                    <ul className="mt-1 list-disc pl-5">{ad.headlines.map((h, i) => <li key={`h${i}`}>{h}</li>)}</ul>
                    <ul className="mt-1 list-disc pl-5">{ad.descriptions.map((d, i) => <li key={`d${i}`}>{d}</li>)}</ul>
                </details>
            )}
        </div>
    );
}

function MetaPreview({ ad, clientName }) {
    const img = ad.imageUrl || ad.thumbnailUrl;
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white font-sans text-[#1c1e21]">
            <div className="flex items-center gap-2 p-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0A2E66] text-xs font-bold text-white">{(clientName || '?').slice(0, 1)}</span>
                <div><b className="block text-sm">{clientName}</b><small className="text-xs text-[#65676b]">Sponsored</small></div>
            </div>
            {ad.body && <p className="line-clamp-5 px-3 pb-2 text-sm whitespace-pre-wrap">{ad.body}</p>}
            <div className="relative aspect-square bg-slate-100">
                {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={ad.title || ad.name || 'Ad creative'} loading="lazy" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                    <div className="grid h-full place-items-center text-slate-400"><ImageIcon size={32} /></div>
                )}
                {ad.format === 'video' && <PlayCircle size={44} className="absolute inset-0 m-auto text-white drop-shadow" />}
                {ad.format === 'carousel' && <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white">Carousel</span>}
            </div>
            <div className="flex items-center gap-2 bg-[#f0f2f5] px-3 py-2">
                <div className="min-w-0 flex-1">
                    <small className="block truncate text-[11px] text-[#65676b] uppercase">{host(ad.finalUrl)}</small>
                    <b className="block truncate text-sm">{ad.title || ad.name}</b>
                </div>
                {ad.callToAction && <span className="shrink-0 rounded-md bg-[#e4e6eb] px-3 py-1.5 text-xs font-bold">{CTA(ad.callToAction)}</span>}
            </div>
        </div>
    );
}

export function AdsTab({ creatives, adRows, currency, clientName, fileBase }) {
    const [query, setQuery] = useState('');
    const [liveOnly, setLiveOnly] = useState(true);
    const [view, setView] = useState('cards');
    const perf = useMemo(() => new Map(adRows.map((r) => [`${r.platform}:${r.accountId}:${r.entityId}`, r])), [adRows]);
    const cards = useMemo(() => {
        const known = new Set();
        const list = creatives.map((c) => {
            const key = `${c.platform}:${c.accountId}:${c.adId}`;
            known.add(key);
            return { ...c, key, perf: perf.get(key) };
        });
        // Ads with spend but no saved copy yet (synced before creatives were collected).
        for (const r of adRows) {
            const key = `${r.platform}:${r.accountId}:${r.entityId}`;
            if (!known.has(key)) list.push({ key, platform: r.platform, accountId: r.accountId, adId: r.entityId, name: r.entity, campaign: r.campaign, adGroup: r.adGroup, status: r.status, clientName: r.clientName, perf: r, missingCopy: true });
        }
        return list
            .filter((c) => (!liveOnly || deliveryOf(c.platform, c.status).on || Number(c.perf?.spend) > 0) && matches(query, c.name, c.title, c.body, c.campaign, c.adGroup, ...(c.headlines || [])))
            .sort((a, b) => Number(b.perf?.spend || 0) - Number(a.perf?.spend || 0) || String(b.createdTime || '').localeCompare(String(a.createdTime || '')));
    }, [creatives, adRows, perf, liveOnly, query]);
    const best = cards.filter((c) => Number(c.perf?.conversions) >= 3).sort((a, b) => a.perf.cpr - b.perf.cpr)[0];

    return (
        <>
            <Toolbar query={query} setQuery={setQuery} placeholder="Search ad name, headline or text" count={cards.length} noun="ads">
                <ActiveToggle value={liveOnly} onChange={setLiveOnly} label="Running or spent only" />
                <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold dark:bg-slate-800">
                    {['cards', 'table'].map((v) => (
                        <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} className={`rounded-lg px-3 py-1.5 capitalize ${view === v ? 'bg-white shadow-sm dark:bg-slate-700' : 'text-slate-500'}`}>{v}</button>
                    ))}
                </div>
                <ExportButton
                    onClick={() =>
                        downloadCsv(`${fileBase}-ads.csv`, [
                            { label: 'Platform', value: 'platform' }, { label: 'Campaign', value: 'campaign' }, { label: 'Ad group / ad set', value: 'adGroup' }, { label: 'Ad', value: 'name' },
                            { label: 'Delivery', value: (c) => deliveryOf(c.platform, c.status).label }, { label: 'Format', value: 'format' }, { label: 'Headlines', value: (c) => (c.headlines || []).join(' | ') },
                            { label: 'Text / descriptions', value: (c) => [c.body, ...(c.descriptions || [])].filter(Boolean).join(' | ') }, { label: 'Call to action', value: (c) => CTA(c.callToAction) }, { label: 'Final URL', value: 'finalUrl' },
                            { label: 'Created', value: (c) => c.createdTime || c.firstSeenAt || '' }, { label: 'Results', value: (c) => c.perf?.conversions || 0 }, { label: 'Cost per result', value: (c) => (c.perf?.cpr || 0).toFixed(2) },
                            { label: 'Amount spent', value: (c) => (c.perf?.spend || 0).toFixed(2) }, { label: 'Impressions', value: (c) => c.perf?.impressions || 0 }, { label: 'Clicks', value: (c) => c.perf?.clicks || 0 },
                        ], cards)
                    }
                />
            </Toolbar>
            {best && (
                <p className="border-b border-slate-100 px-4 py-2 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                    Lowest cost per result in this period: <b>{best.name || best.title}</b> at <b>{money(best.perf.cpr, best.perf.currency || currency)}</b> ({num1(best.perf.conversions)} {best.perf.resultType || 'results'}).
                </p>
            )}
            {!cards.length ? (
                <Empty text="No ads for these filters. Ad copy and creatives are saved from the next sync onwards." />
            ) : view === 'cards' ? (
                <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {cards.map((c) => {
                        const p = c.perf;
                        const cur = p?.currency || currency;
                        return (
                            <article key={c.key} className={`flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800 ${deliveryOf(c.platform, c.status).on ? '' : 'opacity-75'}`}>
                                <div className="flex items-center gap-2">
                                    <PlatformTag platform={c.platform} />
                                    <Delivery platform={c.platform} status={c.status} />
                                    {c.format && c.format !== 'text' && <span className="ml-auto text-[11px] font-semibold text-slate-500 capitalize">{c.format}</span>}
                                </div>
                                {c.missingCopy ? (
                                    <div className="grid min-h-32 place-items-center rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500 dark:bg-slate-800">Ad copy appears here after the next sync.</div>
                                ) : c.platform === 'google' ? (
                                    <GooglePreview ad={c} clientName={c.clientName || clientName} />
                                ) : (
                                    <MetaPreview ad={c} clientName={c.clientName || clientName} />
                                )}
                                <div>
                                    <b className="block truncate text-sm" title={c.name}>{c.name || c.title || 'Untitled ad'}</b>
                                    <span className="block truncate text-xs text-slate-500">{c.campaign}{c.adGroup ? ` · ${c.adGroup}` : ''}</span>
                                    {(c.createdTime || c.firstSeenAt) && <span className="block text-xs text-slate-500">{c.createdTime ? 'Created' : 'First seen'} {fmtDate(c.createdTime || c.firstSeenAt)}{p?.lastActive ? ` · last delivered ${fmtDate(p.lastActive)}` : ''}</span>}
                                    {c.finalUrl && <a href={c.finalUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300">{host(c.finalUrl)}<ExternalLink size={11} /></a>}
                                </div>
                                <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-dashed border-slate-200 pt-3 text-xs dark:border-slate-700">
                                    <div><dt className="text-slate-500">Results</dt><dd className="font-bold">{p?.conversions ? num1(p.conversions) : '—'}</dd></div>
                                    <div><dt className="text-slate-500">Cost / result</dt><dd className="font-bold">{p?.cpr ? money(p.cpr, cur) : '—'}</dd></div>
                                    <div><dt className="text-slate-500">Spent</dt><dd className="font-bold">{p?.spend ? money(p.spend, cur) : '—'}</dd></div>
                                    <div><dt className="text-slate-500">Impressions</dt><dd className="font-bold">{p ? int(p.impressions) : '—'}</dd></div>
                                    <div><dt className="text-slate-500">Clicks</dt><dd className="font-bold">{p ? int(p.clicks) : '—'}</dd></div>
                                    <div><dt className="text-slate-500">CTR</dt><dd className="font-bold">{p ? `${p.ctr.toFixed(2)}%` : '—'}</dd></div>
                                </dl>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="max-h-[75vh] overflow-auto">
                    <table className="w-full min-w-[1100px] border-collapse text-sm">
                        <thead className={thead}>
                            <tr>{['Ad', 'Delivery', 'Results', 'Cost per result', 'Amount spent', 'Impressions', 'Clicks', 'CTR', 'Created'].map((l, i) => <th key={l} className={`px-3 py-3 ${i > 1 && i < 8 ? 'text-right' : ''}`}>{l}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {cards.map((c) => (
                                <tr key={c.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className={`${td} max-w-96`}><b className="block truncate">{c.name || c.title || 'Untitled ad'}</b><span className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500"><PlatformTag platform={c.platform} /><span className="truncate">{c.campaign}</span></span></td>
                                    <td className={td}><Delivery platform={c.platform} status={c.status} /></td>
                                    <td className={tdNum}><Results value={c.perf?.conversions} type={c.perf?.resultType} platform={c.platform} /></td>
                                    <td className={tdNum}>{c.perf ? <CostPerResult row={c.perf} currency={c.perf.currency || currency} /> : '—'}</td>
                                    <td className={tdNum}>{c.perf ? money(c.perf.spend, c.perf.currency || currency) : '—'}</td>
                                    <td className={tdNum}>{c.perf ? int(c.perf.impressions) : '—'}</td>
                                    <td className={tdNum}>{c.perf ? int(c.perf.clicks) : '—'}</td>
                                    <td className={tdNum}>{c.perf ? `${c.perf.ctr.toFixed(2)}%` : '—'}</td>
                                    <td className={`${td} whitespace-nowrap`}>{fmtDate(c.createdTime || c.firstSeenAt) || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

/* ───────────────────── Keywords ───────────────────── */
export function KeywordsTab({ rows, currency, fileBase, showClient }) {
    const [query, setQuery] = useState('');
    const [activeOnly, setActiveOnly] = useState(true);
    const [match, setMatch] = useState('');
    const list = useMemo(
        () =>
            rows
                .map((r) => ({ ...r, ...splitKeyword(r.keyword, r.entity) }))
                .filter((r) => (!activeOnly || isLive(r)) && (!match || r.match === match) && matches(query, r.text, r.campaign, r.adGroup, r.clientName)),
        [rows, activeOnly, match, query]
    );
    const { sorted, header } = useSort(list, 'clicks');
    return (
        <>
            <Toolbar query={query} setQuery={setQuery} placeholder="Search keyword, ad group or campaign" count={list.length} noun="keywords">
                <ActiveToggle value={activeOnly} onChange={setActiveOnly} />
                <select aria-label="Match type" value={match} onChange={(e) => setMatch(e.target.value)} className={input}>
                    <option value="">All match types</option>
                    {['Exact', 'Phrase', 'Broad'].map((m) => <option key={m}>{m}</option>)}
                </select>
                <ExportButton
                    onClick={() =>
                        downloadCsv(`${fileBase}-keywords.csv`, [
                            { label: 'Client', value: 'clientName' }, { label: 'Campaign', value: 'campaign' }, { label: 'Ad group', value: 'adGroup' }, { label: 'Keyword', value: 'text' }, { label: 'Match type', value: 'match' },
                            { label: 'Status', value: (r) => deliveryOf('google', r.status).label }, { label: 'Impressions', value: 'impressions' }, { label: 'Clicks', value: 'clicks' }, { label: 'CTR %', value: (r) => r.ctr.toFixed(2) },
                            { label: 'Avg CPC', value: (r) => r.cpc.toFixed(2) }, { label: 'Cost', value: (r) => r.spend.toFixed(2) }, { label: 'Conversions', value: 'conversions' }, { label: 'Cost per conversion', value: (r) => r.cpr.toFixed(2) },
                            { label: 'First active', value: 'firstActive' }, { label: 'Last active', value: 'lastActive' },
                        ], sorted)
                    }
                />
            </Toolbar>
            {sorted.length ? (
                <div className="max-h-[75vh] overflow-auto">
                    <table className="w-full min-w-[1200px] border-collapse text-sm">
                        <thead className={thead}>
                            <tr>
                                {header('text', 'Keyword')}
                                {header((r) => deliveryOf('google', r.status).label, 'Status')}
                                {header('impressions', 'Impr.', { right: true })}
                                {header('clicks', 'Clicks', { right: true })}
                                {header('ctr', 'CTR', { right: true })}
                                {header('cpc', 'Avg. CPC', { right: true })}
                                {header('spend', 'Cost', { right: true })}
                                {header('conversions', 'Conversions', { right: true })}
                                {header((r) => r.cpr || Infinity, 'Cost / conv.', { right: true })}
                                {header('firstActive', 'Active dates')}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sorted.map((r) => (
                                <tr key={`${r.accountId}-${r.entityId}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className={`${td} max-w-96`}>
                                        <b className="mr-1.5">{r.text}</b>
                                        {r.match && <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">{r.match}</span>}
                                        <span className="mt-1 block truncate text-[11px] text-slate-500">{r.campaign}{r.adGroup ? ` · ${r.adGroup}` : ''}{showClient ? ` · ${r.clientName}` : ''}</span>
                                    </td>
                                    <td className={td}><Delivery platform="google" status={r.status} /></td>
                                    <td className={tdNum}>{int(r.impressions)}</td>
                                    <td className={tdNum}>{int(r.clicks)}</td>
                                    <td className={tdNum}>{r.ctr.toFixed(2)}%</td>
                                    <td className={tdNum}>{r.clicks ? money(r.cpc, r.currency || currency) : '—'}</td>
                                    <td className={`${tdNum} font-semibold`}>{money(r.spend, r.currency || currency)}</td>
                                    <td className={tdNum}>{r.conversions ? num1(r.conversions) : '—'}</td>
                                    <td className={tdNum}>{r.cpr ? money(r.cpr, r.currency || currency) : '—'}</td>
                                    <td className={`${td} text-xs whitespace-nowrap text-slate-500`}>{r.firstActive ? `${fmtDate(r.firstActive)} – ${fmtDate(r.lastActive)}` : 'No delivery'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <Empty text="No keywords for these filters. Keywords come from Google Search and Call campaigns." />
            )}
        </>
    );
}

/* ───────────────────── Shopping products ───────────────────── */
export function ProductsTab({ rows, currency, fileBase }) {
    const [query, setQuery] = useState('');
    const list = useMemo(() => rows.filter((r) => matches(query, r.entity, r.productId, r.productBrand, r.productType, r.campaign)), [rows, query]);
    const { sorted, header } = useSort(list, 'conversions');
    return (
        <>
            <Toolbar query={query} setQuery={setQuery} placeholder="Search product, ID, brand or type" count={list.length} noun="products">
                <ExportButton
                    onClick={() =>
                        downloadCsv(`${fileBase}-products.csv`, [
                            { label: 'Campaign', value: 'campaign' }, { label: 'Product', value: 'entity' }, { label: 'Product ID', value: 'productId' }, { label: 'Brand', value: 'productBrand' }, { label: 'Type', value: 'productType' },
                            { label: 'Impressions', value: 'impressions' }, { label: 'Clicks', value: 'clicks' }, { label: 'CTR %', value: (r) => r.ctr.toFixed(2) }, { label: 'Cost', value: (r) => r.spend.toFixed(2) },
                            { label: 'Conversions', value: 'conversions' }, { label: 'Cost per conversion', value: (r) => r.cpr.toFixed(2) },
                        ], sorted)
                    }
                />
            </Toolbar>
            {sorted.length ? (
                <div className="max-h-[75vh] overflow-auto">
                    <table className="w-full min-w-[1000px] border-collapse text-sm">
                        <thead className={thead}>
                            <tr>
                                {header('entity', 'Product')}
                                {header('impressions', 'Impr.', { right: true })}
                                {header('clicks', 'Clicks', { right: true })}
                                {header('ctr', 'CTR', { right: true })}
                                {header('spend', 'Cost', { right: true })}
                                {header('conversions', 'Conversions', { right: true })}
                                {header((r) => r.cpr || Infinity, 'Cost / conv.', { right: true })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sorted.map((r) => (
                                <tr key={`${r.accountId}-${r.entityId}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className={`${td} max-w-[28rem]`}>
                                        <b className="block truncate" title={r.entity}>{r.entity}</b>
                                        <span className="block truncate text-[11px] text-slate-500">{[r.productId && `ID ${r.productId}`, r.productBrand, r.productType, r.campaign].filter(Boolean).join(' · ')}</span>
                                    </td>
                                    <td className={tdNum}>{int(r.impressions)}</td>
                                    <td className={tdNum}>{int(r.clicks)}</td>
                                    <td className={tdNum}>{r.ctr.toFixed(2)}%</td>
                                    <td className={`${tdNum} font-semibold`}>{money(r.spend, r.currency || currency)}</td>
                                    <td className={tdNum}>{r.conversions ? num1(r.conversions) : '—'}</td>
                                    <td className={tdNum}>{r.cpr ? money(r.cpr, r.currency || currency) : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <Empty text="No Shopping or Performance Max products for these filters." />
            )}
        </>
    );
}

/* ───────────────────── Timeline ───────────────────── */
export function TimelineTab({ campaigns, keywords, creatives, from, to }) {
    const [kind, setKind] = useState('all');
    const events = useMemo(() => {
        const list = [];
        for (const c of campaigns) {
            const name = c.campaign || c.entity;
            if (c.firstActive && c.firstActive > from) list.push({ date: c.firstActive, kind: 'campaign', platform: c.platform, text: `Started delivering: ${name}`, detail: `${campaignType(c)}${c.clientName ? ` · ${c.clientName}` : ''}` });
            if (c.lastActive && c.lastActive < to) list.push({ date: c.lastActive, kind: 'campaign', platform: c.platform, text: `Last delivery: ${name}`, detail: `No spend after this date · now ${deliveryOf(c.platform, c.status).label.toLowerCase()}` });
            if (c.startTime && c.startTime.slice(0, 10) >= from && c.startTime.slice(0, 10) <= to) list.push({ date: c.startTime.slice(0, 10), kind: 'campaign', platform: c.platform, text: `Scheduled start: ${name}` });
            if (c.endTime && c.endTime.slice(0, 10) >= from && c.endTime.slice(0, 10) <= to) list.push({ date: c.endTime.slice(0, 10), kind: 'campaign', platform: c.platform, text: `Scheduled end: ${name}` });
        }
        for (const a of creatives) {
            const date = String(a.createdTime || a.firstSeenAt || '').slice(0, 10);
            if (date && date >= from && date <= to) list.push({ date, kind: 'ad', platform: a.platform, text: `${a.createdTime ? 'New ad created' : 'New ad found'}: ${a.name || a.title || 'Untitled ad'}`, detail: [a.campaign, a.headlines?.[0] || a.title].filter(Boolean).join(' · ') });
        }
        const kwByDay = new Map();
        for (const k of keywords) {
            if (k.firstActive && k.firstActive > from) {
                const key = `${k.firstActive}|${k.campaign}`;
                const item = kwByDay.get(key) || { date: k.firstActive, kind: 'keyword', platform: 'google', campaign: k.campaign, words: [] };
                item.words.push(splitKeyword(k.keyword, k.entity).text);
                kwByDay.set(key, item);
            }
        }
        for (const item of kwByDay.values()) list.push({ ...item, text: `${item.words.length} keyword${item.words.length === 1 ? '' : 's'} started getting impressions in ${item.campaign}`, detail: item.words.slice(0, 12).join(', ') + (item.words.length > 12 ? '…' : '') });
        return list.sort((a, b) => b.date.localeCompare(a.date));
    }, [campaigns, keywords, creatives, from, to]);
    const shown = events.filter((e) => kind === 'all' || e.kind === kind);
    return (
        <div className="p-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                {[['all', 'All'], ['campaign', 'Campaigns'], ['ad', 'Ads'], ['keyword', 'Keywords']].map(([k, l]) => (
                    <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${kind === k ? 'border-[#0A2E66] bg-[#0A2E66] text-white dark:border-orange-400 dark:bg-orange-400 dark:text-slate-950' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>
                        {l} <span className="opacity-70">{k === 'all' ? events.length : events.filter((e) => e.kind === k).length}</span>
                    </button>
                ))}
                <span className="ml-auto text-xs text-slate-500">Built from synced data: first and last delivery dates, schedules and new ads.</span>
            </div>
            {shown.length ? (
                <ol className="space-y-2">
                    {shown.map((e, i) => {
                        const head = i === 0 || shown[i - 1].date !== e.date ? <li key={`d${e.date}`} className="pt-3 text-xs font-bold text-slate-500 first:pt-0">{new Date(`${e.date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</li> : null;
                        return [
                            head,
                            <li key={i} className="flex gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                <span className={`mt-0.5 h-8 w-1 shrink-0 rounded-full ${e.kind === 'campaign' ? 'bg-blue-500' : e.kind === 'ad' ? 'bg-orange-500' : 'bg-violet-500'}`} />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold">{e.text}</p>
                                    {e.detail && <p className="mt-0.5 text-xs text-slate-500">{e.detail}</p>}
                                    <div className="mt-1"><PlatformTag platform={e.platform} /></div>
                                </div>
                            </li>,
                        ];
                    })}
                </ol>
            ) : (
                <Empty text="Nothing changed in this date range." />
            )}
        </div>
    );
}

/* ───────────────────── Raw daily rows ───────────────────── */
export function RawTab({ from, to, platform, clientId, currency, fileBase }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [level, setLevel] = useState('campaign');
    const [query, setQuery] = useState('');
    useEffect(() => {
        let active = true;
        const params = new URLSearchParams({ from, to, platform: platform === 'all' ? '' : platform, clientId });
        fetch(`/api/ads-dashboard?${params}`)
            .then((r) => r.json().then((json) => ({ ok: r.ok, json })))
            .then(({ ok, json }) => {
                if (!active) return;
                if (!ok) throw new Error(json.error || 'Could not load daily rows.');
                setRows(json.rows || []);
            })
            .catch((err) => active && setError(err.message))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [from, to, platform, clientId]);
    const list = useMemo(() => rows.filter((r) => (level === 'all' || r.level === level) && matches(query, r.keyword, r.entity, r.campaign, r.adGroup, r.clientName, r.accountId)), [rows, level, query]);
    return (
        <>
            <Toolbar query={query} setQuery={setQuery} placeholder="Search keyword, ad, campaign or client" count={list.length} noun="rows">
                <select value={level} onChange={(e) => setLevel(e.target.value)} className={input} aria-label="Data level">
                    <option value="campaign">Campaign rows</option>
                    <option value="all">All levels</option>
                    <option value="ad_group">Ad groups</option>
                    <option value="ad_set">Ad sets</option>
                    <option value="ad">Ads</option>
                    <option value="keyword">Keywords</option>
                    <option value="shopping_product">Shopping / PMax products</option>
                </select>
                <ExportButton
                    onClick={() =>
                        downloadCsv(
                            `${fileBase}-daily-rows.csv`,
                            ['date', 'clientName', 'platform', 'accountId', 'level', 'campaign', 'adGroup', 'entity', 'keyword', 'productId', 'status', 'currency', 'impressions', 'clicks', 'spend', 'cpc', 'ctr', 'conversions', 'resultType', 'reach'].map((k) => ({ label: k, value: k })),
                            list
                        )
                    }
                />
            </Toolbar>
            {rows.length >= 5000 && <p className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Showing the first 5,000 daily rows. Pick a client or a shorter range to see all of them. Totals on the other tabs always include every row.</p>}
            {error && <p className="px-4 py-3 text-sm text-red-600">{error}</p>}
            {list.length ? (
                <div className="max-h-[75vh] overflow-auto">
                    <table className="w-full min-w-[1300px] border-collapse text-sm">
                        <thead className={thead}>
                            <tr>{['Date', 'Client', 'Level', 'Campaign', 'Ad group / ad set', 'Ad / keyword / product', 'Impr.', 'Clicks', 'Spend', 'Results', 'Cost / result'].map((l, i) => <th key={l} className={`px-3 py-3 whitespace-nowrap ${i > 5 ? 'text-right' : ''}`}>{l}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {list.map((r) => (
                                <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className={`${td} whitespace-nowrap text-slate-500`}>{r.date}</td>
                                    <td className={`${td} max-w-40 truncate`}>{r.clientName}</td>
                                    <td className={`${td} capitalize`}><PlatformTag platform={r.platform} /> <span className="ml-1">{r.level.replace('_', ' ')}</span></td>
                                    <td className={`${td} max-w-48 truncate`} title={r.campaign}>{r.campaign || '—'}</td>
                                    <td className={`${td} max-w-40 truncate`} title={r.adGroup}>{r.adGroup || '—'}</td>
                                    <td className={`${td} max-w-52 truncate`} title={r.keyword || r.entity}>{r.level === 'keyword' ? `${splitKeyword(r.keyword, r.entity).text} (${splitKeyword(r.keyword, r.entity).match})` : r.entity || '—'}</td>
                                    <td className={tdNum}>{int(r.impressions)}</td>
                                    <td className={tdNum}>{int(r.clicks)}</td>
                                    <td className={tdNum}>{money(r.spend, r.currency || currency)}</td>
                                    <td className={tdNum}>{Number(r.conversions) ? num1(r.conversions) : '—'}</td>
                                    <td className={tdNum}>{Number(r.conversions) ? money(Number(r.spend) / Number(r.conversions), r.currency || currency) : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <Empty loading={loading} text="No daily rows for these filters." />
            )}
        </>
    );
}
