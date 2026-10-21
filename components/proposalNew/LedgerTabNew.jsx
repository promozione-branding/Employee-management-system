"use client";
import React, { useEffect, useState } from "react";
import { getLedgerNewService } from "@/service/proposalNew/ledgerNew";
import { listProposalNewService } from "@/service/proposalNew";
import { Search, Plus, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import LedgerModalNew from "./LedgerModalNew";

export default function LedgerTabNew({ customerId }) {
  const [entries, setEntries] = useState([]);
  const [proposals, setProposals] = useState([]); // ✅ To hold proposals for dropdown
  const [selectedProposal, setSelectedProposal] = useState(null); // ✅ To track selected proposal
  
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
    if (isSecretUnlocked) return true; 
    return !entry.isConfidential; 
  });

  const openEdit = (entry) => {
    setEditData(entry);
    setSelectedProposal(null);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

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

      {/* ✅ PROPOSAL SELECTOR */}
      {!editData && (
        <div className="mb-6 p-4 bg-gray-50 border rounded-xl flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Select Proposal to auto-fill amount</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              onChange={(e) => {
                const pId = e.target.value;
                const prop = proposals.find(p => p._id === pId);
                setSelectedProposal(prop || null);
              }}
              value={selectedProposal?._id || ""}
            >
              <option value="">-- Choose a Proposal --</option>
              {proposals.map(p => (
                <option key={p._id} value={p._id}>{p.proposalNumber} - ₹{p.grandTotal}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={openAdd}
            className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap h-10"
          >
            <Plus className="h-4 w-4" /> Add Funds
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 min-w-[200px]">Particulars</th>
              <th className="px-4 py-3">Voucher</th>
              <th className="px-4 py-3 text-right">Debit</th>
              <th className="px-4 py-3 text-right">Credit</th>
              <th className="px-4 py-3 text-right">Balance</th>
              <th className="px-4 py-3 text-center">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="8" className="text-center py-6 text-gray-500">Loading...</td></tr>
            ) : displayedEntries.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-6 text-gray-500">No entries found.</td></tr>
            ) : (
              displayedEntries.map((entry, idx) => (
                <tr key={entry._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{idx + 1}.</td>
                  <td className="px-4 py-3">{new Date(entry.date).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {entry.particulars}
                    {entry.transactionId && <div className="text-xs text-gray-500 font-normal mt-1">TXN: {entry.transactionId}</div>}
                    {entry.isConfidential && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Confidential</span>}
                  </td>
                  <td className="px-4 py-3 capitalize">{entry.voucher?.replace("-", " ")}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">
                    {entry.debit ? `₹ ${entry.debit.toLocaleString("en-IN")}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">
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

      {isModalOpen && (
        <LedgerModalNew 
          customerId={customerId} 
          initialData={editData}
          preselectedProposal={selectedProposal}
          onClose={() => { setIsModalOpen(false); setSelectedProposal(null); }} 
          onSuccess={() => { setIsModalOpen(false); setSelectedProposal(null); fetchLedger(); }}
          isSecretUnlocked={isSecretUnlocked}
        />
      )}
    </div>
  );
}
