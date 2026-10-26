"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function ReportClientDetail({ params }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [client, setClient] = useState(null);
  const [busy, setBusy] = useState(false);
  
  // Date states
  const [periodType, setPeriodType] = useState("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  
  // Report state
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
      
      // Auto-open the PDF in a new tab
      window.open(`/api/reports/${genJson.reportId}/view`, "_blank");
      
    } catch (e) { 
      alert(`Error: ${e.message}`); 
    } finally { 
      setBusy(false); 
    }
  }

  if (!client) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => router.push("/reports")} className="text-sm text-blue-600 mb-2 hover:underline">← Back to Clients</button>
      <h1 className="text-3xl font-bold mb-6">{client.name}</h1>

      <div className="border rounded p-6 bg-white shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Generate Report</h2>
        
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date Range</label>
            <div className="flex gap-4 items-center flex-wrap">
              <select 
                value={periodType} 
                onChange={e => setPeriodType(e.target.value)} 
                className="border rounded px-3 py-2 bg-gray-50"
              >
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

        <button 
          onClick={handleGenerate} 
          disabled={busy} 
          className="w-full py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Generating PDF..." : "📄 Generate & View Report"}
        </button>

        {latestReportId && (
          <div className="text-center mt-4">
            <a href={`/api/reports/${latestReportId}/view`} target="_blank" className="text-blue-600 underline text-sm font-medium">
              Click here if the PDF didn't open automatically
            </a>
          </div>
        )}
      </div>
      
      {/* Show what accounts are connected (Read Only) */}
      <div className="border rounded p-6 bg-gray-50 text-sm">
        <h3 className="font-semibold mb-2">Connected Accounts</h3>
        <ul className="space-y-1 text-gray-700">
          <li><b>GSC Sites:</b> {client.gscSiteUrls?.length || 0}</li>
          <li><b>GA4 Properties:</b> {client.ga4PropertyIds?.length || 0}</li>
          <li><b>Google Ads:</b> {client.googleAdsCustomerIds?.length || 0}</li>
          <li className="pt-2 text-blue-600"><a href={`/reports/discover?clientId=${id}`}>Edit connected accounts →</a></li>
        </ul>
      </div>
    </div>
  );
}
