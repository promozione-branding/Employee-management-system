// app/proposal/pdf-print-new/[id]/page.jsx

import PdfPrintNew from "./PdfPrintNew";

export default async function Page({ params }) {
  const { id } = await params;
  return <PdfPrintNew id={id} />;
}
