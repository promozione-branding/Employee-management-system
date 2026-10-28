// components/reports/ThankYouPage.jsx


import {
  Page,
  StyleSheet,
  Text,
  View,
  Link,
} from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: {
    backgroundColor: "#0F172A",
    padding: 0,
    fontFamily: "Helvetica",
    position: "relative",
    overflow: "hidden",
  },

  topAccent: {
    height: 8,
    backgroundColor: "#ED8936",
    width: "100%",
  },

  glowCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: "#263650",
    top: 100,
    right: -130,
  },

  glowCircleTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "#263650",
    bottom: 70,
    left: -110,
  },

  content: {
    flex: 1,
    paddingHorizontal: 48,
    paddingVertical: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  brand: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  brandAccent: {
    color: "#ED8936",
  },

  divider: {
    width: 48,
    height: 3,
    backgroundColor: "#ED8936",
    marginTop: 15,
    marginBottom: 45,
  },

  eyebrow: {
    fontSize: 9,
    letterSpacing: 3,
    color: "#94A3B8",
    marginBottom: 18,
    textAlign: "center",
  },

  title: {
    fontSize: 43,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 1.2,
    marginBottom: 12,
  },

  titleAccent: {
    color: "#ED8936",
  },

  description: {
    fontSize: 11,
    lineHeight: 1.9,
    color: "#CBD5E1",
    textAlign: "center",
    maxWidth: 370,
    marginTop: 12,
  },

  messageCard: {
    width: "100%",
    marginTop: 38,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#172338",
  },

  cardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 9,
    textAlign: "center",
  },

  cardDescription: {
    fontSize: 9,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 1.7,
  },

  websiteLabel: {
    color: "#94A3B8",
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 40,
    marginBottom: 9,
  },

  website: {
    color: "#ED8936",
    fontSize: 11,
    fontWeight: "bold",
    textDecoration: "none",
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

  footerText: {
    fontSize: 8,
    color: "#64748B",
  },

  footerBrand: {
    fontSize: 8,
    color: "#CBD5E1",
    fontWeight: "bold",
  },
});

export function ThankYouPage() {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.topAccent} />

      <View style={s.glowCircle} />
      <View style={s.glowCircleTwo} />

      <View style={s.content}>
        <Text style={s.brand}>
          INQUIRY <Text style={s.brandAccent}>BAZAAR</Text>
        </Text>

        <View style={s.divider} />

        <Text style={s.eyebrow}>
          PERFORMANCE REPORT COMPLETE
        </Text>

        <Text style={s.title}>
          Thank{"\n"}
          <Text style={s.titleAccent}>You.</Text>
        </Text>

        <Text style={s.description}>
          Thank you for trusting Inquiry Bazaar
          with your digital growth journey.
          {"\n\n"}
          We appreciate your partnership and look
          forward to achieving even greater results
          together.
        </Text>

        <View style={s.messageCard}>
          <Text style={s.cardTitle}>
            Let's Grow Together
          </Text>

          <Text style={s.cardDescription}>
            Have questions about your performance
            report or want to explore new opportunities?
            {"\n"}
            We're here to help.
          </Text>
        </View>

        <Text style={s.websiteLabel}>
          LET'S CONNECT
        </Text>

        <Link
          src="https://www.inquirybazaar.com/"
          style={s.website}
        >
          www.inquirybazaar.com
        </Link>
      </View>

      <View style={s.footer}>
        <Text style={s.footerBrand}>
          INQUIRY BAZAAR
        </Text>

        <Text style={s.footerText}>
          THANK YOU FOR YOUR PARTNERSHIP
        </Text>
      </View>
    </Page>
  );
}
