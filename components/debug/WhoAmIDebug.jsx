// components/debug/WhoAmIDebug.jsx

'use client';
import { useEffect, useState } from 'react';

export default function WhoAmIDebug() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    const fetchWhoAmI = async () => {
        try {
            setLoading(true);
            setErr(null);
            // We still hit the same API
            const res = await fetch('/api/test/whoami', { credentials: 'include' });
            const json = await res.json();
            setData(json);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWhoAmI();
    }, []);

    return (
        <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 13, background: '#fafafa', minHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🔍 Who Am I — Debug</h1>
                <button
                    onClick={fetchWhoAmI}
                    style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                    Refresh
                </button>
            </div>

            {loading && <p>Loading…</p>}
            {err && <pre style={{ color: 'red' }}>{err}</pre>}

            {data && !data.success && (
                <div style={{ background: '#fee', border: '1px solid #f99', padding: 12, borderRadius: 6, marginBottom: 16 }}>
                    <strong>❌ API returned success: false</strong>
                    <pre style={{ margin: 0, color: '#900' }}>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}

            {data?.success && (
                <>
                    <section style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>✅ Quick interpretation</h2>
                        <table style={{ borderCollapse: 'collapse', background: '#fff' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '6px 12px', border: '1px solid #ddd', fontWeight: 600 }}>authUser._id</td>
                                    <td style={{ padding: '6px 12px', border: '1px solid #ddd' }}>
                                        {data.authUser?._id || <span style={{ color: 'red' }}>null → NOT LOGGED IN</span>}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '6px 12px', border: '1px solid #ddd', fontWeight: 600 }}>authUser.email</td>
                                    <td style={{ padding: '6px 12px', border: '1px solid #ddd' }}>
                                        {data.authUser?.email || <span style={{ color: 'red' }}>null</span>}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '6px 12px', border: '1px solid #ddd', fontWeight: 600 }}>authUser.role</td>
                                    <td style={{ padding: '6px 12px', border: '1px solid #ddd' }}>
                                        {data.authUser?.role || <span style={{ color: 'red' }}>null</span>}
                                    </td>
                                </tr>
                                <tr style={{ background: '#fef9c3' }}>
                                    <td style={{ padding: '6px 12px', border: '1px solid #ddd', fontWeight: 700 }}>resolvedName</td>
                                    <td style={{ padding: '6px 12px', border: '1px solid #ddd', fontWeight: 700 }}>
                                        {data.resolvedName || <span style={{ color: 'red' }}>null</span>}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                    <section>
                        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>📦 Raw JSON</h2>
                        <pre style={{ background: '#fff', padding: 12, border: '1px solid #ddd', borderRadius: 6, overflow: 'auto', maxHeight: '50vh' }}>
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </section>
                </>
            )}
        </div>
    );
}
