"use client";
import React from "react";

const fmt = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

const SummaryNew = ({
  items = [],
  discountType = "amount",
  discountInput = 0,
  gstRate = 0.18,
}) => {
  const subtotal = items.reduce((s, it) => s + Number(it.amount || 0), 0);
  const gstAmount = Number((subtotal * gstRate).toFixed(2));
  const discountAmount =
    discountType === "percentage"
      ? Number(((subtotal * Number(discountInput || 0)) / 100).toFixed(2))
      : Number(discountInput || 0);
  const grandTotal = Number((subtotal + gstAmount - discountAmount).toFixed(2));

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
        <div className="flex justify-between text-gray-600">
          <span>GST ({Math.round(gstRate * 100)}%)</span>
          <span>{fmt(gstAmount)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>
              Discount
              {discountType === "percentage" && discountInput > 0
                ? ` (${discountInput}%)`
                : ""}
            </span>
            <span>- {fmt(discountAmount)}</span>
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
