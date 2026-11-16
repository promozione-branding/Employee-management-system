// app/reports/discover/page.jsx

'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function DiscoverForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editClientId = searchParams.get('clientId');

    const [google, setGoogle] = useState(null);
    const [meta, setMeta] = useState(null);

    // Form states
    const [name, setName] = useState('');
    const [emails, setEmails] = useState('');
    const [websites, setWebsites] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [seoPreview, setSeoPreview] = useState(null); // 👈 To show keywords in UI

    // Search states
    const [customers, setCustomers] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [gscSearch, setGscSearch] = useState('');
    const [gadsSearch, setGadsSearch] = useState('');
    const [metaAdsSearch, setMetaAdsSearch] = useState('');
    const [metaPageSearch, setMetaPageSearch] = useState('');

    const [selection, setSelection] = useState({
        ga4PropertyIds: [],
        gscSiteUrls: [],
        googleAdsCustomerIds: [],
        metaAdAccountIds: [],
        metaPageIds: [],
    });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    // API CALL FOR CUSTOMER SEARCH
    useEffect(() => {
        if (customerSearch.length < 2) {
            setCustomers([]);
            return;
        }
        const delay = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/reports/search-customers?q=${encodeURIComponent(customerSearch)}`);
                const data = await res.json();
                setCustomers(data.customers || []);
            } finally {
                setIsSearching(false);
            }
        }, 400);
        return () => clearTimeout(delay);
    }, [customerSearch]);

    useEffect(() => {
        (async () => {
            try {
                const [g, m] = await Promise.all([
                    fetch('/api/reports/discover/google').then((r) => r.json()),
                    fetch('/api/reports/discover/meta').then((r) => r.json()),
                ]);
                setGoogle(g);
                setMeta(m);

                if (editClientId) {
                    const cl = await fetch(`/api/reports/clients/${editClientId}`).then((r) => r.json());
                    if (cl.client) {
                        setName(cl.client.name || '');
                        setEmails((cl.client.emails || []).join(', '));
                        setWebsites((cl.client.websites || []).join(', '));
                        setCustomerId(cl.client.customerId || '');
                        setSelection({
                            ga4PropertyIds: cl.client.ga4PropertyIds || [],
                            gscSiteUrls: cl.client.gscSiteUrls || [],
                            googleAdsCustomerIds: cl.client.googleAdsCustomerIds || [],
                            metaAdAccountIds: cl.client.metaAdAccountIds || [],
                            metaPageIds: cl.client.metaPageIds || [],
                        });
                    }
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [editClientId]);

    function toggle(field, value) {
        setSelection((s) => {
            const arr = s[field] || [];
            return {
                ...s,
                [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
            };
        });
    }

    // 👈 UPDATED TO SAVE KEYWORDS FOR UI PREVIEW
    async function handleCustomerSelect(c) {
        setName(c.company || c.name || '');
        setCustomerId(c._id);
        if (c.email) setEmails(c.email);

        let siteList = [];
        if (c.website) siteList.push(...c.website.split(',').map((s) => s.trim()));

        try {
            const seoRes = await fetch(`/api/reports/seo/${c._id}`).then((r) => r.json());
            if (seoRes.websites && Array.isArray(seoRes.websites)) {
                siteList = [...siteList, ...seoRes.websites];
            }
            if (seoRes.seoData) {
                setSeoPreview(seoRes.seoData); // Save for UI display
            }
        } catch (e) {
            console.error('Failed to load SEO websites', e);
        }

        const uniqueSites = [...new Set(siteList)].filter(Boolean);
        setWebsites(uniqueSites.join(', '));
        setCustomerSearch('');
    }

    async function save() {
        if (!name.trim()) return alert('Enter client name');
        setBusy(true);
        try {
            const payload = {
                name: name.trim(),
                emails: emails
                    .split(',')
                    .map((e) => e.trim())
                    .filter(Boolean),
                websites: websites
                    .split(',')
                    .map((w) => w.trim())
                    .filter(Boolean),
                customerId: customerId || null,
                ...selection,
            };
            const url = editClientId ? `/api/reports/clients/${editClientId}` : '/api/reports/clients';
            const method = editClientId ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed');
            router.push(editClientId ? `/reports/${editClientId}` : `/reports/${json.client._id}`);
        } catch (e) {
            alert(`Error: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }

    if (loading) return <div className="p-6">Loading accounts...</div>;

    const filteredGsc = (google?.gsc || []).filter((s) => s.siteUrl.toLowerCase().includes(gscSearch.toLowerCase()));
    const filteredGads = (google?.googleAds || []).filter(
        (a) => (a.name || '').toLowerCase().includes(gadsSearch.toLowerCase()) || (a.customerId || '').includes(gadsSearch)
    );
    const filteredMetaAds = (meta?.adAccounts || []).filter(
        (a) => (a.name || '').toLowerCase().includes(metaAdsSearch.toLowerCase()) || (a.id || '').includes(metaAdsSearch)
    );
    const filteredMetaPages = (meta?.pages || []).filter(
        (p) => (p.name || '').toLowerCase().includes(metaPageSearch.toLowerCase()) || (p.id || '').includes(metaPageSearch)
    );

    return (
        <div className="mx-auto max-w-6xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{editClientId ? 'Edit Client Accounts' : 'Add Report Client'}</h1>

            <div className="mb-4 space-y-4 rounded border bg-white p-4 shadow-sm">
                <div className="relative rounded border border-blue-100 bg-blue-50 p-4">
                    <label className="mb-2 block text-sm font-bold text-blue-800">Step 1: Search Customer (by Company, Name, Email)</label>
                    <input
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="Type at least 2 letters..."
                        className="w-full rounded border px-3 py-2"
                    />
                    {isSearching && <div className="mt-1 text-xs text-blue-600">Searching database...</div>}

                    {customerSearch.length >= 2 && !isSearching && (
                        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow-lg">
                            {customers.length === 0 ? (
                                <div className="p-3 text-sm text-gray-500">No company found.</div>
                            ) : (
                                customers.map((c) => (
                                    <div
                                        key={c._id}
                                        onClick={() => handleCustomerSelect(c)}
                                        className="flex cursor-pointer items-center justify-between border-b p-3 text-sm hover:bg-blue-100"
                                    >
                                        <div>
                                            <div className="font-bold text-gray-800">{c.company || c.name}</div>
                                            <div className="text-xs text-gray-500">{c.website || 'No website'}</div>
                                        </div>
                                        <div className="rounded bg-gray-200 px-2 py-1 text-xs">{c.email || 'No email'}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {customerId && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                            <span className="rounded border border-green-300 bg-green-100 px-2 py-1 font-semibold">✅ Linked</span>
                            Selected ID: {customerId}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Client Name *</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border px-3 py-2" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Emails (comma separated)</label>
                        <input value={emails} onChange={(e) => setEmails(e.target.value)} className="w-full rounded border px-3 py-2" />
                    </div>
                    <div className="col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Websites (comma separated)</label>
                        <textarea
                            value={websites}
                            onChange={(e) => setWebsites(e.target.value)}
                            className="h-20 w-full rounded border px-3 py-2"
                            placeholder="These will auto-fill from SEO data..."
                        />
                    </div>
                </div>

                {/* 👈 NEW UI: SHOW SEO KEYWORDS PREVIEW */}
                {seoPreview && Object.keys(seoPreview).length > 0 && (
                    <div className="mt-4 rounded border border-green-200 bg-green-50 p-4">
                        <h3 className="mb-3 text-sm font-bold text-green-800">✅ SEO Keywords Found in Database</h3>
                        <div className="max-h-60 space-y-3 overflow-auto">
                            {Object.entries(seoPreview).map(([site, kws]) => (
                                <div key={site} className="rounded border bg-white p-3 shadow-sm">
                                    <div className="mb-2 border-b pb-1 font-semibold text-gray-800">
                                        🌐 {site} ({kws.length} keywords)
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {kws.slice(0, 10).map((kw, i) => (
                                            <span key={i} className="rounded border bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                                {kw.keyword} <span className="text-gray-400">(Pos {kw.position})</span>
                                            </span>
                                        ))}
                                        {kws.length > 10 && <span className="py-1 text-xs text-gray-500">+{kws.length - 10} more...</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* REST OF THE DISCOVERY PAGE (Google/Meta sections) */}
            <div className="space-y-4">
                <Section
                    title="GA4 Properties"
                    items={google?.ga4}
                    idKey="propertyId"
                    labelKey="displayName"
                    extraKey="account"
                    selected={selection.ga4PropertyIds}
                    toggle={(v) => toggle('ga4PropertyIds', v)}
                    error={google?.ga4Error}
                />

                <div className="mb-2 rounded border border-blue-200 bg-blue-50 p-3">
                    <label className="mb-1 block text-sm font-medium text-blue-800">🔍 Search Console Sites</label>
                    <input
                        value={gscSearch}
                        onChange={(e) => setGscSearch(e.target.value)}
                        placeholder="Search by domain..."
                        className="mb-3 w-full rounded border border-blue-300 px-3 py-2"
                    />
                    <Section
                        title="Sites"
                        items={filteredGsc}
                        idKey="siteUrl"
                        labelKey="siteUrl"
                        extraKey="permissionLevel"
                        selected={selection.gscSiteUrls}
                        toggle={(v) => toggle('gscSiteUrls', v)}
                        error={google?.gscError}
                    />
                </div>

                <div className="mb-2 rounded border border-orange-200 bg-orange-50 p-3">
                    <label className="mb-1 block text-sm font-medium text-orange-800">🔍 Google Ads Accounts</label>
                    <input
                        value={gadsSearch}
                        onChange={(e) => setGadsSearch(e.target.value)}
                        placeholder="Search by name or ID..."
                        className="mb-3 w-full rounded border border-orange-300 px-3 py-2"
                    />
                    <Section
                        title="Accounts"
                        items={filteredGads}
                        idKey="customerId"
                        labelKey="name"
                        extraKey="currency"
                        selected={selection.googleAdsCustomerIds}
                        toggle={(v) => toggle('googleAdsCustomerIds', v)}
                        error={google?.googleAdsError}
                    />
                </div>

                <div className="mb-2 rounded border border-purple-200 bg-purple-50 p-3">
                    <label className="mb-1 block text-sm font-medium text-purple-800">🔍 Meta Ad Accounts</label>
                    <input
                        value={metaAdsSearch}
                        onChange={(e) => setMetaAdsSearch(e.target.value)}
                        placeholder="Search by name or ID..."
                        className="mb-3 w-full rounded border border-purple-300 px-3 py-2"
                    />
                    <Section
                        title="Accounts"
                        items={filteredMetaAds}
                        idKey="id"
                        labelKey="name"
                        extraKey="currency"
                        selected={selection.metaAdAccountIds}
                        toggle={(v) => toggle('metaAdAccountIds', v)}
                        error={meta?.adAccountsError}
                    />
                </div>

                <div className="mb-2 rounded border border-indigo-200 bg-indigo-50 p-3">
                    <label className="mb-1 block text-sm font-medium text-indigo-800">🔍 Meta Pages</label>
                    <input
                        value={metaPageSearch}
                        onChange={(e) => setMetaPageSearch(e.target.value)}
                        placeholder="Search by name or ID..."
                        className="mb-3 w-full rounded border border-indigo-300 px-3 py-2"
                    />
                    <Section
                        title="Pages"
                        items={filteredMetaPages}
                        idKey="id"
                        labelKey="name"
                        extraKey="link"
                        selected={selection.metaPageIds}
                        toggle={(v) => toggle('metaPageIds', v)}
                        error={meta?.pagesError}
                    />
                </div>
            </div>

            <div className="sticky bottom-4 mt-6">
                <button onClick={save} disabled={busy} className="w-full rounded bg-green-600 py-3 font-bold text-white shadow-lg disabled:opacity-50">
                    {busy ? 'Saving...' : editClientId ? '💾 Update Client' : '💾 Save Client'}
                </button>
            </div>
        </div>
    );
}

function Section({ title, items, idKey, labelKey, extraKey, selected, toggle, error }) {
    if (error)
        return (
            <div className="rounded border-2 border-red-400 bg-red-50 p-4">
                <h3 className="font-bold text-red-800">{title}: Error</h3>
                <p className="mt-1 font-mono text-sm text-red-700">{error}</p>
            </div>
        );
    if (!items || items.length === 0) return <div className="rounded border p-3 text-sm text-gray-500">{title}: none found</div>;
    return (
        <div className="rounded border bg-white p-3">
            <h3 className="mb-2 font-semibold">
                {title} <span className="text-xs text-gray-500">({items.length})</span>
            </h3>
            <div className="max-h-60 space-y-1 overflow-auto">
                {items.map((item) => {
                    const id = item[idKey];
                    const label = item[labelKey] || id;
                    const extra = extraKey ? item[extraKey] : null;
                    return (
                        <label key={id} className="flex cursor-pointer items-center gap-2 rounded p-1 text-sm hover:bg-gray-50">
                            <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} className="h-4 w-4" />
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700">{id}</span>
                            <span className="truncate">{label}</span>
                            {extra && <span className="ml-auto text-xs text-gray-400">({extra})</span>}
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

export default function DiscoverPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
            <DiscoverForm />
        </Suspense>
    );
}
