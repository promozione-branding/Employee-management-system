import { Document, Page, Text, View, StyleSheet, Svg, Polyline } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: { marginBottom: 20, borderBottom: "2 solid #eaebed", paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 700, color: "#1a202c" },
  sub: { fontSize: 12, color: "#718096", marginTop: 4 },
  
  // Grids
  grid: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 15 },
  box: { flex: 1, backgroundColor: "#f7fafc", padding: 10, borderRadius: 6, border: "1 solid #e2e8f0" },
  boxLabel: { fontSize: 8, color: "#718096", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 },
  boxValue: { fontSize: 14, fontWeight: "bold", color: "#2d3748" },

  section: { marginBottom: 15 },
  h2: { fontSize: 12, fontWeight: 700, color: "#2d3748", marginBottom: 8 },
  chartBox: { border: "1 solid #e2e8f0", borderRadius: 6, padding: 8, backgroundColor: "#fff" },
  chartLabel: { fontSize: 8, color: "#a0aec0", marginTop: 4, textAlign: "center" }
});

function MetricBox({ label, value }) {
  return (
    <View style={s.box}>
      <Text style={s.boxLabel}>{label}</Text>
      <Text style={s.boxValue}>{value ?? "0"}</Text>
    </View>
  );
}

function LineChart({ data, color }) {
  if (!data || data.length < 2) return <Text style={{ fontSize: 8, color: "#ccc", padding: 10 }}>Not enough data to draw chart</Text>;
  
  const max = Math.max(...data, 1);
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 400;
    const y = 60 - (val / max) * 60; 
    return `${x},${y}`;
  }).join(" ");

  return (
    <Svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none">
      <Polyline fill="none" stroke={color} strokeWidth="3" points={points} />
    </Svg>
  );
}

export function ReportPDF({ report }) {
  const d = report.data || {};
  const c = d.client || {};
  
  // --- Google Calculations ---
  const gscTotals = d.gsc?.map(x => x.data?.totals || {}) || [];
  const totalGscClicks = gscTotals.reduce((a, b) => a + (b.clicks || 0), 0);
  const totalGscImpr = gscTotals.reduce((a, b) => a + (b.impressions || 0), 0);
  
  const gadsTotals = d.gads?.map(x => x.data?.totals || {}) || [];
  const totalAdsClicks = gadsTotals.reduce((a, b) => a + (b.clicks || 0), 0);
  const totalAdsCost = gadsTotals.reduce((a, b) => a + (b.cost || 0), 0);
  
  // --- Meta Calculations ---
  const metaTotals = d.metaAds || [];
  const totalMetaSpend = metaTotals.reduce((a, b) => a + Number(b.spend || 0), 0);
  const totalMetaClicks = metaTotals.reduce((a, b) => a + Number(b.clicks || 0), 0);
  const totalMetaImpr = metaTotals.reduce((a, b) => a + Number(b.impressions || 0), 0);

  // --- Chart Data ---
  const gscChartData = d.gsc?.[0]?.data?.daily?.map(r => r.clicks) || [];
  const gadsChartData = d.gads?.[0]?.data?.daily?.map(r => r.clicks) || [];
  // Note: Meta Daily data requires specific API calls, we'll just show the totals for now.

  const fmt = (n) => Number(n || 0).toLocaleString();
  const money = (n) => `Rs. ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        
        <View style={s.header}>
          <Text style={s.title}>Performance Report</Text>
          <Text style={s.sub}>{c.name} | {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}</Text>
        </View>

        {/* Row 1: SEO & Google Ads */}
        <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 8, color: "#4a5568" }}>Google Channels</Text>
        <View style={s.grid}>
          <MetricBox label="SEO Clicks" value={fmt(totalGscClicks)} />
          <MetricBox label="SEO Impressions" value={fmt(totalGscImpr)} />
          <MetricBox label="Ads Clicks" value={fmt(totalAdsClicks)} />
          <MetricBox label="Ads Spend" value={money(totalAdsCost)} />
        </View>

        {/* Row 2: Meta Ads */}
        <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 8, color: "#4a5568" }}>Meta Channels</Text>
        <View style={s.grid}>
          <MetricBox label="Meta Spend" value={money(totalMetaSpend)} />
          <MetricBox label="Meta Clicks" value={fmt(totalMetaClicks)} />
          <MetricBox label="Meta Impressions" value={fmt(totalMetaImpr)} />
        </View>

        {/* Charts */}
        <View style={s.section}>
          <Text style={s.h2}>Search Console Trend</Text>
          <View style={s.chartBox}>
            <LineChart data={gscChartData} color="#3182ce" />
            <Text style={s.chartLabel}>Daily organic clicks</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.h2}>Google Ads Trend</Text>
          <View style={s.chartBox}>
            <LineChart data={gadsChartData} color="#e53e3e" />
            <Text style={s.chartLabel}>Daily paid clicks</Text>
          </View>
        </View>

        <Text style={{ position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 9, color: "#a0aec0" }}>
          Generated by Promozione Branding on {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );
}
