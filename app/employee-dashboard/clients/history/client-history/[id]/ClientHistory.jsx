// app/employee-dashboard/clients/history/client-history/[id]/ClientHistory.jsx

'use client';

import Loading from '@/components/layout/Loading';
import { getClientHistoryService } from '@/service/customer';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const renderValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const actionBadgeClass = (action) => {
    if (action === 'CREATE') return 'bg-green-100 text-green-800';
    if (action === 'UPDATE') return 'bg-blue-100 text-blue-800';
    if (action === 'DELETE') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-700';
};

const HIDDEN_ALL_FIELDS = new Set([
    'meetingDate',
    'salesPersonEmail',
    'SalesPersonName',
    'salesExecutive',
    'notes',
    'invoices',
    'proposals',
    'history',
    'workDetails',
]);

const ClientHistory = ({ customerId }) => {
    const [loading, setLoading] = useState(true);
    const [clientHistoryData, setClientHistoryData] = useState([]);

    useEffect(() => {
        async function getClientHistory() {
            try {
                const res = await getClientHistoryService(customerId);
                if (res.success) {
                    setClientHistoryData(res.data);
                    toast.success(res.message || 'Client history fetched');
                }
            } catch (error) {
                console.log(error);
                setClientHistoryData([]);
                toast.error(error.response?.data?.message || 'Error while fetching the client history');
            } finally {
                setLoading(false);
            }
        }
        getClientHistory();
    }, [customerId]);

    if (loading) return <Loading />;

    return (
        <div className="w-full space-y-4">
            {clientHistoryData?.length > 0 ? (
                clientHistoryData.map((item) => (
                    <div key={item._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow">
                        <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-center">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded px-2 py-1 text-xs font-semibold ${actionBadgeClass(item.action)}`}>{item.action}</span>
                                <span className="text-sm font-medium text-gray-700">{item.entityType || 'N/A'}</span>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="mb-4 text-sm text-gray-600">
                            <span className="font-medium">Changed By:</span> {item.changedBy?.username || 'Unknown'} ({item.changedBy?.email || 'N/A'})
                        </div>

                        <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                            <p className="mb-2 text-sm font-semibold text-gray-700">Changes</p>
                            <ul className="space-y-3">
                                {item.changes?.map((change) => (
                                    <li key={change._id}>
                                        {change.field === 'ALL' ? (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-700">Entire record {item.action.toLowerCase()}d</p>
                                                {change.newValue && typeof change.newValue === 'object' ? (
                                                    <div className="space-y-1 rounded border border-green-200 bg-green-50 p-2">
                                                        {Object.entries(change.newValue)
                                                            .filter(([key]) => !HIDDEN_ALL_FIELDS.has(key))
                                                            .map(([key, value]) => (
                                                                <div key={key} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-start sm:gap-2">
                                                                    <span className="min-w-[130px] font-medium text-green-700 capitalize">{key}:</span>
                                                                    <span className="break-all text-green-800">{renderValue(value)}</span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-700">{renderValue(change.newValue)}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
                                                <span className="min-w-[110px] font-medium capitalize">{change.field}:</span>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded bg-red-50 px-2 py-1 text-red-700">{renderValue(change.oldValue)}</span>
                                                    <span className="text-gray-400">{'->'}</span>
                                                    <span className="rounded bg-green-50 px-2 py-1 text-green-700">{renderValue(change.newValue)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-8 text-center text-gray-500">No history found for this customer.</div>
            )}
        </div>
    );
};

export default ClientHistory;
