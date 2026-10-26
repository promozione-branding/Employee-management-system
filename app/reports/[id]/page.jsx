"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function ReportClientDetail({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [client, setClient] = useState(null);
  const [busy, setBusy] = useState(false);
  const [periodType, setPeriodType] = useState("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [latestReportId, setLatestReportId] = useState(null);

  async function load() {
    const res = await fetch(`/api/reports/clients/${id}`);
    const json = await res.json();
    setClient(json.client);
  }

  useEffect(() => { load(); }, [id]);

  async function handleGenerate() {
    setBusy(true);
    try {
      const gen = await fetch(`/api/reports/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodType, start: customStart, end: customEnd }),
      });
      const genJson = await gen.json();
      if (!gen.ok) throw new Error(genJson.error || "Generate failed");

      setLatestReportId(genJson.reportId);
      window.open(`/api/reports/${genJson.reportId}/view`, "_blank");
    } catch (e) { alert(`Error: ${e.message}`); } finally { setBusy(false); }
  }

  if (!client) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => router.push("/reports")} className="text-sm text-blue-600 mb-2 hover:underline">← Back</button>
      <h1 className="text-2xl font-bold mb-4">{client.name}</h1>

      <div className="border rounded p-4 mb-4 bg-white shadow-sm space-y-3">
        <div className="flex justify-between items-center mb-2">
           <h2 className="font-semibold text-lg">Connected Accounts</h2>
           <a href={`/reports/discover?clientId=${id}`} className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-gray-800 transition">✏️ Edit Accounts</a>
        </div>
        
        <div className="text-sm space-y-3">
          <div className="flex gap-2 border-b pb-2">
            <span className="font-medium w-32">Google Ads:</span>
            <div className="flex flex-wrap gap-1">
              {client.googleAdsCustomerIds?.length ? client.googleAdsCustomerIds.map(u => <span key={u} className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">{u}</span>) : <span className="text-gray-400">None</span>}
            </div>
          </div>
          <div className="flex gap-2 border-b pb-2">
            <span className="font-medium w-32">Meta Ad Accounts:</span>
            <div className="flex flex-wrap gap-1">
              {client.metaAdAccountIds?.length ? client.metaAdAccountIds.map(u => <span key={u} className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">{u}</span>) : <span className="text-gray-400">None</span>}
            </div>
          </div>
          <div className="flex gap-2 border-b pb-2">
            <span className="font-medium w-32">Meta Pages:</span>
            <div className="flex flex-wrap gap-1">
              {client.metaPageIds?.length ? client.metaPageIds.map(u => <span key={u} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">{u}</span>) : <span className="text-gray-400">None</span>}
            </div>
          </div>
          <div className="flex gap-2 border-b pb-2">
            <span className="font-medium w-32">GSC Sites:</span>
            <div className="flex flex-wrap gap-1">
              {client.gscSiteUrls?.length ? client.gscSiteUrls.map(u => <span key={u} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{u}</span>) : <span className="text-gray-400">None</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded p-6 bg-white shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Generate Report</h2>
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date Range</label>
            <div className="flex gap-4 items-center flex-wrap">
              <select value={periodType} onChange={e => setPeriodType(e.target.value)} className="border rounded px-3 py-2 bg-gray-50">
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 1 Month</option>
                <option value="3month">Last 3 Months</option>
                <option value="6month">Last 6 Months</option>
                <option value="custom">Custom Date Range</option>
              </select>
              {periodType === "custom" && (
                <div className="flex items-center gap-2">
                  <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="border rounded px-2 py-1.5" />
                  <span>to</span>
                  <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="border rounded px-2 py-1.5" />
                </div>
              )}
            </div>
          </div>
        </div>
        <button onClick={handleGenerate} disabled={busy} className="w-full py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50">
          {busy ? "Generating PDF..." : "📄 Generate & View PDF Report"}
        </button>
      </div>
    </div>
  );
}
