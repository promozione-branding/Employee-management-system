// components/admin-dashboard/employee/sales-work/SalesUpdateTab.jsx

'use client';

import { getUpdateService } from '@/service/admin-dashboard/employee/sales-work';
import React, { useEffect, useState } from 'react';
import Shemar from '@/components/layout/Skeleton';

const SalesUpdateTab = ({ employeeId }) => {
    const [updates, setUpdates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchMeetingUpdates() {
        try {
            const res = await getUpdateService(employeeId);
            if (res.success) {
                setUpdates(res.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (employeeId) {
            fetchMeetingUpdates();
        }
    }, [employeeId]);

    if (isLoading) {
        return (
            <div className="mt-5">
                <Shemar count={3} />
            </div>
        );
    }

    return (
        <div className="mt-5">
            {updates && updates.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {updates.map((item) => (
                        <div key={item._id} className="flex flex-col justify-between rounded-lg border bg-white p-4 shadow-sm">
                            <div>
                                <div className="mb-2 flex items-start justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800 capitalize">{item.updateType}</h3>
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                                            item.status === 'not-interested'
                                                ? 'bg-red-100 text-red-800'
                                                : item.status === 'talk'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-green-100 text-green-800'
                                        }`}
                                    >
                                        {item.status.replace('-', ' ')}
                                    </span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="font-medium text-gray-700">Client: {item.client.name}</p>
                                    <p className="text-gray-600">Company: {item.client.company}</p>
                                    {item.note && (
                                        <p className="mt-2 rounded bg-gray-50 p-2 text-gray-700">
                                            <span className="font-medium">Note:</span> {item.note}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                {item.reminderAt && <p className="mt-3 text-xs text-gray-500">Reminder: {new Date(item.reminderAt).toLocaleString()}</p>}
                                <p className="mt-3 border-t pt-3 text-xs text-gray-400">Created: {new Date(item.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No updates found.</p>
            )}
        </div>
    );
};

export default SalesUpdateTab;
