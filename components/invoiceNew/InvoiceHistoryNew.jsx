// components/invoiceNew/InvoiceHistoryNew.jsx
// Previously generated invoices for a client — same audit presentation as
// proposal history: who created it, when, and the latest edits.

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Receipt, Eye, Trash2, Pencil, Download, Mail, X } from 'lucide-react';
import toast from 'react-hot-toast';
import InvoicePreviewNew from './InvoicePreviewNew';
import { downloadInvoicePdf } from './InvoicePdfNew';
import { listInvoiceNewService, getInvoiceNewByIdService, deleteInvoiceNewService, sendInvoiceMailService } from '@/service/invoiceNew';

const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_STYLES = {
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-50 text-blue-700',
    paid: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-600',
};

const InvoiceHistoryNew = ({ customerId, onEdit, refreshKey = 0 }) => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const pendingDownloadRef = useRef(false);

    const [mailModalOpen, setMailModalOpen] = useState(false);
    const [mailTargetId, setMailTargetId] = useState(null);
    const [defaultEmail, setDefaultEmail] = useState('');
    const [selectedEmailType, setSelectedEmailType] = useState('default');
    const [customEmail, setCustomEmail] = useState('');
    const [mailing, setMailing] = useState(false);

    const fetchList = useCallback(async () => {
        if (!customerId) return;
        try {
            setLoading(true);
            const res = await listInvoiceNewService(customerId);
            if (res.success) setList(res.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchList();
    }, [fetchList, refreshKey]);

    const handleView = async (id) => {
        try {
            const res = await getInvoiceNewByIdService(id);
            if (res.success) setPreview(res.data);
        } catch {
            toast.error('Failed to load');
        }
    };

    const handleEdit = async (id) => {
        try {
            const res = await getInvoiceNewByIdService(id);
            if (res.success && onEdit) onEdit(res.data);
        } catch {
            toast.error('Failed to load');
        }
    };

    const handleDownload = async (id) => {
        try {
            const res = await getInvoiceNewByIdService(id);
            if (!res.success || !res.data) return toast.error('Failed to load invoice');
            pendingDownloadRef.current = true;
            setPreview(res.data);
        } catch {
            toast.error('Failed to download');
        }
    };

    // Download only the invoice document (not the page behind the modal).
    useEffect(() => {
        if (!preview || !pendingDownloadRef.current) return;
        pendingDownloadRef.current = false;
        const raf = requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                const node = document.getElementById('invoice-print-root');
                if (node) downloadInvoicePdf(preview, node);
            })
        );
        return () => cancelAnimationFrame(raf);
    }, [preview]);

    const openMailModal = async (id) => {
        try {
            toast.loading('Loading email...', { id: 'load-invoice-email' });
            const res = await getInvoiceNewByIdService(id);
            toast.dismiss('load-invoice-email');
            if (res.success && res.data) {
                setDefaultEmail(res.data.clientId?.email || '');
                setMailTargetId(id);
                setSelectedEmailType('default');
                setCustomEmail('');
                setMailModalOpen(true);
            }
        } catch {
            toast.dismiss('load-invoice-email');
            toast.error('Failed to load email');
        }
    };

    const handleSendMail = async () => {
        const finalEmail = selectedEmailType === 'custom' ? customEmail.trim() : defaultEmail.trim();
        if (!finalEmail) return toast.error('Please provide a valid email address');
        try {
            setMailing(true);
            const res = await sendInvoiceMailService(mailTargetId, { email: finalEmail });
            if (res.success) {
                toast.success(res.message || 'Invoice sent to ' + finalEmail);
                setMailModalOpen(false);
                fetchList();
            } else {
                toast.error(res.message || 'Failed to send');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to send mail');
        } finally {
            setMailing(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this invoice?')) return;
        try {
            const res = await deleteInvoiceNewService(id);
            if (res.success) {
                toast.success('Deleted');
                fetchList();
            }
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">Loading invoices…</div>;
    if (!list.length) return <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">No invoices generated yet.</div>;

    return (
        <>
            <ul className="flex flex-col gap-3">
                {list.map((inv) => (
                    <li key={inv._id} className="grid grid-cols-1 items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto_auto]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                                <Receipt className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{inv.invoiceNumber || '—'}</p>
                                <p className="text-xs text-gray-500">
                                    {inv.items?.length || 0} items · from {inv.proposalNumber || 'proposal'}
                                </p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${STATUS_STYLES[inv.status] || STATUS_STYLES.draft}`}>
                                {inv.status || 'draft'}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1 border-l border-gray-200 py-1 pl-4 text-[11px] text-gray-500">
                            <p className="text-gray-700">
                                <span className="font-semibold">Created:</span> {fmtDateTime(inv.createdAt)} by {inv.createdByName || '—'}
                            </p>
                            {(inv.editHistory || []).map((edit, idx) => (
                                <p key={idx} className="leading-tight text-amber-600/80">
                                    <span className="font-medium">Edited:</span> {fmtDateTime(edit.editedAt)} by {edit.editedByName}
                                </p>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                            <span className="text-sm font-semibold text-gray-800">{fmt(inv.grandTotal)}</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleView(inv._id)} className="text-blue-600 hover:text-blue-800" title="View invoice">
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleEdit(inv._id)} className="text-amber-600 hover:text-amber-800" title="Edit invoice">
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDownload(inv._id)} className="text-emerald-600 hover:text-emerald-800" title="Download PDF">
                                    <Download className="h-4 w-4" />
                                </button>
                                <button onClick={() => openMailModal(inv._id)} className="text-indigo-600 hover:text-indigo-800" title="Send mail">
                                    <Mail className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDelete(inv._id)} className="text-red-500 hover:text-red-700" title="Delete invoice">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {preview && <InvoicePreviewNew invoice={preview} onClose={() => setPreview(null)} />}

            {mailModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg">
                        <div className="flex items-center justify-between border-b p-4">
                            <h3 className="font-semibold text-gray-800">Send Invoice Mail</h3>
                            <button onClick={() => setMailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-4 p-4">
                            <p className="text-xs text-gray-500">Admins will be CC&apos;d automatically.</p>
                            <div className="flex flex-col gap-2">
                                <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-gray-50">
                                    <input type="radio" checked={selectedEmailType === 'default'} onChange={() => setSelectedEmailType('default')} className="h-4 w-4 accent-indigo-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">Send to Client&apos;s Email</p>
                                        <p className="text-xs text-gray-500">{defaultEmail || 'No email on record'}</p>
                                    </div>
                                </label>
                                <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-gray-50">
                                    <input type="radio" checked={selectedEmailType === 'custom'} onChange={() => setSelectedEmailType('custom')} className="h-4 w-4 accent-indigo-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">Send to Custom Email</p>
                                        {selectedEmailType === 'custom' && (
                                            <input
                                                type="email"
                                                value={customEmail}
                                                onChange={(e) => setCustomEmail(e.target.value)}
                                                placeholder="accounts@client.com"
                                                className="mt-2 w-full rounded-md border px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                            />
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t bg-gray-50 p-4">
                            <button onClick={() => setMailModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                                Cancel
                            </button>
                            <button
                                onClick={handleSendMail}
                                disabled={mailing}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {mailing ? 'Sending...' : 'Send Mail'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InvoiceHistoryNew;
