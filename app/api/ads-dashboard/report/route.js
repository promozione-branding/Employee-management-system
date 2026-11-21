import PDFDocument from 'pdfkit';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/getAuthUser';
import AdPerformanceDaily from '@/models/admin/AdPerformanceDaily';
import ReportClient from '@/models/admin/ReportClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function makePdf({ rows, from, to, clientName, platform }) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 44, bufferPages: true });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
        const hasActivity = (row) => ['impressions', 'clicks', 'spend', 'conversions'].some((key) => Number(row[key] || 0) > 0);
        const aggregate = (items, keys) => {
            const map = new Map();
            items.forEach((row) => {
                const key = keys.map((name) => row[name] || '').join('|');
                const current = map.get(key) || { ...row, impressions: 0, clicks: 0, spend: 0, conversions: 0 };
                for (const metric of ['impressions', 'clicks', 'spend', 'conversions']) current[metric] += Number(row[metric] || 0);
                map.set(key, current);
            });
            return [...map.values()].filter(hasActivity).sort((a, b) => b.spend - a.spend);
        };
        const campaignTotals = (items) => {
            const daily = new Map();
            const keyOf = (row) => [row.date, row.accountId, row.campaign].join('|');
            items.filter((row) => row.level === 'campaign').forEach((row) => daily.set(keyOf(row), row));
            // Some older snapshots have detailed ad/ad-group rows but are
            // missing the campaign summary row. Use one canonical child level
            // for those account/day/campaigns only, never add child spend on top
            // of an existing campaign total.
            const priorities = ['ad_group', 'ad_set', 'ad', 'keyword', 'shopping_product'];
            const childGroups = new Map();
            items.filter((row) => priorities.includes(row.level) && hasActivity(row)).forEach((row) => {
                const key = keyOf(row);
                const priority = priorities.indexOf(row.level);
                const group = childGroups.get(key) || { priority, rows: [] };
                if (priority < group.priority) { group.priority = priority; group.rows = [row]; }
                else if (priority === group.priority) group.rows.push(row);
                childGroups.set(key, group);
            });
            for (const [key, group] of childGroups) {
                if (hasActivity(daily.get(key) || {})) continue;
                const [date, accountId, campaign] = key.split('|');
                const sum = (metric) => group.rows.reduce((total, row) => total + Number(row[metric] || 0), 0);
                const parent = daily.get(key);
                daily.set(key, { ...group.rows[0], ...parent, date, accountId, entityId: parent?.entityId || campaign, campaign, impressions: sum('impressions'), clicks: sum('clicks'), spend: sum('spend'), conversions: sum('conversions') });
            }
            return aggregate([...daily.values()].filter(hasActivity), ['platform', 'accountId', 'entityId', 'campaign']);
        };
        const platformNames = platform === 'all' ? ['google', 'meta'] : [platform];
        const sections = platformNames.map((name) => {
            const scoped = rows.filter((row) => row.platform === name);
            // Exclude paused/removed campaigns and zero-only rows. Account APIs
            // return campaign, ad, and keyword levels; only campaign rows are
            // used for totals to avoid counting the same spend several times.
            // Keep inactive campaigns only when they actually delivered in the
            // selected period; zero-only paused/removed campaigns are omitted.
            const campaigns = campaignTotals(scoped);
            const details = aggregate(scoped.filter((row) => ['keyword', 'shopping_product'].includes(row.level) && hasActivity(row)), ['level', 'accountId', 'entityId', 'campaign', 'keyword', 'entity']);
            return { name, campaigns, details };
        }).filter((section) => section.campaigns.length || section.details.length);
        if (!sections.length) sections.push({ name: platform === 'all' ? 'google' : platform, campaigns: [], details: [] });

        const sectionTitle = (name) => name === 'google' ? 'Google Ads' : 'Meta Ads';
        const drawBrandHeader = (name, continuation = false) => {
            doc.rect(0, 0, doc.page.width, 118).fill('#0A2E66');
            doc.fillColor('#F7A25C').fontSize(8).font('Helvetica-Bold').text('INQUIRY BAZAAR  /  PERFORMANCE CENTER', 44, 30, { characterSpacing: 1 });
            doc.fillColor('white').fontSize(24).text(`${sectionTitle(name)}${continuation ? ' · continued' : ''}`, 44, 50);
            doc.fillColor('#DCE8FA').fontSize(10).font('Helvetica').text(clientName, 44, 83, { width: doc.page.width - 88, ellipsis: true });
            doc.fillColor('#334155').fontSize(9).text(`Reporting period  ${from}  —  ${to}`, 44, 133);
        };
        const drawTable = ({ title, headers, widths, values, startY, platformName }) => {
            let y = startY;
            doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text(title, 44, y);
            y += 24;
            const header = () => {
                let x = 44;
                doc.rect(44, y, doc.page.width - 88, 22).fill('#EAF0F8');
                headers.forEach((label, index) => { doc.fillColor('#334155').fontSize(7.5).font('Helvetica-Bold').text(label, x + 5, y + 7, { width: widths[index] - 9, ellipsis: true }); x += widths[index]; });
                y += 24;
            };
            header();
            values.forEach((row, index) => {
                if (y > doc.page.height - 52) {
                    doc.addPage();
                    drawBrandHeader(platformName, true);
                    y = 153;
                    header();
                }
                let x = 44;
                if (index % 2) doc.rect(44, y - 2, doc.page.width - 88, 18).fill('#F8FAFC');
                row.forEach((value, column) => { doc.fillColor('#334155').font('Helvetica').fontSize(7.2).text(String(value), x + 5, y + 2, { width: widths[column] - 9, ellipsis: true }); x += widths[column]; });
                y += 18;
            });
            return y + 12;
        };
        sections.forEach((section, sectionIndex) => {
            if (sectionIndex) doc.addPage();
            drawBrandHeader(section.name);
            const campaignRows = section.campaigns;
            const sum = (key) => campaignRows.reduce((total, row) => total + Number(row[key] || 0), 0);
            const spend = sum('spend'), clicks = sum('clicks'), impressions = sum('impressions'), conversions = sum('conversions');
            const currency = campaignRows.find((row) => row.currency)?.currency || section.details.find((row) => row.currency)?.currency || 'INR';
            const cards = [
                ['SPEND', `${currency} ${fmt(spend)}`], ['IMPRESSIONS', fmt(impressions)], ['CLICKS', fmt(clicks)],
                ['CONVERSIONS', fmt(conversions)], ['AVG. CPC', `${currency} ${fmt(clicks ? spend / clicks : 0)}`],
            ];
            const cardW = (doc.page.width - 88 - 32) / cards.length;
            cards.forEach(([label, value], index) => {
                const x = 44 + index * (cardW + 8);
                doc.roundedRect(x, 158, cardW, 54, 7).lineWidth(1).fillAndStroke('#F8FAFC', '#E2E8F0');
                doc.fillColor('#64748B').fontSize(6.5).font('Helvetica-Bold').text(label, x + 7, 168, { width: cardW - 14 });
                doc.fillColor('#0F172A').fontSize(8.5).font('Helvetica-Bold').text(value, x + 7, 185, { width: cardW - 14, ellipsis: true });
            });
            const campaignTable = campaignRows.map((row) => [`${row.campaign || 'Unnamed campaign'} · ${row.status || 'status unavailable'}`, fmt(row.impressions), fmt(row.clicks), `${row.currency || currency} ${fmt(row.spend)}`, `${row.currency || currency} ${fmt(row.clicks ? row.spend / row.clicks : 0)}`, fmt(row.conversions)]);
            let y = drawTable({ title: 'Active campaign performance', headers: ['Campaign', 'Impressions', 'Clicks', 'Spend', 'Avg. CPC', 'Conversions'], widths: [199, 67, 52, 76, 68, 45], values: campaignTable, startY: 234, platformName: section.name });
            if (!campaignTable.length) {
                doc.fillColor('#64748B').fontSize(9).font('Helvetica').text('No active campaigns with reported activity in this period.', 44, y - 10);
                y += 8;
            }
            const detailRows = section.details.slice(0, 8).map((row) => [row.level === 'keyword' ? 'Keyword' : 'Shopping / PMax', row.keyword || row.entity || '—', row.campaign || '—', fmt(row.clicks), `${row.currency || currency} ${fmt(row.spend)}`]);
            if (detailRows.length) {
                y = Math.max(y, 310);
                drawTable({ title: 'Search keywords and product results', headers: ['Type', 'Keyword / product', 'Campaign', 'Clicks', 'Spend'], widths: [85, 185, 115, 52, 70], values: detailRows, startY: y, platformName: section.name });
            }
            doc.fillColor('#94A3B8').fontSize(7).font('Helvetica').text('Only active campaigns and rows with reported activity are shown. Currency and metrics are supplied by the connected ad account.', 44, doc.page.height - 38, { width: doc.page.width - 88, align: 'center' });
        });
        doc.end();
    });
}

async function getReportData(req) {
    const params = new URL(req.url).searchParams;
    const from = params.get('from') || '';
    const to = params.get('to') || '';
    const platform = params.get('platform') || 'all';
    const clientId = params.get('clientId') || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to)
        return { error: 'Choose a valid reporting date range.', status: 400 };
    const filter = { date: { $gte: from, $lte: to } };
    if (['google', 'meta'].includes(platform)) filter.platform = platform;
    if (clientId.startsWith('account|')) {
        const [, accountPlatform, accountId] = clientId.split('|');
        filter.platform = accountPlatform;
        filter.accountId = accountId;
    } else if (clientId) filter.clientId = clientId;
    const rows = await AdPerformanceDaily.find(filter).sort({ date: 1, spend: -1 }).limit(15000).lean();
    let clientName = 'All clients';
    if (clientId.startsWith('account|')) clientName = rows[0]?.clientName || 'Ad account';
    else if (clientId) clientName = (await ReportClient.findById(clientId).select('name').lean())?.name || rows[0]?.clientName || 'Client';
    return { rows, from, to, clientName, platform };
}

export async function GET(req) {
    if (!await getAuthUser(req)) return new Response('Unauthorized', { status: 401 });
    await connectDB();
    try {
        const data = await getReportData(req);
        if (data.error) return new Response(data.error, { status: data.status });
        const pdf = await makePdf(data);
        const safeName = data.clientName.replace(/[^a-z0-9-_]+/gi, '-').slice(0, 70);
        return new Response(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="ads-report-${safeName}-${data.from}-${data.to}.pdf"`, 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error('Ads report PDF error:', error);
        return new Response('Could not generate the ads report.', { status: 500 });
    }
}

export async function POST(req) {
    if (!await getAuthUser(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    try {
        const body = await req.json();
        const recipient = String(body.recipient || '').trim();
        if (!/^\S+@\S+\.\S+$/.test(recipient)) return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
        const data = await getReportData(new Request(`${new URL(req.url).origin}/api/ads-dashboard/report?${new URLSearchParams({ from: body.from, to: body.to, platform: body.platform || 'all', clientId: body.clientId || '' })}`));
        if (data.error) return Response.json({ error: data.error }, { status: data.status });
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) return Response.json({ error: 'Email delivery is not configured (RESEND_API_KEY missing).' }, { status: 503 });
        const pdf = await makePdf(data);
        const { Resend } = await import('resend');
        const result = await new Resend(apiKey).emails.send({
            from: process.env.REPORT_FROM_EMAIL || 'accounts@promozionebranding.com',
            to: recipient,
            subject: `Ads performance report: ${data.clientName} (${data.from} to ${data.to})`,
            html: `<p>Please find the ads performance report for <b>${data.clientName}</b>, covering ${data.from} to ${data.to}, attached.</p><p>Regards,<br>Inquiry Bazaar</p>`,
            attachments: [{ filename: `ads-report-${data.from}-to-${data.to}.pdf`, content: pdf.toString('base64') }],
        });
        if (result.error) throw new Error(result.error.message || 'Email could not be sent.');
        return Response.json({ ok: true, to: recipient });
    } catch (error) {
        console.error('Ads report email error:', error);
        return Response.json({ error: error.message || 'Could not email the ads report.' }, { status: 500 });
    }
}
