"use client";
import React from "react";

const fmt = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

export const computeTotals = ({
  items = [],
  discountType = "amount",
  discountInput = 0,
  tdsApplicable = false,
  gstRate = 0.18,
  tdsRate = 0.02,
}) => {
  const subtotal = items.reduce((s, it) => s + Number(it.amount || 0), 0);
  const discountAmount =
    discountType === "percentage"
      ? Number(((subtotal * Number(discountInput || 0)) / 100).toFixed(2))
      : Number(discountInput || 0);
  const baseAfterDiscount = Number((subtotal - discountAmount).toFixed(2));
  const tdsAmount = tdsApplicable
    ? Number((baseAfterDiscount * tdsRate).toFixed(2))
    : 0;
  const taxableBase = Number((baseAfterDiscount - tdsAmount).toFixed(2));
  const gstAmount = Number((taxableBase * gstRate).toFixed(2));
  const grandTotal = Number((taxableBase + gstAmount).toFixed(2));

  return {
    subtotal,
    discountAmount,
    baseAfterDiscount,
    tdsAmount,
    taxableBase,
    gstAmount,
    grandTotal,
  };
};

const SummaryNew = (props) => {
  const {
    subtotal,
    discountAmount,
    tdsAmount,
    gstAmount,
    grandTotal,
  } = computeTotals(props);

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
              {props.discountType === "percentage" && props.discountInput > 0
                ? ` (${props.discountInput}%)`
                : ""}
            </span>
            <span>- {fmt(discountAmount)}</span>
          </div>
        )}
        {tdsAmount > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>TDS (2%)</span>
            <span>- {fmt(tdsAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>GST (18%)</span>
          <span>{fmt(gstAmount)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2 mt-2">
          <span>Grand Total</span>
          <span>{fmt(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryNew;
