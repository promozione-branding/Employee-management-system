// app/reports/[id]/page.jsx
"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function ReportClientDetail({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [client, setClient] = useState(null);
  const [period, setPeriod] = useState("weekly");
  const [busy, setBusy] = useState(false);
  const [emails, setEmails] = useState("");

  async function load() {
    const res = await fetch(`/api/reports/clients/${id}`);
    const json = await res.json();
    setClient(json.client);
    setEmails((json.client?.emails || []).join(", "));
  }

  useEffect(() => { load(); }, [id]);

  async function saveEmails() {
    setBusy(true);
    try {
      await fetch(`/api/reports/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: emails.split(",").map(e => e.trim()).filter(Boolean) }),
      });
      await load();
      alert("Saved");
    } finally { setBusy(false); }
  }

  async function generateAndSend() {
    if (!confirm(`Generate and send ${period} report?`)) return;
    setBusy(true);
    try {
      const gen = await fetch(`/api/reports/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodType: period }),
      });
      const genJson = await gen.json();
      if (!gen.ok) throw new Error(genJson.error || "Generate failed");

      const send = await fetch(`/api/reports/${genJson.reportId}/send`, { method: "POST" });
      const sendJson = await send.json();
      if (!send.ok) throw new Error(sendJson.error || "Send failed");

      alert(`Sent to: ${sendJson.to}`);
    } catch (e) { alert(`Error: ${e.message}`); }
    finally { setBusy(false); }
  }

  if (!client) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => router.push("/reports")} className="text-sm text-blue-600 mb-2">← Back</button>
      <h1 className="text-2xl font-bold mb-4">{client.name}</h1>

      <div className="border rounded p-4 mb-4">
        <label className="block text-sm text-gray-600 mb-1">Emails (comma separated)</label>
        <div className="flex gap-2">
          <input value={emails} onChange={e => setEmails(e.target.value)} className="flex-1 border rounded px-2 py-1" />
          <button onClick={saveEmails} disabled={busy} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
        </div>
      </div>

      <div className="border rounded p-4 mb-4 text-sm space-y-1">
        <div><b>GA4:</b> {client.ga4PropertyIds?.join(", ") || "—"}</div>
        <div><b>GSC:</b> {client.gscSiteUrls?.join(", ") || "—"}</div>
        <div><b>Google Ads:</b> {client.googleAdsCustomerIds?.join(", ") || "—"}</div>
        <div><b>Meta Ads:</b> {client.metaAdAccountIds?.join(", ") || "—"}</div>
        <div><b>Meta Pages:</b> {client.metaPageIds?.join(", ") || "—"}</div>
      </div>

      <div className="border rounded p-4 flex gap-2 items-center">
        <select value={period} onChange={e => setPeriod(e.target.value)} className="border rounded px-2 py-1">
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button onClick={generateAndSend} disabled={busy} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          {busy ? "Working..." : "Generate & Send"}
        </button>
      </div>
    </div>
  );
}
