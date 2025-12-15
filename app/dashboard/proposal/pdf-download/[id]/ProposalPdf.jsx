"use client";
import ProposalPdfTemplate from "@/components/pdf/ProposalPdfTemplate";
import { pdfDownloadService } from "@/service/proposal";
import { PDFViewer } from "@react-pdf/renderer";
import React, { useEffect, useState } from "react";


const ProposalPdf = ({ id }) => {
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState({});


  async function fetchingPdfData(proposalId) {
    try {
      const res = await pdfDownloadService(proposalId);
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
    fetchingPdfData(id);
  }, []);

 

  return (
    <>
      {loading ? (
        <div className="animate-pulse">Loading...</div>
      ) : (
        <div style={{ width: "80vw", height: "100vh", overflow: "hidden" }}>
          <PDFViewer
            style={{ height: "100%", width: "90%", overflow: "hidden" }}
          >
            <ProposalPdfTemplate data={pdfData}/>
          </PDFViewer>
        </div>
      )}
    </>
  );
};

export default ProposalPdf;
