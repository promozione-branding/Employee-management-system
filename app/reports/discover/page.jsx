"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DiscoverForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editClientId = searchParams.get("clientId");
  
  const [google, setGoogle] = useState(null);
  const [meta, setMeta] = useState(null);
  
  // Form states
  const [name, setName] = useState("");
  const [emails, setEmails] = useState("");
  const [websites, setWebsites] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [seoPreview, setSeoPreview] = useState(null); // 👈 To show keywords in UI
  
  // Search states
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [gscSearch, setGscSearch] = useState("");
  const [gadsSearch, setGadsSearch] = useState("");
  const [metaAdsSearch, setMetaAdsSearch] = useState("");
  const [metaPageSearch, setMetaPageSearch] = useState("");
  
  const [selection, setSelection] = useState({
    ga4PropertyIds: [], gscSiteUrls: [], googleAdsCustomerIds: [],
    metaAdAccountIds: [], metaPageIds: [],
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
          fetch("/api/reports/discover/google").then(r => r.json()),
          fetch("/api/reports/discover/meta").then(r => r.json()),
        ]);
        setGoogle(g); setMeta(m);

        if (editClientId) {
          const cl = await fetch(`/api/reports/clients/${editClientId}`).then(r => r.json());
          if (cl.client) {
            setName(cl.client.name || "");
            setEmails((cl.client.emails || []).join(", "));
            setWebsites((cl.client.websites || []).join(", "));
            setCustomerId(cl.client.customerId || "");
            setSelection({
              ga4PropertyIds: cl.client.ga4PropertyIds || [],
              gscSiteUrls: cl.client.gscSiteUrls || [],
              googleAdsCustomerIds: cl.client.googleAdsCustomerIds || [],
              metaAdAccountIds: cl.client.metaAdAccountIds || [],
              metaPageIds: cl.client.metaPageIds || [],
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

  // 👈 UPDATED TO SAVE KEYWORDS FOR UI PREVIEW
  async function handleCustomerSelect(c) {
    setName(c.company || c.name || ""); 
    setCustomerId(c._id);
    if (c.email) setEmails(c.email);
    
    let siteList = [];
    if (c.website) siteList.push(...c.website.split(",").map(s => s.trim()));
    
    try {
      const seoRes = await fetch(`/api/reports/seo/${c._id}`).then(r => r.json());
      if (seoRes.websites && Array.isArray(seoRes.websites)) {
        siteList = [...siteList, ...seoRes.websites];
      }
      if (seoRes.seoData) {
        setSeoPreview(seoRes.seoData); // Save for UI display
      }
    } catch (e) {
      console.error("Failed to load SEO websites", e);
    }

    const uniqueSites = [...new Set(siteList)].filter(Boolean);
    setWebsites(uniqueSites.join(", "));
    setCustomerSearch(""); 
  }

  async function save() {
    if (!name.trim()) return alert("Enter client name");
    setBusy(true);
    try {
      const payload = {
        name: name.trim(),
        emails: emails.split(",").map(e => e.trim()).filter(Boolean),
        websites: websites.split(",").map(w => w.trim()).filter(Boolean),
        customerId: customerId || null,
        ...selection,
      };
      const url = editClientId ? `/api/reports/clients/${editClientId}` : "/api/reports/clients";
      const method = editClientId ? "PATCH" : "POST";

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      router.push(editClientId ? `/reports/${editClientId}` : `/reports/${json.client._id}`);
    } catch (e) { alert(`Error: ${e.message}`); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="p-6">Loading accounts...</div>;

  const filteredGsc = (google?.gsc || []).filter(s => s.siteUrl.toLowerCase().includes(gscSearch.toLowerCase()));
  const filteredGads = (google?.googleAds || []).filter(a => (a.name || "").toLowerCase().includes(gadsSearch.toLowerCase()) || (a.customerId || "").includes(gadsSearch));
  const filteredMetaAds = (meta?.adAccounts || []).filter(a => (a.name || "").toLowerCase().includes(metaAdsSearch.toLowerCase()) || (a.id || "").includes(metaAdsSearch));
  const filteredMetaPages = (meta?.pages || []).filter(p => (p.name || "").toLowerCase().includes(metaPageSearch.toLowerCase()) || (p.id || "").includes(metaPageSearch));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{editClientId ? "Edit Client Accounts" : "Add Report Client"}</h1>
      
      <div className="border rounded p-4 mb-4 bg-white shadow-sm space-y-4">
        <div className="bg-blue-50 p-4 rounded border border-blue-100 relative">
          <label className="block text-sm font-bold text-blue-800 mb-2">Step 1: Search Customer (by Company, Name, Email)</label>
          <input 
            value={customerSearch} 
            onChange={e => setCustomerSearch(e.target.value)} 
            placeholder="Type at least 2 letters..." 
            className="w-full border rounded px-3 py-2" 
          />
          {isSearching && <div className="text-xs text-blue-600 mt-1">Searching database...</div>}
          
          {customerSearch.length >= 2 && !isSearching && (
            <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border rounded shadow-lg">
              {customers.length === 0 ? <div className="p-3 text-sm text-gray-500">No company found.</div> :
                customers.map(c => (
                  <div 
                    key={c._id} 
                    onClick={() => handleCustomerSelect(c)}
                    className="p-3 text-sm cursor-pointer hover:bg-blue-100 border-b flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-gray-800">{c.company || c.name}</div>
                      <div className="text-xs text-gray-500">{c.website || "No website"}</div>
                    </div>
                    <div className="text-xs bg-gray-200 px-2 py-1 rounded">{c.email || "No email"}</div>
                  </div>
                ))
              }
            </div>
          )}
          {customerId && (
            <div className="text-sm text-green-700 mt-2 flex items-center gap-2">
              <span className="bg-green-100 border border-green-300 px-2 py-1 rounded font-semibold">✅ Linked</span>
              Selected ID: {customerId}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emails (comma separated)</label>
            <input value={emails} onChange={e => setEmails(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Websites (comma separated)</label>
             <textarea 
               value={websites} 
               onChange={e => setWebsites(e.target.value)} 
               className="w-full border rounded px-3 py-2 h-20" 
               placeholder="These will auto-fill from SEO data..."
             />
          </div>
        </div>

        {/* 👈 NEW UI: SHOW SEO KEYWORDS PREVIEW */}
        {seoPreview && Object.keys(seoPreview).length > 0 && (
          <div className="bg-green-50 p-4 rounded border border-green-200 mt-4">
            <h3 className="font-bold text-green-800 text-sm mb-3">✅ SEO Keywords Found in Database</h3>
            <div className="space-y-3 max-h-60 overflow-auto">
              {Object.entries(seoPreview).map(([site, kws]) => (
                <div key={site} className="bg-white p-3 rounded border shadow-sm">
                  <div className="font-semibold text-gray-800 mb-2 border-b pb-1">🌐 {site} ({kws.length} keywords)</div>
                  <div className="flex flex-wrap gap-2">
                    {kws.slice(0, 10).map((kw, i) => (
                      <span key={i} className="text-xs bg-gray-100 border px-2 py-1 rounded text-gray-700">
                        {kw.keyword} <span className="text-gray-400">(Pos {kw.position})</span>
                      </span>
                    ))}
                    {kws.length > 10 && <span className="text-xs text-gray-500 py-1">+{kws.length - 10} more...</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* REST OF THE DISCOVERY PAGE (Google/Meta sections) */}
      <div className="space-y-4">
        <Section title="GA4 Properties" items={google?.ga4} idKey="propertyId" labelKey="displayName" extraKey="account" selected={selection.ga4PropertyIds} toggle={v => toggle("ga4PropertyIds", v)} error={google?.ga4Error} />
        
        <div className="border border-blue-200 p-3 rounded bg-blue-50 mb-2">
          <label className="block text-sm font-medium text-blue-800 mb-1">🔍 Search Console Sites</label>
          <input value={gscSearch} onChange={e => setGscSearch(e.target.value)} placeholder="Search by domain..." className="w-full border border-blue-300 rounded px-3 py-2 mb-3" />
          <Section title="Sites" items={filteredGsc} idKey="siteUrl" labelKey="siteUrl" extraKey="permissionLevel" selected={selection.gscSiteUrls} toggle={v => toggle("gscSiteUrls", v)} error={google?.gscError} />
        </div>

        <div className="border border-orange-200 p-3 rounded bg-orange-50 mb-2">
          <label className="block text-sm font-medium text-orange-800 mb-1">🔍 Google Ads Accounts</label>
          <input value={gadsSearch} onChange={e => setGadsSearch(e.target.value)} placeholder="Search by name or ID..." className="w-full border border-orange-300 rounded px-3 py-2 mb-3" />
          <Section title="Accounts" items={filteredGads} idKey="customerId" labelKey="name" extraKey="currency" selected={selection.googleAdsCustomerIds} toggle={v => toggle("googleAdsCustomerIds", v)} error={google?.googleAdsError} />
        </div>

        <div className="border border-purple-200 p-3 rounded bg-purple-50 mb-2">
          <label className="block text-sm font-medium text-purple-800 mb-1">🔍 Meta Ad Accounts</label>
          <input value={metaAdsSearch} onChange={e => setMetaAdsSearch(e.target.value)} placeholder="Search by name or ID..." className="w-full border border-purple-300 rounded px-3 py-2 mb-3" />
          <Section title="Accounts" items={filteredMetaAds} idKey="id" labelKey="name" extraKey="currency" selected={selection.metaAdAccountIds} toggle={v => toggle("metaAdAccountIds", v)} error={meta?.adAccountsError} />
        </div>

        <div className="border border-indigo-200 p-3 rounded bg-indigo-50 mb-2">
          <label className="block text-sm font-medium text-indigo-800 mb-1">🔍 Meta Pages</label>
          <input value={metaPageSearch} onChange={e => setMetaPageSearch(e.target.value)} placeholder="Search by name or ID..." className="w-full border border-indigo-300 rounded px-3 py-2 mb-3" />
          <Section title="Pages" items={filteredMetaPages} idKey="id" labelKey="name" extraKey="link" selected={selection.metaPageIds} toggle={v => toggle("metaPageIds", v)} error={meta?.pagesError} />
        </div>
      </div>

      <div className="mt-6 sticky bottom-4">
        <button onClick={save} disabled={busy} className="w-full py-3 bg-green-600 text-white font-bold rounded shadow-lg disabled:opacity-50">
          {busy ? "Saving..." : editClientId ? "💾 Update Client" : "💾 Save Client"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, items, idKey, labelKey, extraKey, selected, toggle, error }) {
  if (error) return <div className="border-2 border-red-400 bg-red-50 p-4 rounded"><h3 className="font-bold text-red-800">{title}: Error</h3><p className="text-sm text-red-700 font-mono mt-1">{error}</p></div>;
  if (!items || items.length === 0) return <div className="border p-3 rounded text-sm text-gray-500">{title}: none found</div>;
  return (
    <div className="border p-3 rounded bg-white">
      <h3 className="font-semibold mb-2">{title} <span className="text-xs text-gray-500">({items.length})</span></h3>
      <div className="space-y-1 max-h-60 overflow-auto">
        {items.map(item => {
          const id = item[idKey]; const label = item[labelKey] || id; const extra = extraKey ? item[extraKey] : null;
          return (
            <label key={id} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
              <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} className="w-4 h-4" />
              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{id}</span>
              <span className="truncate">{label}</span>
              {extra && <span className="text-xs text-gray-400 ml-auto">({extra})</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return <Suspense fallback={<div className="p-6">Loading...</div>}><DiscoverForm /></Suspense>;
}
