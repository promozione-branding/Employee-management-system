// app/manager/employee/employee-details/client/[id]/Client.jsx

'use client';

import { assignedClientService } from '@/service/admin-dashboard/employee/work';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Client = ({ employeeId }) => {
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);

    const fetchAssignedClient = async () => {
        if (!employeeId) return;

        setLoading(true);
        try {
            const res = await assignedClientService(employeeId);
            if (res.success) {
                setClients(res.data || []);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignedClient();
    }, [employeeId]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse rounded-lg border bg-white p-6 shadow-sm">
                        <div className="mb-4 h-6 w-3/4 rounded bg-gray-200"></div>
                        <div className="space-y-3">
                            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                            <div className="h-4 w-full rounded bg-gray-200"></div>
                            <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (clients.length === 0) {
        return <div className="text-gray-500">No assigned clients found.</div>;
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((item) => {
                const client = item.clientId;
                if (!client) return null;

                return (
                    <Link
                        href={`/dashboard/customer/${client._id}`}
                        key={item._id}
                        className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <h3 className="mb-2 text-lg font-semibold text-gray-800">{client.name}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                                <span className="font-medium">Company:</span> {client.company}
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="font-medium">Email:</span> {client.email}
                            </p>
                            {client.website && (
                                <p className="flex items-center gap-2">
                                    <span className="font-medium">Website:</span>
                                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="truncate text-blue-600 hover:underline">
                                        {client.website}
                                    </a>
                                </p>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default Client;
