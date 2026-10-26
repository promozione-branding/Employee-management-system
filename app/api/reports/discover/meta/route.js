// app/api/reports/discover/meta/route.js
import { requireReportAdmin } from "@/lib/reportingAuth";

const VERSION = "v20.0";

export async function GET(req) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const token = process.env.META_SYSTEM_USER_TOKEN;
  if (!token) return Response.json({ adAccountsError: "META_SYSTEM_USER_TOKEN is missing in .env" }, { status: 200 });

  const result = { adAccounts: [], pages: [] };

  // Fetch Ad Accounts
  try {
    const r1 = await fetch(`https://graph.facebook.com/${VERSION}/me/adaccounts?access_token=${token}&fields=id,name,account_status,currency&limit=200`);
    const j1 = await r1.json();
    if (j1.error) throw new Error(j1.error.message);
    result.adAccounts = (j1.data || []).map((a) => ({ id: a.id, name: a.name, status: a.account_status, currency: a.currency }));
  } catch (e) { result.adAccountsError = e.message; }

  // Fetch Pages
  try {
    const r2 = await fetch(`https://graph.facebook.com/${VERSION}/me/accounts?access_token=${token}&fields=id,name,link&limit=200`);
    const j2 = await r2.json();
    if (j2.error) throw new Error(j2.error.message);
    result.pages = (j2.data || []).map((p) => ({ id: p.id, name: p.name, link: p.link }));
  } catch (e) { result.pagesError = e.message; }

  return Response.json(result);
}
