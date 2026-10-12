"use client";
import React, { forwardRef } from "react";
import { computeTotals } from "./SummaryNew";
import { numberToWords } from "@/utils/numberToWordsNew";
import {
  PDF_LOGO_PATH,
  COMPANY_DETAILS,
  FOOTER_LEFT,
  FOOTER_RIGHT,
  LEGAL_NOTES,
  BANK_DETAILS,
  TERMS_AND_CONDITIONS,
  DELIVERABLE_SECTION_MAP,
} from "@/config/new/proposalPdfNew";
import { PROPOSAL_CATALOG } from "@/config/new/proposalCatalogNew";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const CSS_RESET = `
* { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
html, body { margin: 0; padding: 0; background: #fff; color: #111827; font-family: Arial, sans-serif; }

/* ================= PRINT ONLY ================= */
@page { size: A4; margin: 0; }

.pdf-header-fixed,
.pdf-footer-fixed,
.pdf-watermark-fixed { display: none; }

@media print {
  body { margin: 0; }
  .pdf-screen-page {
    width: 210mm !important;
    min-height: 297mm !important;
    margin: 0 auto !important;
    padding: 12mm !important;
    border: 0 !important;
    box-shadow: none !important;
    page-break-after: always;
    position: relative;
    overflow: visible;
  }
  .pdf-screen-page:last-child { page-break-after: auto; }
  .pdf-header-inline,
  .pdf-footer-inline { display: none !important; }

  .pdf-header-fixed {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 26mm;
    padding: 6mm 12mm 4mm 12mm;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    z-index: 10;
  }
  .pdf-footer-fixed {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 14mm;
    padding: 3mm 12mm;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-top: 1px solid #e5e7eb;
    font-size: 10px;
    color: #6b7280;
    z-index: 10;
  }
  .pdf-watermark-fixed {
    display: flex;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 0;
  }
  .pdf-watermark-fixed img {
    width: 480px;
    height: auto;
    opacity: 0.10;
  }
  .pdf-body { padding-top: 26mm !important; padding-bottom: 14mm !important; }
}

/* ================= SCREEN ================= */
.pdf-screen-page {
  width: 210mm;
  min-height: 297mm;
  padding: 12mm;
  background: #fff;
  margin: 0 auto 12px auto;
  position: relative;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.pdf-screen-page .pdf-header-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
  margin-bottom: 14px;
}
.pdf-screen-page .pdf-header-inline img {
  height: 60px;
  width: auto;
}
.pdf-screen-page .pdf-header-inline .info {
  text-align: right;
  font-size: 11px;
  line-height: 1.4;
  color: #374151;
}
.pdf-screen-page .pdf-header-inline .info b {
  color: #111827;
  font-size: 12px;
}
.pdf-screen-page .pdf-footer-inline {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #6b7280;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  margin-top: 20px;
}
.pdf-screen-page .pdf-watermark-inline {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
}
.pdf-screen-page .pdf-watermark-inline img {
  width: 480px;
  height: auto;
  opacity: 0.10;
}
.pdf-screen-page .pdf-body { position: relative; z-index: 1; }

/* ================= TYPOGRAPHY ================= */
table { width: 100%; border-collapse: collapse; }
th, td { padding: 6px 6px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px; vertical-align: top; }
th { background: #f3f4f6; font-weight: 600; }
h1 { font-size: 20px; margin: 0 0 10px 0; }
h3 { font-size: 14px; margin: 18px 0 6px 0; }
ul { list-style: disc; padding-left: 18px; margin: 0; }
li { font-size: 12px; margin-bottom: 2px; line-height: 1.45; }

/* TOTALS table */
table tr td[style*="border: 0"] { border: 0 !important; }
`;

const HeaderContent = () => (
  <>
    <img
      src={PDF_LOGO_PATH}
      alt="Inquiry Bazaar"
      style={{ height: 60, width: "auto" }}
    />
    <div
      style={{
        textAlign: "right",
        fontSize: "11px",
        lineHeight: 1.4,
        color: "#374151",
      }}
    >
      <div>
        <b style={{ color: "#111827", fontSize: "12px" }}>
          {COMPANY_DETAILS.name}
        </b>
      </div>
      <div>{COMPANY_DETAILS.address}</div>
      <div>Call us : {COMPANY_DETAILS.phone}</div>
      <div>Email: {COMPANY_DETAILS.email}</div>
      <div>Website: {COMPANY_DETAILS.website}</div>
    </div>
  </>
);

export const downloadProposalPdf = (proposal) => {
  const node = document.getElementById("proposal-print-root");
  if (!node) return;

  const html = node.outerHTML;
  const win = window.open("", "_blank", "width=900,height=650");
  if (!win) return;

  win.document.open();
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${proposal?.proposalNumber || "Proposal"}</title>
        <style>${CSS_RESET}</style>
      </head>
      <body>${html}</body>
    </html>
  `);
  win.document.close();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 500);
};

const ScreenPage = ({ children }) => (
  <div className="pdf-screen-page">
    <div className="pdf-watermark-inline">
      <img src={PDF_LOGO_PATH} alt="" />
    </div>
    <div className="pdf-body">
      <div className="pdf-header-inline">
        <HeaderContent />
      </div>
      {children}
      <div className="pdf-footer-inline">
        <span>{FOOTER_LEFT}</span>
        <span>{FOOTER_RIGHT}</span>
      </div>
    </div>
  </div>
);

const PdfNew = forwardRef(({ proposal }, ref) => {
  if (!proposal) return null;

  const client = proposal.clientId || {};
  const items = proposal.items || [];
  const checklist = proposal.checklist || [];

  const { subtotal, discountAmount, tdsAmount, gstAmount, grandTotal } =
    computeTotals({
      items,
      discountType: proposal.discountType,
      discountInput: proposal.discountInput,
      tdsApplicable: proposal.tdsApplicable,
    });

  const clientAddress = [
    client.Address,
    client.city,
    client.state,
    client.country,
    client.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const usedCategories = [...new Set(items.map((it) => it.category))].filter(
    (c) => PROPOSAL_CATALOG[c]
  );

  return (
    <div ref={ref} id="proposal-print-root">
      <style>{CSS_RESET}</style>

      {/* Print-only fixed header/footer/watermark */}
      <div className="pdf-header-fixed">
        <HeaderContent />
      </div>
      <div className="pdf-footer-fixed">
        <span>{FOOTER_LEFT}</span>
        <span>{FOOTER_RIGHT}</span>
      </div>
      <div className="pdf-watermark-fixed">
        <img src={PDF_LOGO_PATH} alt="" />
      </div>

      <ScreenPage>
        <h1>Proposal</h1>

        <div style={{ fontSize: "12px", marginBottom: "14px" }}>
          <div style={{ fontWeight: 700, marginBottom: "4px" }}>To,</div>
          <div>
            <b>Client Name:</b> {client.name || "—"}
          </div>
          <div>
            <b>Company name:</b> {client.company || "—"}
          </div>
          {clientAddress && (
            <div>
              <b>Address:</b> {clientAddress}
            </div>
          )}
          {client.GSTIN && (
            <div>
              <b>GST No.:</b> {client.GSTIN}
            </div>
          )}
          <div style={{ marginTop: "4px" }}>
            <b>Date:</b> {fmtDate(proposal.createdAt)}
          </div>
          <div>
            <b>Proposal No.:</b> {proposal.proposalNumber || "—"}
          </div>
          {proposal.validTill && (
            <div>
              <b>Valid Till:</b> {fmtDate(proposal.validTill)}
            </div>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: "30px" }}>S.No</th>
              <th>Description</th>
              <th style={{ width: "80px" }}>Tenure</th>
              <th style={{ width: "100px", textAlign: "right" }}>
                Amount (INR)
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>{i + 1}.</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{it.label}</div>
                  {it.categoryLabel && (
                    <div style={{ color: "#6b7280", fontSize: "11px" }}>
                      {it.categoryLabel}
                    </div>
                  )}
                </td>
                <td>{it.durationLabel || it.duration || "—"}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>
                  {fmt(it.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "12px", marginLeft: "auto", width: "320px" }}>
          <table>
            <tbody>
              <tr>
                <td style={{ border: 0, padding: "4px" }}>Amount</td>
                <td style={{ border: 0, padding: "4px", textAlign: "right" }}>
                  {fmt(subtotal)}
                </td>
              </tr>
              {discountAmount > 0 && (
                <tr>
                  <td style={{ border: 0, padding: "4px" }}>
                    Discount
                    {proposal.discountType === "percentage" &&
                    proposal.discountInput > 0
                      ? ` (${proposal.discountInput}%)`
                      : ""}
                  </td>
                  <td style={{ border: 0, padding: "4px", textAlign: "right" }}>
                    - {fmt(discountAmount)}
                  </td>
                </tr>
              )}
              {tdsAmount > 0 && (
                <tr>
                  <td style={{ border: 0, padding: "4px" }}>TDS (2%)</td>
                  <td style={{ border: 0, padding: "4px", textAlign: "right" }}>
                    - {fmt(tdsAmount)}
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ border: 0, padding: "4px" }}>GST @ 18%</td>
                <td style={{ border: 0, padding: "4px", textAlign: "right" }}>
                  {fmt(gstAmount)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    borderTop: "1px solid #111827",
                    padding: "6px 4px",
                    fontWeight: 700,
                  }}
                >
                  Total Payable Amount
                </td>
                <td
                  style={{
                    borderTop: "1px solid #111827",
                    padding: "6px 4px",
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {fmt(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "14px", fontSize: "12px" }}>
          <b>In Words:</b> {numberToWords(grandTotal)}
        </div>

        <div style={{ marginTop: "16px", fontSize: "11px" }}>
          <ul>
            {LEGAL_NOTES.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: "12px", fontSize: "11px", lineHeight: 1.5 }}>
          <div>{BANK_DETAILS.payee}</div>
          <div>
            PAN No.: {BANK_DETAILS.pan}, CIN: {BANK_DETAILS.cin}
          </div>
          <div>
            BANK ACCOUNT NO : {BANK_DETAILS.account} &nbsp; BANK NAME :{" "}
            {BANK_DETAILS.bank}
          </div>
          <div>IFSC CODE : {BANK_DETAILS.ifsc}</div>
          <div style={{ marginTop: "4px" }}>{BANK_DETAILS.regdOffice}</div>
          <div>CIN: {BANK_DETAILS.cin}</div>
          <div>011 42603232 • customercare@inquirybazaar.com</div>
        </div>
      </ScreenPage>

      {usedCategories.length > 0 && (
        <ScreenPage>
          <h1 style={{ textAlign: "center" }}>
            Service Offerings and Deliverables
          </h1>

          {usedCategories.map((catKey) => {
            const cat = PROPOSAL_CATALOG[catKey];
            const sectionTitle =
              DELIVERABLE_SECTION_MAP[catKey] || cat.label;
            const tickedSections = checklist.filter((c) =>
              cat.checklist?.some((s) => s.title === c.section)
            );

            if (!tickedSections.length) return null;

            return (
              <div key={catKey} style={{ marginBottom: "16px" }}>
                <h3
                  style={{
                    background: "#f3f4f6",
                    padding: "6px 8px",
                    borderLeft: "3px solid #1e3a8a",
                  }}
                >
                  {sectionTitle}
                </h3>
                {tickedSections.map((sec) => (
                  <div key={sec.section} style={{ marginBottom: "8px" }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "12px",
                        marginTop: "6px",
                      }}
                    >
                      {sec.section}
                    </div>
                    <ul style={{ marginTop: "3px" }}>
                      {sec.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })}
        </ScreenPage>
      )}

      <ScreenPage>
        <h1 style={{ textAlign: "center" }}>Terms &amp; Conditions</h1>
        <ol style={{ paddingLeft: "18px", margin: 0 }}>
          {TERMS_AND_CONDITIONS.map((t, i) => (
            <li
              key={i}
              style={{
                fontSize: "11.5px",
                lineHeight: 1.5,
                marginBottom: "5px",
              }}
            >
              {t}
            </li>
          ))}
        </ol>
      </ScreenPage>
    </div>
  );
});

PdfNew.displayName = "PdfNew";

export default PdfNew;
