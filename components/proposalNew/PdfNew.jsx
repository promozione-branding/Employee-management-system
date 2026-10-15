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
  SERVICES_CATALOG,
  INDUSTRIES_SERVED,
} from "@/config/new/proposalPdfNew";
import { PROPOSAL_CATALOG } from "@/config/new/proposalCatalogNew";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const CSS_RESET = `
* { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
html, body { margin: 0; padding: 0; background: #fff; color: #111827; font-family: Arial, sans-serif; }
@page { size: A4; margin: 0; }
.pdf-header-fixed, .pdf-footer-fixed, .pdf-watermark-fixed { display: none; }

.pdf-screen-page {
  width: 210mm;
  height: 297mm;
  max-height: 297mm;
  padding: 2mm 12mm 32mm 12mm;
  background: #fff;
  margin: 0 auto 12px auto;
  position: relative;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pdf-header-inline {
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 10px;
  position: relative; z-index: 2;
  background: #fff;
}
.pdf-header-inline img { height: 110px; width: auto; }
.pdf-header-inline .info { text-align: right; font-size: 10.5px; line-height: 1.35; color: #374151; }
.pdf-header-inline .info b { color: #111827; font-size: 11.5px; }

.pdf-body { position: relative; z-index: 1; flex: 1; }

.pdf-footer-inline {
  position: absolute; bottom: 5mm; left: 12mm; right: 12mm;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 10px; color: #6b7280; padding-top: 6px; border-top: 1px solid #e5e7eb;
  z-index: 2;
  background: #fff;
}
.pdf-footer-inline .left, .pdf-footer-inline .right { flex: 1; }
.pdf-footer-inline .right { text-align: right; }
.pdf-footer-inline .center { flex: 0 0 auto; text-align: center; }

.pdf-watermark-inline {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none; z-index: 0;
}
.pdf-watermark-inline img { width: 480px; height: auto; opacity: 0.08; }

table { width: 100%; border-collapse: collapse; }
th, td { padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px; vertical-align: top; }
th { background: #f3f4f6; font-weight: 600; }
h1 { font-size: 20px; margin: 0 0 10px 0; }
h3 { font-size: 14px; margin: 18px 0 6px 0; }
ul { list-style: disc; padding-left: 18px; margin: 0; }
li { font-size: 12px; margin-bottom: 2px; line-height: 1.45; }
table tr td[style*="border: 0"] { border: 0 !important; }
a { color: #111827; text-decoration: none; }

/* ---- Page 1 compact helpers ---- */
.to-block { font-size: 11.5px; line-height: 1.55; margin-bottom: 10px; }
.to-block .row { display: flex; gap: 6px; flex-wrap: wrap; }
.to-block .row .label { font-weight: 700; }
.legal-notes ul { margin-top: 4px; }
.legal-notes li { font-size: 10.5px; line-height: 1.4; margin-bottom: 1px; }
.bank-block { font-size: 10.5px; line-height: 1.55; margin-top: 10px; }

/* ---- Payment schedule grid ---- */
.schedule-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 6px;
  font-size: 11px;
}
.schedule-grid .grid-head {
  background: #f3f4f6;
  font-weight: 700;
  padding: 6px 10px;
  color: #111827;
  border-bottom: 1px solid #d1d5db;
}
.schedule-grid .grid-head.right { text-align: right; }
.schedule-grid .cell {
  padding: 5px 10px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 11px;
}
.schedule-grid .cell.right { text-align: right; font-weight: 600; }
.schedule-grid .cell.total {
  font-weight: 700;
  border-bottom: 0;
  background: #f9fafb;
}

/* ============================================
   DELIVERABLES — new layout (rows, not boxes)
   ============================================ */
.section-title-bar {
  background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 7px 12px;
  border-radius: 5px;
  margin: 14px 0 10px 0;
}
.section-title-bar:first-child { margin-top: 4px; }

.deliverable-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px dashed #e5e7eb;
  break-inside: avoid;
}
.deliverable-row:last-child { border-bottom: 0; }
.deliverable-row .row-title {
  font-size: 11.5px;
  font-weight: 700;
  color: #1e3a8a;
  padding-top: 1px;
}
.deliverable-row .row-items {
  font-size: 11px;
  color: #374151;
  line-height: 1.55;
}
.deliverable-row .row-items ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
}
.deliverable-row .row-items li {
  position: relative;
  padding-left: 12px;
  font-size: 11px;
  margin: 0;
  line-height: 1.5;
}
.deliverable-row .row-items li::before {
  content: "▪";
  position: absolute;
  left: 0;
  top: 0;
  color: #2563eb;
  font-size: 10px;
}

/* ============================================
   SERVICES — new layout
   ============================================ */
.services-section-title {
  background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 7px 12px;
  border-radius: 5px;
  margin: 14px 0 10px 0;
}

.services-items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px 14px;
}
.services-items-grid .svc-item {
  font-size: 10.5px;
  color: #374151;
  line-height: 1.55;
  position: relative;
  padding-left: 12px;
  break-inside: avoid;
}
.services-items-grid .svc-item::before {
  content: "▪";
  position: absolute;
  left: 0;
  top: 0;
  color: #2563eb;
  font-size: 10px;
}

/* ============================================
   INDUSTRIES — new layout
   ============================================ */
.industries-new-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}
.industry-card {
  border: 1px solid #d1d5db;
  border-left: 4px solid #2563eb;
  border-radius: 6px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  font-size: 12px;
  font-weight: 600;
  color: #1e3a8a;
  text-align: center;
  break-inside: avoid;
}

@media print {
  body { margin: 0; }
  .pdf-screen-page {
    margin: 0 !important;
    border: 0 !important;
    box-shadow: none !important;
    page-break-after: always;
    page-break-inside: avoid;
    height: 297mm !important;
    max-height: 297mm !important;
  }
  .pdf-screen-page:last-child { page-break-after: auto; }
}
`;

const HeaderContent = () => (
  <>
    <img
      src={PDF_LOGO_PATH}
      alt="Inquiry Bazaar"
      style={{ height: 110, width: "auto" }}
    />
    <div
      style={{
        textAlign: "right",
        fontSize: "10.5px",
        lineHeight: 1.35,
        color: "#374151",
      }}
    >
      <div>
        <b style={{ color: "#111827", fontSize: "11.5px" }}>
          {COMPANY_DETAILS.name}
        </b>
      </div>
      <div>{COMPANY_DETAILS.address}</div>
      <div>
        Call us :{" "}
        <a href={`tel:${COMPANY_DETAILS.phone.replace(/\s+/g, "")}`}>
          {COMPANY_DETAILS.phone}
        </a>
      </div>
      <div>
        Email:{" "}
        <a href={`mailto:${COMPANY_DETAILS.email}`}>
          {COMPANY_DETAILS.email}
        </a>
      </div>
      <div>
        Website:{" "}
        <a href={COMPANY_DETAILS.website} target="_blank" rel="noreferrer">
          {COMPANY_DETAILS.website}
        </a>
      </div>
    </div>
  </>
);

const FooterContent = ({ pageNumber, totalPages }) => (
  <>
    <span className="left">
      <a href={`mailto:${FOOTER_LEFT}`}>{FOOTER_LEFT}</a>
    </span>
    <span className="center">
      Page {pageNumber} of {totalPages}
    </span>
    <span className="right">
      <a href="tel:01142603232">011 - 42603232</a>
    </span>
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

const ScreenPage = ({ children, pageNumber, totalPages }) => (
  <div className="pdf-screen-page">
    <div className="pdf-watermark-inline">
      <img src={PDF_LOGO_PATH} alt="" />
    </div>
    <div className="pdf-body">
      <div className="pdf-header-inline">
        <HeaderContent />
      </div>
      {children}
    </div>
    <div className="pdf-footer-inline">
      <FooterContent pageNumber={pageNumber} totalPages={totalPages} />
    </div>
  </div>
);

const PdfNew = forwardRef(({ proposal }, ref) => {
  if (!proposal) return null;

  const client = proposal.clientId || {};
  const items = proposal.items || [];
  const checklist = proposal.checklist || [];
  const partialPayments = proposal.partialPayments || [];

  const { subtotal, discountAmount, gstAmount, tdsAmount, grandTotal } =
    computeTotals({
      items,
      discountType: proposal.discountType,
      discountInput: proposal.discountInput,
      tdsApplicable: proposal.tdsApplicable,
    });

  const totalPaid = partialPayments.reduce(
    (s, p) => s + Number(p.paymentAmount || 0),
    0
  );

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

  const hasDeliverables = usedCategories.some((catKey) => {
    const cat = PROPOSAL_CATALOG[catKey];
    return checklist.some((c) =>
      cat.checklist?.some((s) => s.title === c.section)
    );
  });

  const totalPages = 3 + (hasDeliverables ? 1 : 0) + 1;
  let pageCounter = 1;

  return (
    <div ref={ref} id="proposal-print-root">
      <style>{CSS_RESET}</style>

      {/* ============ PAGE 1 — Proposal ============ */}
      <ScreenPage pageNumber={pageCounter++} totalPages={totalPages}>
        <h1>Proposal</h1>

        <div className="to-block">
          <div style={{ fontWeight: 700, marginBottom: "2px" }}>To,</div>
          <div className="row">
            <span className="label">Client Name:</span>
            <span>{client.name || "—"}</span>
            <span style={{ marginLeft: "16px" }} className="label">
              Company:
            </span>
            <span>{client.company || "—"}</span>
          </div>
          {clientAddress && (
            <div className="row">
              <span className="label">Address:</span>
              <span>{clientAddress}</span>
            </div>
          )}
          {client.GSTIN && (
            <div className="row">
              <span className="label">GST No.:</span>
              <span>{client.GSTIN}</span>
            </div>
          )}
          <div className="row">
            <span className="label">Date:</span>
            <span>{fmtDate(proposal.createdAt)}</span>
            <span style={{ marginLeft: "16px" }} className="label">
              Proposal No.:
            </span>
            <span>{proposal.proposalNumber || "—"}</span>
          </div>
          {proposal.validTill && (
            <div className="row">
              <span className="label">Valid Till:</span>
              <span>{fmtDate(proposal.validTill)}</span>
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

        <div style={{ marginTop: "10px", marginLeft: "auto", width: "320px" }}>
          <table>
            <tbody>
              <tr>
                <td style={{ border: 0, padding: "3px 4px" }}>Amount</td>
                <td
                  style={{
                    border: 0,
                    padding: "3px 4px",
                    textAlign: "right",
                  }}
                >
                  {fmt(subtotal)}
                </td>
              </tr>
              {discountAmount > 0 && (
                <tr>
                  <td style={{ border: 0, padding: "3px 4px" }}>
                    Discount
                    {proposal.discountType === "percentage" &&
                    proposal.discountInput > 0
                      ? ` (${proposal.discountInput}%)`
                      : ""}
                  </td>
                  <td
                    style={{
                      border: 0,
                      padding: "3px 4px",
                      textAlign: "right",
                    }}
                  >
                    - {fmt(discountAmount)}
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ border: 0, padding: "3px 4px" }}>GST @ 18%</td>
                <td
                  style={{
                    border: 0,
                    padding: "3px 4px",
                    textAlign: "right",
                  }}
                >
                  + {fmt(gstAmount)}
                </td>
              </tr>
              {tdsAmount > 0 && (
                <tr>
                  <td style={{ border: 0, padding: "3px 4px" }}>TDS (2%)</td>
                  <td
                    style={{
                      border: 0,
                      padding: "3px 4px",
                      textAlign: "right",
                    }}
                  >
                    - {fmt(tdsAmount)}
                  </td>
                </tr>
              )}
              <tr>
                <td
                  style={{
                    borderTop: "1px solid #111827",
                    padding: "5px 4px",
                    fontWeight: 700,
                  }}
                >
                  Total Payable Amount
                </td>
                <td
                  style={{
                    borderTop: "1px solid #111827",
                    padding: "5px 4px",
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

        <div style={{ marginTop: "10px", fontSize: "11.5px" }}>
          <b>In Words:</b> {numberToWords(grandTotal)}
        </div>

        {partialPayments.length > 0 && (
          <div style={{ marginTop: "12px" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              Payment Schedule
            </div>
            <div className="schedule-grid">
              <div className="grid-head">Milestone</div>
              <div className="grid-head right">Amount (INR)</div>

              {partialPayments.map((p, i) => (
                <React.Fragment key={i}>
                  <div className="cell">{p.paymentDuration}</div>
                  <div className="cell right">{fmt(p.paymentAmount)}</div>
                </React.Fragment>
              ))}

              <div className="cell total">Total</div>
              <div className="cell right total">{fmt(totalPaid)}</div>
            </div>
          </div>
        )}

        <div className="legal-notes" style={{ marginTop: "12px" }}>
          <ul>
            {LEGAL_NOTES.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>

        <div className="bank-block">
          <div>
            <b>Cheque/Draft to be made in favor:</b>{" "}
            <b>Inquiry Bazaar PRIVATE LIMITED</b>
          </div>
          <div>
            <b>PAN No.:</b> {BANK_DETAILS.pan} &nbsp;&nbsp; <b>CIN:</b>{" "}
            {BANK_DETAILS.cin}
          </div>
          <div>
            <b>BANK ACCOUNT NO :</b> {BANK_DETAILS.account} &nbsp;&nbsp;{" "}
            <b>BANK NAME :</b> {BANK_DETAILS.bank}
          </div>
          <div>
            <b>IFSC CODE :</b> {BANK_DETAILS.ifsc}
          </div>
          <div style={{ marginTop: "2px" }}>
            <b>Regd. Office:</b> 606 Best Business Park, Netaji Subhash Place,
            Delhi, 110034
          </div>
          <div>
            <b>CIN:</b> {BANK_DETAILS.cin}
          </div>
        </div>
      </ScreenPage>

      {/* ============ PAGE 2 — Deliverables (row layout) ============ */}
      {hasDeliverables && (
        <ScreenPage pageNumber={pageCounter++} totalPages={totalPages}>
          <h1 style={{ textAlign: "center", marginBottom: "8px" }}>
            Service Offerings and Deliverables
          </h1>

          {usedCategories.map((catKey) => {
            const cat = PROPOSAL_CATALOG[catKey];
            const sectionTitle = DELIVERABLE_SECTION_MAP[catKey] || cat.label;
            const tickedSections = checklist.filter((c) =>
              cat.checklist?.some((s) => s.title === c.section)
            );

            if (!tickedSections.length) return null;

            return (
              <div key={catKey}>
                <div className="section-title-bar">{sectionTitle}</div>

                {tickedSections.map((sec) => (
                  <div key={sec.section} className="deliverable-row">
                    <div className="row-title">{sec.section}</div>
                    <div className="row-items">
                      <ul>
                        {sec.items.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </ScreenPage>
      )}

      {/* ============ PAGE 3 — OUR SERVICES ============ */}
      <ScreenPage pageNumber={pageCounter++} totalPages={totalPages}>
        <h1 style={{ textAlign: "center", marginBottom: "8px" }}>
          Our Services
        </h1>

        {SERVICES_CATALOG.map((section) => (
          <div key={section.title}>
            <div className="services-section-title">{section.title}</div>
            <div className="services-items-grid">
              {section.items.map((it) => (
                <div key={it} className="svc-item">
                  {it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </ScreenPage>

      {/* ============ PAGE 4 — INDUSTRIES ============ */}
      <ScreenPage pageNumber={pageCounter++} totalPages={totalPages}>
        <h1 style={{ textAlign: "center", marginBottom: "14px" }}>
          Industries We Serve
        </h1>

        <div className="industries-new-grid">
          {INDUSTRIES_SERVED.map((ind) => (
            <div key={ind} className="industry-card">
              {ind}
            </div>
          ))}
        </div>
      </ScreenPage>

      {/* ============ LAST PAGE — T&C ============ */}
      <ScreenPage pageNumber={pageCounter++} totalPages={totalPages}>
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
