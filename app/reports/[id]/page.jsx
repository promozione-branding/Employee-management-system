// app/reports/[id]/page.jsx

'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportClientDetail({ params }) {
    const router = useRouter();
    const { id } = use(params);
    const [client, setClient] = useState(null);
    const [busy, setBusy] = useState(false);
    const [periodType, setPeriodType] = useState('monthly');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [latestReportId, setLatestReportId] = useState(null);

    async function load() {
        const res = await fetch(`/api/reports/clients/${id}`);
        const json = await res.json();
        setClient(json.client);
    }

    useEffect(() => {
        load();
    }, [id]);

    async function handleGenerate() {
        setBusy(true);
        try {
            const gen = await fetch(`/api/reports/${id}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    periodType,
                    start: customStart,
                    end: customEnd,
                }),
            });
            const genJson = await gen.json();
            if (!gen.ok) throw new Error(genJson.error || 'Generate failed');

            setLatestReportId(genJson.reportId);
            window.open(`/api/reports/${genJson.reportId}/view`, '_blank');
        } catch (e) {
            alert(`Error: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }

    if (!client) return <div className="p-6">Loading...</div>;

    return (
        <div className="mx-auto max-w-5xl p-6">
            <button onClick={() => router.push('/reports')} className="mb-2 text-sm text-blue-600 hover:underline">
                ← Back
            </button>
            <h1 className="mb-4 text-2xl font-bold">{client.name}</h1>

            <div className="mb-4 space-y-3 rounded border bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Connected Accounts</h2>
                    <a href={`/reports/discover?clientId=${id}`} className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-800 transition hover:bg-gray-300">
                        ✏️ Edit Accounts
                    </a>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex gap-2 border-b pb-2">
                        <span className="w-32 font-medium">Google Ads:</span>
                        <div className="flex flex-wrap gap-1">
                            {client.googleAdsCustomerIds?.length ? (
                                client.googleAdsCustomerIds.map((u) => (
                                    <span key={u} className="rounded border border-orange-100 bg-orange-50 px-2 py-0.5 text-orange-700">
                                        {u}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400">None</span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 border-b pb-2">
                        <span className="w-32 font-medium">Meta Ad Accounts:</span>
                        <div className="flex flex-wrap gap-1">
                            {client.metaAdAccountIds?.length ? (
                                client.metaAdAccountIds.map((u) => (
                                    <span key={u} className="rounded border border-purple-100 bg-purple-50 px-2 py-0.5 text-purple-700">
                                        {u}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400">None</span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 border-b pb-2">
                        <span className="w-32 font-medium">Meta Pages:</span>
                        <div className="flex flex-wrap gap-1">
                            {client.metaPageIds?.length ? (
                                client.metaPageIds.map((u) => (
                                    <span key={u} className="rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-indigo-700">
                                        {u}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400">None</span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 border-b pb-2">
                        <span className="w-32 font-medium">GSC Sites:</span>
                        <div className="flex flex-wrap gap-1">
                            {client.gscSiteUrls?.length ? (
                                client.gscSiteUrls.map((u) => (
                                    <span key={u} className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-blue-700">
                                        {u}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400">None</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6 rounded border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Generate Report</h2>
                <div className="mb-6 flex flex-col gap-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Select Date Range</label>
                        <div className="flex flex-wrap items-center gap-4">
                            <select value={periodType} onChange={(e) => setPeriodType(e.target.value)} className="rounded border bg-gray-50 px-3 py-2">
                                <option value="weekly">Last 7 Days</option>
                                <option value="monthly">Last 1 Month</option>
                                <option value="3month">Last 3 Months</option>
                                <option value="6month">Last 6 Months</option>
                                <option value="custom">Custom Date Range</option>
                            </select>
                            {periodType === 'custom' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        className="rounded border px-2 py-1.5"
                                    />
                                    <span>to</span>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        className="rounded border px-2 py-1.5"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={busy}
                    className="w-full rounded bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {busy ? 'Generating PDF...' : '📄 Generate & View PDF Report'}
                </button>
            </div>
        </div>
    );
}
