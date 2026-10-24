// app/reports/discover/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DiscoverPage() {
  const router = useRouter();
  const [google, setGoogle] = useState(null);
  const [meta, setMeta] = useState(null);
  const [name, setName] = useState("");
  const [emails, setEmails] = useState("");
  const [websites, setWebsites] = useState("");
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
      } finally { setLoading(false); }
    })();
  }, []);

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
      const res = await fetch("/api/reports/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          emails: emails.split(",").map(e => e.trim()).filter(Boolean),
          websites: websites.split(",").map(w => w.trim()).filter(Boolean),
          ...selection,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      router.push(`/reports/${json.client._id}`);
    } catch (e) { alert(`Error: ${e.message}`); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="p-6">Loading accounts from Google + Meta...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Report Client</h1>
      <p className="text-sm text-gray-600 mb-4">Name the client, add emails/websites, and tick all their accounts.</p>

      <div className="border rounded p-4 mb-4 space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Client Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Altius Lighting" className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Emails (comma separated)</label>
          <input value={emails} onChange={e => setEmails(e.target.value)} placeholder="ceo@client.com, seo@client.com" className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Websites (comma separated)</label>
          <input value={websites} onChange={e => setWebsites(e.target.value)} placeholder="client.com" className="w-full border rounded px-2 py-1" />
        </div>
      </div>

      <div className="space-y-4">
        <Section title="GA4 Properties" items={google?.ga4} idKey="propertyId" labelKey="displayName" extraKey="account" selected={selection.ga4PropertyIds} toggle={v => toggle("ga4PropertyIds", v)} error={google?.ga4Error} />
        <Section title="Search Console Sites" items={google?.gsc} idKey="siteUrl" labelKey="siteUrl" extraKey="permissionLevel" selected={selection.gscSiteUrls} toggle={v => toggle("gscSiteUrls", v)} error={google?.gscError} />
        <Section title="Google Ads Accounts" items={google?.googleAds} idKey="customerId" labelKey="name" extraKey="currency" selected={selection.googleAdsCustomerIds} toggle={v => toggle("googleAdsCustomerIds", v)} error={google?.googleAdsError} />
        <Section title="Meta Ad Accounts" items={meta?.adAccounts} idKey="id" labelKey="name" extraKey="currency" selected={selection.metaAdAccountIds} toggle={v => toggle("metaAdAccountIds", v)} error={meta?.adAccountsError} />
        <Section title="Meta Pages" items={meta?.pages} idKey="id" labelKey="name" extraKey="link" selected={selection.metaPageIds} toggle={v => toggle("metaPageIds", v)} error={meta?.pagesError} />
      </div>

      <div className="mt-6">
        <button onClick={save} disabled={busy} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">
          {busy ? "Saving..." : "Save Client"}
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
    <div className="border p-3 rounded">
      <h3 className="font-semibold mb-2">{title} <span className="text-xs text-gray-500">({items.length})</span></h3>
      <div className="space-y-1 max-h-72 overflow-auto">
        {items.map(item => {
          const id = item[idKey];
          const label = item[labelKey] || id;
          const extra = extraKey ? item[extraKey] : null;
          return (
            <label key={id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} />
              <span className="font-mono text-xs bg-gray-100 px-1 rounded">{id}</span>
              <span>{label}</span>
              {extra && <span className="text-xs text-gray-500">({extra})</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}
