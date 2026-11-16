// components/layout/employee-dashboard/EmployeeNavbar.jsx

'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Search, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/service/axiosInstance';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { useEmployeeStore } from '@/lib/store/EmployeeStore';
import { noticationAnnouncementService } from '@/service/employee-dashboard/announcement';

const EmployeeNavbar = () => {
    const { employee } = useEmployeeStore();

    const [openEmployeeDetails, setOpenEmployeeDetails] = useState(false);
    const [openNotification, setOpenNotification] = useState(false);
    const [notification, setNotification] = useState(false);
    const [notificationList, setNotificationList] = useState([]);

    const router = useRouter();

    const designation_value = employee?.basicDetails?.designation;

    async function fetchAnnouncement() {
        try {
            if (designation_value === undefined) return;
            const res = await noticationAnnouncementService(designation_value);
            console.log(res, 'res');
            if (res?.success) {
                setNotification(res?.data?.length > 0);
                setNotificationList(res?.data);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || 'error while fetching the announcement');
        }
    }

    const handleLogout = async () => {
        try {
            await axiosInstance.get('/api/user/logout');
            sessionStorage.removeItem('employeeData');
            toast.success('Logged out successfully');
            router.push('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Logout failed.');
            console.log(error);
        }
    };

    useEffect(() => {
        if (designation_value === undefined) return;

        fetchAnnouncement();
    }, [designation_value]);

    return (
        <div className="relative flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Employe Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />

                <div className="relative hidden md:block">
                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
                    <input
                        type="search"
                        placeholder="Search..."
                        className="h-9 w-64 rounded-md border border-gray-200 bg-gray-50 px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-gray-950 focus-visible:outline-none"
                    />
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => {
                        setOpenEmployeeDetails(false);
                        setOpenNotification((prev) => !prev);
                    }}
                >
                    <Bell size={20} />
                    {notification && <span className="absolute top-2 right-2 h-2 w-2 animate-pulse rounded-full bg-red-500" />}
                </Button>

                <div className="ml-2 flex items-center gap-2 border-l pl-4">
                    <div
                        className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full"
                        onClick={() => {
                            setOpenNotification(false);
                            setOpenEmployeeDetails((prev) => !prev);
                        }}
                    >
                        <Image
                            width="1000"
                            height="1000"
                            alt="employeeImage"
                            className="h-full w-full object-cover"
                            src={employee?.basicDetails?.profileImage || 'https://github.com/shadcn.png'}
                        />
                    </div>
                    <span className="hidden text-sm font-medium capitalize sm:block">{employee?.basicDetails?.name}</span>
                </div>
            </div>

            {/* opening tab  */}

            {openEmployeeDetails && (
                <div className="animate-in fade-in zoom-in-95 absolute top-16 right-6 z-50 w-64 transform overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl transition-all duration-300">
                    <div className="border-b border-gray-100 bg-gray-50/50 p-4">
                        <p className="font-semibold text-gray-800 capitalize">{employee?.basicDetails?.name || 'Employee'}</p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                            {Array.isArray(employee?.basicDetails?.email)
                                ? employee?.basicDetails?.email[0]
                                : employee?.basicDetails?.email || 'employee@promozione.com'}
                        </p>
                    </div>

                    <div className="p-2">
                        <Link
                            href="/employee-dashboard/profile"
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => setOpenEmployeeDetails(false)}
                        >
                            <User size={18} />
                            <span>My Profile</span>
                        </Link>
                        <Link
                            href="/employee-dashboard/settings"
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => setOpenEmployeeDetails(false)}
                        >
                            <Settings size={18} />
                            <span>Settings</span>
                        </Link>
                    </div>

                    <div className="border-t border-gray-100 p-2">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                            <LogOut size={18} />
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>
            )}

            {/* notification  */}

            {openNotification && (
                <div className="animate-in fade-in zoom-in-95 absolute top-16 right-16 z-50 flex max-h-[80vh] w-80 transform flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-xs text-blue-600">{notificationList.length} New</span>
                    </div>
                    <div className="space-y-2 overflow-y-auto p-2">
                        {notificationList.length > 0 ? (
                            notificationList.map((item) => (
                                <Link
                                    href={'/employee-dashboard/announcement'}
                                    key={item._id}
                                    className="group block cursor-pointer rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50"
                                >
                                    <div className="mb-1 flex items-start justify-between gap-2">
                                        <h4 className="line-clamp-2 text-sm font-medium text-gray-800 transition-colors group-hover:text-blue-600">
                                            {item.title}
                                        </h4>
                                        <span className="mt-0.5 text-[10px] whitespace-nowrap text-gray-400">
                                            {new Date(item.startDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-1.5">
                                        <div className="rounded-full bg-gray-100 p-1">
                                            <User size={10} className="text-gray-500" />
                                        </div>
                                        <p className="text-xs text-gray-500">{item.author?.username || 'Admin'}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                <Bell size={32} className="mb-2 opacity-20" />
                                <p className="text-sm">No new notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeNavbar;
