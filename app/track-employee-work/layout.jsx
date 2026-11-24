// app/track-employee-work/layout.jsx

'use client';

import { useEffect, useState } from 'react';
import SideBar from '@/components/layout/SideBar';
import ManagerSidebar from '@/components/layout/manager/Sidebar';
import { useAdminStore } from '@/lib/store/AdminStore';
import { useManagerEmployeeStore } from '@/lib/store/mangerStore';

export default function TrackEmployeeWorkLayout({ children }) {
    const [role, setRole] = useState(null);
    const fetchAdminDetails = useAdminStore((s) => s.fetchAdminDetails);
    const fetchManager = useManagerEmployeeStore((s) => s.fetchEmployee);

    useEffect(() => {
        let active = true;
        fetch('/api/auth/me')
            .then((response) => response.json())
            .then((result) => {
                if (active && result.success) setRole(result.data.role);
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        try {
            if (role === 'admin') fetchAdminDetails?.();
            if (role === 'manager') fetchManager?.();
        } catch (error) {
            console.log(error);
        }
    }, [role, fetchAdminDetails, fetchManager]);

    if (!role) return <div className="min-h-screen bg-slate-50" />;
    if (role === 'manager') return <ManagerSidebar>{children}</ManagerSidebar>;
    return <SideBar>{children}</SideBar>;
}
