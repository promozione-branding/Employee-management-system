// lib/adsReportPdf.js
// Professional ads PDF. Header/footer content comes from the same source
// the proposal PDFs use: components/proposalNew/ProposalPdfHeaderNew.jsx
// renders COMPANY_DETAILS + PDF_LOGO_PATH, ProposalPdfFooterNew.jsx renders
// FOOTER_LEFT / Page X of Y / FOOTER_RIGHT (config/new/proposalPdfNew.js).
// pdfkit cannot render React, so the identical content is drawn here.
// Pages are created only when content needs one: no empty pages in between.

import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { COMPANY_DETAILS, FOOTER_LEFT, FOOTER_RIGHT, PDF_LOGO_PATH } from '@/config/new/proposalPdfNew';

const LEFT = 44;
const TOP = 98;
const BOTTOM = 786;
const WIDTH = 507; // A4 595pt - 2 * 44pt margins

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmtDate = (iso) => {
    const d = new Date(`${iso}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
};
const titleCase = (s) => String(s || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function logoBuffer() {
    // Same logo as ProposalPdfHeaderNew (PDF_LOGO_PATH), pre-resized to
    // 450px wide so email/WhatsApp PDFs stay small; falls back to the
    // original base64 logo when the resized file is unavailable.
    try {
        const resized = path.join(process.cwd(), 'public', 'pdf', 'ads-report-logo.png');
        if (fs.existsSync(resized)) return fs.readFileSync(resized);
    } catch { /* fall through to the original logo */ }
    try {
        const base64 = String(PDF_LOGO_PATH || '').split(',')[1];
        return base64 ? Buffer.from(base64, 'base64') : null;
    } catch {
        return null;
    }
}

function stampHeaderFooter(doc, logo) {
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i += 1) {
        doc.switchToPage(i);
        // Header (ProposalPdfHeaderNew): logo left, company details right.
        if (logo) {
            try { doc.image(logo, LEFT, 22, { fit: [150, 42] }); } catch { /* logo optional */ }
        }
        doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9)
            .text(COMPANY_DETAILS.name, 320, 22, { width: WIDTH - 276, align: 'right', lineBreak: false });
        doc.fillColor('#374151').font('Helvetica').fontSize(7.5)
            .text(`${COMPANY_DETAILS.address}\nCall us : ${COMPANY_DETAILS.phone}\nEmail: ${COMPANY_DETAILS.email}\nWebsite: ${COMPANY_DETAILS.website}`, 320, 34, { width: WIDTH - 276, align: 'right', lineGap: 1.5, lineBreak: false });
        doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(LEFT, 78).lineTo(LEFT + WIDTH, 78).stroke();
        // Footer (ProposalPdfFooterNew): email left, Page X of Y centre, phone right.
        // lineBreak:false below the bottom margin, otherwise pdfkit paginates
        // and inserts blank pages while stamping.
        doc.strokeColor('#E5E7EB').moveTo(LEFT, 800).lineTo(LEFT + WIDTH, 800).stroke();
        doc.fillColor('#6B7280').font('Helvetica').fontSize(7.5);
        doc.text(FOOTER_LEFT, LEFT, 808, { width: 190, lineBreak: false });
        doc.text(`Page ${i - range.start + 1} of ${range.count}`, 225, 808, { width: 145, align: 'center', lineBreak: false });
        doc.text(FOOTER_RIGHT, 361, 808, { width: 190, align: 'right', lineBreak: false });
    }
}

export function makeAdsReportPdf(report) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: LEFT, bufferPages: true });
        const chunks = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        const logo = logoBuffer();

        const newPage = () => { doc.addPage(); doc.y = TOP; };
        const ensureSpace = (needed) => { if (doc.y + needed > BOTTOM) newPage(); };

        // ---- Cover / title block (page 1 only) ----
        doc.y = TOP;
        const titleY = doc.y;
        doc.roundedRect(LEFT, titleY, WIDTH, 66, 8).fill('#0A2E66');
        doc.fillColor('#F7A25C').font('Helvetica-Bold').fontSize(7.5)
            .text('INQUIRY BAZAAR  /  PERFORMANCE CENTER', LEFT + 16, titleY + 10, { characterSpacing: 1 });
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(17)
            .text(report.periodLabel, LEFT + 16, titleY + 22, { width: WIDTH - 32 });
        doc.fillColor('#DCE8FA').font('Helvetica').fontSize(9.5)
            .text(`Prepared for: ${report.clientName}`, LEFT + 16, titleY + 44, { width: WIDTH - 32 });
        doc.y = titleY + 80;
        doc.fillColor('#334155').font('Helvetica').fontSize(8.5)
            .text(`Reporting period: ${fmtDate(report.from)} to ${fmtDate(report.to)}   ·   Generated on: ${fmtDate(report.generatedOn)}   ·   Currency as reported by the ad account`, LEFT, doc.y, { width: WIDTH });
        doc.y += 20;

        if (report.isEmpty) {
            ensureSpace(70);
            const emptyY = doc.y;
            doc.roundedRect(LEFT, emptyY, WIDTH, 62, 8).lineWidth(1).fillAndStroke('#F8FAFC', '#E2E8F0');
            doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(10)
                .text('No ad activity in this period', LEFT + 14, emptyY + 12, { width: WIDTH - 28 });
            doc.fillColor('#64748B').font('Helvetica').fontSize(8.5)
                .text(`No campaigns delivered for ${report.clientName} between ${fmtDate(report.from)} and ${fmtDate(report.to)}. Please check the date range or sync the ad account and generate the report again.`, LEFT + 14, emptyY + 28, { width: WIDTH - 28, lineGap: 2 });
            doc.y = emptyY + 76;
            stampHeaderFooter(doc, logo);
            doc.end();
            return;
        }

        const drawTable = ({ title, columns, rows, totalRow }) => {
            const headerH = 20;
            const rowH = 16;
            ensureSpace(26 + headerH + rowH);
            doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(10.5).text(title, LEFT, doc.y, { width: WIDTH });
            doc.y += 18;
            const drawHeader = () => {
                const headerY = doc.y;
                let x = LEFT;
                doc.rect(LEFT, headerY, WIDTH, headerH).fill('#EAF0F8');
                columns.forEach((col) => {
                    doc.fillColor('#334155').font('Helvetica-Bold').fontSize(7)
                        .text(col.label, x + 5, headerY + 6, { width: col.width - 9, ellipsis: true, align: col.align || 'left' });
                    x += col.width;
                });
                doc.y = headerY + headerH + 2;
            };
            drawHeader();
            rows.forEach((cells, index) => {
                if (doc.y + rowH > BOTTOM) { newPage(); drawHeader(); }
                const rowY = doc.y;
                let x = LEFT;
                if (index % 2) doc.rect(LEFT, rowY - 2, WIDTH, rowH).fill('#F8FAFC');
                cells.forEach((cell, ci) => {
                    doc.fillColor('#334155').font('Helvetica').fontSize(7.2)
                        .text(String(cell ?? ''), x + 5, rowY + 2, { width: columns[ci].width - 9, ellipsis: true, align: columns[ci].align || 'left' });
                    x += columns[ci].width;
                });
                doc.y = rowY + rowH;
            });
            if (totalRow) {
                if (doc.y + rowH > BOTTOM) { newPage(); drawHeader(); }
                const totalY = doc.y;
                let x = LEFT;
                doc.rect(LEFT, totalY - 2, WIDTH, rowH).fill('#EAF0F8');
                totalRow.forEach((cell, ci) => {
                    doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(7.2)
                        .text(String(cell ?? ''), x + 5, totalY + 2, { width: columns[ci].width - 9, ellipsis: true, align: columns[ci].align || 'left' });
                    x += columns[ci].width;
                });
                doc.y = totalY + rowH;
            }
            doc.y += 12;
        };

        report.sections.forEach((section, sectionIndex) => {
            if (sectionIndex > 0) ensureSpace(120);
            // Section title bar
            ensureSpace(30);
            const barY = doc.y;
            doc.roundedRect(LEFT, barY, WIDTH, 22, 5).fill('#1E3A5F');
            doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9.5)
                .text(`${section.title}${section.resultType ? `  ·  ${section.resultType}` : ''}`, LEFT + 10, barY + 6, { width: WIDTH - 20 });
            doc.y = barY + 32;

            // KPI cards (only metrics that have data)
            const t = section.totals;
            const cur = section.currency;
            const cards = [
                ['SPEND', `${cur} ${fmt(t.spend)}`],
                ['IMPRESSIONS', fmt(t.impressions)],
                ['CLICKS', fmt(t.clicks)],
                ...(section.hasReach ? [['REACH', fmt(t.reach)]] : []),
                ...(section.hasResults
                    ? [['RESULTS', fmt(t.conversions)], ['COST / RESULT', `${cur} ${fmt(t.costPerResult)}`]]
                    : [['AVG. CPC', `${cur} ${fmt(t.cpc)}`], ['CTR', `${(t.ctr * 100).toFixed(2)}%`]]),
            ].slice(0, 6);
            ensureSpace(56);
            const gap = 8;
            const cardW = (WIDTH - gap * (cards.length - 1)) / cards.length;
            const cardsY = doc.y;
            cards.forEach(([label, value], i) => {
                const x = LEFT + i * (cardW + gap);
                doc.roundedRect(x, cardsY, cardW, 50, 7).lineWidth(1).fillAndStroke('#F8FAFC', '#E2E8F0');
                doc.fillColor('#64748B').font('Helvetica-Bold').fontSize(6.2).text(label, x + 7, cardsY + 9, { width: cardW - 14, ellipsis: true });
                doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8.2).text(value, x + 7, cardsY + 24, { width: cardW - 14, ellipsis: true });
            });
            doc.y = cardsY + 64;

            // Campaign table (columns only when the data exists)
            const columns = [
                { label: 'Campaign', width: 0 },
                { label: 'Impressions', width: 64, align: 'right' },
                ...(section.hasReach ? [{ label: 'Reach', width: 58, align: 'right' }] : []),
                { label: 'Clicks', width: 48, align: 'right' },
                { label: 'Spend', width: 72, align: 'right' },
                ...(section.hasResults ? [{ label: 'Results', width: 50, align: 'right' }, { label: 'Cost / result', width: 68, align: 'right' }] : []),
            ];
            columns[0].width = WIDTH - columns.slice(1).reduce((s, c) => s + c.width, 0);
            const campaignCells = (r) => [
                `${r.campaign}${r.status ? ` (${titleCase(r.status)})` : ''}`,
                fmt(r.impressions),
                ...(section.hasReach ? [fmt(r.reach)] : []),
                fmt(r.clicks),
                `${r.currency || cur} ${fmt(r.spend)}`,
                ...(section.hasResults ? [fmt(r.conversions), r.conversions ? `${r.currency || cur} ${fmt(r.costPerResult)}` : ''] : []),
            ];
            drawTable({
                title: 'Campaign performance',
                columns,
                rows: section.campaigns.map(campaignCells),
                totalRow: campaignCells({ campaign: 'Total', status: '', impressions: t.impressions, reach: t.reach, clicks: t.clicks, spend: t.spend, conversions: t.conversions, costPerResult: t.costPerResult, currency: cur }),
            });

            // Daily table for the selected date range
            if (section.daily.length) {
                const dailyColumns = [
                    { label: 'Date', width: 86 },
                    { label: 'Impressions', width: 72, align: 'right' },
                    ...(section.hasReach ? [{ label: 'Reach', width: 62, align: 'right' }] : []),
                    { label: 'Clicks', width: 54, align: 'right' },
                    { label: 'Spend', width: 78, align: 'right' },
                    ...(section.hasResults ? [{ label: 'Results', width: 54, align: 'right' }, { label: 'Cost / result', width: 0, align: 'right' }] : []),
                ];
                const fixed = dailyColumns.reduce((s, c) => s + c.width, 0);
                if (section.hasResults) dailyColumns[dailyColumns.length - 1].width = WIDTH - fixed;
                drawTable({
                    title: `Daily performance (${fmtDate(report.from)} to ${fmtDate(report.to)})`,
                    columns: dailyColumns,
                    rows: section.daily.map((d) => [
                        fmtDate(d.date), fmt(d.impressions),
                        ...(section.hasReach ? [fmt(d.reach)] : []),
                        fmt(d.clicks), `${cur} ${fmt(d.spend)}`,
                        ...(section.hasResults ? [fmt(d.conversions), d.conversions ? `${cur} ${fmt(d.costPerResult)}` : ''] : []),
                    ]),
                });
            }

            // Keyword / product details only when present
            if (section.details.length) {
                drawTable({
                    title: section.name === 'google' ? 'Search keywords and product results' : 'Top ad details',
                    columns: [
                        { label: 'Type', width: 78 },
                        { label: 'Keyword / product', width: 178 },
                        { label: 'Campaign', width: 125 },
                        { label: 'Clicks', width: 48, align: 'right' },
                        { label: 'Spend', width: 78, align: 'right' },
                    ],
                    rows: section.details.slice(0, 10).map((r) => [
                        r.level === 'keyword' ? 'Keyword' : 'Shopping / PMax',
                        r.keyword || r.entity || '',
                        r.campaign || '',
                        fmt(r.clicks),
                        `${r.currency || cur} ${fmt(r.spend)}`,
                    ]),
                });
            }
        });

        ensureSpace(16);
        doc.fillColor('#94A3B8').font('Helvetica').fontSize(7)
            .text('Only campaigns and days with reported activity are shown. Metrics are supplied by the connected ad account.', LEFT, doc.y + 4, { width: WIDTH, align: 'center' });
        stampHeaderFooter(doc, logo);
        doc.end();
    });
}
