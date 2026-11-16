// components/wasteComponents/layout/sales-dashboard/SalesSidebar.jsx

'use client';

import { Button } from '@/components/ui/button';
import { LayoutDashboard, CalendarCheck, FileText, User, LogOut, Menu, Briefcase, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axiosInstance from '@/service/axiosInstance';
import { useSalesEmployeeStore } from '@/lib/store/salesEmployeeStore';

const SalesSidebar = ({ open, setOpen }) => {
    const router = useRouter();

    const { clearEmployee } = useSalesEmployeeStore();

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

    const navLinks = [
        {
            href: '/sales-dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard size={24} />,
        },
        {
            href: '/sales-dashboard/clients',
            label: 'Client',
            icon: <UsersRound size={24} />,
        },
        {
            href: '/sales-dashboard/attendance',
            label: 'Attendance',
            icon: <CalendarCheck size={24} />,
        },

        {
            href: '/sales-dashboard/leaves',
            label: 'Leaves',
            icon: <FileText size={24} />,
        },
        {
            href: '/sales-dashboard/projects',
            label: 'Projects',
            icon: <Briefcase size={24} />,
        },
        {
            href: '/sales-dashboard/profile',
            label: 'Profile',
            icon: <User size={24} />,
        },
    ];

    return (
        <div
            className={`relative flex h-screen flex-col border-r bg-white p-4 text-black transition-all duration-300 ease-in-out ${
                open ? 'w-64' : 'w-14 md:w-20'
            }`}
        >
            <div className="mb-6 flex items-center justify-between">
                {open && <h1 className="truncate text-2xl font-bold">Promizone</h1>}
                <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="ml-auto hover:bg-gray-100">
                    <Menu size={24} />
                </Button>
            </div>

            <nav className="flex flex-grow flex-col gap-2">
                {navLinks.map((link) => (
                    <Button
                        key={link.href}
                        asChild
                        variant="ghost"
                        className={`justify-start gap-4 p-3 hover:bg-zinc-700 hover:text-white ${!open && 'justify-center'}`}
                    >
                        <Link href={link.href} className="flex w-full items-center">
                            {link.icon}
                            {open && <span className="ml-3">{link.label}</span>}
                        </Link>
                    </Button>
                ))}
            </nav>

            <div className="mt-auto">
                <Button
                    variant="ghost"
                    className={`w-full justify-start gap-4 p-3 hover:bg-gray-500 hover:text-white ${!open && 'justify-center'}`}
                    onClick={handleLogout}
                >
                    <LogOut size={24} />
                    {open && <span className="ml-3">Logout</span>}
                </Button>
            </div>
        </div>
    );
};

export default SalesSidebar;
