// components/proposalNew/LedgerTabNew.jsx

'use client';
import React, { useEffect, useState } from 'react';
import { getLedgerNewService } from '@/service/proposalNew/ledgerNew';
import { listProposalNewService } from '@/service/proposalNew';
import { Search, Plus, Pencil, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import LedgerModalNew from './LedgerModalNew';
import { filterLedgerEntries, computeLedger, isConfidentialEntry } from '@/lib/ledgerNewMath';

export default function LedgerTabNew({ customerId }) {
    const [entries, setEntries] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchLedger = async () => {
        try {
            setLoading(true);
            const res = await getLedgerNewService(customerId);
            if (res.success) setEntries(res.data);
        } catch (err) {
            toast.error('Failed to load ledger');
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

    const isSecretUnlocked = searchQuery.trim() === '2-2=1';

    // Switching ledger clears the selection: a project lives in one ledger only.
    useEffect(() => {
        setSelectedProposal(null);
    }, [isSecretUnlocked]);

    // Never mix: genuine view = genuine entries only, confidential view =
    // confidential entries only, and only for the selected proposal.
    const displayedEntries = selectedProposal
        ? filterLedgerEntries(entries, {
              proposalId: selectedProposal._id,
              confidential: isSecretUnlocked,
          })
        : [];

    // A proposal that already has entries in the other ledger stays there.
    const proposalsForLedger = proposals.filter((p) => {
        const forProposal = entries.filter((e) => e.proposalId && String(e.proposalId) === String(p._id));
        if (forProposal.some((e) => isConfidentialEntry(e) === isSecretUnlocked)) return true;
        if (forProposal.some((e) => isConfidentialEntry(e) !== isSecretUnlocked)) return false;
        return true;
    });

    const openEdit = (entry) => {
        setEditData(entry);
        setIsModalOpen(true);
    };

    const openAdd = () => {
        setEditData(null);
        setIsModalOpen(true);
    };

    // Tally for this ledger only (genuine XOR confidential, this proposal only).
    const proposalBaseValue = selectedProposal ? Number(selectedProposal.grandTotal) || 0 : 0;
    const { rows: ledgerRows, totalAddon, totalCredit, totalServiceUsed, remainingBalance } = computeLedger(displayedEntries, proposalBaseValue);

    return (
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-2xl font-bold text-gray-800">{isSecretUnlocked ? 'Confidential Ledger (2-2=1)' : 'Ledger'}</h2>

                <div className="flex w-full gap-3 md:w-auto">
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search or enter code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-9 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>

            {!selectedProposal ? (
                <div className="mx-auto mt-10 max-w-md rounded-2xl border bg-gray-50 p-8 text-center">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Select a Proposal to view Ledger</h3>
                    <select
                        className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        onChange={(e) => {
                            const pId = e.target.value;
                            const prop = proposals.find((p) => p._id === pId);
                            if (prop) setSelectedProposal(prop);
                        }}
                        value=""
                    >
                        <option value="">-- Choose a Proposal --</option>
                        {proposalsForLedger.map((p) => (
                            <option key={p._id} value={p._id}>
                                {p.proposalNumber} - ₹{p.grandTotal}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <>
                    <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 md:flex-row">
                        <div>
                            <p className="text-sm font-medium text-blue-900">Viewing Ledger for:</p>
                            <p className="text-xl font-bold text-blue-950">
                                {selectedProposal.proposalNumber}{' '}
                                <span className="font-normal text-blue-700">(₹ {selectedProposal.grandTotal.toLocaleString('en-IN')})</span>
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedProposal(null)}
                                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                <ArrowLeft className="h-4 w-4" /> Change
                            </button>
                            <button
                                onClick={openAdd}
                                className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                            >
                                <Plus className="h-4 w-4" /> Add Payment
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">
                                <tr>
                                    <th className="px-4 py-3">No.</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="min-w-[200px] px-4 py-3">Particulars</th>
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
                                    <td className="px-4 py-3">{new Date(selectedProposal.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        Proposal #{selectedProposal.proposalNumber}
                                        <div className="mt-1 text-xs font-normal text-gray-500">Initial Service Value</div>
                                    </td>
                                    <td className="px-4 py-3">-</td>
                                    <td className="px-4 py-3 text-right font-medium text-red-600">₹ {proposalBaseValue.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3 text-right font-medium text-green-600">-</td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-800">₹ {proposalBaseValue.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3 text-center">-</td>
                                </tr>

                                {/* ✅ PAYMENTS (Credits) */}
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="py-6 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : ledgerRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-6 text-center text-gray-500">
                                            No payments recorded yet in the {isSecretUnlocked ? 'confidential' : 'genuine'} ledger.
                                        </td>
                                    </tr>
                                ) : (
                                    ledgerRows.map((entry, idx) => (
                                        <tr key={entry._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{idx + 1}.</td>
                                            <td className="px-4 py-3">{new Date(entry.date).toLocaleDateString('en-IN')}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                {entry.particulars}
                                                {entry.transactionId && (
                                                    <div className="mt-1 text-xs font-normal text-gray-500">TXN: {entry.transactionId}</div>
                                                )}

                                                {entry.extraAmount > 0 && (
                                                    <div className="mt-1 inline-block rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-bold text-green-600">
                                                        Add-on: ₹ {entry.extraAmount.toLocaleString('en-IN')}
                                                    </div>
                                                )}

                                                {entry.isConfidential && (
                                                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Confidential</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 capitalize">{entry.voucher?.replace('-', ' ')}</td>
                                            <td className="px-4 py-3 text-right font-medium text-red-600">
                                                {entry.debit ? `₹ ${entry.debit.toLocaleString('en-IN')}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-green-600">
                                                {entry.credit ? `₹ ${entry.credit.toLocaleString('en-IN')}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-800">₹ {entry.balance?.toLocaleString('en-IN')}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => openEdit(entry)} className="p-1 text-blue-600 hover:text-blue-800">
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
                        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border bg-gray-50 p-4 md:grid-cols-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Total Service (Debit)</p>
                                <p className="text-lg font-bold text-gray-800">₹ {totalServiceUsed.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Total Add-ons</p>
                                <p className="text-lg font-bold text-green-600">₹ {totalAddon.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Total Paid (Credit)</p>
                                <p className="text-lg font-bold text-blue-700">₹ {totalCredit.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Remaining Balance</p>
                                <p className={`text-lg font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    ₹ {Math.abs(remainingBalance).toLocaleString('en-IN')}
                                    <span className="ml-1 text-xs font-normal">{remainingBalance > 0 ? '(Due)' : '(Advance)'}</span>
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
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchLedger();
                    }}
                    isSecretUnlocked={isSecretUnlocked}
                />
            )}
        </div>
    );
}
