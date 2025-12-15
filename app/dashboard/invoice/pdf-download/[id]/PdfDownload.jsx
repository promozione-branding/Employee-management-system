"use client";
import InvoicePdfTemplate from "@/components/pdf/InvoicePdfTemplate";
import { pdfDownloaderById } from "@/service/invoice";
import { PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";

const PdfDownload = ({ id }) => {
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState(null);

  async function fetchingPdfInfo(invoiceId) {
    try {
      const res = await pdfDownloaderById(invoiceId);
      if (res?.success) {
        setPdfData(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchingPdfInfo(id);
  }, []);

  return (
    <>
      {loading ? (
        <div className="animate-pulse">loading...</div>
      ) : (
        <div style={{ width: "80vw", height: "100vh", overflow: "hidden" }}>
          <PDFViewer
            style={{ height: "100%", width: "90%", overflow: "hidden" }}
          >
            <InvoicePdfTemplate data={pdfData} />
          </PDFViewer>
        </div>
      )}
    </>
  );
};

export default PdfDownload;
