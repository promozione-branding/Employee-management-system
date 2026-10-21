"use client";
import React, { useEffect, useState } from "react";
import { getLedgerNewService } from "@/service/proposalNew/ledgerNew";
import { listProposalNewService } from "@/service/proposalNew";
import { Search, Plus, Pencil, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import LedgerModalNew from "./LedgerModalNew";

export default function LedgerTabNew({ customerId }) {
  const [entries, setEntries] = useState([]);
  const [proposals, setProposals] = useState([]); 
  const [selectedProposal, setSelectedProposal] = useState(null); 
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await getLedgerNewService(customerId);
      if (res.success) setEntries(res.data);
    } catch (err) {
      toast.error("Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const res = await listProposalNewService(customerId);
      if (res.success) setProposals(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { 
    fetchLedger(); 
    fetchProposals();
  }, [customerId]);

  const isSecretUnlocked = searchQuery.trim() === "2-2=1";

  const displayedEntries = entries.filter((entry) => {
    if (selectedProposal) {
      const matchesProposal = entry.proposalId === selectedProposal._id || !entry.proposalId;
      if (!matchesProposal) return false;
    }
    if (isSecretUnlocked) return true; 
    return !entry.isConfidential; 
  });

  const openEdit = (entry) => {
    setEditData(entry);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditData(null); 
    setIsModalOpen(true);
  };

  // ✅ TALLY MATH
  const proposalBaseValue = selectedProposal ? Number(selectedProposal.grandTotal) : 0;
  const totalAddon = displayedEntries.reduce((sum, e) => sum + (e.extraAmount || 0), 0);
  
  // Total Service Used = Proposal Value + Total Add-on
  const totalServiceUsed = proposalBaseValue + totalAddon;
  
  // Total Paid = Sum of Credits (Payments)
  const totalCredit = displayedEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
  
  // Remaining Balance = Service Used - Paid
  const remainingBalance = totalServiceUsed - totalCredit;

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {isSecretUnlocked ? "Confidential Ledger (2-2=1)" : "Ledger"}
        </h2>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search or enter code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {!selectedProposal ? (
        <div className="max-w-md mx-auto mt-10 p-8 bg-gray-50 border rounded-2xl text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select a Proposal to view Ledger</h3>
          <select 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
            onChange={(e) => {
              const pId = e.target.value;
              const prop = proposals.find(p => p._id === pId);
              if (prop) setSelectedProposal(prop);
            }}
            value=""
          >
            <option value="">-- Choose a Proposal --</option>
            {proposals.map(p => (
              <option key={p._id} value={p._id}>{p.proposalNumber} - ₹{p.grandTotal}</option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-blue-900 font-medium">Viewing Ledger for:</p>
              <p className="text-xl font-bold text-blue-950">{selectedProposal.proposalNumber} <span className="text-blue-700 font-normal">(₹ {selectedProposal.grandTotal.toLocaleString("en-IN")})</span></p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedProposal(null)}
                className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Change
              </button>
              <button 
                onClick={openAdd}
                className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Payment
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">No.</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 min-w-[200px]">Particulars</th>
                  <th className="px-4 py-3">Voucher</th>
                  <th className="px-4 py-3 text-right">Debit (Service)</th>
                  <th className="px-4 py-3 text-right">Credit (Paid)</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-center">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {/* ✅ INITIAL PROPOSAL ROW (Always a Debit) */}
                <tr className="bg-gray-50/50">
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">{new Date(selectedProposal.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    Proposal #{selectedProposal.proposalNumber}
                    <div className="text-xs text-gray-500 font-normal mt-1">Initial Service Value</div>
                  </td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">
                    ₹ {proposalBaseValue.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">-</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">
                    ₹ {proposalBaseValue.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-center">-</td>
                </tr>

                {/* ✅ PAYMENTS (Credits) */}
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-6 text-gray-500">Loading...</td></tr>
                ) : displayedEntries.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-6 text-gray-500">No payments recorded yet.</td></tr>
                ) : (
                  displayedEntries.map((entry, idx) => (
                    <tr key={entry._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{idx + 1}.</td>
                      <td className="px-4 py-3">{new Date(entry.date).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {entry.particulars}
                        {entry.transactionId && <div className="text-xs text-gray-500 font-normal mt-1">TXN: {entry.transactionId}</div>}
                        
                        {entry.extraAmount > 0 && (
                          <div className="text-xs text-green-600 font-bold mt-1 bg-green-50 inline-block px-2 py-0.5 rounded border border-green-200">
                            Add-on: ₹ {entry.extraAmount.toLocaleString("en-IN")}
                          </div>
                        )}

                        {entry.isConfidential && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Confidential</span>}
                      </td>
                      <td className="px-4 py-3 capitalize">{entry.voucher?.replace("-", " ")}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">
                        {entry.debit ? `₹ ${entry.debit.toLocaleString("en-IN")}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        {entry.credit ? `₹ ${entry.credit.toLocaleString("en-IN")}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">
                        ₹ {entry.balance?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => openEdit(entry)} className="text-blue-600 hover:text-blue-800 p-1">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ TALLY SUMMARY */}
          {!loading && (
            <div className="mt-6 p-4 bg-gray-50 border rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Total Service (Debit)</p>
                <p className="text-lg font-bold text-gray-800">₹ {totalServiceUsed.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Total Add-ons</p>
                <p className="text-lg font-bold text-green-600">₹ {totalAddon.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Total Paid (Credit)</p>
                <p className="text-lg font-bold text-blue-700">₹ {totalCredit.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Remaining Balance</p>
                <p className={`text-lg font-bold ${remainingBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  ₹ {Math.abs(remainingBalance).toLocaleString("en-IN")} 
                  <span className="text-xs font-normal ml-1">
                    {remainingBalance > 0 ? "(Due)" : "(Advance)"}
                  </span>
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <LedgerModalNew 
          customerId={customerId} 
          initialData={editData}
          preselectedProposal={selectedProposal}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchLedger(); }}
          isSecretUnlocked={isSecretUnlocked}
        />
      )}
    </div>
  );
}
