// components/sales-dashboard/client/call-update-tab.jsx

'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TimePicker from '@/components/ui/time-picker';
import CcPicker from './cc-picker';
import { toLocalISO } from './update-utils';
import { addNewMeetingUpdate, createMeetingService } from '@/service/meeting';

const emptyForm = {
    status: '',
    note: '',
    reminderTime: '',
    reminderDate: '',
    meetingTime: '',
    meetingDate: '',
};

const CallUpdateTab = ({ customerId, actingUserId, newMeeting, meetingUpdateId, emailListData }) => {
    const [loading, setLoading] = useState(false);
    const [sendMail, setSendMail] = useState(false);
    const [search, setSearch] = useState('');
    const [recipients, setRecipients] = useState([]);
    const [form, setForm] = useState(emptyForm);

    const toggleRecipient = (user) => {
        setRecipients((prev) => {
            const exists = prev.some((s) => s?._id === user?._id);
            return exists ? prev.filter((s) => s._id !== user?._id) : [...prev, user];
        });
    };

    const reset = () => {
        setRecipients([]);
        setSendMail(false);
        setSearch('');
        setForm(emptyForm);
    };

    const buildPayload = () => ({
        salesPersonId: actingUserId,
        salesPerson: sendMail ? recipients.map((u) => u?._id) : [],
        clientId: customerId,
        updateType: 'call',
        status: form?.status,
        note: form?.note,
        meetingAt: toLocalISO(form.meetingDate, form.meetingTime),
        reminderAt: toLocalISO(form.reminderDate, form.reminderTime),
        sendToSelf: sendMail,
        ccAdmin: sendMail,
        mailRecipients: sendMail ? recipients.map((u) => u?._id) : [],
    });

    const handleCreate = async (e) => {
        e.preventDefault();
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
            <h2 className="mb-5 text-center text-2xl font-bold">Call Update</h2>
            <form onSubmit={newMeeting ? handleCreate : handleUpdate} className="flex flex-col gap-2">
                <div className="flex flex-col gap-3">
                    <Label>Call Update</Label>
                    <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Talk" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="talk">Talk</SelectItem>
                            <SelectItem value="no-talk">No Talk</SelectItem>
                            <SelectItem value="appointment">Appointment</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-3">
                    <Label>Note</Label>
                    <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
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

                <div className="flex flex-col gap-2 rounded-lg border bg-gray-50 p-3">
                    <Label>Send mail?</Label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="callSendMail" checked={!sendMail} onChange={() => setSendMail(false)} />
                            No
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="callSendMail" checked={sendMail} onChange={() => setSendMail(true)} />
                            Yes
                        </label>
                    </div>
                    {sendMail && (
                        <CcPicker
                            title="Choose CC recipients (self + admin always CC'd)"
                            employees={emailListData}
                            selected={recipients}
                            onToggle={toggleRecipient}
                            search={search}
                            setSearch={setSearch}
                        />
                    )}
                </div>

                <Button className="w-full" disabled={loading}>
                    Call Update
                </Button>
            </form>
        </div>
    );
};

export default CallUpdateTab;
