// app/dashboard/customer/meeting/meetingHistory/MeetingHistory.jsx

'use client';

import Loading from '@/components/layout/Loading';
import { clientMeetingHistory } from '@/service/meeting';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const MeetingHistory = ({ customerId }) => {
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState([]);

    console.log(historyData, 'historyData');

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
        handleCustomerHistoryFetch();
    }, [customerId]);

    return (
        <div>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <div className="mb-4 grid grid-cols-6 gap-5 font-medium">
                        <div>S.No</div>
                        <div>Meeting Type</div>
                        <div>Notes</div>
                        <div>Status</div>
                        <div>Meeting At</div>
                        <div>Sales Person</div>
                    </div>
                    <div className="">
                        {historyData?.length > 0 ? (
                            historyData?.map((item, idx) => (
                                <div key={item?._id} className="grid grid-cols-6 gap-5 border-b">
                                    <div>{idx + 1}</div>
                                    <div>{item?.updateType}</div>
                                    <div className="text-sm">{item?.note}</div>
                                    <div className="">{item?.status}</div>
                                    <div className="">{new Date(item?.meetingAt).toLocaleString()}</div>
                                    <div className="">{item?.salesPersonId?.username}</div>
                                </div>
                            ))
                        ) : (
                            <div>No history available</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MeetingHistory;
