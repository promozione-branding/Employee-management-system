// components/proposalNew/SummaryNew.jsx

"use client";
import React from "react";

const fmt = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

const round0 = (n) => Math.round(Number(n) || 0);

export const computeTotals = ({
  items = [],
  discountType = "amount",
  discountInput = 0,
  tdsApplicable = false,
  gstRate = 0.18,
  tdsRate = 0.02,
}) => {
  const subtotal = round0(
    items.reduce((s, it) => s + Number(it.amount || 0), 0)
  );

  const discountAmount =
    discountType === "percentage"
      ? round0((subtotal * Number(discountInput || 0)) / 100)
      : round0(discountInput || 0);

  const baseAfterDiscount = round0(subtotal - discountAmount);

  // ✅ GST on base-after-discount (NOT reduced by TDS)
  const gstAmount = round0(baseAfterDiscount * gstRate);

  // ✅ TDS on base-after-discount
  const tdsAmount = tdsApplicable ? round0(baseAfterDiscount * tdsRate) : 0;

  // ✅ Grand = baseAfterDiscount + GST − TDS
  const grandTotal = round0(baseAfterDiscount + gstAmount - tdsAmount);

  return {
    subtotal,
    discountAmount,
    baseAfterDiscount,
    gstAmount,
    tdsAmount,
    taxableBase: baseAfterDiscount,
    grandTotal,
  };
};

export const isPartialPaymentsValid = (partialPayments, grandTotal) => {
  const total = round0(
    partialPayments.reduce((s, p) => s + Number(p.paymentAmount || 0), 0)
  );
  return total === round0(grandTotal);
};

export const sumPartials = (partialPayments) =>
  round0(
    partialPayments.reduce((s, p) => s + Number(p.paymentAmount || 0), 0)
  );

const SummaryNew = (props) => {
  const { subtotal, discountAmount, gstAmount, tdsAmount, grandTotal } =
    computeTotals(props);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
        Payment Summary
      </h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>
              Discount
              {props.discountType === "percentage" &&
              Number(props.discountInput) > 0
                ? ` (${Number(props.discountInput)}%)`
                : ""}
            </span>
            <span>- {fmt(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>GST (18%)</span>
          <span>+ {fmt(gstAmount)}</span>
        </div>
        {tdsAmount > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>TDS (2%)</span>
            <span>- {fmt(tdsAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2 mt-2">
          <span>Grand Total</span>
          <span>{fmt(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryNew;
