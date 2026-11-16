// components/sales-dashboard/activity/CustomerTab.jsx

'use client';

import { clientListService } from '@/service/sales-dashboard/activity';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Globe, Mail, Phone, User } from 'lucide-react';
import Skeleton from '@/components/layout/Skeleton';
import Link from 'next/link';

const CustomerTab = ({ employeeId }) => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchClient() {
        try {
            setLoading(true);
            const res = await clientListService(employeeId);
            if (res.success) {
                setClients(res.data);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to fetch clients');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (employeeId) {
            fetchClient();
        }
    }, [employeeId]);

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 rounded-lg border bg-white p-4 shadow-sm">
                        <Skeleton count={3} />
                    </div>
                ))}
            </div>
        );
    }

    if (!clients.length) {
        return <div className="flex h-40 items-center justify-center text-gray-500">No clients found</div>;
    }

    return (
        <div className="mt-4 grid h-[calc(100vh-220px)] gap-4 overflow-y-auto pr-2 pb-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
                <Link
                    href={`/sales-dashboard/clients/69940a64f0b76fbee01408c3/${client._id}`}
                    key={client._id}
                    className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                    <div>
                        <div className="mb-3 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-50 p-2.5 text-blue-600">
                                    <User size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800">{client.name}</h3>
                                    <p className="text-xs text-gray-500">{client.company}</p>
                                </div>
                            </div>
                            <span className="rounded-full bg-gray-50 px-2 py-1 text-[10px] text-gray-400">{formatDate(client.createdAt)}</span>
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />
                                <span className="truncate">{client.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                <span>{client.phone}</span>
                            </div>
                            {client.website && (
                                <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-gray-400" />
                                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="truncate text-blue-500 hover:underline">
                                        {client.website}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 border-t border-gray-50 pt-3">
                        <div className="flex w-fit items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1.5 text-xs font-medium text-purple-600">
                            <FileText size={14} />
                            <span>Proposals: {client.proposals?.length || 0}</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default CustomerTab;
