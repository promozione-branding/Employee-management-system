'use client';

import { useEffect, useState } from 'react';
import SideBar from '@/components/layout/SideBar';
import ManagerSidebar from '@/components/layout/manager/Sidebar';
import EmployeeLayout from '@/components/layout/employee-dashboard/Layout';
import SalesSidebar from '@/components/layout/sales-dashboard/SalesSidebar';
import SalesNavbar from '@/components/layout/sales-dashboard/SalesNavbar';
import { useEmployeeStore } from '@/lib/store/EmployeeStore';

export default function AdsDashboardLayout({ children }) {
    const [role, setRole] = useState(null);
    const [salesOpen, setSalesOpen] = useState(true);
    const fetchEmployee = useEmployeeStore((state) => state.fetchEmployee);

    useEffect(() => {
        let active = true;
        fetch('/api/auth/me')
            .then((response) => response.json())
            .then((result) => {
                if (active && result.success) setRole(result.data.role);
            })
            .catch(() => {});
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (role === 'employee') fetchEmployee();
    }, [role, fetchEmployee]);

    if (!role) return <div className="min-h-screen bg-slate-50" />;

    if (role === 'admin') return <SideBar defaultOpen>{children}</SideBar>;
    if (role === 'manager') return <ManagerSidebar defaultOpen>{children}</ManagerSidebar>;
    if (role === 'employee') return <EmployeeLayout defaultOpen>{children}</EmployeeLayout>;
    if (role === 'sales') {
        return (
            <div className="flex min-h-screen bg-white">
                <SalesSidebar open={salesOpen} setOpen={setSalesOpen} />
                <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
                    <SalesNavbar />
                    <main className="flex-1 overflow-y-auto p-1 md:p-6">{children}</main>
                </div>
            </div>
        );
    }

    return <main>{children}</main>;
}
