// components/employee-dashboard/tabs/WorkProgressTab.jsx

'use client';

import Loading from '@/components/layout/Loading';
import { GetClientWorkDetailHistory } from '@/service/customer/history';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const WorkProgressTab = ({ customerId }) => {
    const [loading, setLoading] = useState(true);
    const [clientWorkData, setClientWorkData] = useState([]);

    async function fetchClientWorkDetail() {
        try {
            const res = await GetClientWorkDetailHistory(customerId);
            if (res.success) {
                setLoading(false);
                setClientWorkData(res?.data?.workDetails);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message || 'Error while fetching the client work details');
        }
    }

    useEffect(() => {
        fetchClientWorkDetail();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="h-[90vh] space-y-6 overflow-auto p-4 md:p-6">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Work History Details</h2>
            {clientWorkData.length === 0 ? (
                <div className="py-8 text-center text-gray-500">No work history available for this client.</div>
            ) : (
                clientWorkData.map((work) => (
                    <div key={work._id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        {/* Header Section */}
                        <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4 md:flex-row md:items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{work.department} Department</h3>
                                <p className="mt-1 text-sm text-gray-500">Started: {new Date(work.startedAt).toLocaleString()}</p>
                                <div className="mt-2 flex items-center gap-3">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase ${
                                            work.status === 'COMPLETED'
                                                ? 'bg-green-100 text-green-800'
                                                : work.status === 'IN_PROGRESS'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {work.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            {work.progressPercentage && (
                                <div className="w-full md:w-64">
                                    <div className="mb-1 flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500">Progress</span>
                                        <span className="text-xs font-bold text-gray-700">
                                            {work.progressPercentage.totalField > 0
                                                ? Math.round((work.progressPercentage.completeField / work.progressPercentage.totalField) * 100)
                                                : 0}
                                            %
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                                            style={{
                                                width: `${
                                                    work.progressPercentage.totalField > 0
                                                        ? (work.progressPercentage.completeField / work.progressPercentage.totalField) * 100
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                    <div className="mt-1 text-right text-xs text-gray-400">
                                        {work.progressPercentage.completeField} / {work.progressPercentage.totalField} Completed
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 p-6">
                            {/* Employees Section */}
                            <div>
                                <h4 className="mb-3 text-sm font-semibold tracking-wider text-gray-700 uppercase">Team Members</h4>
                                <div className="flex flex-wrap gap-3">
                                    {work.employeeId.map((emp) => (
                                        <div key={emp._id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                                {emp.basicDetails.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{emp.basicDetails.name}</p>
                                                <p className="text-xs text-gray-500">{emp.basicDetails.designation}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Checklist Section */}
                            <div>
                                <h4 className="mb-3 text-sm font-semibold tracking-wider text-gray-700 uppercase">Task Checklist</h4>
                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Task</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Completed At</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Remarks</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">CompletedBy</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Proof</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {work.checklist.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.label}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {item.completed ? (
                                                            <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                                Completed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">
                                                        {item.completedAt ? new Date(item.completedAt).toLocaleString() : '-'}
                                                    </td>
                                                    <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-500">{item.remarks || '-'}</td>
                                                    <td className="max-w-xs truncate px-4 py-3 text-sm font-medium text-black capitalize">
                                                        {item?.completedBy?.basicDetails?.name || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-blue-600">
                                                        {item.proofUrl ? (
                                                            <a
                                                                href={item.proofUrl.startsWith('http') ? item.proofUrl : `https://${item.proofUrl}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:underline"
                                                            >
                                                                View Proof
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default WorkProgressTab;
