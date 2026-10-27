import { Document, Page, Text, View, StyleSheet, Svg, Path, Image } from "@react-pdf/renderer";

// 👈 PASTE YOUR BASE64 STRINGS HERE
const LOGO_BASE64 = "YOUR_BASE64_LOGO_HERE";
const THANKYOU_BASE64 = "YOUR_BASE64_THANKYOU_HERE";

const s = StyleSheet.create({
  coverPage: { padding: 60, backgroundColor: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%" },
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  
  thankyouPage: { padding: 0, backgroundColor: "#ffffff", height: "100%" },
  thankyouImage: { width: "100%", height: "100%", objectFit: "cover" },
  
  header: { marginBottom: 20, borderBottom: "2 solid #eaebed", paddingBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: 22, fontWeight: 700, color: "#1a202c" },
  sub: { fontSize: 10, color: "#718096", marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#2d3748", marginTop: 15, marginBottom: 10, borderBottom: "1 solid #e2e8f0", paddingBottom: 4 },
  
  grid: { flexDirection: "row", gap: 10, marginBottom: 15 },
  box: { flex: 1, backgroundColor: "#f7fafc", padding: 12, borderRadius: 6, border: "1 solid #e2e8f0" },
  boxLabel: { fontSize: 8, color: "#718096", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 },
  boxValue: { fontSize: 16, fontWeight: "bold", color: "#2d3748" },

  chartBox: { border: "1 solid #e2e8f0", borderRadius: 6, padding: 10, backgroundColor: "#fff", marginBottom: 10 },
  
  table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, marginTop: 5 },
  tableRow: { flexDirection: "row", borderBottomColor: "#e2e8f0", borderBottomWidth: 1, alignItems: "center" },
  tableHeader: { backgroundColor: "#edf2f7", fontWeight: "bold", color: "#2d3748" },
  tableCellWide: { padding: 8, fontSize: 9, flex: 3, borderRightWidth: 1, borderRightColor: "#e2e8f0" },
  tableCellCenter: { padding: 8, fontSize: 9, flex: 1, textAlign: "center" },
});

function MetricBox({ label, value, highlight }) {
  return (
    <View style={[s.box, highlight ? { backgroundColor: "#ebf8ff", borderColor: "#bee3f8" } : {}]}>
      <Text style={s.boxLabel}>{label}</Text>
      <Text style={s.boxValue}>{value ?? "0"}</Text>
    </View>
  );
}

function SmoothChart({ data, color }) {
  if (!data || data.length < 2) return <Text style={{ fontSize: 8, color: "#ccc", padding: 10 }}>Not enough data</Text>;
  const max = Math.max(...data, 1);
  const width = 400; const height = 60; const stepX = width / (data.length - 1);
  let path = `M 0,${height - (data[0] / max) * height}`;
  for (let i = 1; i < data.length; i++) {
    const x1 = (i - 1) * stepX; const y1 = height - (data[i - 1] / max) * height;
    const x2 = i * stepX; const y2 = height - (data[i] / max) * height;
    const cx = (x1 + x2) / 2;
    path += ` C ${cx},${y1} ${cx},${y2} ${x2},${y2}`;
  }
  return <Svg width="100%" height="60" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"><Path d={path} fill="none" stroke={color} strokeWidth="3" /></Svg>;
}

export function ReportPDF({ report }) {
  const d = report.data || {};
  const c = d.client || {};
  
  // --- Google Data ---
  const gscTotals = d.gsc?.[0]?.data?.totals || {};
  const gadsTotals = d.gads?.[0]?.data?.totals || {};
  const gscChart = d.gsc?.[0]?.data?.daily?.map(r => r.clicks) || [];
  const gadsChart = d.gads?.[0]?.data?.daily?.map(r => r.clicks) || [];

  // --- Meta Data ---
  const metaAdsTotals = d.metaAds?.[0]?.data?.totals || {};
  const metaPageData = d.metaPage?.[0]?.data || { views: 0, followers: 0, daily: [] };
  const metaAdsChart = d.metaAds?.[0]?.data?.daily?.map(r => r.clicks) || [];
  const metaPageChart = metaPageData.daily?.map(r => r.views) || [];
  const metaCampaigns = d.metaAds?.[0]?.data?.campaigns || [];

  // --- SEO Data ---
  // 👈 FIXED: Now it checks if kw.page is 1 or 2
  const filteredSeo = (d.seoKeywords || []).filter(kw => {
    const pageNum = Number(kw.page);
    return pageNum === 1 || pageNum === 2;
  });

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
  const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <Document>
      {/* PAGE 1: COVER */}
      <Page size="A4" style={s.coverPage}>
        {/* 👈 USING BASE64 LOGO */}
        {LOGO_BASE64 !== "YOUR_BASE64_LOGO_HERE" && (
          <Image src={LOGO_BASE64} style={{ width: 250, marginBottom: 40 }} />
        )}
        
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
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View><Text style={s.title}>Google Performance</Text><Text style={s.sub}>{c.name}</Text></View>
        </View>

        <Text style={s.sectionTitle}>Search Console (SEO)</Text>
        <View style={s.grid}>
          <MetricBox label="Total Clicks" value={fmt(gscTotals.clicks)} />
          <MetricBox label="Total Impressions" value={fmt(gscTotals.impressions)} />
          <MetricBox label="Avg CTR" value={gscTotals.ctr ? `${(gscTotals.ctr * 100).toFixed(2)}%` : "0%"} />
          <MetricBox label="Avg Position" value={gscTotals.position ? Number(gscTotals.position).toFixed(1) : "0"} />
        </View>

        <Text style={s.sectionTitle}>Google Ads</Text>
        <View style={s.grid}>
          <MetricBox label="Clicks" value={fmt(gadsTotals.clicks)} />
          <MetricBox label="Impressions" value={fmt(gadsTotals.impressions)} />
          <MetricBox label="Cost" value={money(gadsTotals.cost)} highlight />
          <MetricBox label="Conversions" value={fmt(gadsTotals.conversions)} />
        </View>

        <Text style={s.sectionTitle}>Traffic Trends</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
           <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#3182ce", marginBottom: 5 }}>Search Console Clicks</Text>
              <View style={s.chartBox}><SmoothChart data={gscChart} color="#3182ce" /></View>
           </View>
           <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#e53e3e", marginBottom: 5 }}>Google Ads Clicks</Text>
              <View style={s.chartBox}><SmoothChart data={gadsChart} color="#e53e3e" /></View>
           </View>
        </View>
      </Page>

      {/* PAGE 3: META REPORT */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View><Text style={s.title}>Meta Performance</Text><Text style={s.sub}>{c.name}</Text></View>
        </View>

        <Text style={s.sectionTitle}>Facebook & Instagram Insights</Text>
        <View style={s.grid}>
          <MetricBox label="Total Page Views" value={fmt(metaPageData.views)} highlight />
          <MetricBox label="New Followers" value={fmt(metaPageData.followers)} />
        </View>

        <Text style={s.sectionTitle}>Meta Ads</Text>
        <View style={s.grid}>
          <MetricBox label="Spend" value={money(metaAdsTotals.spend)} />
          <MetricBox label="Impressions" value={fmt(metaAdsTotals.impressions)} />
          <MetricBox label="Clicks" value={fmt(metaAdsTotals.clicks)} />
          <MetricBox label="Reach" value={fmt(metaAdsTotals.reach)} />
        </View>

        <Text style={s.sectionTitle}>Meta Trends</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
           <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#805ad5", marginBottom: 5 }}>Meta Ads Clicks</Text>
              <View style={s.chartBox}><SmoothChart data={metaAdsChart} color="#805ad5" /></View>
           </View>
           <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#38a169", marginBottom: 5 }}>Page Views</Text>
              <View style={s.chartBox}><SmoothChart data={metaPageChart} color="#38a169" /></View>
           </View>
        </View>

        {metaCampaigns.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Active Campaigns</Text>
            <View style={s.table}>
              <View style={[s.tableRow, s.tableHeader]}>
                <Text style={s.tableCellWide}>Campaign Name</Text>
                <Text style={s.tableCellCenter}>Spend</Text>
                <Text style={s.tableCellCenter}>Clicks</Text>
              </View>
              {metaCampaigns.map((camp, i) => (
                <View key={i} style={[s.tableRow, i === metaCampaigns.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                  <Text style={s.tableCellWide}>{camp.name}</Text>
                  <Text style={s.tableCellCenter}>{money(camp.spend)}</Text>
                  <Text style={s.tableCellCenter}>{fmt(camp.clicks)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </Page>

      {/* PAGE 4: SEO REPORT */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View><Text style={s.title}>SEO Keyword Rankings</Text><Text style={s.sub}>Top Rankings (Page 1 & 2)</Text></View>
        </View>

        {filteredSeo.length === 0 ? (
          <Text style={{ fontSize: 12, color: "#718096", marginTop: 20 }}>No keywords found ranking on Page 1 or 2.</Text>
        ) : (
          <View style={s.table}>
            <View style={[s.tableRow, s.tableHeader]}>
              <Text style={s.tableCellWide}>Keyword</Text>
              <Text style={s.tableCellCenter}>Page</Text>
              <Text style={s.tableCellCenter}>Position</Text>
            </View>
            {filteredSeo.map((kw, i) => (
              <View key={i} style={[s.tableRow, i === filteredSeo.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                <Text style={s.tableCellWide}>{kw.keyword}</Text>
                <Text style={s.tableCellCenter}>Page {kw.page}</Text>
                <Text style={s.tableCellCenter}>#{kw.position}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>

      {/* PAGE 5: FULL IMAGE THANK YOU PAGE */}
      <Page size="A4" style={s.thankyouPage}>
        {/* 👈 USING BASE64 THANK YOU IMAGE */}
        {THANKYOU_BASE64 !== "YOUR_BASE64_THANKYOU_HERE" && (
          <Image src={THANKYOU_BASE64} style={s.thankyouImage} />
        )}
      </Page>
    </Document>
  );
}
