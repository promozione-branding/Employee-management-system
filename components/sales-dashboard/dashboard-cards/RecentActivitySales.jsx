
"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { recentActivityService } from "@/service/sales-dashboard/dashboard-api";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Activity,
  FileText,
  Users,
  ArrowUpRight,
  Clock3,
  Sparkles,
} from "lucide-react";

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

  // Existing loading functionality preserved
  if (loading) {
    return (
      <div className="w-full lg:w-1/3 rounded-2xl border border-[#E3E7F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,27,51,0.04)]">
        <div className="mb-6 flex items-center gap-3">
          <Skeleton circle width={44} height={44} />
          <div className="flex-1">
            <Skeleton width={145} height={17} />
            <Skeleton width={105} height={11} className="mt-1" />
          </div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[#E3E7F0] p-4"
            >
              <div className="flex justify-between gap-3">
                <div className="flex-1">
                  <Skeleton width="75%" height={15} />
                  <Skeleton width="45%" height={11} className="mt-3" />
                </div>
                <Skeleton width={65} height={22} borderRadius={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    if (type === "proposal") return FileText;
    if (type === "customer") return Users;
    return Activity;
  };

  const getActivityColor = (type) => {
    if (type === "proposal") {
      return {
        icon: "bg-blue-50 text-blue-600",
        badge: "bg-blue-50 text-blue-700 border-blue-100",
      };
    }

    if (type === "customer") {
      return {
        icon: "bg-emerald-50 text-emerald-600",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      };
    }

    return {
      icon: "bg-orange-50 text-orange-600",
      badge: "bg-orange-50 text-orange-700 border-orange-100",
    };
  };

  return (
    <div className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(15,27,51,0.07)] lg:w-1/3">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#F27B1E]/[0.05] blur-2xl" />

      {/* Header */}
      <div className="relative mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A2E66] text-white shadow-sm">
            <Activity size={20} strokeWidth={2} />
          </div>

          <div>
            <h2 className="text-base font-bold tracking-tight text-[#0F1B33]">
              Recent Activity
            </h2>
            <p className="mt-0.5 text-xs text-[#8A92A6]">
              Your latest updates
            </p>
          </div>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F6F9] text-[#8A92A6]">
          <Sparkles size={15} />
        </div>
      </div>

      {/* Activity list */}
      <div className="custom-scrollbar relative flex max-h-[300px] min-h-[100px] flex-col gap-3 overflow-y-auto pr-1">
        {recentData?.length > 0 ? (
          recentData.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colors = getActivityColor(activity.type);

            return (
              <Link
                href={`/sales-dashboard/proposal/pdf-download/${activity.refId}`}
                key={activity.refId || index}
                className="group/item block"
              >
                <div className="relative rounded-xl border border-[#E9EDF4] bg-[#FAFBFD] p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D5DEEF] hover:bg-white hover:shadow-[0_5px_16px_rgba(15,27,51,0.06)]">
                  <div className="flex items-start gap-3">
                    {/* Activity icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </div>

                    {/* Activity content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#26344D] transition-colors group-hover/item:text-[#0A2E66]">
                          {activity.title}
                        </h3>

                        <ArrowUpRight
                          size={15}
                          className="mt-0.5 shrink-0 text-[#A5ADBD] transition-all group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 group-hover/item:text-[#F27B1E]"
                        />
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${colors.badge}`}
                        >
                          {activity.type}
                        </span>

                        <span className="rounded-full border border-[#FCE8C8] bg-[#FFF8EB] px-2 py-0.5 text-[10px] font-semibold capitalize text-[#C47A16]">
                          {activity.action}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#929BAD]">
                        <Clock3 size={12} />
                        <span>
                          {new Date(activity.createdAt).toLocaleString(
                            "en-IN",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[#DDE3ED] bg-[#FAFBFD] px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F3F8] text-[#8A92A6]">
              <Activity size={21} />
            </div>

            <h3 className="text-sm font-semibold text-[#26344D]">
              No recent activity
            </h3>

            <p className="mt-1 text-xs text-[#929BAD]">
              Your latest updates will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[#EDF0F5] pt-3">
        <span className="text-[11px] font-medium text-[#929BAD]">
          Activity overview
        </span>

        <span className="rounded-full bg-[#F0F3F8] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#0A2E66]">
          {recentData?.length || 0} Activities
        </span>
      </div>
    </div>
  );
};

export default RecentActivitySales;
