"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { totalClientCount } from "@/service/sales-dashboard/dashboard-api";
import { ShieldUser } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const TotalClientCount = () => {
  const { employee } = useSalesEmployeeStore();
  const [loading, setLoading] = useState(true);
  const [callData, setCallData] = useState(null);

  async function fetchClientsCount() {
    try {
      const res = await totalClientCount(employee?._id);
      console.log(res);
      if (res.success) {
        setCallData(res.client);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching daily call count");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (employee?._id) {
      fetchClientsCount();
    }
  }, []);

  if (loading) {
    return (
      <div className="mb-5 bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-full">
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
    <div className="bg-[#f3eaea] p-4 rounded-lg shadow-sm border border-gray-200 w-full h-full hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Total Clients
          </p>
          <div className="mt-1 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{callData}</span>
          </div>
        </div>
        <div className="p-3 bg-orange-50 rounded-full">
          <ShieldUser className="text-orange-500" />
        </div>
      </div>
    </div>
  );
};

export default TotalClientCount;
