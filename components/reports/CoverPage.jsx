import { Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";

let logoBuffer = null;
try {
  const logoPath = path.join(process.cwd(), "public/blog/inquiry-bazaar-logo.png");
  if (fs.existsSync(logoPath)) logoBuffer = fs.readFileSync(logoPath);
} catch (e) {}

const s = StyleSheet.create({
  coverPage: { padding: 60, backgroundColor: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%" },
  title: { fontSize: 32, fontWeight: "bold", color: "#1a202c", marginBottom: 10, textAlign: "center" },
  clientName: { fontSize: 20, color: "#ed8936", fontWeight: "bold", marginBottom: 40, textAlign: "center" },
  periodBox: { backgroundColor: "#f7fafc", padding: 20, borderRadius: 8, border: "1 solid #e2e8f0", width: "80%", alignItems: "center" },
  periodLabel: { fontSize: 12, color: "#718096", marginBottom: 4 },
  periodDate: { fontSize: 14, fontWeight: "bold", color: "#2d3748" }
});

export function CoverPage({ report }) {
  const c = report.data?.client || {};
  
  return (
    <Page size="A4" style={s.coverPage}>
      {logoBuffer && <Image src={{ data: logoBuffer, format: "png" }} style={{ width: 250, marginBottom: 40 }} />}
      <Text style={s.title}>PERFORMANCE REPORT</Text>
      <Text style={s.clientName}>{c.name}</Text>
      
      <View style={s.periodBox}>
        <Text style={s.periodLabel}>Reporting Period</Text>
        <Text style={s.periodDate}>
          {new Date(report.periodStart).toLocaleDateString("en-IN")} - {new Date(report.periodEnd).toLocaleDateString("en-IN")}
        </Text>
      </View>
    </Page>
  );
}
