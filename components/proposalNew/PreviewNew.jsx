// components/proposalNew/PreviewNew.jsx

"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import PdfNew, { downloadProposalPdf } from "./PdfNew";
import { X } from "lucide-react";

const PreviewNew = ({ proposal, onClose }) => {
  const printRef = useRef(null);

  const handlePrint = () => {
    if (!proposal || !printRef.current) return;

    // Use the same PDF markup and print CSS as the History download action.
    downloadProposalPdf(proposal, printRef.current);
  };

  if (!proposal) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">
            {proposal.proposalNumber || "Proposal"}
          </h3>

          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} size="sm">
              Print / Save PDF
            </Button>

            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-800"
              type="button"
              aria-label="Close proposal preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-auto">
          <PdfNew ref={printRef} proposal={proposal} />
        </div>
      </div>
    </div>
  );
};

export default PreviewNew;
