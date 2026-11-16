// components/wasteComponents/history/ClientHistory.jsx

'use client';

import Loading from '@/components/layout/Loading';
import { getClientHistoryService } from '@/service/customer';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
};

const ClientHistory = ({ customerId }) => {
    const [loading, setLoading] = useState(true);
    const [clientHistoryData, setClientHistoryData] = useState([]);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        async function getClientHistory() {
            try {
                const res = await getClientHistoryService(customerId);
                if (res.success) {
                    setClientHistoryData(res.data);
                    setPagination(res.pagination || null);
                    toast.success(res.message || 'Client history fetched');
                }
            } catch (error) {
                console.log(error);
                setClientHistoryData([]);
                toast.error(error.response.data.message || 'Error while fetching the client history');
            } finally {
                setLoading(false);
            }
        }
        getClientHistory();
    }, [customerId]);

    return (
        <div className="w-full">
            {loading ? (
                <Loading />
            ) : (
                <div className="space-y-4">
                    {clientHistoryData?.length > 0 ? (
                        clientHistoryData.map((history) => (
                            <div key={history._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow">
                                <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b pb-3">
                                    <div>
                                        <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                            {history.action}
                                        </span>
                                        <span className="ml-2 inline-block rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                                            {history.entityType || 'N/A'}
                                        </span>
                                        <span className="ml-2 text-sm text-gray-500">{new Date(history.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{history.changedBy?.username || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500">
                                            {history.changedBy?.email} ({history.changedBy?.role})
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                    <p className="text-gray-600">
                                        <span className="font-semibold text-gray-800">History ID:</span> {history._id}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-semibold text-gray-800">Client ID:</span> {history.clientId || 'N/A'}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-semibold text-gray-800">Entity ID:</span> {history.entityId || 'N/A'}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-semibold text-gray-800">Updated At:</span>{' '}
                                        {history.updatedAt ? new Date(history.updatedAt).toLocaleString() : 'N/A'}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-semibold text-gray-800">Version:</span> {history.__v ?? 'N/A'}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 gap-3 text-xs font-semibold text-gray-500 uppercase lg:grid-cols-3">
                                        <div>Field</div>
                                        <div>Old Value</div>
                                        <div>New Value</div>
                                    </div>
                                    {history.changes?.map((change) => (
                                        <div
                                            key={change._id}
                                            className="grid grid-cols-1 gap-3 rounded-md border border-gray-100 p-3 py-3 text-sm lg:grid-cols-3"
                                        >
                                            <div className="font-medium text-gray-700">
                                                <p>{change.field}</p>
                                                <p className="mt-1 text-xs text-gray-500">{change._id}</p>
                                            </div>
                                            <div className="break-words text-red-600">
                                                <pre className="rounded-md border border-red-100 bg-red-50 p-2 text-xs break-words whitespace-pre-wrap">
                                                    {formatValue(change.oldValue)}
                                                </pre>
                                            </div>
                                            <div className="break-words text-green-600">
                                                <pre className="rounded-md border border-green-100 bg-green-50 p-2 text-xs break-words whitespace-pre-wrap">
                                                    {formatValue(change.newValue)}
                                                </pre>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-gray-500">No history found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientHistory;
