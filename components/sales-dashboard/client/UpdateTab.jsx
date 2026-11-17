// components/sales-dashboard/client/UpdateTab.jsx

'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { getCallHistoryService } from '@/service/calling';
import { checkNewMeetService, getCcRecipientsService } from '@/service/meeting';
import { useSalesEmployeeStore } from '@/lib/store/salesEmployeeStore';
import CallPanel from './CallPanel';
import CallHistory from './CallHistory';
import CallUpdateTab from './call-update-tab';
import MeetingUpdateTab from './meeting-update-tab';
import GeneralUpdateTab from './general-update-tab';

const UpdateTab = ({ customerId, salesPersonId }) => {
    const [newMeeting, setNewMeeting] = useState(false);
    const [meetingUpdateId, setMeetingUpdateId] = useState('');
    const [emailListData, setEmailListData] = useState([]);

    const { employee } = useSalesEmployeeStore();
    const actingUserId = employee?.user?._id || salesPersonId || '';

    const [callHistory, setCallHistory] = useState([]);
    const [callHistoryLoading, setCallHistoryLoading] = useState(false);

    // 👇 read ?tab=meeting from URL
    const searchParams = useSearchParams();
    const activeTab = searchParams?.get('tab') || '';
    const isMeetingTab = activeTab === 'meeting';

    const fetchCallHistory = async () => {
        if (!customerId) return;
        try {
            setCallHistoryLoading(true);
            const res = await getCallHistoryService(customerId, 'all');
            if (res?.success) setCallHistory(res.data || []);
        } catch (err) {
            console.log('fetchCallHistory error:', err);
        } finally {
            setCallHistoryLoading(false);
        }
    };

    useEffect(() => {
        async function CheckNewMeet() {
            try {
                const res = await checkNewMeetService(customerId);
                if (res.success) {
                    setNewMeeting(res?.newMeeting);
                    setMeetingUpdateId(res.data?.meetingUpdate?._id);
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message || 'error while checking the new meeting');
            }
        }
        if (customerId) CheckNewMeet();
    }, [customerId]);

    useEffect(() => {
        async function loadCcRecipients() {
            try {
                const res = await getCcRecipientsService();
                if (res.success) setEmailListData(res.data || []);
                else toast.error(res.message || 'Failed to load recipients');
            } catch (error) {
                console.log(error);
                toast.error(error.response?.data?.message || 'Failed to load recipients');
            }
        }
        loadCcRecipients();
    }, []);

    useEffect(() => {
        fetchCallHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId]);

    const sharedProps = {
        customerId,
        actingUserId,
        newMeeting,
        meetingUpdateId,
        emailListData,
    };

    return (
        <div className="flex flex-col-reverse">
            <CallPanel
                customerId={customerId}
                customerName="Customer"
                customerPhone="—"
                virtualNumber={process.env.NEXT_PUBLIC_MYOP_VIRTUAL_NUMBER || '—'}
                onCallStarted={() => setTimeout(fetchCallHistory, 2000)}
            />

            <div className="mb-5">
                {callHistoryLoading ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                        Loading call history…
                    </div>
                ) : (
                    <CallHistory calls={callHistory} />
                )}
            </div>

            <div className="flex gap-10">
                <CallUpdateTab {...sharedProps} />
                <MeetingUpdateTab {...sharedProps} autoCaptureLocation={isMeetingTab} />
                <GeneralUpdateTab {...sharedProps} />
            </div>
        </div>
    );
};

export default UpdateTab;
