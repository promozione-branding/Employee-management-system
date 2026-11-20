// components/layout/employee-dashboard/Layout.jsx

'use client';

import EmployeeSidebar from './EmployeeSidebar';
import EmployeeNavbar from './EmployeeNavbar';
import { useState } from 'react';

const Layout = ({ children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="flex min-h-screen bg-white">
            <EmployeeSidebar open={open} setOpen={setOpen} />
            <div className="flex h-screen flex-1 flex-col overflow-hidden">
                <EmployeeNavbar />
                <main className="flex-1 overflow-y-auto p-1 md:p-6">{children}</main>
            </div>
        </div>
    );
};

export default Layout;
