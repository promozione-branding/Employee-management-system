// components/sales-dashboard/client/meeting-update-tab.jsx

'use client';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TimePicker from '@/components/ui/time-picker';
import CcPicker from './cc-picker';
import LocationPicker from './location-picker';
import { captureLocation, toLocalISO } from './update-utils';
import { addNewMeetingUpdate, createMeetingService } from '@/service/meeting';

const emptyForm = {
    status: '',
    note: '',
    reminderTime: '',
    reminderDate: '',
    meetingTime: '',
    meetingDate: '',
};

const MeetingUpdateTab = ({
    customerId,
    actingUserId,
    newMeeting,
    meetingUpdateId,
    emailListData,
    autoCaptureLocation = false,
}) => {
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [recipients, setRecipients] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [location, setLocation] = useState(null);
    const [locating, setLocating] = useState(false);
    const autoRanRef = useRef(false);

    // auto-request location on mount when meeting tab is active
    useEffect(() => {
        if (!autoCaptureLocation) return;
        if (autoRanRef.current) return;
        autoRanRef.current = true;

        let cancelled = false;
        (async () => {
            try {
                setLocating(true);
                const loc = await captureLocation();
                if (!cancelled) {
                    setLocation(loc);
                    toast.success('Location captured');
                }
            } catch (err) {
                const msg =
                    err?.code === 1
                        ? 'Location permission denied — please allow it in browser settings'
                        : err?.code === 2
                        ? 'Location unavailable — try again'
                        : err?.code === 3
                        ? 'Location request timed out — try again'
                        : err?.message || 'Could not get location';
                toast.error(msg);
            } finally {
                if (!cancelled) setLocating(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [autoCaptureLocation]);

    const toggleRecipient = (user) => {
        setRecipients((prev) => {
            const exists = prev.some((s) => s?._id === user?._id);
            return exists ? prev.filter((s) => s._id !== user?._id) : [...prev, user];
        });
    };

    const reset = () => {
        setRecipients([]);
        setSearch('');
        setForm(emptyForm);
        setLocation(null);
    };

    const buildPayload = () => ({
        salesPersonId: actingUserId,
        salesPerson: recipients.map((u) => u?._id),
        clientId: customerId,
        updateType: 'meeting',
        status: form?.status,
        note: form?.note,
        meetingAt: toLocalISO(form.meetingDate, form.meetingTime),
        reminderAt: toLocalISO(form.reminderDate, form.reminderTime),
        sendToSelf: true,
        ccAdmin: true,
        mailRecipients: recipients.map((u) => u?._id),
        location, // mandatory now
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!location) {
            toast.error('Location is required to submit a meeting update');
            return;
        }
        setLoading(true);
        if (!actingUserId) {
            toast.error('please provide sale person id');
            setLoading(false);
            return;
        }
        const formData = buildPayload();
        if (!formData?.salesPersonId || !formData?.clientId) {
            toast.error('client id and salesPersonId not found');
            setLoading(false);
            return;
        }
        try {
            const res = await createMeetingService(formData);
            if (res.success) {
                toast.success(res.message || 'Meet has been created');
                reset();
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'Error while create meeting');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!location) {
            toast.error('Location is required to submit a meeting update');
            return;
        }
        setLoading(true);
        const formData = buildPayload();
        if (!formData?.salesPersonId || !formData?.clientId) {
            toast.error('client id and salesPersonId not found');
            setLoading(false);
            return;
        }
        try {
            if (meetingUpdateId !== '') {
                const res = await addNewMeetingUpdate(meetingUpdateId, formData);
                if (res.success) {
                    toast.success(res.message || 'Meet has been Updated');
                    reset();
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'Error while Updating meeting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-1/3">
            <h2 className="mb-5 text-center text-2xl font-bold">Meeting Update</h2>
            <form onSubmit={newMeeting ? handleCreate : handleUpdate} className="flex flex-col gap-2">
                <div className="flex flex-col gap-3">
                    <Label>Interested</Label>
                    <Select required value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Client Interested" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="interested">Interested</SelectItem>
                            <SelectItem value="not-interested">Not-Interested</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-3">
                    <Label>Note</Label>
                    <Textarea required value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
                <div className="flex flex-col gap-3">
                    <Label>Reminder</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <TimePicker value={form.reminderTime} onChange={(v) => setForm({ ...form, reminderTime: v })} />
                        <Input type="date" value={form.reminderDate} onChange={(e) => setForm({ ...form, reminderDate: e.target.value })} />
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <Label>Meeting Date</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <TimePicker value={form.meetingTime} onChange={(v) => setForm({ ...form, meetingTime: v })} />
                        <Input type="date" value={form.meetingDate} onChange={(e) => setForm({ ...form, meetingDate: e.target.value })} />
                    </div>
                </div>

                <LocationPicker value={location} onChange={setLocation} required />

                <div className="flex flex-col gap-2 rounded-lg border bg-blue-50/50 p-3">
                    <div className="text-xs text-gray-700">
                        Mail will be sent to you + <strong>admin</strong> (CC). Tick employees below to add them to CC.
                    </div>
                    <CcPicker
                        title="CC employees (optional)"
                        employees={emailListData}
                        selected={recipients}
                        onToggle={toggleRecipient}
                        search={search}
                        setSearch={setSearch}
                    />
                </div>

                <Button className="w-full" disabled={loading || !location}>
                    Meeting Update
                </Button>
            </form>
        </div>
    );
};

export default MeetingUpdateTab;
