// components/reports/ReportPDF.jsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Line,
  Circle,
  G,
  Text as SvgText,
} from "@react-pdf/renderer";

import { CoverPage } from "./CoverPage";
import { ThankYouPage } from "./ThankYouPage";

const s = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#1a202c",
  },
  header: {
    marginBottom: 22,
    borderBottom: "2 solid #eaebed",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: { fontSize: 22, fontWeight: 700, color: "#1a202c" },
  sub: { fontSize: 9, color: "#718096", marginTop: 4 },
  siteHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a202c",
    marginTop: 18,
    marginBottom: 10,
    backgroundColor: "#f2f7fc",
    padding: 10,
    borderRadius: 5,
    borderLeft: "4 solid #2b6cb0",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2d3748",
    marginTop: 10,
    marginBottom: 8,
    borderBottom: "1 solid #e2e8f0",
    paddingBottom: 5,
  },
  grid: { flexDirection: "row", gap: 8, marginBottom: 12 },
  box: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#ffffff",
    padding: 9,
    borderRadius: 7,
    border: "1 solid #e2e8f0",
  },
  boxLabel: {
    fontSize: 8,
    color: "#718096",
    textTransform: "uppercase",
    marginBottom: 5,
    fontWeight: 700,
    letterSpacing: 0.35,
  },
  boxValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 5,
  },
  comparison: { fontSize: 8, fontWeight: "bold", lineHeight: 1.3 },
  up: { color: "#27845b" },
  down: { color: "#d64545" },
  neutral: { color: "#718096" },
  chartBox: {
    border: "1 solid #e2e8f0",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#ffffff",
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#4a5568",
    marginBottom: 4,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 5,
    marginTop: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#e2e8f0",
    borderBottomWidth: 1,
    alignItems: "center",
  },
  tableHeader: { backgroundColor: "#f2f7fc" },
  tableCellWide: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    fontSize: 8.5,
    flex: 3,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    color: "#1a202c",
  },
  tableCellCenter: {
    paddingVertical: 7,
    paddingHorizontal: 5,
    fontSize: 8.5,
    flex: 1,
    textAlign: "center",
    color: "#4a5568",
  },
  emptyText: { fontSize: 9, color: "#718096", marginTop: 8 },
});

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return Number(value);
}

function calculateChange(current, previous) {
  const currentNumber = toNumber(current);
  const previousNumber = toNumber(previous);

  if (!Number.isFinite(currentNumber) || !Number.isFinite(previousNumber)) {
    return { text: "No data to compare", type: "neutral" };
  }

  if (previousNumber === 0) {
    return currentNumber > 0
      ? { text: "New activity", type: "up" }
      : { text: "No change", type: "neutral" };
  }

  const change = ((currentNumber - previousNumber) / Math.abs(previousNumber)) * 100;

  if (change > 0) {
    return { text: `Increased by ${change.toFixed(1)}%`, type: "up" };
  }
  if (change < 0) {
    return { text: `Decreased by ${Math.abs(change).toFixed(1)}%`, type: "down" };
  }
  return { text: "No change", type: "neutral" };
}

function formatNumber(value) {
  const number = toNumber(value);
  if (!Number.isFinite(number)) return "—";
  return number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function MetricBox({ label, current, previous, format }) {
  const change = calculateChange(current, previous);
  let displayValue = formatNumber(current);

  if (format === "money") {
    // Keep the currency amount compact so it doesn't wrap awkwardly in narrow cards.
    displayValue = `Rs ${formatNumber(current)}`;
  } else if (format === "percent") {
    const number = toNumber(current);
    displayValue = Number.isFinite(number) ? `${(number * 100).toFixed(2)}%` : "—";
  }

  return (
    <View style={s.box}>
      <Text style={s.boxLabel}>{label}</Text>
      <Text style={s.boxValue}>{displayValue}</Text>
      <Text style={[s.comparison, s[change.type]]}>{change.text}</Text>
    </View>
  );
}

function getDailyValue(row, valueKey) {
  if (typeof row === "number" || typeof row === "string") {
    return toNumber(row);
  }
  return toNumber(
    row?.[valueKey] ??
      row?.clicks ??
      row?.value ??
      row?.conversions ??
      row?.impressions ??
      0
  );
}

function getDailyDate(row) {
  if (!row || typeof row !== "object") return null;
  return row.date ?? row.day ?? row.startDate ?? row.date_start ?? row.timestamp ?? null;
}

function formatChartDate(value, fallbackIndex) {
  if (value == null || value === "") return `${fallbackIndex + 1}`;

  // Treat date-only values as UTC to prevent the displayed date shifting by timezone.
  const stringValue = String(value);
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(stringValue)
    ? new Date(`${stringValue}T00:00:00Z`)
    : new Date(stringValue);

  if (Number.isNaN(parsed.getTime())) return stringValue.slice(0, 10);

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

function SmoothChart({ data, color = "#3182ce", valueKey = "clicks", title = "Daily clicks" }) {
  const rows = Array.isArray(data) ? data : [];
  const points = rows
    .map((row, index) => ({
      value: getDailyValue(row, valueKey),
      label: formatChartDate(getDailyDate(row), index),
    }))
    .filter((point) => Number.isFinite(point.value));

  if (points.length < 2) {
    return (
      <View style={s.chartBox}>
        <Text style={s.chartTitle}>{title}</Text>
        <Text style={s.emptyText}>Not enough daily data to render a timeline.</Text>
      </View>
    );
  }

  const svgWidth = 500;
  const svgHeight = 150;
  const left = 46;
  const right = 12;
  const top = 12;
  const plotHeight = 88;
  const plotWidth = svgWidth - left - right;
  const bottom = top + plotHeight;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const axisMax = maxValue === 1 ? 1 : maxValue;
  const xFor = (index) =>
    left + (points.length === 1 ? 0 : (index / (points.length - 1)) * plotWidth);
  const yFor = (value) => bottom - (value / axisMax) * plotHeight;

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(point.value)}`)
    .join(" ");

  const tickIndexes = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];

  return (
    <View>
      <Text style={s.chartTitle}>{title}</Text>
      <Svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {[0, 1, 2, 3, 4].map((tick) => {
          const value = (axisMax * tick) / 4;
          const y = bottom - (plotHeight * tick) / 4;
          return (
            <G key={`grid-${tick}`}>
              <Line
                x1={left}
                y1={y}
                x2={svgWidth - right}
                y2={y}
                stroke="#e8edf3"
                strokeWidth={1}
              />
              <SvgText
                x={left - 7}
                y={y + 3}
                fontSize={8}
                fill="#718096"
                textAnchor="end"
              >
                {Math.round(value).toLocaleString("en-IN")}
              </SvgText>
            </G>
          );
        })}

        <Line
          x1={left}
          y1={top}
          x2={left}
          y2={bottom}
          stroke="#cbd5e0"
          strokeWidth={1}
        />
        <Line
          x1={left}
          y1={bottom}
          x2={svgWidth - right}
          y2={bottom}
          stroke="#cbd5e0"
          strokeWidth={1}
        />
        <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} />

        {tickIndexes.map((index) => (
          <G key={`date-${index}`}>
            <Circle
              cx={xFor(index)}
              cy={yFor(points[index].value)}
              r={3}
              fill={color}
            />
            <SvgText
              x={xFor(index)}
              y={bottom + 17}
              fontSize={8}
              fill="#718096"
              textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
            >
              {points[index].label}
            </SvgText>
          </G>
        ))}
        <SvgText
          x={svgWidth - right}
          y={svgHeight - 5}
          fontSize={7}
          fill="#a0aec0"
          textAnchor="end"
        >
          Date
        </SvgText>
      </Svg>
    </View>
  );
}

function domainKey(value) {
  if (!value) return "";

  let text = String(value).trim();
  text = text.replace(/^Website\s*[-:]\s*/i, "");
  text = text.replace(/^sc-domain:/i, "");
  text = text.replace(/^https?:\/\//i, "");
  text = text.replace(/^\/\//, "");
  text = text.split(/[/?#\s]/)[0].replace(/\.$/, "");
  text = text.replace(/^www\./i, "");

  // A project label may not be a domain; don't match it accidentally.
  if (!text || !text.includes(".")) return "";
  return text.toLowerCase();
}

function displayWebsite(value) {
  const key = domainKey(value);
  if (key) return `www.${key}`;

  const fallback = String(value || "Website").trim();
  return fallback.replace(/^Website\s*[-:]\s*/i, "");
}

function keywordBelongsToSite(keyword, siteId) {
  const siteKey = domainKey(siteId);
  if (!siteKey) return false;

  const candidates = [keyword?.website, keyword?.project?.projectName];
  return candidates.some((candidate) => domainKey(candidate) === siteKey);
}

function latestPageOneOrTwoRanking(keyword) {
  const rankings = Array.isArray(keyword?.rankings) ? keyword.rankings : [];
  const valid = rankings.filter((ranking) => {
    const page = Number(ranking?.page);
    return page === 1 || page === 2;
  });

  if (valid.length === 0) return null;

  const sorted = [...valid].sort((a, b) => {
    const aDate = new Date(a?.date || 0).getTime();
    const bDate = new Date(b?.date || 0).getTime();
    return (Number.isFinite(bDate) ? bDate : 0) - (Number.isFinite(aDate) ? aDate : 0);
  });

  const latest = sorted[0];
  return {
    keyword: String(keyword?.keyword || "Untitled keyword"),
    page: Number(latest.page),
    position: latest.position ?? "—",
  };
}

function SeoKeywordTable({ keywords }) {
  const rows = (keywords || []).map(latestPageOneOrTwoRanking).filter(Boolean);
  if (rows.length === 0) return null;

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.sectionTitle}>Manual SEO Keyword Rankings</Text>
      <View style={s.table}>
        <View style={[s.tableRow, s.tableHeader]}>
          <Text style={[s.tableCellWide, { fontWeight: "bold" }]}>Keyword</Text>
          <Text style={[s.tableCellCenter, { fontWeight: "bold" }]}>Page</Text>
          <Text style={[s.tableCellCenter, { fontWeight: "bold", borderRightWidth: 0 }]}>
            Position
          </Text>
        </View>
        {rows.map((row, index) => (
          <View
            key={`${row.keyword}-${index}`}
            style={[
              s.tableRow,
              index === rows.length - 1 ? { borderBottomWidth: 0 } : {},
            ]}
            wrap={false}
          >
            <Text style={s.tableCellWide}>{row.keyword}</Text>
            <Text style={s.tableCellCenter}>Page {row.page}</Text>
            <Text style={[s.tableCellCenter, { borderRightWidth: 0 }]}>
              #{row.position}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function groupUnmatchedSeoKeywords(keywords) {
  const groups = new Map();

  keywords.forEach((keyword) => {
    const label =
      keyword?.website ||
      keyword?.project?.projectName ||
      "General Keywords";
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(keyword);
  });

  return [...groups.entries()];
}

export function ReportPDF({ report }) {
  const d = report?.data || {};
  const c = d.client || {};
  const seoKeywords = Array.isArray(d.seoKeywords) ? d.seoKeywords : [];
  const gscSites = (Array.isArray(d.gsc) ? d.gsc : []).filter(
    (site) => !site?.error && site?.data
  );
  const googleAds = (Array.isArray(d.gads) ? d.gads : []).find(
    (account) => !account?.error && account?.data
  );
  const metaAccounts = (Array.isArray(d.metaAds) ? d.metaAds : []).filter(
    (account) => !account?.error && account?.data
  );

  const matchedSeoBySite = new Map(
    gscSites.map((site) => [
      site.id,
      seoKeywords.filter((keyword) => keywordBelongsToSite(keyword, site.id)),
    ])
  );
  const matchedSeoKeywords = new Set(
    [...matchedSeoBySite.values()].flat()
  );
  const unmatchedSeo = seoKeywords.filter((keyword) => !matchedSeoKeywords.has(keyword));
  const unmatchedSeoGroups = groupUnmatchedSeoKeywords(unmatchedSeo);

  return (
    <Document>
      <CoverPage report={report} />

      {/* Google Search Console performance and site-matched manual SEO data */}
      <Page size="A4" style={s.page} wrap>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Google Performance</Text>
            <Text style={s.sub}>{c.name || "Performance Report"}</Text>
          </View>
          <Text style={s.sub}>SEARCH CONSOLE</Text>
        </View>

        {gscSites.length === 0 ? (
          <Text style={s.emptyText}>No Google Search Console data was found.</Text>
        ) : (
          gscSites.map((site) => {
            const t = site.data?.totals || {};
            const p = site.data?.prevTotals || {};
            const daily = Array.isArray(site.data?.daily) ? site.data.daily : [];
            const siteSeo = matchedSeoBySite.get(site.id) || [];

            return (
              <View key={site.id} style={{ marginBottom: 10 }}>
                <Text style={s.siteHeader}>{displayWebsite(site.id)}</Text>
                <Text style={s.sectionTitle}>Search Console Overview</Text>
                <View style={s.grid}>
                  <MetricBox label="Clicks" current={t.clicks} previous={p.clicks} />
                  <MetricBox
                    label="Impressions"
                    current={t.impressions}
                    previous={p.impressions}
                  />
                  <MetricBox label="Average CTR" current={t.ctr} previous={p.ctr} format="percent" />
                  <MetricBox
                    label="Average Position"
                    current={t.position}
                    previous={p.position}
                  />
                </View>

                <View style={s.chartBox}>
                  <SmoothChart data={daily} color="#3182ce" title="Daily clicks" />
                </View>

                {/* Manual SEO rows now appear directly after this website's graph. */}
                <SeoKeywordTable keywords={siteSeo} />
              </View>
            );
          })
        )}

        {unmatchedSeoGroups.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Additional SEO Keywords</Text>
            <Text style={s.emptyText}>
              These manually entered keywords could not be matched to a Search Console website.
            </Text>
            {unmatchedSeoGroups.map(([website, keywords]) => (
              <View key={website} style={{ marginBottom: 12 }}>
                <Text style={s.siteHeader}>{displayWebsite(website)}</Text>
                <SeoKeywordTable keywords={keywords} />
              </View>
            ))}
          </View>
        )}
      </Page>

      {/* Google Ads */}
      {googleAds && (
        <Page size="A4" style={s.page} wrap>
          <View style={s.header}>
            <View>
              <Text style={s.title}>Google Ads</Text>
              <Text style={s.sub}>{c.name || "Performance Report"}</Text>
            </View>
            <Text style={s.sub}>PAID SEARCH</Text>
          </View>

          <Text style={s.siteHeader}>Google Ads Overview</Text>
          <View style={s.grid}>
            <MetricBox
              label="Clicks"
              current={googleAds.data?.totals?.clicks}
              previous={googleAds.data?.prevTotals?.clicks}
            />
            <MetricBox
              label="Impressions"
              current={googleAds.data?.totals?.impressions}
              previous={googleAds.data?.prevTotals?.impressions}
            />
            <MetricBox
              label="Cost (INR)"
              current={googleAds.data?.totals?.cost}
              previous={googleAds.data?.prevTotals?.cost}
              format="money"
            />
            <MetricBox
              label="Conversions"
              current={googleAds.data?.totals?.conversions}
              previous={googleAds.data?.prevTotals?.conversions}
            />
          </View>

          <View style={s.chartBox}>
            <SmoothChart
              data={googleAds.data?.daily || []}
              color="#d64545"
              title="Daily clicks"
            />
          </View>
        </Page>
      )}

      {/* Meta Ads */}
      <Page size="A4" style={s.page} wrap>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Meta Performance</Text>
            <Text style={s.sub}>{c.name || "Performance Report"}</Text>
          </View>
          <Text style={s.sub}>PAID SOCIAL</Text>
        </View>

        {metaAccounts.length === 0 ? (
          <Text style={s.emptyText}>No Meta Ads account data was found.</Text>
        ) : (
          metaAccounts.map((account) => {
            const t = account.data?.totals || {};
            const p = account.data?.prevTotals || {};

            return (
              <View key={account.id} style={{ marginBottom: 20 }}>
                <Text style={s.siteHeader}>
                  Meta Ads Account {String(account.id || "").replace(/^act_/i, "")}
                </Text>
                <View style={s.grid}>
                  <MetricBox label="Spend (INR)" current={t.spend} previous={p.spend} format="money" />
                  <MetricBox label="Clicks" current={t.clicks} previous={p.clicks} />
                  <MetricBox label="Reach" current={t.reach} previous={p.reach} />
                  <MetricBox label="Impressions" current={t.impressions} previous={p.impressions} />
                </View>

                <View style={s.chartBox}>
                  <SmoothChart
                    data={account.data?.daily || []}
                    color="#805ad5"
                    title="Daily clicks"
                  />
                </View>
              </View>
            );
          })
        )}
      </Page>

      <ThankYouPage />
    </Document>
  );
}
