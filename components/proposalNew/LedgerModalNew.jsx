// components/proposalNew/LedgerModalNew.jsx

"use client";
import React, { useState, useEffect } from "react";
import { createLedgerNewService, updateLedgerNewService, deleteLedgerNewService } from "@/service/proposalNew/ledgerNew";
import toast from "react-hot-toast";
import { X, Trash2 } from "lucide-react";

export default function LedgerModalNew({ customerId, onClose, onSuccess, isSecretUnlocked, initialData, preselectedProposal }) {
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    proposalId: "",
    method: "net-banking",
    particulars: "",
    transactionId: "",
    transactionDate: new Date().toISOString().split("T")[0],
    amount: "",
    addonAmount: "",
    isConfidential: false,
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setForm({
        proposalId: initialData.proposalId || "",
        method: initialData.voucher || "net-banking",
        // Remove the prefix we added before, just use original particulars
        particulars: initialData.particulars.replace(" (Service Used)", "") || "",
        transactionId: initialData.transactionId || "",
        transactionDate: new Date(initialData.date).toISOString().split("T")[0],
        amount: initialData.credit || initialData.debit || "",
        addonAmount: initialData.extraAmount || "",
        isConfidential: initialData.isConfidential || false,
      });
    } else {
      setForm({
        proposalId: preselectedProposal?._id || "",
        method: "net-banking",
        particulars: preselectedProposal ? `Proposal #${preselectedProposal.proposalNumber}` : "",
        transactionId: "",
        transactionDate: new Date().toISOString().split("T")[0],
        amount: preselectedProposal?.grandTotal || "",
        addonAmount: "",
        isConfidential: isSecretUnlocked,
      });
    }
  }, [isEditing, initialData, preselectedProposal, isSecretUnlocked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.particulars || !form.amount) return toast.error("Fill required fields");

    try {
      setLoading(true);
      const baseAmt = Number(form.amount);
      const addonAmt = Number(form.addonAmount) || 0;
      const totalCredit = baseAmt + addonAmt;

      const payload = {
        customerId,
        entryId: initialData?._id,
        proposalId: form.proposalId || null,
        date: form.transactionDate,
        particulars: form.particulars,
        voucher: form.method,
        debit: 0, // ✅ Always 0 for a payment
        credit: totalCredit, // ✅ Payment goes to Credit
        extraAmount: addonAmt,
        transactionId: form.transactionId,
        isConfidential: form.isConfidential,
      };

      if (isEditing) {
        await updateLedgerNewService(payload);
        toast.success("Entry updated");
      } else {
        await createLedgerNewService(payload);
        toast.success("Payment logged");
      }
      onSuccess();
    } catch (err) {
      toast.error("Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this entry? This cannot be undone.")) return;
    
    try {
      setLoading(true);
      const res = await deleteLedgerNewService(initialData._id);
      if (res.success) {
        toast.success("Entry deleted");
        onSuccess();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Failed to delete entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">
        
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg text-gray-800">
            {isEditing ? "Edit Entry" : "Add Payment (Credit)"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          
          <div>
            <label className="text-sm font-medium text-gray-700">Method of Payment</label>
            <select value={form.method} onChange={(e) => setForm({...form, method: e.target.value})} className="w-full mt-1 border rounded-md px-3 py-2 text-sm">
              <option value="net-banking">Net Banking</option>
              <option value="card">Card</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Particular Description</label>
            <input type="text" value={form.particulars} onChange={(e) => setForm({...form, particulars: e.target.value})} placeholder="Enter Particular description" className="w-full mt-1 border rounded-md px-3 py-2 text-sm" required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Transaction ID / UTR</label>
            <input type="text" value={form.transactionId} onChange={(e) => setForm({...form, transactionId: e.target.value})} placeholder="Enter Transaction ID / UTR" className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Transaction Date</label>
            <input type="date" value={form.transactionDate} onChange={(e) => setForm({...form, transactionDate: e.target.value})} className="w-full mt-1 border rounded-md px-3 py-2 text-sm" required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Amount Received (₹)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} placeholder="Enter Amount" className="w-full mt-1 border rounded-md px-3 py-2 text-sm" required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Add-on Payment (₹) <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input type="number" value={form.addonAmount} onChange={(e) => setForm({...form, addonAmount: e.target.value})} placeholder="Extra amount paid" className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
          </div>

          {isSecretUnlocked && !isEditing && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-md mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-red-700">
                <input type="checkbox" checked={form.isConfidential} onChange={(e) => setForm({...form, isConfidential: e.target.checked})} className="h-4 w-4 accent-red-600" />
                Mark as Confidential (Unaccountable Cash)
              </label>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            {isEditing && (
              <button type="button" onClick={handleDelete} disabled={loading} className="px-4 bg-red-50 text-red-600 border border-red-200 rounded-md font-semibold hover:bg-red-100 disabled:opacity-50 flex items-center justify-center">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button type="submit" disabled={loading} className="flex-1 bg-blue-900 text-white py-2 rounded-md font-semibold hover:bg-blue-800 disabled:opacity-50">
              {loading ? "Saving..." : (isEditing ? "Update Entry" : "Record Payment")}
            </button>
          </div>  
        </form>

      </div>
    </div>
  );
}
