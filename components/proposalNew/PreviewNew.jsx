// components/proposalNew/PreviewNew.jsx

"use client";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import PdfNew from "./PdfNew";
import { X } from "lucide-react";

const PreviewNew = ({ proposal, onClose }) => {
  const printRef = useRef(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const html = printRef.current.outerHTML;
    const win = window.open("", "_blank", "width=900,height=650");
    if (!win) return;

    win.document.open();
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${proposal?.proposalNumber || "Proposal"}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; margin: 0; color: #111827; }
            #proposal-print-root { width: 100%; max-width: 794px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 13px; }
            ul { list-style: none; padding: 0; margin: 0; }
            li { margin-bottom: 3px; font-size: 13px; break-inside: avoid; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    win.document.close();

    setTimeout(() => {
      win.focus();
      win.print();
    }, 250);
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
