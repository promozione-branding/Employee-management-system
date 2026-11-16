// app/employee-dashboard/announcement/page.jsx

'use client';

import Loading from '@/components/layout/Loading';
import { useEmployeeStore } from '@/lib/store/EmployeeStore';
import { getListAnnouncementService } from '@/service/employee-dashboard/announcement';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, User, Megaphone } from 'lucide-react';

const Announcement = () => {
    const { employee } = useEmployeeStore();
    const [loading, setLoading] = useState(true);
    const [announcementList, setAnnouncementList] = useState([]);

    const designation_value = employee?.basicDetails?.designation;

    async function fetchAnnouncement() {
        try {
            if (designation_value === undefined) return;
            const res = await getListAnnouncementService(designation_value);
            if (res?.success) {
                setAnnouncementList(res?.data);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || 'error while fetching the announcement');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (designation_value === undefined) return;
        fetchAnnouncement();
    }, [designation_value]);

    if (loading) return <Loading />;
    return (
        <div className="mx-auto max-w-7xl p-6">
            <div className="mb-8 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                    <Megaphone className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            </div>

            {announcementList.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                    <p className="text-gray-500">No announcements available at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {announcementList.map((announcement) => (
                        <div
                            key={announcement._id}
                            className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
                        >
                            <div className="flex-1 p-5">
                                <div className="mb-3 flex items-start justify-between">
                                    <h3 className="line-clamp-2 text-lg font-semibold text-gray-900" title={announcement.title}>
                                        {announcement.title}
                                    </h3>
                                    {announcement.targetDepartment && (
                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium tracking-wider text-gray-600 uppercase">
                                            {announcement.targetDepartment.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                </div>
                                <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-gray-600">{announcement.content}</p>
                            </div>

                            <div className="mt-auto border-t border-gray-100 bg-gray-50 px-5 py-3">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="capitalize">{announcement.author?.username || 'Admin'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{new Date(announcement.startDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Announcement;
