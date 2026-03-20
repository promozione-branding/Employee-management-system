"use client";

import Link from "next/link";
import {
  Activity,
  Album,
  BadgeIndianRupee,
  BanknoteArrowUp,
  NotebookTabs,
  Paperclip,
  TableProperties,
  Users,
  Volleyball,
} from "lucide-react";

const HistoryTab = ({ customerId }) => {
  const cardData = [
    {
      label: "Client Profile",
      icon: <Users />,
      href: `/sales-dashboard/clients/history/client-history/${customerId}`,
    },
    // {
    //   label: "Client Proposals",
    //   icon: <TableProperties />,
    //   href: `/dashboard/customer/history/client-proposal/${customerId}`,
    // },
    // {
    //   label: "Client Invoice",
    //   icon: <Album />,
    //   href: `/dashboard/customer/history/client-invoice/${customerId}`,
    // },
    {
      label: "Work Details",
      icon: <Activity />,
      href: `/sales-dashboard/clients/history/work-detail/${customerId}`,
    },
    {
      label: "Sales",
      icon: <BanknoteArrowUp />,
      href: `/sales-dashboard/clients/history/sales-history/${customerId}`,
    },
    {
      label: "Team Update",
      icon: <Volleyball />,
      href: `/sales-dashboard/clients/history/team-update/${customerId}`,
    },
     {
      label: "Attachment",
      icon: <Paperclip />,
      href: `/sales-dashboard/clients/history/attachment-history/${customerId}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {cardData.map((card, index) => (
        <Link href={card.href} key={index} className="block">
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-xl transition-shadow border border-gray-200 h-full cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold capitalize text-gray-800">
                {card.label}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default HistoryTab;
