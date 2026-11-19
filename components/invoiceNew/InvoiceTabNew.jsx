// components/invoiceNew/InvoiceTabNew.jsx
// Generate an invoice from a created proposal: every offering, discount,
// GST/TDS and the payment schedule come from the proposal, totals always
// match it. Previously generated invoices are listed below with the same
// created/edited audit trail as Proposal History.

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Receipt, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import InvoiceHistoryNew from './InvoiceHistoryNew';
import { listProposalNewService } from '@/service/proposalNew';
import { generateInvoiceFromProposalService, listInvoiceNewService, updateInvoiceNewService } from '@/service/invoiceNew';
import { buildInvoiceFromProposal } from '@/lib/invoiceNew';

const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const today = () => new Date().toISOString().slice(0, 10);
const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

const TotRow = ({ label, value }) => (
    <div className="flex justify-between py-0.5 text-sm text-gray-600">
        <span>{label}</span>
        <span>{value}</span>
    </div>
);

const InvoiceTabNew = ({ customerId }) => {
    const [proposals, setProposals] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedProposalId, setSelectedProposalId] = useState('');
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [form, setForm] = useState({ invoiceDate: today(), dueDate: '', notes: '', status: 'draft', paymentMethod: '' });

    const fetchData = useCallback(async () => {
        if (!customerId) return;
        try {
            setLoading(true);
            const [propRes, invRes] = await Promise.all([listProposalNewService(customerId), listInvoiceNewService(customerId)]);
            if (propRes.success) setProposals(propRes.data || []);
            if (invRes.success) setInvoices(invRes.data || []);
        } catch (err) {
            console.log(err);
            toast.error('Failed to load proposals');
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshKey]);

    const invoicedProposalIds = useMemo(() => new Set(invoices.map((i) => String(i.proposalId))), [invoices]);
    const selectedProposal = useMemo(() => proposals.find((p) => p._id === selectedProposalId) || null, [proposals, selectedProposalId]);

    const preview = useMemo(() => {
        if (editingInvoice) return editingInvoice;
        if (!selectedProposal) return null;
        try {
            return buildInvoiceFromProposal(selectedProposal, form);
        } catch {
            return null;
        }
    }, [editingInvoice, selectedProposal, form]);

    const selectProposal = (id) => {
        setEditingInvoice(null);
        setSelectedProposalId(id);
        const proposal = proposals.find((p) => p._id === id);
        setForm({ invoiceDate: today(), dueDate: '', notes: proposal?.notes || '', status: 'draft', paymentMethod: proposal?.paymentMethod || '' });
    };

    const loadForEdit = (invoice) => {
        setEditingInvoice(invoice);
        setSelectedProposalId('');
        setForm({
            invoiceDate: toDateInput(invoice.invoiceDate) || today(),
            dueDate: toDateInput(invoice.dueDate),
            notes: invoice.notes || '',
            status: invoice.status || 'draft',
            paymentMethod: invoice.paymentMethod || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingInvoice(null);
        setSelectedProposalId('');
        setForm({ invoiceDate: today(), dueDate: '', notes: '', status: 'draft', paymentMethod: '' });
    };

    const handleGenerate = async () => {
        if (!selectedProposal) return toast.error('Select a proposal first');
        if (invoicedProposalIds.has(String(selectedProposal._id)) && !window.confirm('An invoice already exists for this proposal. Generate another one?')) return;
        try {
            setGenerating(true);
            const res = await generateInvoiceFromProposalService({ proposalId: selectedProposal._id, clientId: customerId, ...form });
            if (res.success) {
                toast.success(res.message || 'Invoice generated');
                resetForm();
                setRefreshKey((k) => k + 1);
            } else {
                toast.error(res.message || 'Failed to generate invoice');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to generate invoice');
        } finally {
            setGenerating(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setGenerating(true);
            const res = await updateInvoiceNewService(editingInvoice._id, form);
            if (res.success) {
                toast.success('Invoice updated');
                resetForm();
                setRefreshKey((k) => k + 1);
            } else {
                toast.error(res.message || 'Failed to update invoice');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update invoice');
        } finally {
            setGenerating(false);
        }
    };

    const globalDiscount = preview ? Math.max(0, Number(preview.discountAmount || 0) - Number(preview.serviceDiscountAmount || 0)) : 0;

    return (
        <div className="flex flex-col gap-6">
            {editingInvoice && (
                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
                    <p className="text-sm text-amber-800">
                        Editing <strong>{editingInvoice.invoiceNumber}</strong> — offerings & totals are a locked snapshot; delete and regenerate to change them.
                    </p>
                    <button type="button" onClick={resetForm} className="flex items-center gap-1 text-xs text-amber-800 hover:underline">
                        <X className="h-3.5 w-3.5" /> Cancel edit
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="flex flex-col gap-5 lg:col-span-2">
                    {!editingInvoice && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h3 className="mb-3 border-b pb-2 font-semibold text-gray-800">Generate invoice from proposal</h3>
                            {loading ? (
                                <p className="text-sm text-gray-500">Loading proposals…</p>
                            ) : proposals.length ? (
                                <select
                                    value={selectedProposalId}
                                    onChange={(e) => selectProposal(e.target.value)}
                                    className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                                    aria-label="Select proposal"
                                >
                                    <option value="">Select a proposal…</option>
                                    {proposals.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.proposalNumber} · {fmt(p.grandTotal)} · {p.items?.length || 0} items · {fmtDate(p.createdAt)}
                                            {invoicedProposalIds.has(String(p._id)) ? ' · already invoiced' : ''}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-sm text-gray-500">No proposals yet — create one from the New Proposal tab first.</p>
                            )}
                        </div>
                    )}

                    {preview ? (
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between border-b pb-2">
                                <h3 className="font-semibold text-gray-800">{editingInvoice ? editingInvoice.invoiceNumber : 'Invoice preview'}</h3>
                                <span className="text-xs text-gray-500">From {preview.proposalNumber || '—'}</span>
                            </div>
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-left text-gray-500">
                                        <th className="px-3 py-2">Offering</th>
                                        <th className="px-3 py-2">Duration</th>
                                        <th className="px-3 py-2 text-right">Amount</th>
                                        <th className="px-3 py-2 text-right">Discount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {(preview.items || []).map((it, i) => (
                                        <tr key={it._id || i}>
                                            <td className="px-3 py-2">
                                                <p className="font-medium text-gray-800">{it.label}</p>
                                                <p className="text-xs text-gray-500">{it.categoryLabel || it.category || ''}</p>
                                                {it.customOfferings?.length > 0 && <p className="text-xs text-gray-500">{it.customOfferings.join(' · ')}</p>}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">{it.durationLabel || it.duration || '—'}</td>
                                            <td className="px-3 py-2 text-right">{fmt(it.amount)}</td>
                                            <td className="px-3 py-2 text-right">{it.serviceDiscount ? `- ${fmt(it.serviceDiscount)}` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {preview.partialPayments?.length > 0 && (
                                <div className="mt-4 rounded-xl border bg-gray-50 p-3">
                                    <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">Payment schedule</p>
                                    {preview.partialPayments.map((p, i) => (
                                        <div key={i} className="flex justify-between text-sm text-gray-600">
                                            <span>{p.paymentDuration}</span>
                                            <span>{fmt(p.paymentAmount)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        !editingInvoice &&
                        proposals.length > 0 && (
                            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                                Select a proposal above to preview its invoice.
                            </div>
                        )
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    {preview && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h3 className="mb-3 border-b pb-2 font-semibold text-gray-800">Totals (from proposal)</h3>
                            <TotRow label="Subtotal" value={fmt(preview.subtotal)} />
                            {Number(preview.serviceDiscountAmount) > 0 && <TotRow label="Service discounts" value={`- ${fmt(preview.serviceDiscountAmount)}`} />}
                            {globalDiscount > 0 && <TotRow label="Discount" value={`- ${fmt(globalDiscount)}`} />}
                            <TotRow label="GST (18%)" value={`+ ${fmt(preview.gstAmount)}`} />
                            {Number(preview.tdsAmount) > 0 && <TotRow label="TDS (2%)" value={`- ${fmt(preview.tdsAmount)}`} />}
                            <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold text-gray-900">
                                <span>Grand Total</span>
                                <span>{fmt(preview.grandTotal)}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div>
                            <Label>Invoice Date</Label>
                            <Input type="date" value={form.invoiceDate} onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Due Date</Label>
                            <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Payment Method</Label>
                            <Input value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))} placeholder="e.g. UPI, Net Banking" />
                        </div>
                        {editingInvoice && (
                            <div>
                                <Label>Status</Label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                    className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <Label>Notes</Label>
                            <Textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                        </div>
                        <Button onClick={editingInvoice ? handleUpdate : handleGenerate} disabled={generating || (!editingInvoice && !selectedProposal)} className="gap-2">
                            <Receipt className="h-4 w-4" />
                            {generating ? 'Saving…' : editingInvoice ? 'Update Invoice' : 'Generate Invoice'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h3 className="mb-3 font-semibold text-gray-800">Invoice History</h3>
                <InvoiceHistoryNew customerId={customerId} onEdit={loadForEdit} refreshKey={refreshKey} />
            </div>
        </div>
    );
};

export default InvoiceTabNew;
