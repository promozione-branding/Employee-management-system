// lib/adsReportPdf.js
// Ads performance PDF (A4 landscape), drawn with pdfkit from the model built in
// lib/adsReportData.js. Header/footer carry the same company details as the
// proposal PDFs (config/new/proposalPdfNew.js).
//
// Layout rules:
//  - Page margins are 0 and every string is drawn with lineBreak:false at an
//    explicit position, so pdfkit never adds pages on its own. A page is only
//    added when the next block does not fit, so there are no blank pages.
//  - A table column is only drawn when at least one row has a value for it, and
//    sections / tables with no data are skipped entirely.
//  - Noto Sans (₹ and Latin) with Noto Sans Devanagari for Hindi names.

import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { COMPANY_DETAILS, FOOTER_LEFT, FOOTER_RIGHT, PDF_LOGO_PATH } from '@/config/new/proposalPdfNew';
import { bidStrategyLabel, campaignType, deliveryOf, googleAdType, perResultLabel } from '@/lib/adsLabels';

// ── Page geometry (A4 landscape, points) ──
const PAGE_W = 841.89;
const PAGE_H = 595.28;
const M = 36;
const W = PAGE_W - M * 2;
const TOP = 66;
const BOTTOM = PAGE_H - 44;

// ── Palette: mostly ink and greys, one brand accent ──
const C = {
    ink: '#0F172A', text: '#334155', muted: '#64748B', faint: '#94A3B8', line: '#E2E8F0', soft: '#F5F7FA',
    navy: '#0A2E66', accent: '#F27B1E', google: '#3B69AD', meta: '#F2A65A', up: '#15803D', down: '#B91C1C',
};

// ── Fonts ──
const FONT_DIR = path.join(process.cwd(), 'public', 'font');
const FONT_FILES = { R: 'NotoSans-Regular.ttf', S: 'NotoSans-SemiBold.ttf', B: 'NotoSans-Bold.ttf', D: 'NotoSansDevanagari-Regular.ttf' };
const FALLBACK = { R: 'Helvetica', S: 'Helvetica-Bold', B: 'Helvetica-Bold', D: 'Helvetica' };
function registerFonts(doc) {
    const fonts = {};
    for (const [key, file] of Object.entries(FONT_FILES)) {
        try {
            const full = path.join(FONT_DIR, file);
            if (fs.existsSync(full)) { doc.registerFont(key, full); fonts[key] = key; continue; }
        } catch { /* use fallback */ }
        fonts[key] = FALLBACK[key];
    }
    fonts.unicode = fonts.R === 'R';
    return fonts;
}

// ── Formatting ──
const SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
const n2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pctText = (ratio) => `${(Number(ratio || 0) * 100).toFixed(2)}%`;
const fmtDate = (iso, opts = {}) => {
    const d = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? String(iso || '') : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC', ...opts });
};
const shortDate = (iso) => fmtDate(iso, { year: undefined });
const dayDate = (iso) => {
    const d = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? String(iso || '') : `${d.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' })}, ${fmtDate(iso)}`;
};
const resultsNoun = (type, count = 2) => {
    if (Math.round(count) === 1) return type ? perResultLabel(type).replace(/^Per /, '') : 'result';
    return type ? type.charAt(0).toLowerCase() + type.slice(1) : 'results';
};
const ellipsize = (s, max) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

function logoBuffer() {
    try {
        const resized = path.join(process.cwd(), 'public', 'pdf', 'ads-report-logo.png');
        if (fs.existsSync(resized)) return fs.readFileSync(resized);
    } catch { /* fall through */ }
    try {
        const base64 = String(PDF_LOGO_PATH || '').split(',')[1];
        return base64 ? Buffer.from(base64, 'base64') : null;
    } catch {
        return null;
    }
}

export function makeAdsReportPdf(report) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0, bufferPages: true, info: { Title: `${report.clientName} - ${report.periodLabel}`, Author: COMPANY_DETAILS.name } });
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            render(doc, report);
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

function render(doc, report) {
    const F = registerFonts(doc);
    const logo = logoBuffer();
    const cur = report.currency || 'INR';
    const sym = F.unicode ? SYMBOLS[cur] : '';
    const money = (v, currency = cur) => {
        const s = (F.unicode && SYMBOLS[currency]) || (currency === cur ? sym : '');
        return s ? `${s}${n2(v)}` : `${currency} ${n2(v)}`;
    };
    let y = TOP;

    // ── Text with script-aware font runs (Latin in Noto Sans, Hindi in Noto Sans Devanagari) ──
    const DEVA = /[ऀ-ॿ᳐-᳿꣠-ꣿ]/;
    const clean = (value) => {
        let s = String(value ?? '').replace(/[\r\n\t]+/g, ' ');
        s = s.replace(/\p{Extended_Pictographic}|[‍︎️]|[\u{1F1E6}-\u{1F1FF}]/gu, '');
        if (!F.unicode) s = s.replace(/₹/g, 'Rs.').replace(/[^\x20-\x7E -ÿ]/g, '');
        return s.replace(/\s{2,}/g, ' ').trim();
    };
    const runsOf = (s) => {
        const runs = [];
        for (const ch of s) {
            const deva = F.unicode && DEVA.test(ch);
            const last = runs[runs.length - 1];
            if (last && (last.deva === deva || ch === ' ')) last.t += ch;
            else runs.push({ t: ch, deva });
        }
        return runs;
    };
    const widthOf = (s, font, size) => runsOf(s).reduce((w, r) => w + doc.font(r.deva ? F.D : F[font]).fontSize(size).widthOfString(r.t), 0);
    const fit = (s, font, size, width) => {
        if (!width || widthOf(s, font, size) <= width) return s;
        let lo = 0, hi = s.length;
        while (lo < hi) {
            const mid = Math.ceil((lo + hi) / 2);
            if (widthOf(`${s.slice(0, mid).trimEnd()}…`, font, size) <= width) lo = mid;
            else hi = mid - 1;
        }
        return lo ? `${s.slice(0, lo).trimEnd()}…` : '';
    };
    /** Draws one line of text; returns its width. Never wraps, never paginates. */
    const put = (value, x, top, { font = 'R', size = 8, color = C.text, width = 0, align = 'left', link, spacing = 0 } = {}) => {
        const s = fit(clean(value), font, size, width);
        if (!s) return 0;
        const w = widthOf(s, font, size) + spacing * Math.max(0, s.length - 1);
        const start = align === 'right' ? x + width - w : align === 'center' ? x + (width - w) / 2 : x;
        let cx = start;
        for (const r of runsOf(s)) {
            doc.font(r.deva ? F.D : F[font]).fontSize(size).fillColor(color);
            // Noto Sans Devanagari has a taller ascent; nudge it onto the Latin baseline.
            doc.text(r.t, cx, r.deva ? top + size * 0.08 : top, { lineBreak: false, characterSpacing: spacing });
            cx += doc.widthOfString(r.t, { characterSpacing: spacing });
        }
        if (link) doc.link(start, top, w, size * 1.4, link);
        return w;
    };
    const rule = (x1, yy, x2, color = C.line, width = 0.6) => doc.save().strokeColor(color).lineWidth(width).moveTo(x1, yy).lineTo(x2, yy).stroke().restore();
    const triangle = (x, yy, up, color) => {
        doc.save().fillColor(color);
        if (up) doc.polygon([x, yy + 5], [x + 5.4, yy + 5], [x + 2.7, yy + 0.6]);
        else doc.polygon([x, yy + 0.8], [x + 5.4, yy + 0.8], [x + 2.7, yy + 5.2]);
        doc.fill().restore();
    };

    const newPage = () => { doc.addPage({ size: 'A4', layout: 'landscape', margin: 0 }); y = TOP; };
    const ensure = (needed) => { if (y + needed > BOTTOM) newPage(); };

    // ── Cover block ──
    const platforms = report.sections.map((s) => s.title).join(' + ');
    put('ADS PERFORMANCE REPORT', M, y, { font: 'S', size: 7.5, color: C.accent, spacing: 1.2 });
    put(report.clientName, M, y + 11, { font: 'B', size: 21, color: C.ink, width: W * 0.62 });
    put(`${report.periodLabel}  ·  ${fmtDate(report.from)} – ${fmtDate(report.to)}${report.days ? `  (${report.days} day${report.days === 1 ? '' : 's'})` : ''}`, M, y + 42, { size: 9.5, color: C.text, width: W * 0.62 });
    const meta = [platforms, report.prevFrom && !report.isEmpty ? `Compared with ${fmtDate(report.prevFrom)} – ${fmtDate(report.prevTo)}` : '', `Generated ${fmtDate(report.generatedOn)}`].filter(Boolean).join('  ·  ');
    put(meta, M, y + 57, { size: 7.5, color: C.muted, width: W * 0.62 });
    // Live-ads links (clickable) on the right of the cover.
    const linkItems = [report.links?.meta && ['Meta Ad Library', report.links.meta], report.links?.google && ['Google Ads Transparency Center', report.links.google]].filter(Boolean);
    if (linkItems.length) {
        put('See the live ads', M + W - 200, y + 14, { font: 'S', size: 7, color: C.muted, width: 200, align: 'right' });
        linkItems.forEach(([label, url], i) => put(`${label}  ›`, M + W - 200, y + 26 + i * 12, { font: 'S', size: 8, color: C.navy, width: 200, align: 'right', link: url }));
    }
    rule(M, y + 74, M + 46, C.accent, 1.6);
    y += 88;

    if (report.isEmpty) {
        doc.save().roundedRect(M, y, W, 60, 6).lineWidth(0.8).fillAndStroke(C.soft, C.line).restore();
        put('No ad activity in this period', M + 16, y + 14, { font: 'S', size: 11, color: C.ink, width: W - 32 });
        put(`No campaigns delivered for ${report.clientName} between ${fmtDate(report.from)} and ${fmtDate(report.to)}. Check the date range, or sync the ad account and generate the report again.`, M + 16, y + 34, { size: 8.5, color: C.muted, width: W - 32 });
        stamp(doc, report, logo, put, rule);
        return;
    }

    // ── KPI cards ──
    const change = (current, previous, goodWhenUp) => {
        if (!Number(previous) || !Number(current)) return null;
        const pct = ((Number(current) - Number(previous)) / Number(previous)) * 100;
        const up = pct >= 0;
        return { pct, up, color: goodWhenUp === null ? C.muted : up === goodWhenUp ? C.up : C.down };
    };
    const kpis = (t, p) => [
        { label: 'Amount spent', value: money(t.spend), cur: t.spend, prev: p.spend, good: null, show: t.spend > 0 },
        { label: t.resultType ? `Results · ${t.resultType}` : 'Results', value: n0(t.conversions), cur: t.conversions, prev: p.conversions, good: true, show: t.conversions > 0 },
        { label: t.resultType ? `Cost ${perResultLabel(t.resultType).toLowerCase()}` : 'Cost per result', value: money(t.costPerResult), cur: t.costPerResult, prev: p.conversions ? p.costPerResult : 0, good: false, show: t.conversions > 0 },
        { label: 'Impressions', value: n0(t.impressions), cur: t.impressions, prev: p.impressions, good: true, show: t.impressions > 0 },
        { label: 'Reach', value: n0(t.reach), cur: t.reach, prev: p.reach, good: true, show: t.reach > 0 },
        { label: 'Clicks', value: n0(t.clicks), cur: t.clicks, prev: p.clicks, good: true, show: t.clicks > 0 },
        { label: 'CTR', value: pctText(t.ctr), cur: t.ctr, prev: p.ctr, good: true, show: t.clicks > 0 },
        { label: 'Avg. CPC', value: money(t.cpc), cur: t.cpc, prev: p.cpc, good: false, show: t.clicks > 0 },
        { label: 'CPM', value: money(t.cpm), cur: t.cpm, prev: p.cpm, good: false, show: t.impressions > 0 },
    ].filter((k) => k.show);
    const drawCards = (cards, { height = 50, valueSize = 14 } = {}) => {
        if (!cards.length) return;
        const perRow = cards.length <= 5 ? cards.length : Math.ceil(cards.length / 2);
        const gap = 8;
        const cw = (W - gap * (perRow - 1)) / perRow;
        const rowsNeeded = Math.ceil(cards.length / perRow);
        ensure(rowsNeeded * (height + gap));
        cards.forEach((k, i) => {
            const col = i % perRow;
            const row = Math.floor(i / perRow);
            const x = M + col * (cw + gap);
            const top = y + row * (height + gap);
            doc.save().roundedRect(x, top, cw, height, 5).lineWidth(0.7).fillAndStroke('#FFFFFF', C.line).restore();
            put(k.label, x + 10, top + 8, { font: 'S', size: 6.8, color: C.muted, width: cw - 20 });
            put(k.value, x + 10, top + 19, { font: 'B', size: valueSize, color: C.ink, width: cw - 20 });
            const ch = change(k.cur, k.prev, k.good);
            if (ch) {
                triangle(x + 10, top + height - 13, ch.up, ch.color);
                const w = put(`${Math.abs(ch.pct).toFixed(1)}%`, x + 18, top + height - 15, { font: 'S', size: 6.8, color: ch.color });
                put(`vs previous ${report.days} days`, x + 21 + w, top + height - 15, { size: 6.8, color: C.faint, width: cw - 32 - w });
            }
        });
        y += rowsNeeded * (height + gap) + 6;
    };

    // ── Generic table: hides empty columns, repeats the header on new pages ──
    const isBlank = (v) => v === null || v === undefined || v === '' || v === '—' || (Array.isArray(v) && isBlank(v[0]) && isBlank(v[1]));
    const table = ({ title, note, columns, rows, total }) => {
        if (!rows.length) return;
        const cells = rows.map((r) => columns.map((c) => c.cell(r)));
        const visible = columns.map((c, i) => ({ ...c, i })).filter((c) => c.always || cells.some((row) => !isBlank(row[c.i])));
        const fixed = visible.reduce((s, c) => s + (c.flex ? 0 : c.w), 0);
        const flexTotal = visible.reduce((s, c) => s + (c.flex || 0), 0);
        const cols = visible.map((c) => ({ ...c, width: c.flex ? ((W - fixed) * c.flex) / flexTotal : c.w }));
        const twoLine = cols.some((c) => cells.some((row) => Array.isArray(row[c.i]) && !isBlank(row[c.i][1])));
        const rowH = twoLine ? 23 : 17;
        const headH = 18;
        const pad = 6;

        const drawTitle = (continued) => {
            put(`${title}${continued ? ' (continued)' : ''}`, M, y, { font: 'B', size: 10.5, color: C.ink, width: W * 0.7 });
            if (note && !continued) put(note, M + W * 0.5, y + 2.5, { size: 7, color: C.faint, width: W * 0.5, align: 'right' });
            y += 18;
        };
        const drawHead = () => {
            doc.save().rect(M, y, W, headH).fill(C.soft).restore();
            let x = M;
            for (const c of cols) {
                put(c.label, x + pad, y + 5.2, { font: 'S', size: 6.7, color: C.muted, width: c.width - pad * 2, align: c.align || 'left' });
                x += c.width;
            }
            rule(M, y + headH, M + W, C.line, 0.6);
            y += headH;
        };
        const drawRow = (row, { bold = false } = {}) => {
            let x = M;
            for (const c of cols) {
                const v = row[c.i];
                const [main, sub] = Array.isArray(v) ? v : [v, ''];
                const first = c === cols[0];
                let tx = x + pad;
                let tw = c.width - pad * 2;
                if (c.dot && !bold) {
                    const color = c.dot(rows[cells.indexOf(row)]);
                    if (color) { doc.save().circle(tx + 2.2, y + (twoLine ? 8.4 : 8.6), 2.2).fill(color).restore(); tx += 8; tw -= 8; }
                }
                const mainTop = twoLine ? y + 3.8 : y + 4.4;
                if (!isBlank(main)) put(main, tx, mainTop, { font: bold || first ? 'S' : 'R', size: 7.6, color: bold || first ? C.ink : C.text, width: tw, align: c.align || 'left' });
                if (twoLine && !isBlank(sub)) put(sub, tx, y + 13.4, { size: 6.4, color: C.muted, width: tw, align: c.align || 'left' });
                x += c.width;
            }
        };

        ensure(18 + headH + rowH * Math.min(rows.length, 3) + (total ? rowH : 0));
        drawTitle(false);
        drawHead();
        cells.forEach((row) => {
            if (y + rowH > BOTTOM) { newPage(); drawTitle(true); drawHead(); }
            drawRow(row);
            y += rowH;
            rule(M, y, M + W, C.line, 0.4);
        });
        if (total) {
            const totalCells = columns.map((c) => c.cell(total, true));
            if (y + rowH > BOTTOM) { newPage(); drawTitle(true); drawHead(); }
            doc.save().rect(M, y, W, rowH).fill(C.soft).restore();
            rule(M, y, M + W, C.navy, 0.8);
            drawRow(totalCells, { bold: true });
            y += rowH;
        }
        y += 18;
    };

    // ── Shared cell builders ──
    const resultsCell = (r) => (r.conversions > 0 ? [n0(r.conversions), r.resultType || ''] : '');
    const cprCell = (r) => (r.conversions > 0 ? [money(r.costPerResult, r.currency || cur), r.resultType ? perResultLabel(r.resultType) : ''] : '');
    const metricCols = ({ reach = true } = {}) => [
        { label: 'Results', w: 112, align: 'right', cell: resultsCell },
        { label: 'Cost per result', w: 128, align: 'right', cell: cprCell },
        { label: 'Amount spent', w: 74, align: 'right', cell: (r) => (r.spend > 0 ? money(r.spend, r.currency || cur) : '') },
        { label: 'Impressions', w: 62, align: 'right', cell: (r) => (r.impressions > 0 ? n0(r.impressions) : '') },
        ...(reach ? [{ label: 'Reach', w: 58, align: 'right', cell: (r) => (r.reach > 0 ? n0(r.reach) : '') }] : []),
        { label: 'Clicks', w: 46, align: 'right', cell: (r) => (r.clicks > 0 ? n0(r.clicks) : '') },
        { label: 'CTR', w: 44, align: 'right', cell: (r) => (r.clicks > 0 && r.impressions > 0 ? pctText(r.ctr) : '') },
        { label: 'Avg. CPC', w: 54, align: 'right', cell: (r) => (r.clicks > 0 ? money(r.cpc, r.currency || cur) : '') },
    ];
    const deliveryCol = (platform) => ({
        label: 'Delivery', w: 66,
        cell: (r, isTotal) => (isTotal ? '' : r.status ? deliveryOf(platform, r.status).label : ''),
        dot: (r) => (r?.status ? (deliveryOf(platform, r.status).on ? '#22A06B' : C.faint) : null),
    });
    const budgetText = (r, currency) => {
        if (r.budgetType === 'campaign') return 'Campaign budget';
        if (!(r.budget > 0)) return '';
        const amount = money(r.budget, currency);
        if (r.budgetType === 'lifetime') return `${amount} lifetime`;
        if (r.budgetType === 'adset') return `${amount}/day (ad sets)`;
        return `${amount}/day`;
    };
    const endText = (r) => {
        const end = String(r.endTime || '');
        if (!end || end.startsWith('2037')) return '';
        return `Ends ${fmtDate(end.slice(0, 10))}`;
    };
    const settingsLine = (r, platform, showClient) => {
        const type = campaignType({ ...r, platform }).replace(/^(Google|Meta) /, '');
        return [
            showClient ? r.clientName : '',
            type === 'campaigns' ? '' : type,
            budgetText(r, r.currency || cur),
            bidStrategyLabel(platform, r.bidStrategy) === 'Mixed' ? '' : bidStrategyLabel(platform, r.bidStrategy),
            r.attributionSetting && r.attributionSetting !== 'Mixed' ? r.attributionSetting : '',
            endText(r),
        ].filter(Boolean).join('  ·  ');
    };
    const topNote = (shown, all, what) => (all > shown ? `Top ${shown} of ${all} ${what} by amount spent` : '');

    // ── Page 1: overview ──
    drawCards(kpis(report.overall, report.prevOverall));

    if (report.sections.length > 1) {
        const all = report.overall;
        table({
            title: 'Platform summary',
            columns: [
                { label: 'Platform', flex: 1, cell: (r, isTotal) => (isTotal ? 'Total' : r.title), always: true, dot: (r) => (r?.name === 'google' ? C.google : r?.name === 'meta' ? C.meta : null) },
                { label: 'Share of spend', w: 76, align: 'right', cell: (r) => (all.spend ? `${((r.totals.spend / all.spend) * 100).toFixed(1)}%` : '') },
                ...metricCols().map((c) => ({ ...c, cell: (r) => c.cell(r.totals) })),
            ],
            rows: report.sections,
            total: { title: 'Total', totals: report.overall },
        });
    }

    // Daily chart for the whole report.
    if (report.daily.length > 1) drawChart();

    if (report.highlights.length) {
        const lines = report.highlights.map(highlightText).filter(Boolean);
        ensure(18 + Math.min(lines.length, 3) * 14);
        put('Highlights', M, y, { font: 'B', size: 10.5, color: C.ink });
        y += 18;
        for (const line of lines) {
            ensure(14);
            doc.save().circle(M + 3, y + 5, 1.8).fill(C.accent).restore();
            put(line, M + 12, y, { size: 8.2, color: C.text, width: W - 12 });
            y += 14;
        }
        y += 10;
    }

    // ── One section per platform ──
    for (const s of report.sections) {
        const showClient = report.clientName === 'All clients';
        // Section heading (+ KPI strip) and the first rows must fit; otherwise start on a fresh page.
        ensure(130);
        doc.save().circle(M + 4, y + 8, 4).fill(s.name === 'google' ? C.google : C.meta).restore();
        put(s.title, M + 14, y, { font: 'B', size: 15, color: C.ink, width: W * 0.5 });
        if (s.accounts.length) put(`Ad account${s.accounts.length > 1 ? 's' : ''}: ${s.accounts.slice(0, 6).join(', ')}${s.accounts.length > 6 ? ` +${s.accounts.length - 6} more` : ''}`, M + W * 0.4, y + 5, { size: 7.5, color: C.muted, width: W * 0.6, align: 'right' });
        y += 24;
        rule(M, y, M + W);
        y += 10;

        const reach = s.hasReach;
        table({
            title: 'Campaigns',
            note: `${s.campaigns.length} campaign${s.campaigns.length === 1 ? '' : 's'} with delivery in this period`,
            columns: [
                { label: 'Campaign', flex: 1, always: true, cell: (r, isTotal) => (isTotal ? ['Total', ''] : [r.campaign, settingsLine(r, s.name, showClient)]) },
                deliveryCol(s.name),
                ...metricCols({ reach }),
            ],
            rows: s.campaigns,
            total: s.campaigns.length > 1 ? { ...s.totals, currency: s.currency } : null,
        });

        const groupWord = s.name === 'meta' ? 'ad sets' : 'ad groups';
        const sameAsCampaigns = s.groups.length === s.campaigns.length && s.groups.every((g) => s.campaigns.some((c) => c.campaign === g.campaign && Math.abs(c.spend - g.spend) < 0.01 && c.conversions === g.conversions));
        const groups = sameAsCampaigns ? [] : s.groups.slice(0, 25);
        table({
            title: s.name === 'meta' ? 'Ad sets' : 'Ad groups',
            note: topNote(groups.length, s.groups.length, groupWord),
            columns: [
                { label: s.name === 'meta' ? 'Ad set' : 'Ad group', flex: 1, always: true, cell: (r) => [r.name, [showClient ? r.clientName : '', r.campaign !== r.name ? r.campaign : '', s.name === 'meta' ? budgetText(r, r.currency || cur) : ''].filter(Boolean).join('  ·  ')] },
                deliveryCol(s.name),
                ...metricCols({ reach }),
            ],
            rows: groups,
        });

        const ads = s.ads.slice(0, 25);
        table({
            title: 'Ads',
            note: topNote(ads.length, s.ads.length, 'ads'),
            columns: [
                {
                    label: 'Ad', flex: 1.2, always: true,
                    cell: (r) => {
                        const copy = [r.headline && r.headline !== r.name ? r.headline : '', r.body].filter(Boolean).join(' — ').replace(/[*_#`]+/g, '');
                        const named = Boolean(r.entity || r.headline);
                        const kind = adFormat(r);
                        const title = named ? r.name : `${kind && kind !== 'Text' ? `${kind} ad` : 'Ad'}`;
                        const where = [named ? '' : `ID ${r.entityId}`, r.campaign, r.adGroup].filter(Boolean).join(' › ');
                        return [title, copy || where];
                    },
                },
                { label: 'Format', w: 70, cell: (r) => adFormat(r) },
                deliveryCol(s.name),
                ...metricCols({ reach }).filter((c) => c.label !== 'Avg. CPC'),
            ],
            rows: ads,
        });

        const keywords = s.keywords.slice(0, 40);
        table({
            title: 'Search keywords',
            note: topNote(keywords.length, s.keywords.length, 'keywords'),
            columns: [
                { label: 'Keyword', flex: 1, always: true, cell: (r) => [r.keywordText, [r.campaign, r.adGroup].filter(Boolean).join(' › ')] },
                { label: 'Match type', w: 62, cell: (r) => r.matchType },
                ...metricCols({ reach: false }),
            ],
            rows: keywords,
        });

        const products = s.products.slice(0, 25);
        table({
            title: 'Shopping products',
            note: topNote(products.length, s.products.length, 'products'),
            columns: [
                { label: 'Product', flex: 1.3, always: true, cell: (r) => [r.name, [r.productId && r.productId !== r.name ? `ID ${r.productId}` : '', r.productBrand, r.productType].filter(Boolean).join('  ·  ')] },
                { label: 'Campaign', flex: 0.7, cell: (r) => r.campaign },
                ...metricCols({ reach: false }),
            ],
            rows: products,
        });

        if (s.daily.length) {
            table({
                title: 'Day by day',
                columns: [
                    { label: 'Date', w: 104, always: true, cell: (r, isTotal) => (isTotal ? 'Total' : dayDate(r.date)) },
                    { label: 'Results', w: 1, flex: 1, align: 'right', cell: (r) => (r.conversions > 0 ? n0(r.conversions) : '') },
                    { label: 'Cost per result', flex: 1, align: 'right', cell: (r) => (r.conversions > 0 ? money(r.costPerResult, s.currency) : '') },
                    { label: 'Amount spent', flex: 1, align: 'right', cell: (r) => (r.spend > 0 ? money(r.spend, s.currency) : '') },
                    { label: 'Impressions', flex: 1, align: 'right', cell: (r) => (r.impressions > 0 ? n0(r.impressions) : '') },
                    ...(reach ? [{ label: 'Reach', flex: 1, align: 'right', cell: (r, isTotal) => (!isTotal && r.reach > 0 ? n0(r.reach) : '') }] : []),
                    { label: 'Clicks', flex: 1, align: 'right', cell: (r) => (r.clicks > 0 ? n0(r.clicks) : '') },
                    { label: 'CTR', flex: 1, align: 'right', cell: (r) => (r.clicks > 0 && r.impressions > 0 ? pctText(r.ctr) : '') },
                    { label: 'Avg. CPC', flex: 1, align: 'right', cell: (r) => (r.clicks > 0 ? money(r.cpc, s.currency) : '') },
                    { label: 'CPM', flex: 1, align: 'right', cell: (r) => (r.impressions > 0 ? money(r.cpm, s.currency) : '') },
                ],
                rows: s.daily,
                total: s.daily.length > 1 ? s.totals : null,
            });
        }
    }

    stamp(doc, report, logo, put, rule);

    // ── Helpers that need the closure ──
    function adFormat(r) {
        // Google: the ad type is the precise answer (a call ad has no text but is not a "text" ad).
        const t = r.platform === 'google' ? googleAdType(r.adType) : '';
        const map = { RESPONSIVE_SEARCH_AD: 'Search (RSA)', EXPANDED_TEXT_AD: 'Text', TEXT_AD: 'Text', RESPONSIVE_DISPLAY_AD: 'Display', IMAGE_AD: 'Image', CALL_AD: 'Call', SHOPPING_PRODUCT_AD: 'Shopping', VIDEO_RESPONSIVE_AD: 'Video', DEMAND_GEN_MULTI_ASSET_AD: 'Demand Gen', DEMAND_GEN_CAROUSEL_AD: 'Carousel', DEMAND_GEN_VIDEO_RESPONSIVE_AD: 'Video', DEMAND_GEN_PRODUCT_AD: 'Product' };
        if (t) return map[t] || t.toLowerCase().replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());
        if (r.format) return r.format.charAt(0).toUpperCase() + r.format.slice(1);
        return '';
    }

    function highlightText(h) {
        const name = (v) => `“${ellipsize(clean(v), 48)}”`;
        const on = report.sections.length > 1 ? ` on ${h.platformTitle}` : '';
        const dir = (pct) => `${pct >= 0 ? 'up' : 'down'} ${Math.abs(pct).toFixed(1)}%`;
        switch (h.kind) {
            case 'spend': return `Amount spent is ${dir(h.change)} on the previous ${report.days} days (${money(h.prev)} to ${money(h.value)}).`;
            case 'results': return `Results are ${dir(h.change)} on the previous ${report.days} days (${n0(h.prev)} to ${n0(h.value)}${h.resultType ? ` ${resultsNoun(h.resultType, h.value)}` : ''}).`;
            case 'mostResults': return `Most results: ${name(h.campaign)}${on}, with ${n0(h.value)} ${resultsNoun(h.resultType, h.value)}.`;
            case 'bestCost': return `Lowest cost per result: ${name(h.campaign)}${on}, at ${money(h.value, h.currency || cur)} ${perResultLabel(h.resultType).toLowerCase()}.`;
            case 'topSpend': return `Biggest share of spend: ${name(h.campaign)}${on}, ${h.share.toFixed(1)}% of the total (${money(h.value, h.currency || cur)}).`;
            case 'peakDay': return `Highest-spend day: ${dayDate(h.date)}, ${money(h.value)}${h.conversions ? ` for ${n0(h.conversions)} result${Math.round(h.conversions) === 1 ? '' : 's'}` : ''}.`;
            case 'topKeyword': return `Most-clicked keyword: ${name(h.keyword)}, ${n0(h.value)} clicks at ${pctText(h.ctr)} CTR.`;
            default: return '';
        }
    }

    function drawChart() {
        // Weekly buckets past ~2 months so bars stay readable.
        // Every day of the range, so quiet days show as gaps instead of disappearing.
        const byDate = new Map(report.daily.map((d) => [d.date, d]));
        let points = [];
        for (let t = Date.parse(`${report.from}T00:00:00Z`), end = Date.parse(`${report.to}T00:00:00Z`); t <= end && points.length < 400; t += 86400000) {
            const date = new Date(t).toISOString().slice(0, 10);
            points.push(byDate.get(date) || { date, google: 0, meta: 0, spend: 0, conversions: 0 });
        }
        if (!points.length) points = report.daily;
        const weekly = points.length > 62;
        if (weekly) {
            const weeks = new Map();
            for (const d of points) {
                const dt = new Date(`${d.date}T00:00:00Z`);
                dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
                const key = dt.toISOString().slice(0, 10);
                const w = weeks.get(key) || { date: key, google: 0, meta: 0, spend: 0, conversions: 0 };
                w.google += d.google; w.meta += d.meta; w.spend += d.spend; w.conversions += d.conversions;
                weeks.set(key, w);
            }
            points = [...weeks.values()];
        }
        const room = BOTTOM - y - 56;
        if (room < 80) newPage();
        const H = Math.max(80, Math.min(118, BOTTOM - y - 56));

        put(`${weekly ? 'Weekly' : 'Daily'} amount spent${report.overall.conversions ? ' and results' : ''}`, M, y, { font: 'B', size: 10.5, color: C.ink });
        // Legend
        const legend = [
            ...report.sections.map((s) => [s.title, s.name === 'google' ? C.google : C.meta, 'bar']),
            ...(report.overall.conversions ? [[report.overall.resultType || 'Results', C.ink, 'line']] : []),
        ];
        let lx = M + W;
        for (const [label, color, kind] of [...legend].reverse()) {
            const w = widthOf(label, 'R', 7.2);
            lx -= w;
            put(label, lx, y + 2, { size: 7.2, color: C.muted });
            lx -= 12;
            if (kind === 'bar') doc.save().rect(lx, y + 4, 8, 6).fill(color).restore();
            else { rule(lx, y + 7, lx + 8, color, 1.2); doc.save().circle(lx + 4, y + 7, 1.6).fill(color).restore(); }
            lx -= 14;
        }
        y += 22;
        const top = y;
        const left = M + 52;
        const right = M + W - (report.overall.conversions ? 40 : 4);
        const plotW = right - left;
        const maxSpend = niceMax(Math.max(...points.map((p) => p.spend)));
        const maxRes = Math.max(4, niceMax(Math.max(...points.map((p) => p.conversions))));
        // Grid + axes
        for (let i = 0; i <= 4; i += 1) {
            const gy = top + H - (H * i) / 4;
            rule(left, gy, right, i === 0 ? C.faint : C.line, i === 0 ? 0.7 : 0.4);
            put(compactMoney((maxSpend * i) / 4), M, gy - 4, { size: 6.4, color: C.faint, width: 46, align: 'right' });
            if (report.overall.conversions) put(n0((maxRes * i) / 4), right + 6, gy - 4, { size: 6.4, color: C.faint, width: 34 });
        }
        const slot = plotW / points.length;
        const barW = Math.max(2, Math.min(22, slot * 0.62));
        points.forEach((p, i) => {
            const x = left + i * slot + (slot - barW) / 2;
            let base = top + H;
            for (const [key, color] of [['google', C.google], ['meta', C.meta]]) {
                const h = maxSpend ? (p[key] / maxSpend) * H : 0;
                if (h > 0.2) { doc.save().rect(x, base - h, barW, h).fill(color).restore(); base -= h; }
            }
        });
        if (report.overall.conversions && maxRes) {
            const pts = points.map((p, i) => [left + i * slot + slot / 2, top + H - (p.conversions / maxRes) * H]);
            doc.save().strokeColor(C.ink).lineWidth(1.1);
            pts.forEach(([px, py], i) => (i ? doc.lineTo(px, py) : doc.moveTo(px, py)));
            doc.stroke().restore();
            if (points.length <= 45) pts.forEach(([px, py]) => doc.save().circle(px, py, 1.7).fill(C.ink).restore());
        }
        // X labels: at most ~16, evenly spaced.
        const every = Math.max(1, Math.ceil(points.length / 16));
        points.forEach((p, i) => {
            if (i % every) return;
            put(shortDate(p.date), left + i * slot + slot / 2 - 24, top + H + 5, { size: 6.4, color: C.faint, width: 48, align: 'center' });
        });
        y = top + H + 30;
    }

    function niceMax(v) {
        if (!(v > 0)) return 0;
        const raw = v / 4;
        const pow = 10 ** Math.floor(Math.log10(raw));
        const step = [1, 2, 2.5, 3, 4, 5, 10].map((m) => m * pow).find((st) => st >= raw && (v < 4 || Number.isInteger(st)));
        return (step || raw) * 4;
    }
    function compactMoney(v) {
        const a = Math.abs(v);
        const s = a >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : a >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : a >= 1e3 ? `${(v / 1e3).toFixed(a >= 1e4 ? 0 : 1)}K` : n0(v);
        return `${sym || ''}${s.replace('.0', '')}`;
    }
}

/** Header + footer on every page (same company details as the proposal PDFs). */
function stamp(doc, report, logo, put, rule) {
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i += 1) {
        doc.switchToPage(i);
        if (logo) {
            try { doc.image(logo, M, 15, { fit: [118, 30] }); } catch { /* logo is optional */ }
        }
        put(COMPANY_DETAILS.name, M + W - 380, 15, { font: 'B', size: 8.5, color: C.ink, width: 380, align: 'right' });
        put(`${COMPANY_DETAILS.address}  ·  ${COMPANY_DETAILS.phone}`, M + W - 380, 27, { size: 6.8, color: C.muted, width: 380, align: 'right' });
        put(`${COMPANY_DETAILS.email}  ·  ${String(COMPANY_DETAILS.website || '').replace(/^https?:\/\//, '')}`, M + W - 380, 36.5, { size: 6.8, color: C.muted, width: 380, align: 'right' });
        rule(M, 52, M + W, C.line, 0.7);

        rule(M, PAGE_H - 32, M + W, C.line, 0.6);
        put(FOOTER_LEFT, M, PAGE_H - 24, { size: 6.8, color: C.faint, width: 200 });
        put(`${report.clientName}  ·  ${fmtDate(report.from)} – ${fmtDate(report.to)}  ·  ${FOOTER_RIGHT}`, M + 200, PAGE_H - 24, { size: 6.8, color: C.faint, width: W - 400, align: 'center' });
        put(`Page ${i - range.start + 1} of ${range.count}`, M + W - 200, PAGE_H - 24, { size: 6.8, color: C.faint, width: 200, align: 'right' });
    }
}



