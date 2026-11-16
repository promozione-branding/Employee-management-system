// components/employee-dashboard/tabs/AllHistory.jsx

'use client';

import Link from 'next/link';
import { Activity, Album, BadgeIndianRupee, BanknoteArrowUp, NotebookTabs, Paperclip, TableProperties, Users, Volleyball } from 'lucide-react';

const AllHistory = ({ customerId }) => {
    const cardData = [
        {
            label: 'Client Profile',
            icon: <Users />,
            href: `/employee-dashboard/clients/history/client-history/${customerId}`,
        },

        {
            label: 'Work Details',
            icon: <Activity />,
            href: `/employee-dashboard/clients/history/work-detail/${customerId}`,
        },
        // {
        //   label: "Sales",
        //   icon: <BanknoteArrowUp />,
        //   href: `/employee-dashboard/clients/history/sales-history/${customerId}`,
        // },
        {
            label: 'Attachment',
            icon: <Paperclip />,
            href: `/employee-dashboard/clients/history/attachment-history/${customerId}`,
        },
        {
            label: 'Team Update',
            icon: <Volleyball />,
            href: `/employee-dashboard/clients/history/team-update/${customerId}`,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {cardData.map((card, index) => (
                <Link href={card.href} key={index} className="block">
                    <div className="h-full cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl">
                        <div className="flex items-center space-x-4">
                            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">{card.icon}</div>
                            <h3 className="text-lg font-semibold text-gray-800 capitalize">{card.label}</h3>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default AllHistory;
