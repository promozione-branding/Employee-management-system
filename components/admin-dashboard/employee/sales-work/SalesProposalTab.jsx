// components/admin-dashboard/employee/sales-work/SalesProposalTab.jsx

'use client';

import { getSalesWorkProposalService } from '@/service/admin-dashboard/employee/sales-work';
import { useEffect, useState } from 'react';
import Shemar from '@/components/layout/Skeleton';

const SalesProposalTab = ({ employeeId }) => {
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchProposal() {
        try {
            const res = await getSalesWorkProposalService(employeeId);
            if (res.success) {
                setProposals(res.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (employeeId) {
            fetchProposal();
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
            {proposals && proposals.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {proposals.map((item) => (
                        <div key={item._id} className="rounded-lg border bg-white p-4 shadow-sm">
                            <div className="mb-2 flex items-start justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">{item.proposalNo}</h3>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-700">Client: {item.clientName}</p>
                                <p className="text-sm text-gray-600">Company: {item.clientCompany}</p>
                                {item.clientId && (
                                    <>
                                        <p className="text-sm text-gray-600">
                                            <a href={`mailto:${item.clientId.email}`} className="text-blue-600 hover:underline">
                                                {item.clientId.email}
                                            </a>
                                        </p>
                                        {item.clientId.website && (
                                            <p className="text-sm text-gray-600">
                                                <a
                                                    href={item.clientId.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="break-all text-blue-600 hover:underline"
                                                >
                                                    {item.clientId.website}
                                                </a>
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No proposals found.</p>
            )}
        </div>
    );
};

export default SalesProposalTab;
