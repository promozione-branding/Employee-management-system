import { Document, Page, Text, View, StyleSheet, Svg, Path } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: { marginBottom: 20, borderBottom: "2 solid #eaebed", paddingBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: 22, fontWeight: 700, color: "#1a202c" },
  sub: { fontSize: 10, color: "#718096", marginTop: 4 },
  
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#2d3748", marginTop: 20, marginBottom: 10, borderBottom: "1 solid #e2e8f0", paddingBottom: 4 },
  grid: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginBottom: 10 },
  box: { flex: 1, backgroundColor: "#f7fafc", padding: 12, borderRadius: 6, border: "1 solid #e2e8f0" },
  boxLabel: { fontSize: 8, color: "#718096", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 },
  boxValue: { fontSize: 18, fontWeight: "bold", color: "#2d3748" },

  table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, marginTop: 5, marginBottom: 15 },
  tableRow: { flexDirection: "row", borderBottomColor: "#e2e8f0", borderBottomWidth: 1, alignItems: "center" },
  tableHeader: { backgroundColor: "#edf2f7", fontWeight: "bold", color: "#2d3748" },
  tableCellWide: { padding: 8, fontSize: 9, flex: 3, borderRightWidth: 1, borderRightColor: "#e2e8f0" },
  tableCellCenter: { padding: 8, fontSize: 9, flex: 1, textAlign: "center" },
  siteHeader: { backgroundColor: "#e2e8f0", padding: 8, fontSize: 11, fontWeight: "bold", color: "#1a202c", marginTop: 10, borderRadius: 4 }
});

function MetricBox({ label, value, highlight }) {
  return (
    <View style={[s.box, highlight ? { backgroundColor: "#ebf8ff", borderColor: "#bee3f8" } : {}]}>
      <Text style={s.boxLabel}>{label}</Text>
      <Text style={s.boxValue}>{value ?? "0"}</Text>
    </View>
  );
}

export function ReportPDF({ report }) {
  const d = report.data || {};
  const c = d.client || {};
  const seoData = d.seoData || {}; 
  
  const gscClicks = (d.gsc || []).reduce((a, b) => a + (b.data?.totals?.clicks || 0), 0);
  const gscImpr = (d.gsc || []).reduce((a, b) => a + (b.data?.totals?.impressions || 0), 0);
  const gadsCost = (d.gads || []).reduce((a, b) => a + (b.data?.totals?.cost || 0), 0);
  const metaSpend = (d.metaAds || []).reduce((a, b) => a + (b.data?.totals?.spend || 0), 0);

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
  const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View><Text style={s.title}>Performance Report</Text><Text style={s.sub}>{c.name}</Text></View>
          <View><Text style={{ fontSize: 10, color: "#4a5568", fontWeight: "bold" }}>Report Period</Text><Text style={{ fontSize: 10, color: "#718096" }}>{new Date(report.periodStart).toLocaleDateString("en-IN")} - {new Date(report.periodEnd).toLocaleDateString("en-IN")}</Text></View>
        </View>

        <Text style={{ ...s.sectionTitle, marginTop: 0 }}>Overview</Text>
        <View style={s.grid}>
          <MetricBox label="SEO Clicks" value={fmt(gscClicks)} />
          <MetricBox label="SEO Impressions" value={fmt(gscImpr)} />
          <MetricBox label="Ads Spend" value={money(gadsCost + metaSpend)} highlight />
        </View>

        {/* 👈 LOOP THROUGH ALL WEBSITES AND SHOW THEIR KEYWORDS */}
        {Object.keys(seoData).length > 0 && (
          <>
            <Text style={s.sectionTitle}>SEO Keyword Rankings</Text>
            {Object.entries(seoData).map(([website, keywords]) => (
              <View key={website} style={{ marginBottom: 15 }}>
                <Text style={s.siteHeader}>🌐 {website}</Text>
                <View style={s.table}>
                  <View style={[s.tableRow, s.tableHeader]}>
                    <Text style={s.tableCellWide}>Keyword</Text>
                    <Text style={s.tableCellCenter}>Page</Text>
                    <Text style={s.tableCellCenter}>Position</Text>
                  </View>
                  {keywords.map((kw, i) => (
                    <View key={i} style={[s.tableRow, i === keywords.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                      <Text style={s.tableCellWide}>{kw.keyword}</Text>
                      <Text style={s.tableCellCenter}>{kw.page !== "-" ? `Page ${kw.page}` : "-"}</Text>
                      <Text style={s.tableCellCenter}>{kw.position !== "-" ? `#${kw.position}` : "-"}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
