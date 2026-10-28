import { Page, StyleSheet, Image } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";

let thankyouBuffer = null;
try {
  const thankyouPath = path.join(process.cwd(), "public/blog/thank-you.png");
  if (fs.existsSync(thankyouPath)) thankyouBuffer = fs.readFileSync(thankyouPath);
} catch (e) {}

const s = StyleSheet.create({
  thankyouPage: { padding: 0, backgroundColor: "#ffffff", height: "100%" },
  thankyouImage: { width: "100%", height: "100%", objectFit: "cover" },
});

export function ThankYouPage() {
  return (
    <Page size="A4" style={s.thankyouPage}>
      {thankyouBuffer && <Image src={{ data: thankyouBuffer, format: "png" }} style={s.thankyouImage} />}
    </Page>
  );
}
