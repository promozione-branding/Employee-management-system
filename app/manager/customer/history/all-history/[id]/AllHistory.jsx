// app/manager/customer/history/all-history/[id]/AllHistory.jsx

'use client';

import Loading from '@/components/layout/Loading';
import { getAllHistory } from '@/service/customer';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Pagination from './Pagination';

const AllHistory = ({ customerId }) => {
    const [allHistoryData, setAllHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
    });

    async function getAllHistoryFetched(page = 1) {
        try {
            setLoading(true);
            const res = await getAllHistory(customerId, page);
            if (res.success) {
                setAllHistoryData(res.data);
                // Extract totalPages from pagination object in API response
                setPagination({
                    currentPage: page,
                    totalPages: res.pagination?.totalPages || 1,
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to get all history');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (customerId) {
            // Fetch the first page when the component mounts or customerId changes.
            getAllHistoryFetched(1);
        }
    }, [customerId]);

    const renderValue = (value) => {
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="flex h-[92vh] flex-col">
            <h2 className="mb-4 text-2xl font-semibold">History Log</h2>
            <div className="h-[55vh] flex-1 space-y-4 overflow-y-scroll">
                {allHistoryData.length > 0 ? (
                    allHistoryData.map((item) => (
                        <div key={item._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow">
                            <div className="mb-2 flex flex-col justify-between md:flex-row md:items-center">
                                <div className="mb-2 flex items-center gap-2 md:mb-0">
                                    <span
                                        className={`rounded px-2 py-1 text-xs font-bold uppercase ${
                                            item.action === 'CREATE'
                                                ? 'bg-green-100 text-green-800'
                                                : item.action === 'UPDATE'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {item.action}
                                    </span>
                                    <span className="font-medium text-gray-700">{item.entityType}</span>
                                </div>
                                <span className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
                            </div>

                            <div className="mb-3 text-sm text-gray-600">
                                <span className="font-medium">Changed By:</span> {item.changedBy?.username} ({item.changedBy?.email})
                            </div>

                            {item.changes && item.changes.length > 0 && (
                                <div className="rounded bg-gray-50 p-3 text-sm">
                                    <p className="mb-2 font-semibold text-gray-700">Changes:</p>
                                    <ul className="space-y-2">
                                        {item.changes.map((change) => (
                                            <li key={change._id} className="wrap-break-word">
                                                {change.field === 'ALL' ? (
                                                    <div className="space-y-2">
                                                        <p className="font-semibold text-gray-700 capitalize">Entire record {item.action.toLowerCase()}d</p>
                                                        {change.newValue && typeof change.newValue === 'object' ? (
                                                            <div className="space-y-1 rounded border border-green-200 bg-green-50 p-2 text-sm">
                                                                {Object.entries(change.newValue).map(([key, value]) => (
                                                                    <div key={key} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2">
                                                                        <span className="min-w-[120px] font-medium text-green-700 capitalize">{key}:</span>
                                                                        <span className="break-words text-green-800">{renderValue(value)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-500">{renderValue(change.newValue)}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                                                        <span className="min-w-[100px] font-medium capitalize">{change.field}:</span>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="rounded bg-red-50 px-1 text-red-700 line-through decoration-red-500/50">
                                                                {renderValue(change.oldValue)}
                                                            </span>
                                                            <span className="text-gray-400">→</span>
                                                            <span className="rounded bg-green-50 px-1 text-green-700">{renderValue(change.newValue)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-center text-gray-500">No history found for this customer.</div>
                )}
            </div>
            <div className="shrink-0 border-t py-2">
                <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={getAllHistoryFetched} />
            </div>
        </div>
    );
};

export default AllHistory;
