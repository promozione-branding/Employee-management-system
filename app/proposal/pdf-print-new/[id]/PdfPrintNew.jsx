// app/proposal/pdf-print-new/[id]/PdfPrintNew.jsx

"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import PdfNew from "@/components/proposalNew/PdfNew";

export default function PdfPrintNew({ id }) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProposal() {
      try {
        const res = await axios.get(`/api/proposalNew/${id}`);
        if (res.data.success) {
          setProposal(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProposal();
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Loading PDF...</div>;
  if (!proposal) return <div style={{ padding: 20 }}>Proposal not found</div>;

  return (
    <div style={{ background: "#fff", margin: 0, padding: 0 }}>
      <style>{`
        body { background: #fff; margin: 0; padding: 0; }
        .pdf-screen-page { border: none !important; box-shadow: none !important; margin: 0 auto !important; }
      `}</style>
      <PdfNew proposal={proposal} />
    </div>
  );
}
