"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Trash, X } from "lucide-react";
import SelectorNew from "./SelectorNew";
import ChecklistNew from "./ChecklistNew";
import SummaryNew, { computeTotals } from "./SummaryNew";
import HistoryNew from "./HistoryNew";
import { createProposalNewService } from "@/service/proposalNew";

const DURATION_OPTIONS = [
  "Advance Payment",
  "After 15 Days",
  "After 30 Days",
  "After 45 Days",
  "After 60 Days",
  "After 90 Days",
  "After 120 Days",
];

const METRIC_LABELS = [
  { key: "posts", label: "Posts" },
  { key: "reels", label: "Reels" },
  { key: "carousels", label: "Carousels" },
  { key: "stories", label: "Stories" },
];

const emptyForm = {
  items: [],
  discountType: "amount",
  discountInput: 0,
  tdsApplicable: false,
  notes: "",
  validTill: "",
  paymentMethod: "",
  partialPayments: [],
  deliveryPeriod: "weekly",
  deliveredMetrics: [],
  checklist: [],
};

const ProposalTabNew = ({ customerId }) => {
  const [form, setForm] = useState(emptyForm);
  const [paymentForm, setPaymentForm] = useState({
    paymentDuration: "",
    customDurationText: "",
    customDate: "",
    paymentAmount: "",
  });
  const [saving, setSaving] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const {
    items,
    discountType,
    discountInput,
    tdsApplicable,
    notes,
    validTill,
    paymentMethod,
    partialPayments,
    deliveryPeriod,
    deliveredMetrics,
    checklist,
  } = form;

  const { grandTotal } = computeTotals({
    items,
    discountType,
    discountInput,
    tdsApplicable,
  });

  const totalPaid = partialPayments.reduce(
    (s, p) => s + Number(p.paymentAmount || 0),
    0
  );
  const balance = grandTotal - totalPaid;

  const isCustomDur = paymentForm.paymentDuration === "__custom_text__";
  const isCustomDate = paymentForm.paymentDuration === "__custom_date__";

  const usedDurations = partialPayments.map((p) => p.paymentDuration);

  const resolveDuration = () => {
    if (isCustomDur) {
      const txt = paymentForm.customDurationText.trim();
      if (!txt) return "";
      return txt.toLowerCase().startsWith("after") ? txt : `After ${txt}`;
    }
    if (isCustomDate) {
      if (!paymentForm.customDate) return "";
      const d = new Date(paymentForm.customDate);
      return `On ${d.toLocaleDateString("en-IN")}`;
    }
    return paymentForm.paymentDuration;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setPaymentForm({
      paymentDuration: "",
      customDurationText: "",
      customDate: "",
      paymentAmount: "",
    });
    setEditingProposal(null);
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    const resolved = resolveDuration();
    if (!resolved) return toast.error("Select or enter a duration");
    if (usedDurations.includes(resolved))
      return toast.error("This duration is already added");
    const amt = Number(paymentForm.paymentAmount);
    if (amt <= 0) return toast.error("Amount must be greater than 0");
    if (amt > balance)
      return toast.error(
        `Amount cannot exceed balance ₹ ${balance.toLocaleString("en-IN")}`
      );
    setField("partialPayments", [
      ...partialPayments,
      { paymentDuration: resolved, paymentAmount: amt },
    ]);
    setPaymentForm({
      paymentDuration: "",
      customDurationText: "",
      customDate: "",
      paymentAmount: "",
    });
  };

  const handleRemovePayment = (idx) => {
    setField(
      "partialPayments",
      partialPayments.filter((_, i) => i !== idx)
    );
  };

  const toggleMetric = (label) => {
    const exists = deliveredMetrics.find((m) => m.label === label);
    if (exists) {
      setField(
        "deliveredMetrics",
        deliveredMetrics.filter((m) => m.label !== label)
      );
    } else {
      setField("deliveredMetrics", [...deliveredMetrics, { label, count: 0 }]);
    }
  };

  const updateMetric = (label, value) => {
    const n = Math.max(0, Number(value) || 0);
    setField(
      "deliveredMetrics",
      deliveredMetrics.map((m) =>
        m.label === label ? { ...m, count: n } : m
      )
    );
  };

  const loadForEdit = (proposal) => {
    setEditingProposal(proposal);
    setForm({
      items: proposal.items || [],
      discountType: proposal.discountType || "amount",
      discountInput: proposal.discountInput || 0,
      tdsApplicable: !!proposal.tdsApplicable,
      notes: proposal.notes || "",
      validTill: proposal.validTill
        ? new Date(proposal.validTill).toISOString().slice(0, 10)
        : "",
      paymentMethod: proposal.paymentMethod || "",
      partialPayments: proposal.partialPayments || [],
      deliveryPeriod: proposal.deliveryPeriod || "weekly",
      deliveredMetrics: (proposal.deliveredMetrics || []).map((m) => ({
        label: m.label,
        count: m.count || 0,
      })),
      checklist: proposal.checklist || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!items.length) return toast.error("Add at least one package");
    if (!validTill) return toast.error("Select valid till date");
    if (!paymentMethod) return toast.error("Select payment method");
    if (discountType === "percentage" && Number(discountInput) > 100)
      return toast.error("Percentage cannot exceed 100");
    if (Number(discountInput) < 0)
      return toast.error("Discount cannot be negative");
    if (grandTotal > 0 && Math.abs(totalPaid - grandTotal) > 0.01)
      return toast.error(
        `Partial payments must total ₹${grandTotal.toLocaleString(
          "en-IN"
        )}. Remaining: ₹${balance.toLocaleString("en-IN")}`
      );

    try {
      setSaving(true);
      const res = await createProposalNewService({
        clientId: customerId,
        items,
        discountType,
        discountInput: Number(discountInput || 0),
        tdsApplicable,
        partialPayments,
        deliveryPeriod,
        deliveredMetrics,
        checklist,
        notes,
        validTill,
        paymentMethod,
      });
      if (res.success) {
        toast.success("Proposal created");
        resetForm();
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(res.message || "Failed to create");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to create proposal");
    } finally {
      setSaving(false);
    }
  };

  const isEditing = !!editingProposal;

  return (
    <div className="flex flex-col gap-6">
      {isEditing && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
          <p className="text-sm text-amber-800">
            Editing <strong>{editingProposal.proposalNumber}</strong> — saving
            will create a new version
          </p>
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-1 text-xs text-amber-800 hover:underline"
          >
            <X className="h-3.5 w-3.5" /> Cancel edit
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <SelectorNew
            selectedItems={items}
            onChange={(v) => setField("items", v)}
          />

          <ChecklistNew
            items={items}
            checklist={checklist}
            onChange={(v) => setField("checklist", v)}
          />

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h3 className="font-semibold text-gray-800">Delivery Report</h3>
              <select
                value={deliveryPeriod}
                onChange={(e) => setField("deliveryPeriod", e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {METRIC_LABELS.map((m) => {
                const sel = deliveredMetrics.some((d) => d.label === m.label);
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggleMetric(m.label)}
                    className={`text-xs px-3 py-1.5 rounded-md border ${
                      sel
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {deliveredMetrics.length > 0 && (
              <div className="flex flex-col gap-2">
                {deliveredMetrics.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center gap-3 border rounded-lg p-2 bg-gray-50"
                  >
                    <span className="text-sm font-medium w-24">{m.label}</span>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Delivered"
                      value={m.count}
                      onChange={(e) => updateMetric(m.label, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
              Partial Payment
            </h3>

            <form onSubmit={handleAddPayment} className="flex flex-col gap-3">
              <select
                value={paymentForm.paymentDuration}
                onChange={(e) =>
                  setPaymentForm((p) => ({
                    ...p,
                    paymentDuration: e.target.value,
                    customDurationText: "",
                    customDate: "",
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select Payment Duration</option>
                {DURATION_OPTIONS.filter((d) => !usedDurations.includes(d)).map(
                  (d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  )
                )}
                <option value="__custom_text__">Custom (enter days)</option>
                <option value="__custom_date__">Custom Date</option>
              </select>

              {isCustomDur && (
                <Input
                  type="text"
                  placeholder="e.g. 23 Days"
                  value={paymentForm.customDurationText}
                  onChange={(e) =>
                    setPaymentForm((p) => ({
                      ...p,
                      customDurationText: e.target.value,
                    }))
                  }
                />
              )}

              {isCustomDate && (
                <Input
                  type="date"
                  value={paymentForm.customDate}
                  onChange={(e) =>
                    setPaymentForm((p) => ({
                      ...p,
                      customDate: e.target.value,
                    }))
                  }
                />
              )}

              <Input
                type="number"
                min="0"
                placeholder="Enter amount"
                value={paymentForm.paymentAmount}
                onChange={(e) =>
                  setPaymentForm((p) => ({
                    ...p,
                    paymentAmount: e.target.value,
                  }))
                }
              />

              <p className="text-sm text-gray-500">
                Balance: ₹ {balance.toLocaleString("en-IN")}
              </p>

              <Button type="submit" disabled={balance <= 0}>
                Add
              </Button>
            </form>

            <div className="mt-4">
              {partialPayments.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {partialPayments.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {p.paymentDuration}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          ₹ {Number(p.paymentAmount).toLocaleString("en-IN")}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePayment(idx)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500">
                    No partial payments added yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SummaryNew
            items={items}
            discountType={discountType}
            discountInput={discountInput}
            tdsApplicable={tdsApplicable}
          />

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-3">
            <div>
              <Label>Valid Till</Label>
              <Input
                type="date"
                value={validTill}
                onChange={(e) => setField("validTill", e.target.value)}
              />
            </div>

            <div>
              <Label>Payment Method</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setField("paymentMethod", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="net banking">Net Banking</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <Label>Discount</Label>
              <div className="flex gap-2">
                <select
                  value={discountType}
                  onChange={(e) => setField("discountType", e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="amount">₹ Amount</option>
                  <option value="percentage">% Percentage</option>
                </select>
                <Input
                  type="number"
                  min="0"
                  value={discountInput}
                  onChange={(e) => setField("discountInput", e.target.value)}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tdsApplicable}
                onChange={(e) => setField("tdsApplicable", e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              <span className="text-sm text-gray-700">Apply TDS (2%)</span>
            </label>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setField("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-2">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          size="lg"
          className="min-w-[240px]"
        >
          {saving ? "Saving…" : "Save Proposal"}
        </Button>
        {isEditing && (
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
        )}
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-gray-800 mb-3">Proposal History</h3>
        <HistoryNew
          customerId={customerId}
          onEdit={loadForEdit}
          refreshKey={refreshKey}
        />
      </div>
    </div>
  );
};

export default ProposalTabNew;
