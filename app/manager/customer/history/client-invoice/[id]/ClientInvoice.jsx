// app/manager/customer/history/client-invoice/[id]/ClientInvoice.jsx

'use client';

import Loading from '@/components/layout/Loading';
import { getClientInoviceHistoryService } from '@/service/customer/history';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FileText } from 'lucide-react';

const ClientInvoice = ({ clientId }) => {
    const [loading, setLoading] = useState(true);
    const [invoiceHistory, setInvoiceHistory] = useState([]);

    const fetchClientInvoiceHistory = async () => {
        try {
            const res = await getClientInoviceHistoryService(clientId);
            if (res.success) {
                setInvoiceHistory(res.data || []);
            } else {
                setInvoiceHistory([]);
            }
        } catch (error) {
            console.log(error);
            setInvoiceHistory([]);
            toast.error(error.response?.data?.message || 'error while getting invoice history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!clientId) {
            setLoading(false);
            return;
        }

        fetchClientInvoiceHistory();
    }, [clientId]);

    if (loading) return <Loading />;

    return (
        <div className="w-full">
            {invoiceHistory.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {invoiceHistory.map((item) => {
                        const invoiceId = item.entityId || item._id;

                        return (
                            <Link key={item._id} href={`/dashboard/invoice/pdf-download/${invoiceId}`} className="block">
                                <div className="h-full cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                                                <FileText size={18} />
                                            </span>
                                            <p className="font-semibold text-gray-800">Invoice</p>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                item.action === 'CREATE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : item.action === 'UPDATE'
                                                      ? 'bg-blue-100 text-blue-700'
                                                      : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {item.action}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>
                                            <span className="font-medium text-gray-800">Changed By:</span> {item.changedBy?.username || 'Unknown'}
                                        </p>
                                        <p className="break-all">
                                            <span className="font-medium text-gray-800">Email:</span> {item.changedBy?.email || 'N/A'}
                                        </p>
                                        <p className="break-all">
                                            <span className="font-medium text-gray-800">Invoice ID:</span> {invoiceId}
                                        </p>
                                        <p>
                                            <span className="font-medium text-gray-800">Date:</span> {new Date(item.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="py-8 text-center text-gray-500">No Invoice history found.</div>
            )}
        </div>
    );
};

export default ClientInvoice;
