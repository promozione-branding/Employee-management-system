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
  const [latestReportId, setLatestReportId] = useState(null);

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

  async function generateAndSend(sendEmail = false) {
    if (sendEmail && !confirm(`Generate and send ${period} report via email?`)) return;
    if (!sendEmail) setBusy(true);

    try {
      // 1. Generate the report data
      const gen = await fetch(`/api/reports/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodType: period }),
      });
      const genJson = await gen.json();
      if (!gen.ok) throw new Error(genJson.error || "Generate failed");

      setLatestReportId(genJson.reportId);

      if (sendEmail) {
        // 2. Send the email (only if requested)
        const send = await fetch(`/api/reports/${genJson.reportId}/send`, { method: "POST" });
        const sendJson = await send.json();
        if (!send.ok) throw new Error(sendJson.error || "Send failed");
        alert(`Sent to: ${sendJson.to}`);
      } else {
        // 2. Just open the PDF in a new tab
        window.open(`/api/reports/${genJson.reportId}/view`, "_blank");
      }
    } catch (e) { 
      alert(`Error: ${e.message}`); 
    } finally { 
      setBusy(false); 
    }
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

      <div className="border rounded p-4 flex flex-col gap-4 bg-gray-50">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">Period:</label>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="border rounded px-2 py-1">
            <option value="weekly">Last 7 Days (Weekly)</option>
            <option value="monthly">Last Month (Monthly)</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => generateAndSend(false)} 
            disabled={busy} 
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
          >
            {busy ? "Generating..." : "👁️ Generate & View PDF"}
          </button>

          <button 
            onClick={() => generateAndSend(true)} 
            disabled={busy} 
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 hover:bg-green-700"
          >
            {busy ? "Working..." : "📧 Generate & Send Email"}
          </button>
        </div>

        {latestReportId && (
          <div className="text-sm mt-2">
            <a href={`/api/reports/${latestReportId}/view`} target="_blank" className="text-blue-600 underline">
              Open the report you just generated
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
