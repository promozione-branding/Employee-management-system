import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: { marginBottom: 20, borderBottom: "2 solid #eaebed", paddingBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: 22, fontWeight: 700, color: "#1a202c" },
  sub: { fontSize: 10, color: "#718096", marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#2d3748", marginTop: 20, marginBottom: 10, borderBottom: "1 solid #e2e8f0", paddingBottom: 4 },
  
  card: { border: "1 solid #e2e8f0", borderRadius: 6, padding: 12, marginBottom: 20 },
  siteHeader: { fontSize: 14, fontWeight: "bold", color: "#2b6cb0", marginBottom: 10 },
  
  grid: { flexDirection: "row", gap: 10, marginBottom: 15 },
  box: { flex: 1, backgroundColor: "#f7fafc", padding: 8, borderRadius: 4, border: "1 solid #e2e8f0" },
  boxLabel: { fontSize: 8, color: "#718096", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 },
  boxValue: { fontSize: 14, fontWeight: "bold", color: "#2d3748" },

  table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4 },
  tableRow: { flexDirection: "row", borderBottomColor: "#e2e8f0", borderBottomWidth: 1, alignItems: "center" },
  tableHeader: { backgroundColor: "#edf2f7", fontWeight: "bold", color: "#2d3748" },
  tableCellWide: { padding: 6, fontSize: 9, flex: 3, borderRightWidth: 1, borderRightColor: "#e2e8f0" },
  tableCellCenter: { padding: 6, fontSize: 9, flex: 1, textAlign: "center" },
});

function MetricBox({ label, value }) {
  return (
    <View style={s.box}>
      <Text style={s.boxLabel}>{label}</Text>
      <Text style={s.boxValue}>{value ?? "0"}</Text>
    </View>
  );
}

export function ReportPDF({ report }) {
  const d = report.data || {};
  const c = d.client || {};
  const seoData = d.seoData || {}; 
  
  // Clean up the SEO Data keys so they match raw URLs
  // e.g. "https://www.barbendingmachinesupplier.com" -> "barbendingmachinesupplier.com"
  const cleanSeoData = {};
  Object.keys(seoData).forEach(key => {
     let cleanKey = key.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "").toLowerCase();
     cleanSeoData[cleanKey] = seoData[key];
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View><Text style={s.title}>SEO Performance Report</Text><Text style={s.sub}>{c.name}</Text></View>
          <View><Text style={{ fontSize: 10, color: "#4a5568", fontWeight: "bold" }}>Report Period</Text><Text style={{ fontSize: 10, color: "#718096" }}>{new Date(report.periodStart).toLocaleDateString("en-IN")} - {new Date(report.periodEnd).toLocaleDateString("en-IN")}</Text></View>
        </View>

        {/* 👈 LOOP THROUGH EACH SEARCH CONSOLE SITE */}
        {(d.gsc || []).map((siteObj, index) => {
          const gscSiteUrl = siteObj.id; // The URL from Search Console
          const cleanGscUrl = gscSiteUrl.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "").toLowerCase();
          
          // Find matching keywords in our SEO DB
          let siteKeywords = cleanSeoData[cleanGscUrl] || [];
          
          // If no exact match, maybe the SEO sheet used a slightly different URL (fallback)
          if (siteKeywords.length === 0) {
             const fallbackKey = Object.keys(cleanSeoData).find(k => k.includes(cleanGscUrl) || cleanGscUrl.includes(k));
             if (fallbackKey) siteKeywords = cleanSeoData[fallbackKey];
          }

          const clicks = siteObj.data?.totals?.clicks || 0;
          const impressions = siteObj.data?.totals?.impressions || 0;

          return (
            <View key={index} style={s.card} wrap={false}>
              <Text style={s.siteHeader}>🌐 {gscSiteUrl}</Text>
              
              <View style={s.grid}>
                <MetricBox label="Search Console Clicks" value={clicks} />
                <MetricBox label="Search Impressions" value={impressions} />
                <MetricBox label="Tracked Keywords" value={siteKeywords.length} />
              </View>

              {/* 👈 SHOW THE MANUAL SEO KEYWORDS FOR THIS SITE */}
              {siteKeywords.length > 0 && (
                <View style={s.table}>
                  <View style={[s.tableRow, s.tableHeader]}>
                    <Text style={s.tableCellWide}>Tracked Keyword</Text>
                    <Text style={s.tableCellCenter}>Page</Text>
                    <Text style={s.tableCellCenter}>Position</Text>
                  </View>
                  {siteKeywords.map((kw, i) => (
                    <View key={i} style={[s.tableRow, i === siteKeywords.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                      <Text style={s.tableCellWide}>{kw.keyword}</Text>
                      <Text style={s.tableCellCenter}>{kw.page !== "-" ? `Page ${kw.page}` : "-"}</Text>
                      <Text style={s.tableCellCenter}>{kw.position !== "-" ? `#${kw.position}` : "-"}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
