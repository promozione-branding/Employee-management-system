import { Document, Page, Text, View, StyleSheet, Svg, Path, Image } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";

let logoBuffer = null;
let thankyouBuffer = null;
try {
  if (fs.existsSync(path.join(process.cwd(), "public/blog/inquiry-bazaar-logo.png"))) logoBuffer = fs.readFileSync(path.join(process.cwd(), "public/blog/inquiry-bazaar-logo.png"));
  if (fs.existsSync(path.join(process.cwd(), "public/blog/thank-you.png"))) thankyouBuffer = fs.readFileSync(path.join(process.cwd(), "public/blog/thank-you.png"));
} catch (e) {}

const s = StyleSheet.create({
  coverPage: { padding: 60, backgroundColor: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%" },
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  thankyouPage: { padding: 0, backgroundColor: "#ffffff", height: "100%" },
  thankyouImage: { width: "100%", height: "100%", objectFit: "cover" },
  
  header: { marginBottom: 25, borderBottom: "2 solid #eaebed", paddingBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: 22, fontWeight: 700, color: "#1a202c" },
  sub: { fontSize: 10, color: "#718096", marginTop: 4 },
  
  // 👈 Fixed Spacing for Site Headers
  siteHeader: { fontSize: 14, fontWeight: "bold", color: "#1a202c", marginTop: 25, marginBottom: 12, backgroundColor: "#f7fafc", padding: 10, borderRadius: 4, borderLeft: "4 solid #2b6cb0" },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#2d3748", marginTop: 15, marginBottom: 10, borderBottom: "1 solid #e2e8f0", paddingBottom: 4 },
  
  // 👈 Better Metric Boxes
  grid: { flexDirection: "row", gap: 12, marginBottom: 15 },
  box: { flex: 1, backgroundColor: "#ffffff", padding: 15, borderRadius: 8, border: "1 solid #e2e8f0" },
  boxLabel: { fontSize: 9, color: "#718096", textTransform: "uppercase", marginBottom: 6, fontWeight: 700, letterSpacing: 0.5 },
  boxValue: { fontSize: 20, fontWeight: "bold", color: "#2d3748", marginBottom: 6 },
  
  // 👈 Comparison Text
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

// 👈 CALCULATE PERCENTAGE CHANGE (READABLE TEXT)
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
  const displayVal = format === "money" ? `Rs ${Number(current || 0).toLocaleString("en-IN")}` : Number(current || 0).toLocaleString("en-IN");
  return (
    <View style={s.box}>
      <Text style={s.boxLabel}>{label}</Text>
      <Text style={s.boxValue}>{displayVal}</Text>
      <Text style={[s.comparison, s[change.type]]}>{change.text}</Text>
    </View>
  );
}

// 👈 BEAUTIFUL GOOGLE ANALYTICS STYLE GRAPH
function SmoothChart({ data, color }) {
  if (!data || data.length < 2) return <Text style={{ fontSize: 10, color: "#a0aec0", padding: 20, textAlign: "center" }}>Not enough data to render chart</Text>;
  
  const max = Math.max(...data, 1);
  const width = 500;
  const height = 80; 
  const stepX = width / (data.length - 1);
  
  let path = `M 0,${height - (data[0] / max) * height}`;
  for (let i = 1; i < data.length; i++) {
    const x1 = (i - 1) * stepX; 
    const y1 = height - (data[i - 1] / max) * height;
    const x2 = i * stepX; 
    const y2 = height - (data[i] / max) * height;
    const cx = (x1 + x2) / 2;
    path += ` C ${cx},${y1} ${cx},${y2} ${x2},${y2}`;
  }

  return (
    <Svg width="100%" height="80" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <Path d={`M 0,${height/2} L ${width},${height/2}`} stroke="#edf2f7" strokeWidth="1" />
      <Path d={`M 0,${height} L ${width},${height}`} stroke="#edf2f7" strokeWidth="1" />
      <Path d={path} fill="none" stroke={color} strokeWidth="4" />
    </Svg>
  );
}

export function ReportPDF({ report }) {
  const d = report.data || {};
  const c = d.client || {};
  
  // 👈 Clean URL and Remove "act_" from Meta IDs
  const cleanUrl = (url) => {
    if (!url) return "Unknown";
    return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "").replace(/^act_/i, ""); 
  };
  
  const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

  // Group SEO by Website
  const seoByWebsite = {};
  (d.seoKeywords || []).forEach(kw => {
    const pageNum = parseInt(String(kw.page || "").replace(/[^0-9]/g, ""), 10);
    if (pageNum === 1 || pageNum === 2) {
      const site = kw.website || "General Keywords";
      if (!seoByWebsite[site]) seoByWebsite[site] = [];
      seoByWebsite[site].push(kw);
    }
  });

  return (
    <Document>
      {/* PAGE 1: COVER */}
      <Page size="A4" style={s.coverPage}>
        {logoBuffer && <Image src={{ data: logoBuffer, format: "png" }} style={{ width: 250, marginBottom: 40 }} />}
        <Text style={{ fontSize: 32, fontWeight: "bold", color: "#1a202c", marginBottom: 10, textAlign: "center" }}>PERFORMANCE REPORT</Text>
        <Text style={{ fontSize: 20, color: "#ed8936", fontWeight: "bold", marginBottom: 40, textAlign: "center" }}>{c.name}</Text>
        <View style={{ backgroundColor: "#f7fafc", padding: 20, borderRadius: 8, border: "1 solid #e2e8f0", width: "80%", alignItems: "center" }}>
          <Text style={{ fontSize: 12, color: "#718096", marginBottom: 4 }}>Reporting Period</Text>
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "#2d3748" }}>
            {new Date(report.periodStart).toLocaleDateString("en-IN")} - {new Date(report.periodEnd).toLocaleDateString("en-IN")}
          </Text>
        </View>
      </Page>

      {/* PAGE 2: GOOGLE REPORT */}
      <Page size="A4" style={s.page} wrap>
        <View style={s.header}>
          <View><Text style={s.title}>Google Performance</Text><Text style={s.sub}>{c.name}</Text></View>
        </View>

        {(d.gsc || []).map((site, index) => {
          if (site.error) return null;
          const t = site.data.totals || {};
          const p = site.data.prevTotals || {};
          const chartData = site.data.daily?.map(r => r.clicks) || [];

          const adsData = d.gads?.[index]?.data;
          const adsT = adsData?.totals || {};
          const adsP = adsData?.prevTotals || {};
          const adsChart = adsData?.daily?.map(r => r.clicks) || [];

          return (
            <View key={site.id} style={{ marginBottom: 20 }} wrap={false}>
              <Text style={s.siteHeader}>🌐 {cleanUrl(site.id)}</Text>
              
              <Text style={s.sectionTitle}>Search Console (SEO)</Text>
              <View style={s.grid}>
                <MetricBox label="Clicks" current={t.clicks} previous={p.clicks} />
                <MetricBox label="Impressions" current={t.impressions} previous={p.impressions} />
                <MetricBox label="Avg Position" current={t.position ? Number(t.position).toFixed(1) : "0"} previous={p.position ? Number(p.position).toFixed(1) : "0"} />
              </View>
              <View style={s.chartBox}><SmoothChart data={chartData} color="#3182ce" /></View>

              {adsData && (
                <>
                  <Text style={s.sectionTitle}>Google Ads</Text>
                  <View style={s.grid}>
                    <MetricBox label="Clicks" current={adsT.clicks} previous={adsP.clicks} />
                    <MetricBox label="Cost" current={adsT.cost} previous={adsP.cost} format="money" />
                    <MetricBox label="Conversions" current={adsT.conversions} previous={adsP.conversions} />
                  </View>
                  <View style={s.chartBox}><SmoothChart data={adsChart} color="#e53e3e" /></View>
                </>
              )}
            </View>
          );
        })}
      </Page>

      {/* PAGE 3: META REPORT */}
      <Page size="A4" style={s.page} wrap>
        <View style={s.header}>
          <View><Text style={s.title}>Meta Performance</Text><Text style={s.sub}>{c.name}</Text></View>
        </View>

        {(d.metaAds || []).map((acc, index) => {
          if (acc.error) return null;
          const t = acc.data.totals || {};
          const p = acc.data.prevTotals || {};
          const chartData = acc.data.daily?.map(r => r.clicks) || [];

          const pageData = d.metaPage?.[index]?.data;
          const pageT = pageData || {};
          const pageP = pageData?.prevTotals || {};
          const pageChart = pageData?.daily?.map(r => r.views) || [];

          return (
            <View key={acc.id} style={{ marginBottom: 20 }} wrap={false}>
              <Text style={s.siteHeader}>📱 {cleanUrl(acc.id)}</Text>
              
              <Text style={s.sectionTitle}>Meta Ads</Text>
              <View style={s.grid}>
                <MetricBox label="Spend" current={t.spend} previous={p.spend} format="money" />
                <MetricBox label="Clicks" current={t.clicks} previous={p.clicks} />
                <MetricBox label="Reach" current={t.reach} previous={p.reach} />
              </View>
              <View style={s.chartBox}><SmoothChart data={chartData} color="#805ad5" /></View>

              {pageData && (
                <>
                  <Text style={s.sectionTitle}>Facebook Page Insights</Text>
                  <View style={s.grid}>
                    <MetricBox label="Views" current={pageT.views} previous={pageP.views} />
                    <MetricBox label="Interactions" current={pageT.interactions} previous={pageP.interactions} />
                    <MetricBox label="New Followers" current={pageT.followers} previous={pageP.followers} />
                  </View>
                  <View style={s.chartBox}><SmoothChart data={pageChart} color="#38a169" /></View>
                </>
              )}
            </View>
          );
        })}
      </Page>

      {/* PAGE 4: SEO REPORT */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View><Text style={s.title}>SEO Keyword Rankings</Text><Text style={s.sub}>Top Rankings (Page 1 & 2)</Text></View>
        </View>

        {Object.keys(seoByWebsite).length === 0 ? (
          <Text style={{ fontSize: 12, color: "#718096", marginTop: 20 }}>No keywords found ranking on Page 1 or 2.</Text>
        ) : (
          Object.entries(seoByWebsite).map(([website, keywords]) => (
            <View key={website} style={{ marginBottom: 20 }} wrap={false}>
              <Text style={s.siteHeader}>🌐 {cleanUrl(website)}</Text>
              <View style={s.table}>
                <View style={[s.tableRow, s.tableHeader]}>
                  <Text style={s.tableCellWide}>Keyword</Text>
                  <Text style={s.tableCellCenter}>Page</Text>
                  <Text style={s.tableCellCenter}>Position</Text>
                </View>
                {keywords.map((kw, i) => (
                  <View key={i} style={[s.tableRow, i === keywords.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                    <Text style={s.tableCellWide}>{kw.keyword}</Text>
                    <Text style={s.tableCellCenter}>Page {kw.page}</Text>
                    <Text style={s.tableCellCenter}>#{kw.position}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </Page>

      {/* PAGE 5: THANK YOU */}
      <Page size="A4" style={s.thankyouPage}>
        {thankyouBuffer && <Image src={{ data: thankyouBuffer, format: "png" }} style={s.thankyouImage} />}
      </Page>
    </Document>
  );
}
