// components/admin-dashboard/employee/sales-work/SalesCustomerTab.jsx

'use client';

import { getSalesWorkClientService } from '@/service/admin-dashboard/employee/sales-work';
import { useEffect, useState } from 'react';
import Shemar from '@/components/layout/Skeleton';
import Link from 'next/link';

const SalesCustomerTab = ({ employeeId }) => {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchClientSales() {
        try {
            const res = await getSalesWorkClientService(employeeId);
            if (res.success) {
                setClients(res.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (employeeId) {
            fetchClientSales();
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
            {clients && clients.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
                        <Link href={`/dashboard/customer/${client._id}`} key={client._id} className="rounded-lg border bg-white p-4 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800">{client.name}</h3>
                            <p className="mb-3 text-sm text-gray-600">{client.company}</p>
                            <div className="space-y-1 text-sm">
                                <p>
                                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                                        {client.email}
                                    </a>
                                </p>
                                <p>{client.phone}</p>
                                <p>
                                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="break-all text-blue-600 hover:underline">
                                        {client.website}
                                    </a>
                                </p>
                            </div>
                            <p className="mt-3 border-t pt-3 text-xs text-gray-400">Added on: {new Date(client.createdAt).toLocaleString()}</p>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No customers found.</p>
            )}
        </div>
    );
};

export default SalesCustomerTab;
