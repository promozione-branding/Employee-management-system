// components/admin-dashboard/tabs/WorkflowHistory.jsx

'use client';
import React, { useEffect, useState } from 'react';
import { Workflow, Eye, Trash2, Calendar } from 'lucide-react';
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

export default function WorkflowHistory({ customerId, refreshKey = 0 }) {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

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
                            {/* Can add a View button later if you build a workflow detail modal */}
                            <button className="text-gray-400 hover:text-gray-700 cursor-not-allowed" title="View (Coming soon)">
                                <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(w._id)} className="text-red-500 hover:text-red-700" title="Delete">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
