// app/api/ads-dashboard/report/route.js

import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/getAuthUser';
import AdPerformanceDaily from '@/models/admin/AdPerformanceDaily';
import ReportClient from '@/models/admin/ReportClient';
import { buildAdsReport } from '@/lib/adsReportData';
import { makeAdsReportPdf } from '@/lib/adsReportPdf';
import { syncAdsSnapshot } from '@/lib/adsSnapshot';
import { getTransporter, MAIL_FROM } from '@/lib/mailerNew';
import { reportFileName, transparencyLinks } from '@/lib/adsLabels';
import AdCreative from '@/models/admin/AdCreative';

const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmtDay = (value) => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

async function fetchRows({ from, to, platform, clientId, levels }) {
    const filter = { date: { $gte: from, $lte: to } };
    if (levels) filter.level = { $in: levels };
    if (['google', 'meta'].includes(platform)) filter.platform = platform;
    if (clientId.startsWith('account|')) {
        const [, accountPlatform, accountId] = clientId.split('|');
        filter.platform = accountPlatform;
        filter.accountId = accountId;
    } else if (clientId) filter.clientId = clientId;
    return AdPerformanceDaily.find(filter).sort({ date: 1, spend: -1 }).limit(15000).lean();
}

async function getReportData(req) {
    const params = new URL(req.url).searchParams;
    const from = params.get('from') || '';
    const to = params.get('to') || '';
    const platform = params.get('platform') || 'all';
    const clientId = params.get('clientId') || '';
    const period = params.get('period') || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to)
        return { error: 'Choose a valid reporting date range.', status: 400 };
    let rows = await fetchRows({ from, to, platform, clientId });
    // Data for the selected range must come on report click: if nothing is
    // saved for this range yet, sync it from the ad accounts once, then read.
    if (!rows.length) {
        try {
            await syncAdsSnapshot(from, to);
            rows = await fetchRows({ from, to, platform, clientId });
        } catch (error) {
            console.error('Ads report sync-on-demand failed:', error.message);
        }
    }
    let clientName = 'All clients';
    let client = null;
    if (clientId.startsWith('account|')) clientName = rows[0]?.clientName || 'All clients';
    else if (clientId) {
        client = await ReportClient.findById(clientId).select('name websites metaPageIds').lean().catch(() => null);
        clientName = client?.name || rows[0]?.clientName || 'All clients';
    }
    // Extras for the PDF (comparison, ad copy, transparency links). Best-effort:
    // a failure here never blocks the report.
    const days = Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1;
    const prevTo = new Date(Date.parse(`${from}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
    const prevFrom = new Date(Date.parse(`${prevTo}T00:00:00Z`) - (days - 1) * 86400000).toISOString().slice(0, 10);
    const adIds = [...new Set(rows.filter((r) => r.level === 'ad').map((r) => String(r.entityId || '')).filter(Boolean))];
    const [prevRows, creatives] = await Promise.all([
        fetchRows({ from: prevFrom, to: prevTo, platform, clientId, levels: ['campaign'] }).catch(() => []),
        adIds.length ? AdCreative.find({ adId: { $in: adIds } }).select('platform accountId adId title headlines descriptions body callToAction finalUrl format adType').lean().catch(() => []) : [],
    ]);
    const hasPlatform = (p) => rows.some((r) => r.platform === p);
    const links = client ? transparencyLinks({ name: clientName, websites: client.websites || [], metaPageIds: client.metaPageIds || [] }) : null;
    const report = buildAdsReport({
        rows, prevRows, creatives, from, to, clientName, platform, period,
        links: links ? { meta: hasPlatform('meta') ? links.meta[0]?.url : '', google: hasPlatform('google') ? links.google[0]?.url : '' } : null,
    });
    return { report, from, to, platform, clientId };
}

export async function GET(req) {
    if (!await getAuthUser(req)) return new Response('Unauthorized', { status: 401 });
    await connectDB();
    try {
        const data = await getReportData(req);
        if (data.error) return new Response(data.error, { status: data.status });
        const pdf = await makeAdsReportPdf(data.report);
        const fileName = reportFileName(data.report.clientName, data.from, data.to);
        return new Response(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${fileName}"`, 'Cache-Control': 'no-store' } });
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
        // Share mode: email (default, recipient = email) or whatsapp
        // (recipient = phone; PDF is attached where the channel supports it,
        // otherwise the caller downloads it and opens the WhatsApp chat).
        const mode = body.mode === 'whatsapp' ? 'whatsapp' : 'email';
        const recipient = String(body.recipient || '').trim();
        if (mode === 'email' && !/^\S+@\S+\.\S+$/.test(recipient)) return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
        if (mode === 'whatsapp' && recipient.replace(/\D/g, '').length < 10) return Response.json({ error: 'Enter a valid WhatsApp number with country code.' }, { status: 400 });
        const query = new URLSearchParams({ from: body.from || '', to: body.to || '', platform: body.platform || 'all', clientId: body.clientId || '', period: body.period || '' });
        const data = await getReportData(new Request(`${new URL(req.url).origin}/api/ads-dashboard/report?${query}`));
        if (data.error) return Response.json({ error: data.error }, { status: data.status });
        const pdf = await makeAdsReportPdf(data.report);
        const { report } = data;
        const periodText = `${report.periodLabel} for ${report.clientName}, ${data.from} to ${data.to}.`;
        if (mode === 'whatsapp') {
            // No server-side WhatsApp attach API is configured: return the
            // PDF so the client can download it and open wa.me with the text.
            return new Response(pdf, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${reportFileName(report.clientName, data.from, data.to)}"`,
                    'X-Share-Text': encodeURIComponent(`Please find the ads performance report attached. ${periodText}`),
                    'Cache-Control': 'no-store',
                },
            });
        }
        // Same Gmail/nodemailer setup the proposal emails use (lib/mailerNew).
        if (!process.env.YOUR_EMAIL_ADDRESS || !process.env.YOUR_APP_PASSWORD)
            return Response.json({ error: 'Email delivery is not configured (YOUR_EMAIL_ADDRESS / YOUR_APP_PASSWORD missing).' }, { status: 503 });
        const fileName = reportFileName(report.clientName, data.from, data.to);
        const range = `${fmtDay(data.from)} to ${fmtDay(data.to)}`;
        await getTransporter().sendMail({
            from: MAIL_FROM,
            to: recipient,
            subject: `Ads performance report: ${report.clientName} (${range})`,
            html: `<p>Hello,</p><p>Please find attached the ads performance report for <b>${esc(report.clientName)}</b>, covering ${esc(range)}.</p><p>${esc(report.periodLabel)}.</p><p>Regards,<br>Inquiry Bazaar</p>`,
            attachments: [{ filename: fileName, content: Buffer.from(pdf), contentType: 'application/pdf' }],
        });
        return Response.json({ ok: true, to: recipient, clientName: report.clientName });
    } catch (error) {
        console.error('Ads report share error:', error);
        return Response.json({ error: error.message || 'Could not share the ads report.' }, { status: 500 });
    }
}
