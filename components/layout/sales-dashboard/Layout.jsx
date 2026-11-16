// components/layout/sales-dashboard/Layout.jsx

'use client';

import { useState } from 'react';
import SalesSidebar from './SalesSidebar';
import SalesNavbar from './SalesNavbar';

const Layout = ({ children }) => {
    const [open, setOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SalesSidebar open={open} setOpen={setOpen} />
            <div className="flex h-screen flex-1 flex-col overflow-hidden">
                <SalesNavbar />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
};

export default Layout;
