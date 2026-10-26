import { Document, Page, Text, View, StyleSheet, Svg, Polyline } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: { marginBottom: 20, borderBottom: "2 solid #eaebed", paddingBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: 22, fontWeight: 700, color: "#1a202c" },
  sub: { fontSize: 10, color: "#718096", marginTop: 4 },
  
  // Metrics Layout
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#4a5568", marginTop: 15, marginBottom: 8 },
  grid: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginBottom: 10 },
  box: { flex: 1, backgroundColor: "#f7fafc", padding: 12, borderRadius: 6, border: "1 solid #e2e8f0" },
  boxLabel: { fontSize: 8, color: "#718096", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 },
  boxValue: { fontSize: 16, fontWeight: "bold", color: "#2d3748" },

  // Charts
  chartBox: { border: "1 solid #e2e8f0", borderRadius: 6, padding: 10, backgroundColor: "#fff", marginBottom: 15 },
  chartLabel: { fontSize: 8, color: "#a0aec0", marginTop: 5, textAlign: "center" },

  // Beautiful Table
  table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, marginTop: 5 },
  tableRow: { flexDirection: "row", borderBottomColor: "#e2e8f0", borderBottomWidth: 1, alignItems: "center" },
  tableHeader: { backgroundColor: "#edf2f7", fontWeight: "bold", color: "#2d3748" },
  tableCellWide: { padding: 8, fontSize: 9, flex: 3, borderRightWidth: 1, borderRightColor: "#e2e8f0" },
  tableCell: { padding: 8, fontSize: 9, flex: 1, textAlign: "right" },
  tableCellCenter: { padding: 8, fontSize: 9, flex: 1, textAlign: "center" },
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
  if (!data || data.length < 2) return <Text style={{ fontSize: 8, color: "#ccc", padding: 10 }}>Not enough data to render chart</Text>;
  const max = Math.max(...data, 1);
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 400;
    const y = 60 - (val / max) * 60; 
    return `${x},${y}`;
  }).join(" ");
  return <Svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none"><Polyline fill="none" stroke={color} strokeWidth="3" points={points} /></Svg>;
}

export function ReportPDF({ report }) {
  const d = report.data || {};
  const c = d.client || {};
  
  // --- Extracting Totals ---
  const totalGscClicks = (d.gsc || []).reduce((a, b) => a + (b.data?.totals?.clicks || 0), 0);
  const totalGscImpr = (d.gsc || []).reduce((a, b) => a + (b.data?.totals?.impressions || 0), 0);
  const totalAdsClicks = (d.gads || []).reduce((a, b) => a + (b.data?.totals?.clicks || 0), 0);
  const totalAdsCost = (d.gads || []).reduce((a, b) => a + (b.data?.totals?.cost || 0), 0);
  
  const totalMetaSpend = (d.metaAds || []).reduce((a, b) => a + (b.data?.totals?.spend || 0), 0);
  const totalMetaClicks = (d.metaAds || []).reduce((a, b) => a + (b.data?.totals?.clicks || 0), 0);
  const totalMetaImpr = (d.metaAds || []).reduce((a, b) => a + (b.data?.totals?.impressions || 0), 0);

  // --- Extracting Chart Data ---
  const gadsChart = d.gads?.[0]?.data?.daily?.map(r => r.clicks) || [];
  const metaChart = d.metaAds?.[0]?.data?.daily?.map(r => r.clicks) || [];
  const metaCampaigns = d.metaAds?.[0]?.data?.campaigns || [];

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
  const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        
        {/* HEADER */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>Performance Report</Text>
            <Text style={s.sub}>{c.name}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 10, color: "#4a5568", fontWeight: "bold" }}>Report Period</Text>
            <Text style={{ fontSize: 10, color: "#718096" }}>{new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* METRICS */}
        <Text style={s.sectionTitle}>Google Channels</Text>
        <View style={s.grid}>
          <MetricBox label="SEO Clicks" value={fmt(totalGscClicks)} />
          <MetricBox label="SEO Impressions" value={fmt(totalGscImpr)} />
          <MetricBox label="Ads Clicks" value={fmt(totalAdsClicks)} />
          <MetricBox label="Ads Spend" value={money(totalAdsCost)} />
        </View>

        <Text style={s.sectionTitle}>Meta Channels</Text>
        <View style={s.grid}>
          <MetricBox label="Meta Spend" value={money(totalMetaSpend)} />
          <MetricBox label="Meta Clicks" value={fmt(totalMetaClicks)} />
          <MetricBox label="Meta Impressions" value={fmt(totalMetaImpr)} />
        </View>

        {/* CHARTS */}
        <Text style={s.sectionTitle}>Trends</Text>
        <View style={s.chartBox}>
          <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4a5568", marginBottom: 5 }}>Google Ads Clicks</Text>
          <LineChart data={gadsChart} color="#e53e3e" />
        </View>
        <View style={s.chartBox}>
          <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4a5568", marginBottom: 5 }}>Meta Ads Clicks</Text>
          <LineChart data={metaChart} color="#805ad5" />
        </View>

        {/* CAMPAIGN TABLE */}
        {metaCampaigns.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Meta Campaign Breakdown</Text>
            <View style={s.table}>
              <View style={[s.tableRow, s.tableHeader]}>
                <Text style={s.tableCellWide}>Campaign Name</Text>
                <Text style={s.tableCellCenter}>Spend</Text>
                <Text style={s.tableCellCenter}>Clicks</Text>
                <Text style={s.tableCellCenter}>Results</Text>
              </View>
              {metaCampaigns.map((camp, i) => (
                <View key={i} style={[s.tableRow, i === metaCampaigns.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                  <Text style={s.tableCellWide}>{camp.name || "Unnamed Campaign"}</Text>
                  <Text style={s.tableCell}>{money(camp.spend)}</Text>
                  <Text style={s.tableCell}>{fmt(camp.clicks)}</Text>
                  <Text style={s.tableCell}>{fmt(camp.results)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* FOOTER */}
        <Text style={{ position: "absolute", bottom: 20, left: 30, right: 30, textAlign: "center", fontSize: 8, color: "#a0aec0", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 10 }}>
          Generated by Promozione Branding on {new Date().toLocaleString("en-IN")}
        </Text>

      </Page>
    </Document>
  );
}
