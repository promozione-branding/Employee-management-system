"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { recentActivityService } from "@/service/sales-dashboard/dashboard-api";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const RecentActivitySales = () => {
  const { employee } = useSalesEmployeeStore();
  const [loading, setLoading] = useState(true);
  const [recentData, setRecentData] = useState([]);

  async function fetchRecentActivity() {
    try {
      const res = await recentActivityService(employee?._id);

      console.log(employee, "res");
      if (res.success) {
        setLoading(false);
        setRecentData(res?.data);
      }
      console.log(res);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(
        error?.response?.data?.message ||
          "Error while fetching the today meeting",
      );
    }
  }

  useEffect(() => {
    if (employee?.user?._id) {
      fetchRecentActivity();
    }
  }, [employee]);

  if (loading) {
    return (
      <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <Skeleton height={28} width={180} className="mb-4" />
        <div className="space-y-3">
          <Skeleton height={64} count={3} borderRadius={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 lg:w-1/3">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] custom-scrollbar">
        {recentData?.length > 0 ? (
          recentData.map((activity, index) => (
            <Link
              href={`/sales-dashboard/proposal/pdf-download/${activity.refId}`}
              key={activity.refId || index}
            >
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm">
                      {activity.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(activity.createdAt).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        activity.type === "proposal"
                          ? "bg-blue-100 text-blue-600"
                          : activity.type === "customer"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {activity.type}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize bg-yellow-50 text-yellow-600 border border-yellow-100">
                      {activity.action}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivitySales;
