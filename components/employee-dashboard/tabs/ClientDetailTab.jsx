// components/employee-dashboard/tabs/ClientDetailTab.jsx

'use client';

import React, { useEffect, useState } from 'react';
import Loading from '@/components/layout/Loading';
import { Building2, Calendar, FileText, Globe, Mail, MapPin, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientDetailService } from '@/service/employee-dashboard/client';

const ClientDetailTab = ({ clientId }) => {
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClientDetails = async () => {
            try {
                const res = await clientDetailService(clientId);
                if (res.success) {
                    setClient(res.data);
                } else {
                    toast.error(res.message || 'Failed to fetch client details');
                }
            } catch (error) {
                console.error('Error fetching client details:', error);
                toast.error('Something went wrong while fetching details');
            } finally {
                setLoading(false);
            }
        };

        if (clientId) {
            fetchClientDetails();
        }
    }, [clientId]);

    if (loading) return <Loading />;

    if (!client) {
        return <div className="p-4 text-center text-gray-500">No details found for this client.</div>;
    }

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-start justify-between border-b pb-4">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                        <User className="h-6 w-6 text-indigo-600" />
                        {client.name}
                    </h2>
                    <p className="mt-1 flex items-center gap-2 text-gray-600">
                        <Building2 className="h-4 w-4" /> {client.company}
                    </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                    <p>Created: {new Date(client.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Contact Information</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" /> {client.email}
                        </p>
                        <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" /> {client.phone}
                        </p>
                        <p className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" /> {client.website || 'N/A'}
                        </p>
                        <p className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                            <span>
                                {client.Address}, {client.city}, {client.state} - {client.pincode}, {client.country}
                            </span>
                        </p>
                    </div>

                    <h3 className="mt-6 text-lg font-semibold text-gray-700">Official Details</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" /> GSTIN: {client.GSTIN || 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-700">
                        <Calendar className="h-5 w-5 text-indigo-500" /> Service duration
                    </h3>
                    {client.projectCycle?.projectDuration?.length > 0 ? (
                        <div className="space-y-3">
                            {client.projectCycle.projectDuration.map((item) => (
                                <div key={item._id} className="flex items-center justify-between rounded border border-gray-200 bg-white p-3 shadow-sm">
                                    <span className="font-medium text-gray-700 capitalize">{item.service}</span>
                                    <span className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-500">
                                        Start: {new Date(item.startDate).toLocaleDateString()}
                                    </span>
                                    {item?.endDate && (
                                        <span className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-500">
                                            End: {new Date(item.endDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No active project cycles found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDetailTab;
