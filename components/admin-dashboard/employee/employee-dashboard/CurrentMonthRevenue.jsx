// components/admin-dashboard/employee/employee-dashboard/CurrentMonthRevenue.jsx

'use client';

import { currentMonthRevenueService } from '@/service/sales-dashboard/dashboard-api';
import { BanknoteArrowUp, HandCoins } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CurrentMonthRevenue = ({ employeeId }) => {
    const [loading, setLoading] = useState(true);
    const [callData, setCallData] = useState(null);

    async function fetchCurrentMonthRevenue() {
        try {
            const res = await currentMonthRevenueService(employeeId);
            console.log(res);
            if (res.success) {
                setCallData(res.revenue);
            }
        } catch (error) {
            console.log(error);
            toast.error('Error fetching daily call count');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (employeeId) {
            fetchCurrentMonthRevenue();
        }
    }, []);

    if (loading) {
        return (
            <div className="mb-5 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton height={16} width={100} className="mb-2" />
                        <Skeleton height={32} width={60} />
                    </div>
                    <Skeleton circle height={40} width={40} />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-lg border border-gray-200 bg-[#f3eaea] p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium tracking-wide text-gray-500 uppercase">Current Month Revenue</p>
                    <div className="mt-1 flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">₹ {(callData || 0).toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <div className="rounded-full bg-orange-50 p-3">
                    <BanknoteArrowUp className="text-orange-600" />
                </div>
            </div>
        </div>
    );
};

export default CurrentMonthRevenue;
