"use client";

import dynamic from "next/dynamic";
import { PDFViewer } from "@react-pdf/renderer";
import Loading from "@/components/layout/Loading";
import ProposalPdfTemplate from "@/components/pdf/ProposalPdfTemplate";
import { pdfDownloadService } from "@/service/proposal";
import { useEffect, useState } from "react";

// const PDFViewer = dynamic(
//   () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
//   { ssr: false }
// );

export default function ProposalPdf({ id }) {
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      setPdfData(null);

      try {
        const res = await pdfDownloadService(id);
        if (active && res?.success) {
          setPdfData(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Loading />;

  if (!pdfData) return <p>Unable to load PDF.</p>;

  return (
    <div style={{ width: "80vw", height: "100vh" }}>
      <PDFViewer style={{ width: "90%", height: "100%" }}>
        <ProposalPdfTemplate data={pdfData} />
      </PDFViewer>
    </div>
  );
}