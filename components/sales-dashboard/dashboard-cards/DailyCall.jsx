"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { dailyCallService } from "@/service/sales-dashboard/dashboard-api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const DailyCall = () => {
  const { employee } = useSalesEmployeeStore();
  const [loading, setLoading] = useState(true);
  const [callData, setCallData] = useState(null);

  async function fetchDailyCallCount() {
    try {
      const res = await dailyCallService(employee?.user?._id);
      if (res.success) {
        setCallData(res);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching daily call count");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (employee?.user?._id) {
      fetchDailyCallCount();
    }
  }, [employee]);

  if (loading) {
    return (
      <div className="mb-5 bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-full sm:w-1/2 lg:w-1/4">
        <div className="flex justify-between items-center">
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
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-full h-full hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Today's Calls
          </p>
          <div className="mt-1 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {callData?.totalCalls || 0}
            </span>
          </div>
        </div>
        <div className="p-3 bg-orange-50 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-orange-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DailyCall;
