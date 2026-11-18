// components/admin-dashboard/tabs/WorkflowHistory.jsx

'use client';
import React, { useEffect, useState } from 'react';
import { Workflow, Eye, Trash2, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { listWorkflowsService, deleteWorkflowService } from '@/service/workflow';

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          })
        : '—';

const getStatusColor = (status) => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-700 border-green-200';
        case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export default function WorkflowHistory({ customerId, refreshKey = 0, onEdit }) {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewData, setViewData] = useState(null); // 👈 For the View Modal

    const fetchList = async () => {
        if (!customerId) return;
        try {
            setLoading(true);
            const res = await listWorkflowsService(customerId);
            if (res.success) setList(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this workflow?')) return;
        try {
            const res = await deleteWorkflowService(id);
            if (res.success) {
                toast.success('Workflow deleted');
                fetchList();
            }
        } catch (err) {
            toast.error('Failed to delete workflow');
        }
    };

    useEffect(() => {
        fetchList();
    }, [customerId, refreshKey]);

    if (loading)
        return <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">Loading workflows…</div>;
    
    if (!list.length)
        return <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">No workflows created yet.</div>;

    return (
        <>
            <div className="mt-6">
                <h3 className="mb-3 font-semibold text-gray-800">Workflow History</h3>
                <ul className="flex flex-col gap-3">
                    {list.map((w) => (
                        <li key={w._id} className="grid grid-cols-1 items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto_auto]">
                            
                            {/* LEFT: Icon, Category, Status */}
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                                    <Workflow className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{w.categoryLabel || w.category}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${getStatusColor(w.status)}`}>
                                            {w.status}
                                        </span>
                                        <span className="text-xs text-gray-500">{w.proposalNumber || '—'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* MIDDLE: Timeline & Creator */}
                            <div className="flex flex-col gap-1 text-[11px] text-gray-500 border-l border-gray-200 pl-4 py-1">
                                <p className="text-gray-700">
                                    <span className="font-semibold">Timeline:</span> {fmtDate(w.startDate)} to {fmtDate(w.endDate)}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-600">Created:</span> {fmtDate(w.createdAt)} by {w.createdByAdminName || '—'}
                                </p>
                            </div>

                            {/* RIGHT: Actions */}
                            <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                                <button onClick={() => setViewData(w)} className="text-blue-600 hover:text-blue-800" title="View">
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => onEdit && onEdit(w)} 
                                    className="text-amber-600 hover:text-amber-800" 
                                    title="Edit"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDelete(w._id)} className="text-red-500 hover:text-red-700" title="Delete">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 👇 VIEW MODAL */}
            {viewData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-lg">
                        <div className="flex items-center justify-between border-b p-4">
                            <h3 className="text-lg font-semibold text-gray-800">Workflow Details</h3>
                            <button onClick={() => setViewData(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 text-sm text-gray-700">
                            <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                <span className="font-medium text-gray-500">Proposal</span>
                                <span className="col-span-2 font-semibold">{viewData.proposalNumber || '—'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                <span className="font-medium text-gray-500">Category</span>
                                <span className="col-span-2">{viewData.categoryLabel || viewData.category}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                <span className="font-medium text-gray-500">Timeline</span>
                                <span className="col-span-2">{fmtDate(viewData.startDate)} &rarr; {fmtDate(viewData.endDate)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                <span className="font-medium text-gray-500">Status</span>
                                <span className="col-span-2 capitalize">{viewData.status}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                <span className="font-medium text-gray-500">Created By</span>
                                <span className="col-span-2">{viewData.createdByAdminName} ({fmtDate(viewData.createdAt)})</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="font-medium text-gray-500">Description</span>
                                <span className="col-span-2 whitespace-pre-wrap">{viewData.description || <span className="text-gray-400 italic">No description</span>}</span>
                            </div>
                        </div>
                        <div className="flex justify-end border-t bg-gray-50 p-4">
                            <button onClick={() => setViewData(null)} className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
