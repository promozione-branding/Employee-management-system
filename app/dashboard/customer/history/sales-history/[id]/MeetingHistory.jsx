// app/dashboard/customer/history/sales-history/[id]/MeetingHistory.jsx

'use client';

import Loading from '@/components/layout/Loading';
import { clientMeetingHistory } from '@/service/meeting';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CallHistoryList from '@/components/sales-dashboard/client/CallHistoryList';

const TABS = [
    { id: 'updates', label: 'Updates' },
    { id: 'calls', label: 'Calls' },
];

const MeetingHistory = ({ customerId }) => {
    const [activeTab, setActiveTab] = useState('updates');
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        async function handleCustomerHistoryFetch() {
            try {
                const res = await clientMeetingHistory(customerId);
                if (res.success) {
                    setHistoryData(res.data?.meetingUpdate?.meetingUpdate);
                    setLoading(false);
                }
            } catch (error) {
                console.log(error);
                setLoading(false);
                toast.error(error.message || 'Error while fetching customer history');
            }
        }
        if (customerId) handleCustomerHistoryFetch();
    }, [customerId]);

    return (
        <div>
            {/* Tabs */}
            <div className="mb-5 flex items-center gap-2 border-b border-gray-200">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                            activeTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Updates tab — original content */}
            {activeTab === 'updates' && (
                <>
                    {loading ? (
                        <Loading />
                    ) : (
                        <div className="overflow-x-auto rounded-lg bg-white shadow-md">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">S.No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Meeting Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Notes</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Meeting At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Reminder At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Sales Person</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {historyData?.length > 0 ? (
                                        historyData.map((item, idx) => (
                                            <tr key={item?._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{idx + 1}</td>
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 capitalize">
                                                    {item?.updateType || 'Meeting'}
                                                </td>
                                                <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500" title={item?.note}>
                                                    {item?.note || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 capitalize">{item?.status || 'Pending'}</td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                    {item?.meetingAt
                                                        ? new Date(item.meetingAt).toLocaleString([], {
                                                              dateStyle: 'medium',
                                                              timeStyle: 'short',
                                                          })
                                                        : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                    {item?.reminderAt
                                                        ? new Date(item.reminderAt).toLocaleString([], {
                                                              dateStyle: 'medium',
                                                              timeStyle: 'short',
                                                          })
                                                        : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm whitespace-nowrap text-gray-500">
                                                    {item?.salesPersonId?.username || 'Unknown'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-10 text-center text-sm text-gray-500">
                                                No history available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Calls tab — new */}
            {activeTab === 'calls' && <CallHistoryList customerId={customerId} scope="all" />}
        </div>
    );
};

export default MeetingHistory;
