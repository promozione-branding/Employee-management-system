// app/reports/discover/page.jsx
"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DiscoverForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editClientId = searchParams.get("clientId"); // 👈 Check if we are editing
  
  const [google, setGoogle] = useState(null);
  const [meta, setMeta] = useState(null);
  const [name, setName] = useState("");
  const [emails, setEmails] = useState("");
  const [websites, setWebsites] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selection, setSelection] = useState({
    ga4PropertyIds: [], gscSiteUrls: [], googleAdsCustomerIds: [],
    metaAdAccountIds: [], metaPageIds: [],
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [g, m] = await Promise.all([
          fetch("/api/reports/discover/google").then(r => r.json()),
          fetch("/api/reports/discover/meta").then(r => r.json()),
        ]);
        setGoogle(g); setMeta(m);

        // If editing, load existing client data
        if (editClientId) {
          const c = await fetch(`/api/reports/clients/${editClientId}`).then(r => r.json());
          if (c.client) {
            setName(c.client.name || "");
            setEmails((c.client.emails || []).join(", "));
            setWebsites((c.client.websites || []).join(", "));
            setSelection({
              ga4PropertyIds: c.client.ga4PropertyIds || [],
              gscSiteUrls: c.client.gscSiteUrls || [],
              googleAdsCustomerIds: c.client.googleAdsCustomerIds || [],
              metaAdAccountIds: c.client.metaAdAccountIds || [],
              metaPageIds: c.client.metaPageIds || [],
            });
          }
        }
      } finally { setLoading(false); }
    })();
  }, [editClientId]);

  function toggle(field, value) {
    setSelection(s => {
      const arr = s[field] || [];
      return { ...s, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  }

  async function save() {
    if (!name.trim()) return alert("Enter client name");
    setBusy(true);
    try {
      const payload = {
        name: name.trim(),
        emails: emails.split(",").map(e => e.trim()).filter(Boolean),
        websites: websites.split(",").map(w => w.trim()).filter(Boolean),
        ...selection,
      };

      // If editing, send PATCH request instead of POST
      const url = editClientId ? `/api/reports/clients/${editClientId}` : "/api/reports/clients";
      const method = editClientId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      
      router.push(editClientId ? `/reports/${editClientId}` : `/reports/${json.client._id}`);
    } catch (e) { alert(`Error: ${e.message}`); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="p-6">Loading accounts...</div>;

  const filteredGsc = (google?.gsc || []).filter(site => 
    site.siteUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{editClientId ? "Edit Client Accounts" : "Add Report Client"}</h1>
      <p className="text-sm text-gray-600 mb-4">Name the client, add emails/websites, and tick all their accounts.</p>

      <div className="border rounded p-4 mb-4 space-y-3 bg-white shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Altius Lighting" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emails (comma separated)</label>
          <input value={emails} onChange={e => setEmails(e.target.value)} placeholder="ceo@client.com, seo@client.com" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Websites (comma separated)</label>
          <input value={websites} onChange={e => setWebsites(e.target.value)} placeholder="client.com" className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="space-y-4">
        <Section title="GA4 Properties" items={google?.ga4} idKey="propertyId" labelKey="displayName" extraKey="account" selected={selection.ga4PropertyIds} toggle={v => toggle("ga4PropertyIds", v)} error={google?.ga4Error} />
        
        <div className="border border-blue-200 p-3 rounded bg-blue-50 mb-2">
          <label className="block text-sm font-medium text-blue-800 mb-1">🔍 Search Console Sites (Search to filter)</label>
          <input 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Type a domain name (e.g. altius)..." 
            className="w-full border border-blue-300 rounded px-3 py-2 mb-3"
          />
          <Section 
            title="Filtered Sites" 
            items={filteredGsc} 
            idKey="siteUrl" 
            labelKey="siteUrl" 
            extraKey="permissionLevel" 
            selected={selection.gscSiteUrls} 
            toggle={v => toggle("gscSiteUrls", v)} 
            error={google?.gscError} 
          />
        </div>

        <Section title="Google Ads Accounts" items={google?.googleAds} idKey="customerId" labelKey="name" extraKey="currency" selected={selection.googleAdsCustomerIds} toggle={v => toggle("googleAdsCustomerIds", v)} error={google?.googleAdsError} />
        <Section title="Meta Ad Accounts" items={meta?.adAccounts} idKey="id" labelKey="name" extraKey="currency" selected={selection.metaAdAccountIds} toggle={v => toggle("metaAdAccountIds", v)} error={meta?.adAccountsError} />
        <Section title="Meta Pages" items={meta?.pages} idKey="id" labelKey="name" extraKey="link" selected={selection.metaPageIds} toggle={v => toggle("metaPageIds", v)} error={meta?.pagesError} />
      </div>

      <div className="mt-6 sticky bottom-4">
        <button onClick={save} disabled={busy} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-lg disabled:opacity-50">
          {busy ? "Saving..." : editClientId ? "💾 Update Client" : "💾 Save Client"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, items, idKey, labelKey, extraKey, selected, toggle, error }) {
  if (error) return (
    <div className="border border-red-300 bg-red-50 p-3 rounded">
      <h3 className="font-semibold text-red-700">{title}</h3>
      <p className="text-xs text-red-600">{error}</p>
    </div>
  );
  if (!items || items.length === 0) return <div className="border p-3 rounded text-sm text-gray-500">{title}: none found</div>;
  return (
    <div className="border p-3 rounded bg-white">
      <h3 className="font-semibold mb-2">{title} <span className="text-xs text-gray-500">({items.length})</span></h3>
      <div className="space-y-1 max-h-72 overflow-auto">
        {items.map(item => {
          const id = item[idKey];
          const label = item[labelKey] || id;
          const extra = extraKey ? item[extraKey] : null;
          return (
            <label key={id} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
              <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} className="w-4 h-4" />
              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{id}</span>
              {extra && <span className="text-xs text-gray-400">({extra})</span>}
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
