// app/reports/page.jsx

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ReportsPage() {
    const [clients, setClients] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const [c, s] = await Promise.all([fetch('/api/reports/clients').then((r) => r.json()), fetch('/api/reports/admin/status').then((r) => r.json())]);
            setClients(c.clients || []);
            setStatus(s);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleDelete(id, name) {
        if (!confirm(`Are you sure you want to delete the report for "${name}"?`)) return;
        try {
            await fetch(`/api/reports/clients/${id}`, { method: 'DELETE' });
            load();
        } catch (e) {
            alert(`Error: ${e.message}`);
        }
    }

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="mx-auto max-w-6xl p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Client Reports</h1>
                <div className="space-x-2">
                    <a
                        href="/api/reports/auth/google"
                        className={`rounded px-3 py-1 text-sm ${status?.googleConnected ? 'bg-green-100 text-green-700' : 'bg-red-600 text-white'}`}
                    >
                        {status?.googleConnected ? '✓ Google Connected' : 'Connect Google'}
                    </a>
                    <a
                        href="/api/reports/auth/meta"
                        className={`rounded px-3 py-1 text-sm ${status?.metaConnected ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white'}`}
                    >
                        {status?.metaConnected ? '✓ Meta Connected' : 'Connect Meta'}
                    </a>
                    <Link href="/reports/discover" className="rounded bg-purple-600 px-3 py-1 text-sm text-white">
                        + Add Client
                    </Link>
                </div>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-2 text-xs">
                <StatusCard label="Google OAuth" on={status?.googleConnected} />
                <StatusCard label="Meta Token" on={status?.metaConnected} />
                <StatusCard label="Google Ads API" on={status?.googleAdsConfigured} />
                <StatusCard label="Resend Email" on={status?.resendConfigured} />
            </div>

            {clients.length === 0 ? (
                <div className="rounded border p-6 text-center text-gray-500">
                    <p className="mb-2">No clients yet.</p>
                    <Link href="/reports/discover" className="text-blue-600 underline">
                        Discover accounts →
                    </Link>
                </div>
            ) : (
                <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">Client</th>
                            <th className="p-2 text-left">Emails</th>
                            <th className="p-2 text-left">Accounts</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((c) => (
                            <tr key={c._id} className="border-t">
                                <td className="p-2 font-medium">{c.name}</td>
                                <td className="p-2">{c.emails?.join(', ') || '-'}</td>
                                <td className="p-2 text-xs">
                                    GA4: {c.ga4PropertyIds?.length || 0} · GSC: {c.gscSiteUrls?.length || 0} · GAds: {c.googleAdsCustomerIds?.length || 0} ·
                                    Meta: {c.metaAdAccountIds?.length || 0}
                                </td>
                                <td className="space-x-2 p-2 whitespace-nowrap">
                                    <Link href={`/reports/${c._id}`} className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
                                        Open
                                    </Link>
                                    <Link
                                        href={`/reports/discover?clientId=${c._id}`}
                                        className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-800 hover:bg-gray-300"
                                    >
                                        ✏️ Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(c._id, c.name)}
                                        className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                                    >
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

function StatusCard({ label, on }) {
    return (
        <div className={`rounded border p-2 ${on ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
            <div className="font-semibold">
                {on ? '✓' : '✗'} {label}
            </div>
        </div>
    );
}
