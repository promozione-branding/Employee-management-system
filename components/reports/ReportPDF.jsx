import { Document, Page, Text, View, StyleSheet, Svg, Path } from "@react-pdf/renderer";
import { CoverPage } from "./CoverPage";
import { ThankYouPage } from "./ThankYouPage";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: { marginBottom: 25, borderBottom: "2 solid #eaebed", paddingBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: 22, fontWeight: 700, color: "#1a202c" },
  sub: { fontSize: 10, color: "#718096", marginTop: 4 },
  siteHeader: { fontSize: 14, fontWeight: "bold", color: "#1a202c", marginTop: 25, marginBottom: 12, backgroundColor: "#f7fafc", padding: 10, borderRadius: 4, borderLeft: "4 solid #2b6cb0" },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#2d3748", marginTop: 15, marginBottom: 10, borderBottom: "1 solid #e2e8f0", paddingBottom: 4 },
  
  grid: { flexDirection: "row", gap: 12, marginBottom: 15 },
  box: { flex: 1, backgroundColor: "#ffffff", padding: 12, borderRadius: 8, border: "1 solid #e2e8f0" },
  boxLabel: { fontSize: 9, color: "#718096", textTransform: "uppercase", marginBottom: 6, fontWeight: 700, letterSpacing: 0.5 },
  boxValue: { fontSize: 18, fontWeight: "bold", color: "#2d3748", marginBottom: 6 },
  
  comparison: { fontSize: 9, fontWeight: "bold", lineHeight: 1.3 },
  up: { color: "#38a169" },
  down: { color: "#e53e3e" },
  neutral: { color: "#718096" },

  chartBox: { border: "1 solid #e2e8f0", borderRadius: 8, padding: 15, backgroundColor: "#fff", marginBottom: 20 },
  
  table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6, marginTop: 5 },
  tableRow: { flexDirection: "row", borderBottomColor: "#e2e8f0", borderBottomWidth: 1, alignItems: "center" },
  tableHeader: { backgroundColor: "#f7fafc", fontWeight: "bold", color: "#2d3748" },
  tableCellWide: { padding: 10, fontSize: 10, flex: 3, borderRightWidth: 1, borderRightColor: "#e2e8f0", color: "#1a202c" },
  tableCellCenter: { padding: 10, fontSize: 10, flex: 1, textAlign: "center", color: "#4a5568" },
});

function calculateChange(current, previous) {
  const c = typeof current === "string" ? parseFloat(current.replace(/[^0-9.-]+/g, "")) : Number(current);
  const p = typeof previous === "string" ? parseFloat(previous.replace(/[^0-9.-]+/g, "")) : Number(previous);
  
  if (isNaN(c) || isNaN(p)) return { text: "No data to compare", type: "neutral" };
  if (p === 0) return { text: c > 0 ? "New Activity" : "No change", type: c > 0 ? "up" : "neutral" };
  
  const change = ((c - p) / p) * 100;
  
  if (change > 0) return { text: `Increased by ${change.toFixed(1)}%`, type: "up" };
  if (change < 0) return { text: `Decreased by ${Math.abs(change).toFixed(1)}%`, type: "down" };
  return { text: "No change", type: "neutral" };
}

function MetricBox({ label, current, previous, format }) {
  const change = calculateChange(current, previous);
  const displayVal = format === "money" ? `Rs ${Number(current || 0).toLocaleString("en-IN")}` : format === "percent" ? `${(Number(current || 0) * 100).toFixed(2)}%` : Number(current || 0).toLocaleString("en-IN");
  return (
    <View style={s.box}>
      <Text style={s.boxLabel}>{label}</Text>
      <Text style={s.boxValue}>{displayVal}</Text>
      <Text style={[s.comparison, s[change.type]]}>{change.text}</Text>
    </View>
  );
}

function SmoothChart({ data, color }) {
  if (!data || data.length < 2) return <Text style={{ fontSize: 10, color: "#a0aec0", padding: 20, textAlign: "center" }}>Not enough data to render chart</Text>;
  const max = Math.max(...data, 1);
  const width = 500; const height = 80; const stepX = width / (data.length - 1);
  let path = `M 0,${height - (data[0] / max) * height}`;
  for (let i = 1; i < data.length; i++) {
    const x1 = (i - 1) * stepX; const y1 = height - (data[i - 1] / max) * height;
    const x2 = i * stepX; const y2 = height - (data[i] / max) * height;
    const cx = (x1 + x2) / 2;
    path += ` C ${cx},${y1} ${cx},${y2} ${x2},${y2}`;
  }
  return <Svg width="100%" height="80" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"><Path d={`M 0,${height/2} L ${width},${height/2}`} stroke="#edf2f7" strokeWidth="1" /><Path d={`M 0,${height} L ${width},${height}`} stroke="#edf2f7" strokeWidth="1" /><Path d={path} fill="none" stroke={color} strokeWidth="4" /></Svg>;
}

export function ReportPDF({ report }) {
  const d = report.data || {};
  const c = d.client || {};
  
  // Group SEO by Website
  const seoByWebsite = {};
  (d.seoKeywords || []).forEach(kw => {
    const siteName = kw.project?.projectName || kw.website || "General Keywords";
    const cleanSiteName = siteName.replace(/^Website\s*[-:]\s*/i, "").trim();
    
    if (!seoByWebsite[cleanSiteName]) seoByWebsite[cleanSiteName] = [];
    seoByWebsite[cleanSiteName].push(kw);
  });

  return (
    <Document>
      {/* 👈 CUSTOM COVER PAGE */}
      <CoverPage report={report} />

      {/* GOOGLE SEO PAGE */}
      <Page size="A4" style={s.page} wrap>
        <View style={s.header}><Text style={s.title}>Google Performance</Text><Text style={s.sub}>{c.name}</Text></View>
        {(d.gsc || []).map((site, index) => {
          if (site.error) return null;
          const t = site.data.totals || {}; const p = site.data.prevTotals || {};
          return (
            <View key={site.id} style={{ marginBottom: 20 }}>
              <Text style={s.siteHeader}>🌐 {site.id.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "")}</Text>
              <Text style={s.sectionTitle}>Search Console (SEO)</Text>
              <View style={s.grid}>
                <MetricBox label="Clicks" current={t.clicks} previous={p.clicks} />
                <MetricBox label="Impressions" current={t.impressions} previous={p.impressions} />
                <MetricBox label="Avg CTR" current={t.ctr} previous={p.ctr} format="percent" />
                <MetricBox label="Avg Position" current={t.position ? Number(t.position).toFixed(1) : "0"} previous={p.position ? Number(p.position).toFixed(1) : "0"} />
              </View>
              <View style={s.chartBox}><SmoothChart data={site.data.daily?.map(r => r.clicks) || []} color="#3182ce" /></View>
            </View>
          );
        })}
      </Page>

      {/* GOOGLE ADS PAGE */}
      {d.gads && d.gads.length > 0 && !d.gads[0].error && (
        <Page size="A4" style={s.page}>
          <View style={s.header}><Text style={s.title}>Google Ads</Text><Text style={s.sub}>{c.name}</Text></View>
          <View style={s.siteHeader}>🎯 Google Ads</View>
          <View style={s.grid}>
            <MetricBox label="Clicks" current={d.gads[0].data.totals.clicks} previous={d.gads[0].data.prevTotals.clicks} />
            <MetricBox label="Impressions" current={d.gads[0].data.totals.impressions} previous={d.gads[0].data.prevTotals.impressions} />
            <MetricBox label="Cost" current={d.gads[0].data.totals.cost} previous={d.gads[0].data.prevTotals.cost} format="money" />
            <MetricBox label="Conversions" current={d.gads[0].data.totals.conversions} previous={d.gads[0].data.prevTotals.conversions} />
          </View>
          <View style={s.chartBox}><SmoothChart data={d.gads[0].data.daily?.map(r => r.clicks) || []} color="#e53e3e" /></View>
        </Page>
      )}

      {/* META PAGE */}
      <Page size="A4" style={s.page} wrap>
        <View style={s.header}><Text style={s.title}>Meta Performance</Text><Text style={s.sub}>{c.name}</Text></View>
        {(!d.metaAds || d.metaAds.length === 0) && (
          <Text style={{ fontSize: 12, color: "#e53e3e", marginTop: 20 }}>No Meta Ad Accounts were found.</Text>
        )}
        {(d.metaAds || []).map((acc, index) => {
          if (acc.error) return null;
          const t = acc.data?.totals || {}; const p = acc.data?.prevTotals || {};
          return (
            <View key={acc.id} style={{ marginBottom: 25 }}>
              <Text style={s.siteHeader}>📱 {acc.id.replace(/^act_/i, "")}</Text>
              <Text style={s.sectionTitle}>Meta Ads</Text>
              <View style={s.grid}>
                <MetricBox label="Spend" current={t.spend} previous={p.spend} format="money" />
                <MetricBox label="Clicks" current={t.clicks} previous={p.clicks} />
                <MetricBox label="Reach" current={t.reach} previous={p.reach} />
                <MetricBox label="Impressions" current={t.impressions} previous={p.impressions} />
              </View>
              <View style={s.chartBox}><SmoothChart data={acc.data?.daily?.map(r => r.clicks) || []} color="#805ad5" /></View>
            </View>
          );
        })}
      </Page>

      {/* SEO PAGE */}
      <Page size="A4" style={s.page}>
        <View style={s.header}><Text style={s.title}>SEO Keyword Rankings</Text><Text style={s.sub}>Top Rankings (Page 1 & 2)</Text></View>
        {Object.keys(seoByWebsite).length === 0 ? (
          <Text style={{ fontSize: 12, color: "#718096", marginTop: 20 }}>No SEO sheet data found.</Text>
        ) : (
          Object.entries(seoByWebsite).map(([website, keywords]) => {
            const page12Keywords = keywords.map(kw => {
              const validRankings = (kw.rankings || []).filter(r => r.page === 1 || r.page === 2);
              if (validRankings.length === 0) return null;
              const latest = validRankings.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
              return { keyword: kw.keyword, page: latest.page, position: latest.position };
            }).filter(Boolean);

            if (page12Keywords.length === 0) return null;

            return (
              <View key={website} style={{ marginBottom: 20 }}>
                <Text style={s.siteHeader}>🌐 {website}</Text>
                <View style={s.table}>
                  <View style={[s.tableRow, s.tableHeader]}>
                    <Text style={s.tableCellWide}>Keyword</Text><Text style={s.tableCellCenter}>Page</Text><Text style={s.tableCellCenter}>Position</Text>
                  </View>
                  {page12Keywords.map((kw, i) => (
                    <View key={i} style={[s.tableRow, i === page12Keywords.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                      <Text style={s.tableCellWide}>{kw.keyword}</Text><Text style={s.tableCellCenter}>Page {kw.page}</Text><Text style={s.tableCellCenter}>#{kw.position}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </Page>

      {/* 👈 CUSTOM THANK YOU PAGE */}
      <ThankYouPage />
    </Document>
  );
}
