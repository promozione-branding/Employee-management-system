// app/sales-dashboard/clients/history/sales-history/[id]/MeetingHistory.jsx
'use client';

import Loading from '@/components/layout/Loading';
import { clientMeetingHistory } from '@/service/meeting';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import CallHistoryList from '@/components/sales-dashboard/client/CallHistoryList';
import { CalendarDays, X } from 'lucide-react';

const TABS = [
    { id: 'updates', label: 'Updates' },
    { id: 'calls', label: 'Calls' },
];

const TYPE_FILTERS = [
    { id: '', label: 'All' },
    { id: 'call', label: 'Call' },
    { id: 'meeting', label: 'Meeting' },
    { id: 'general', label: 'General' },
];

const DATE_PRESETS = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'custom', label: 'Custom' },
];

// ------------------------------------------------------------------
// Local calendar-day helpers
// ------------------------------------------------------------------
function toLocalDateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// The date we filter/sort on.
// General updates have no meetingAt → fall back to createdAt
function recordDate(item) {
    return item?.meetingAt || item?.createdAt || null;
}

// Inclusive day-range test on the record's effective date.
function inDateRange(item, fromStr, toStr) {
    if (!fromStr && !toStr) return true;
    const raw = recordDate(item);
    if (!raw) return false;
    const dt = new Date(raw);
    if (isNaN(dt.getTime())) return false;
    const dayStr = toLocalDateStr(dt);
    if (fromStr && dayStr < fromStr) return false;
    if (toStr && dayStr > toStr) return false;
    return true;
}

// ------------------------------------------------------------------
// Sort:
//  - upcoming meetings first (soonest meetingAt)
//  - then everything else by createdAt DESC (latest update first)
// ------------------------------------------------------------------
function sortForDisplay(items) {
    const now = Date.now();
    const meetingTime = (item) => {
        const v = item?.meetingAt ? new Date(item.meetingAt).getTime() : 0;
        return isNaN(v) ? 0 : v;
    };
    const createdTime = (item) => {
        const v = item?.createdAt ? new Date(item.createdAt).getTime() : 0;
        return isNaN(v) ? 0 : v;
    };

    const upcoming = [];
    const rest = [];

    for (const item of items) {
        const mt = meetingTime(item);
        if (mt && mt >= now) upcoming.push(item);
        else rest.push(item);
    }

    upcoming.sort((a, b) => meetingTime(a) - meetingTime(b));

    rest.sort((a, b) => {
        const dc = createdTime(b) - createdTime(a);
        if (dc !== 0) return dc;
        return meetingTime(b) - meetingTime(a);
    });

    return [...upcoming, ...rest];
}

// Normalize "who updated"
function getActor(item) {
    const p = item?.salesPersonId;
    if (!p) return { name: 'Unknown', email: '', role: '' };
    if (typeof p === 'string') return { name: p, email: '', role: '' };
    return {
        name: p.username || p.name || p.fullName || 'Unknown',
        email: p.email || '',
        role: p.role || p.userType || '',
    };
}

const MeetingHistory = ({ customerId }) => {
    const [activeTab, setActiveTab] = useState('updates');
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState([]);

    const [typeFilter, setTypeFilter] = useState('');
    const [datePreset, setDatePreset] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        async function handleCustomerHistoryFetch() {
            try {
                const res = await clientMeetingHistory(customerId);
                if (res.success) {
                    setHistoryData(res.data?.meetingUpdate?.meetingUpdate || []);
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message || 'Error while fetching customer history');
            } finally {
                setLoading(false);
            }
        }
        if (customerId) handleCustomerHistoryFetch();
    }, [customerId]);

    const { from, to } = useMemo(() => {
        const today = new Date();
        const todayStr = toLocalDateStr(today);

        if (datePreset === 'today') return { from: todayStr, to: todayStr };
        if (datePreset === 'yesterday') {
            const y = new Date(today);
            y.setDate(y.getDate() - 1);
            const yStr = toLocalDateStr(y);
            return { from: yStr, to: yStr };
        }
        if (datePreset === 'custom') return { from: fromDate, to: toDate };
        return { from: '', to: '' };
    }, [datePreset, fromDate, toDate]);

    const displayed = useMemo(() => {
        let list = historyData || [];
        if (typeFilter) {
            list = list.filter((i) => (i?.updateType || '').toLowerCase() === typeFilter);
        }
        list = list.filter((i) => inDateRange(i, from, to));
        return sortForDisplay(list);
    }, [historyData, typeFilter, from, to]);

    const counts = useMemo(() => {
        const now = Date.now();
        let upcoming = 0;
        let past = 0;
        let total = 0;
        (historyData || []).forEach((item) => {
            if (typeFilter && (item?.updateType || '').toLowerCase() !== typeFilter) return;
            if (!inDateRange(item, from, to)) return;
            total++;
            const mt = item?.meetingAt ? new Date(item.meetingAt).getTime() : 0;
            if (mt && !isNaN(mt)) {
                if (mt >= now) upcoming++;
                else past++;
            }
        });
        return { upcoming, past, total };
    }, [historyData, typeFilter, from, to]);

    const clearFilters = () => {
        setTypeFilter('');
        setDatePreset('all');
        setFromDate('');
        setToDate('');
    };

    const anyFilter = Boolean(typeFilter || datePreset !== 'all' || fromDate || toDate);

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

            {activeTab === 'updates' && (
                <>
                    {loading ? (
                        <Loading />
                    ) : (
                        <>
                            {/* Filters */}
                            <div className="mb-4 space-y-3 rounded-lg border border-gray-200 bg-white p-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="mr-1 text-xs font-medium text-gray-500 uppercase">Type:</span>
                                    {TYPE_FILTERS.map((f) => (
                                        <button
                                            key={f.id || 'all'}
                                            type="button"
                                            onClick={() => setTypeFilter(f.id)}
                                            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                                typeFilter === f.id
                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="mr-1 text-xs font-medium text-gray-500 uppercase">Date:</span>
                                    {DATE_PRESETS.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                                setDatePreset(p.id);
                                                if (p.id !== 'custom') {
                                                    setFromDate('');
                                                    setToDate('');
                                                }
                                            }}
                                            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                                datePreset === p.id
                                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}

                                    {datePreset === 'custom' && (
                                        <div className="ml-2 flex flex-wrap items-center gap-2">
                                            <div className="relative">
                                                <CalendarDays className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={fromDate}
                                                    max={toDate || undefined}
                                                    onChange={(e) => setFromDate(e.target.value)}
                                                    className="rounded-md border border-gray-200 bg-white py-1.5 pr-2 pl-8 text-sm"
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400">to</span>
                                            <div className="relative">
                                                <CalendarDays className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={toDate}
                                                    min={fromDate || undefined}
                                                    onChange={(e) => setToDate(e.target.value)}
                                                    className="rounded-md border border-gray-200 bg-white py-1.5 pr-2 pl-8 text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {anyFilter && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="ml-auto inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Summary chips */}
                            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                <span className="rounded bg-gray-100 px-2 py-1">
                                    Total <b className="text-gray-800">{counts.total}</b>
                                </span>
                                <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">
                                    Upcoming <b>{counts.upcoming}</b>
                                </span>
                                <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">
                                    Past <b>{counts.past}</b>
                                </span>
                            </div>

                            {displayed.length === 0 ? (
                                <div className="rounded-lg bg-white p-10 text-center text-sm text-gray-500 shadow-md">
                                    {anyFilter ? 'No updates match the current filters.' : 'No history available.'}
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg bg-white shadow-md">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">S.No</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Type</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Updated By</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Notes</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Meeting At</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Reminder At</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {displayed.map((item, idx) => {
                                                const isUpcoming = item?.meetingAt && new Date(item.meetingAt).getTime() >= Date.now();
                                                const actor = getActor(item);
                                                const type = (item?.updateType || 'meeting').toLowerCase();

                                                return (
                                                    <tr key={item?._id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-500">{idx + 1}</td>
                                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                            <span
                                                                className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${
                                                                    type === 'call'
                                                                        ? 'bg-blue-50 text-blue-700'
                                                                        : type === 'meeting'
                                                                          ? 'bg-purple-50 text-purple-700'
                                                                          : 'bg-gray-100 text-gray-700'
                                                                }`}
                                                            >
                                                                {type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <p className="max-w-[180px] truncate font-medium text-gray-800">{actor.name}</p>
                                                            {actor.email && (
                                                                <p className="max-w-[180px] truncate text-xs text-gray-500">{actor.email}</p>
                                                            )}
                                                            {actor.role && (
                                                                <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 uppercase">
                                                                    {actor.role}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-500" title={item?.note}>
                                                            {item?.note || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-500 capitalize">
                                                            {item?.status || 'Pending'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                            <span className={isUpcoming ? 'font-medium text-blue-700' : 'text-gray-500'}>
                                                                {item?.meetingAt
                                                                    ? new Date(item.meetingAt).toLocaleString([], {
                                                                          dateStyle: 'medium',
                                                                          timeStyle: 'short',
                                                                      })
                                                                    : 'N/A'}
                                                            </span>
                                                            {isUpcoming && (
                                                                <span className="ml-2 inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 uppercase">
                                                                    upcoming
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-500">
                                                            {item?.reminderAt
                                                                ? new Date(item.reminderAt).toLocaleString([], {
                                                                      dateStyle: 'medium',
                                                                      timeStyle: 'short',
                                                                  })
                                                                : 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-500">
                                                            {item?.createdAt
                                                                ? new Date(item.createdAt).toLocaleString([], {
                                                                      dateStyle: 'medium',
                                                                      timeStyle: 'short',
                                                                  })
                                                                : '—'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Calls tab — unchanged */}
            {activeTab === 'calls' && <CallHistoryList customerId={customerId} scope="all" />}
        </div>
    );
};

export default MeetingHistory;