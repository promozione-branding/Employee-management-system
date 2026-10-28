
import { Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";

let logoBuffer = null;

try {
  const logoPath = path.join(
    process.cwd(),
    "public/blog/inquiry-bazaar-logo.png"
  );

  if (fs.existsSync(logoPath)) {
    logoBuffer = fs.readFileSync(logoPath);
  }
} catch (error) {
  console.error("Unable to load Inquiry Bazaar logo:", error);
}

const ORANGE = "#ED8936";
const NAVY = "#0F172A";
const MUTED = "#94A3B8";

const s = StyleSheet.create({
  page: {
    backgroundColor: NAVY,
    fontFamily: "Helvetica",
    position: "relative",
    overflow: "hidden",
  },

  topAccent: {
    height: 8,
    backgroundColor: ORANGE,
  },

  circleLarge: {
    position: "absolute",
    width: 310,
    height: 310,
    borderRadius: 155,
    borderWidth: 1,
    borderColor: "#25344D",
    top: 95,
    right: -155,
  },

  circleSmall: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: "#25344D",
    bottom: 65,
    left: -105,
  },

  content: {
    flex: 1,
    paddingHorizontal: 48,
    paddingTop: 55,
    paddingBottom: 35,
    alignItems: "center",
    justifyContent: "center",
  },

  logoWrap: {
    minHeight: 75,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },

  logo: {
    width: 210,
    height: 70,
    objectFit: "contain",
  },

  brandFallback: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 2,
  },

  brandAccent: {
    color: ORANGE,
  },

  eyebrow: {
    color: ORANGE,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: 18,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 1.3,
    letterSpacing: 1,
  },

  titleAccent: {
    color: ORANGE,
  },

  subtitle: {
    color: "#CBD5E1",
    fontSize: 11,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 1.7,
    maxWidth: 340,
  },

  divider: {
    width: 48,
    height: 3,
    backgroundColor: ORANGE,
    marginTop: 25,
    marginBottom: 30,
  },

  clientLabel: {
    color: MUTED,
    fontSize: 8,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 10,
  },

  clientName: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: 440,
    marginBottom: 35,
  },

  periodBox: {
    width: "100%",
    maxWidth: 390,
    paddingVertical: 22,
    paddingHorizontal: 20,
    backgroundColor: "#172338",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    alignItems: "center",
  },

  periodLabel: {
    color: MUTED,
    fontSize: 8,
    letterSpacing: 2,
    marginBottom: 12,
  },

  periodDate: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },

  bottomAccent: {
    width: 35,
    height: 3,
    backgroundColor: ORANGE,
    marginTop: 25,
  },

  footer: {
    paddingHorizontal: 35,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#263650",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerBrand: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  footerText: {
    fontSize: 8,
    color: MUTED,
  },
});

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function CoverPage({ report }) {
  const c = report?.data?.client || {};

  const startDate = formatDate(report?.periodStart);
  const endDate = formatDate(report?.periodEnd);

  return (
    <Page size="A4" style={s.page}>
      <View style={s.topAccent} />

      <View style={s.circleLarge} />
      <View style={s.circleSmall} />

      <View style={s.content}>
        <View style={s.logoWrap}>
          {logoBuffer ? (
            <Image
              src={{ data: logoBuffer, format: "png" }}
              style={s.logo}
            />
          ) : (
            <Text style={s.brandFallback}>
              INQUIRY <Text style={s.brandAccent}>BAZAAR</Text>
            </Text>
          )}
        </View>

        <Text style={s.eyebrow}>
          DIGITAL GROWTH & ANALYTICS
        </Text>

        <Text style={s.title}>
          PERFORMANCE{"\n"}
          <Text style={s.titleAccent}>REPORT</Text>
        </Text>

        <Text style={s.subtitle}>
          A comprehensive overview of your digital
          performance, marketing results, and SEO progress.
        </Text>

        <View style={s.divider} />

        <Text style={s.clientLabel}>
          PREPARED EXCLUSIVELY FOR
        </Text>

        <Text style={s.clientName}>
          {c.name || "Valued Client"}
        </Text>

        <View style={s.periodBox}>
          <Text style={s.periodLabel}>
            REPORTING PERIOD
          </Text>

          <Text style={s.periodDate}>
            {startDate} — {endDate}
          </Text>

          <View style={s.bottomAccent} />
        </View>
      </View>

      <View style={s.footer}>
        <Text style={s.footerBrand}>
          INQUIRY BAZAAR
        </Text>

        <Text style={s.footerText}>
          CONFIDENTIAL BUSINESS REPORT
        </Text>
      </View>
    </Page>
  );
}
