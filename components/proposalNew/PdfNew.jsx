"use client";
import React, { forwardRef } from "react";
import { computeTotals } from "./SummaryNew";

const fmt = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

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

const PdfNew = forwardRef(({ proposal }, ref) => {
  if (!proposal) return null;

  const client = proposal.clientId || {};
  const items = proposal.items || [];
  const partialPayments = proposal.partialPayments || [];
  const deliveredMetrics = proposal.deliveredMetrics || [];
  const checklist = proposal.checklist || [];

  const {
    subtotal,
    discountAmount,
    tdsAmount,
    gstAmount,
    grandTotal,
  } = computeTotals({
    items,
    discountType: proposal.discountType,
    discountInput: proposal.discountInput,
    tdsApplicable: proposal.tdsApplicable,
  });

  const totalPaid = partialPayments.reduce(
    (s, p) => s + Number(p.paymentAmount || 0),
    0
  );
  const balance = grandTotal - totalPaid;

  const clientAddress = [
    client.Address,
    client.city,
    client.state,
    client.country,
    client.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const th = { textAlign: "left", padding: "8px", fontWeight: 600 };
  const thR = { textAlign: "right", padding: "8px", fontWeight: 600 };
  const td = { padding: "8px", fontSize: "13px" };
  const tdR = { padding: "8px", fontSize: "13px", textAlign: "right" };

  return (
    <div
      ref={ref}
      id="proposal-print-root"
      style={{
        backgroundColor: "#fff",
        color: "#111827",
        width: "794px",
        padding: "32px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "16px",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
          Proposal
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>
          {proposal.proposalNumber} · {fmtDate(proposal.createdAt)}
        </p>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0" }}>
          Valid Till: {fmtDate(proposal.validTill)} · Payment:{" "}
          {proposal.paymentMethod || "—"}
        </p>
      </div>

      {(client.name || client.company) && (
        <div style={{ marginBottom: "20px", fontSize: "13px" }}>
          <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
            BILL TO
          </p>
          <p style={{ fontWeight: 600, margin: "2px 0 0" }}>
            {client.company || "—"}
          </p>
          <p style={{ margin: "2px 0 0" }}>{client.name || "—"}</p>
          <p style={{ margin: "2px 0 0" }}>
            {client.phone || "—"} · {client.email || "—"}
          </p>
          {clientAddress && <p style={{ margin: "2px 0 0" }}>{clientAddress}</p>}
          {client.GSTIN && (
            <p style={{ margin: "2px 0 0" }}>GSTIN: {client.GSTIN}</p>
          )}
          {client.tanNo && (
            <p style={{ margin: "2px 0 0" }}>TAN: {client.tanNo}</p>
          )}
        </div>
      )}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
            }}
          >
            <th style={th}>Item</th>
            <th style={th}>Category</th>
            <th style={th}>Duration</th>
            <th style={thR}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={td}>{it.label}</td>
              <td style={td}>{it.categoryLabel}</td>
              <td style={td}>{it.durationLabel || it.duration}</td>
              <td style={tdR}>{fmt(it.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginLeft: "auto",
          width: "288px",
          fontSize: "13px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "2px 0",
          }}
        >
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "2px 0",
            }}
          >
            <span>
              Discount
              {proposal.discountType === "percentage" &&
              proposal.discountInput > 0
                ? ` (${proposal.discountInput}%)`
                : ""}
            </span>
            <span>- {fmt(discountAmount)}</span>
          </div>
        )}
        {tdsAmount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "2px 0",
            }}
          >
            <span>TDS (2%)</span>
            <span>- {fmt(tdsAmount)}</span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "2px 0",
          }}
        >
          <span>GST (18%)</span>
          <span>{fmt(gstAmount)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 700,
            borderTop: "1px solid #e5e7eb",
            paddingTop: "8px",
            marginTop: "4px",
          }}
        >
          <span>Grand Total</span>
          <span>{fmt(grandTotal)}</span>
        </div>
      </div>

      {checklist.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h3
            style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}
          >
            Deliverables Included
          </h3>
          {checklist.map((sec) => (
            <div key={sec.section} style={{ marginBottom: "16px" }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "4px",
                  marginBottom: "6px",
                }}
              >
                {sec.section}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  columnCount: 2,
                  columnGap: "24px",
                  fontSize: "13px",
                }}
              >
                {sec.items.map((it) => (
                  <li
                    key={it}
                    style={{ marginBottom: "3px", breakInside: "avoid" }}
                  >
                    <span style={{ color: "#059669", marginRight: "6px" }}>
                      ✔
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {deliveredMetrics.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h3
            style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}
          >
            Delivery Report ({proposal.deliveryPeriod || "weekly"})
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                }}
              >
                <th style={th}>Item</th>
                <th style={thR}>Delivered</th>
              </tr>
            </thead>
            <tbody>
              {deliveredMetrics.map((m, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={td}>{m.label}</td>
                  <td style={tdR}>{m.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {partialPayments.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h3
            style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}
          >
            Payment Schedule
          </h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: "13px",
            }}
          >
            {partialPayments.map((p, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <span>{p.paymentDuration}</span>
                <span style={{ fontWeight: 600 }}>
                  {fmt(p.paymentAmount)}
                </span>
              </li>
            ))}
          </ul>
          <div
            style={{
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid #e5e7eb",
              fontSize: "13px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 700 }}>Total Scheduled</span>
            <span style={{ fontWeight: 700 }}>{fmt(totalPaid)}</span>
          </div>
          <div
            style={{
              fontSize: "13px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 700 }}>Balance</span>
            <span style={{ fontWeight: 700 }}>{fmt(balance)}</span>
          </div>
        </div>
      )}

      {proposal.notes && (
        <div style={{ marginTop: "24px", fontSize: "13px" }}>
          <p style={{ fontWeight: 600, marginBottom: "4px" }}>Notes</p>
          <p style={{ color: "#4b5563", margin: 0 }}>{proposal.notes}</p>
        </div>
      )}
    </div>
  );
});

PdfNew.displayName = "PdfNew";

export default PdfNew;
