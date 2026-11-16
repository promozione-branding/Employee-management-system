// components/wasteComponents/layout/sales-dashboard/SalesNavbar.jsx

'use client';

import React, { useState } from 'react';
import { Bell, Search, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/service/axiosInstance';
import { useSalesEmployeeStore } from '@/lib/store/salesEmployeeStore';

const SalesNavbar = () => {
    const router = useRouter();
    const [openEmployeeDetails, setOpenEmployeeDetails] = useState(false);

    const { employee, clearEmployee } = useSalesEmployeeStore();

    const handleLogout = async () => {
        try {
            await axiosInstance.get('/api/user/logout');

            clearEmployee();
            sessionStorage.removeItem('employeeData');

            toast.success('Logged out successfully');
            router.push('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Logout failed');
        }
    };

    return (
        <div className="relative flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
            {/* Left */}
            <h2 className="text-xl font-semibold text-gray-800">Sales Dashboard</h2>

            {/* Right */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
                    <input type="search" placeholder="Search..." className="h-9 w-64 rounded-md border bg-gray-50 px-3 pl-9 text-sm" />
                </div>

                {/* Notification */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                </Button>

                {/* Profile */}
                <div className="flex cursor-pointer items-center gap-2 border-l pl-4" onClick={() => setOpenEmployeeDetails((p) => !p)}>
                    <Image
                        width={32}
                        height={32}
                        alt="employee"
                        className="rounded-full"
                        src={employee?.basicDetails?.profileImage || 'https://github.com/shadcn.png'}
                    />
                    <span className="hidden text-sm font-medium capitalize sm:block">{employee?.basicDetails?.name || 'Profile'}</span>
                </div>
            </div>

            {/* Dropdown */}
            {openEmployeeDetails && (
                <div className="absolute top-16 right-6 z-50 w-64 rounded-xl border bg-white shadow-xl">
                    <div className="border-b bg-gray-50 p-4">
                        <p className="font-semibold capitalize">{employee?.basicDetails?.name || 'Employee'}</p>
                        <p className="truncate text-xs text-gray-500">
                            {Array.isArray(employee?.basicDetails?.email) ? employee?.basicDetails?.email[0] : employee?.basicDetails?.email || 'Testmode.com'}
                        </p>
                    </div>

                    <div className="p-2">
                        <Link
                            href="/employee-dashboard/profile"
                            className="flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setOpenEmployeeDetails(false)}
                        >
                            <User size={18} />
                            My Profile
                        </Link>

                        <Link
                            href="/employee-dashboard/settings"
                            className="flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setOpenEmployeeDetails(false)}
                        >
                            <Settings size={18} />
                            Settings
                        </Link>
                    </div>

                    <div className="border-t p-2">
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                            <LogOut size={18} />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesNavbar;
