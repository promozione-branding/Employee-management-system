import ReportClient from '@/models/admin/ReportClient';
import AdPerformanceDaily from '@/models/admin/AdPerformanceDaily';
import ReportSetting from '@/models/admin/ReportSetting';
import MetaSetting from '@/models/admin/MetaSetting';

async function discoverGoogleAccounts() {
    if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN || !process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) return [];
    const setting = await ReportSetting.findOne({ key: 'google_refresh_token' }).lean();
    if (!setting?.value) return [];
    const { GoogleAdsApi } = await import('google-ads-api');
    const api = new GoogleAdsApi({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN });
    const manager = api.Customer({ customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID, refresh_token: setting.value });
    const rows = await manager.query(`SELECT customer_client.id, customer_client.descriptive_name, customer_client.currency_code FROM customer_client WHERE customer_client.manager = FALSE`);
    return (rows || []).map((row) => ({ id: String(row.customer_client.id), name: row.customer_client.descriptive_name || `Google Ads ${row.customer_client.id}`, currency: row.customer_client.currency_code || '' }));
}

async function discoverMetaAccounts() {
    const setting = await MetaSetting.findOne({ key: 'meta_access_token' }).lean();
    if (!setting?.value) return [];
    const accounts = [];
    let next = `https://graph.facebook.com/v26.0/me/adaccounts?${new URLSearchParams({ access_token: setting.value, fields: 'id,name,currency,account_status', limit: '200' })}`;
    while (next) {
        const response = await fetch(next);
        const result = await response.json();
        if (!response.ok || result.error) throw new Error(result.error?.message || 'Could not discover Meta ad accounts.');
        accounts.push(...(result.data || []).map((account) => ({ id: account.id, name: account.name || `Meta Ads ${account.id}`, currency: account.currency || '' })));
        next = result.paging?.next || '';
    }
    return accounts;
}

export async function syncAdsSnapshot(start, end) {
    const clients = await ReportClient.find({ status: 'active' }).lean();
    const { fetchGoogleAdsDaily } = await import('@/lib/google');
    const { fetchMetaAdsDaily } = await import('@/lib/meta');
    const errors = [];
    const accountOwners = new Map();
    for (const client of clients) {
        for (const accountId of client.googleAdsCustomerIds || []) accountOwners.set(`google:${accountId}`, client);
        for (const accountId of client.metaAdAccountIds || []) accountOwners.set(`meta:${accountId}`, client);
    }
    const inventories = await Promise.allSettled([discoverGoogleAccounts(), discoverMetaAccounts()]);
    const googleAccounts = inventories[0].status === 'fulfilled' ? inventories[0].value : [];
    const metaAccounts = inventories[1].status === 'fulfilled' ? inventories[1].value : [];
    if (inventories[0].status === 'rejected') errors.push({ platform: 'google', error: inventories[0].reason.message });
    if (inventories[1].status === 'rejected') errors.push({ platform: 'meta', error: inventories[1].reason.message });
    const googleById = new Map(googleAccounts.map((account) => [String(account.id), account]));
    const metaById = new Map(metaAccounts.map((account) => [String(account.id), account]));
    const googleIds = new Set([...googleById.keys(), ...[...accountOwners.keys()].filter((key) => key.startsWith('google:')).map((key) => key.slice(7))]);
    const metaIds = new Set([...metaById.keys(), ...[...accountOwners.keys()].filter((key) => key.startsWith('meta:')).map((key) => key.slice(5))]);
    const accountsSynced = { google: 0, meta: 0 };
    let saved = 0;
    const tasks = [
        ...[...googleIds].map((accountId) => ({ platform: 'google', accountId, account: googleById.get(String(accountId)), fetch: fetchGoogleAdsDaily })),
        ...[...metaIds].map((accountId) => ({ platform: 'meta', accountId, account: metaById.get(String(accountId)), fetch: fetchMetaAdsDaily })),
    ];
    let cursor = 0;
    const worker = async () => {
        while (cursor < tasks.length) {
            const task = tasks[cursor++];
            const { platform, accountId, account, fetch: fetchAccount } = task;
            const client = accountOwners.get(`${platform}:${accountId}`);
            const clientId = client?._id;
            const clientName = client?.name || account?.name || `${platform === 'google' ? 'Google' : 'Meta'} Ads ${accountId}`;
            try {
                if (clientId) await AdPerformanceDaily.updateMany({ platform, accountId, clientId: null }, { $set: { clientId, clientName } });
                const rows = await fetchAccount(accountId, start, end);
                if (rows.warnings?.length) errors.push({ client: clientName, platform, accountId, error: `Partial data: ${rows.warnings.join(' | ')}` });
                const operations = rows.map((row) => ({
                    updateOne: {
                        filter: { clientId: clientId || null, platform, accountId, date: row.date, level: row.level, entityId: row.entityId || '' },
                        update: { $set: { ...row, ...(clientId ? { clientId } : {}), clientName, platform, accountId } },
                        upsert: true,
                    },
                }));
                for (let offset = 0; offset < operations.length; offset += 500) {
                    const result = await AdPerformanceDaily.bulkWrite(operations.slice(offset, offset + 500), { ordered: false });
                    saved += result.upsertedCount + result.modifiedCount;
                }
                accountsSynced[platform] += 1;
            } catch (error) {
                errors.push({ client: clientName, platform, accountId, error: error.message });
            }
        }
    };
    await Promise.all(Array.from({ length: Math.min(4, tasks.length) }, worker));
    return { ok: true, clients: clients.length, accountsDiscovered: { google: googleIds.size, meta: metaIds.size }, accountsSynced, saved, errors };
}
