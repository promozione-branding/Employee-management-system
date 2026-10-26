// app/reports/page.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ReportsPage() {
  const [clients, setClients] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([
        fetch("/api/reports/clients").then(r => r.json()),
        fetch("/api/reports/admin/status").then(r => r.json()),
      ]);
      setClients(c.clients || []);
      setStatus(s);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // 👈 DELETE HANDLER
  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to delete the report for "${name}"?\n\nThis will remove it from the reporting database.`)) return;
    
    try {
      const res = await fetch(`/api/reports/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      load(); // Refresh the list
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Client Reports</h1>
        <div className="space-x-2">
          <a href="/api/reports/auth/google" className={`px-3 py-1 text-sm rounded ${status?.googleConnected ? "bg-green-100 text-green-700" : "bg-red-600 text-white"}`}>
            {status?.googleConnected ? "✓ Google Connected" : "Connect Google (Admin)"}
          </a>
          <Link href="/reports/discover" className="px-3 py-1 text-sm bg-purple-600 text-white rounded">+ Add Client</Link>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2 text-xs">
        <StatusCard label="Google OAuth" on={status?.googleConnected} />
        <StatusCard label="Meta Token" on={status?.metaConfigured} />
        <StatusCard label="Google Ads API" on={status?.googleAdsConfigured} />
        <StatusCard label="Resend Email" on={status?.resendConfigured} />
      </div>

      {clients.length === 0 ? (
        <div className="border rounded p-6 text-center text-gray-500">
          <p className="mb-2">No clients yet.</p>
          <Link href="/reports/discover" className="text-blue-600 underline">Discover accounts →</Link>
        </div>
      ) : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Client</th>
              <th className="p-2 text-left">Emails</th>
              <th className="p-2 text-left">Accounts</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c._id} className="border-t">
                <td className="p-2 font-medium">{c.name}</td>
                <td className="p-2">{c.emails?.join(", ") || "-"}</td>
                <td className="p-2 text-xs">
                  GA4: {c.ga4PropertyIds?.length || 0} · GSC: {c.gscSiteUrls?.length || 0} · GAds: {c.googleAdsCustomerIds?.length || 0} · Meta: {c.metaAdAccountIds?.length || 0}
                </td>
                <td className="p-2 space-x-2 whitespace-nowrap">
                  <Link href={`/reports/${c._id}`} className="px-3 py-1 text-sm bg-blue-600 text-white rounded">Open</Link>
                  <Link href={`/reports/discover?clientId=${c._id}`} className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded">✏️ Edit</Link>
                  <button onClick={() => handleDelete(c._id, c.name)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">🗑️ Delete</button>
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
    <div className={`border rounded p-2 ${on ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
      <div className="font-semibold">{on ? "✓" : "✗"} {label}</div>
    </div>
  );
}
