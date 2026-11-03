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

  useEffect(() => {
    let cancelled = false;

    async function fetchRecentActivity() {
      if (!employee?.user?._id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await recentActivityService(employee._id);

        if (!cancelled && res.success) {
          setRecentData(res?.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error?.response?.data?.message ||
              "Error while fetching recent activity",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRecentActivity();

    return () => {
      cancelled = true;
    };
  }, [employee]);

  const getActivityIcon = (type) => {
    if (type === "proposal") return FileText;
    if (type === "customer") return Users;
    return Activity;
  };

  const getActivityColor = (type) => {
    if (type === "proposal") {
      return {
        icon: "bg-orange-50 text-[#F27B1E]",
        badge: "border-orange-100 bg-orange-50 text-[#C56816]",
      };
    }

    if (type === "customer") {
      return {
        icon: "bg-emerald-50 text-emerald-600",
        badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
      };
    }

    return {
      icon: "bg-[#F0F3F8] text-[#0A2E66]",
      badge: "border-[#E3E7F0] bg-[#F0F3F8] text-[#0A2E66]",
    };
  };

  const formatDate = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="group relative flex h-[420px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white p-4 shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(15,27,51,0.07)] sm:p-5">
      {/* Decorative accent */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#F27B1E]/[0.06] blur-2xl" />

      {/* Header */}
      <div className="relative mb-5 flex shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66] text-white shadow-sm">
            <Activity size={21} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-[#0F1B33]">
              Recent Activity
            </h2>

            <p className="mt-0.5 text-xs text-[#8A92A6]">Your latest updates</p>
          </div>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F3F8] text-[#8A92A6]">
          <Sparkles size={15} />
        </div>
      </div>

      {/* Activity list */}
      <div className="custom-scrollbar relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {loading ? (
          [1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[#E3E7F0] p-3.5"
            >
              <div className="flex gap-3">
                <Skeleton
                  width={40}
                  height={40}
                  borderRadius={12}
                  baseColor="#F0F3F8"
                  highlightColor="#FAFBFD"
                />

                <div className="min-w-0 flex-1">
                  <Skeleton
                    width="85%"
                    height={14}
                    baseColor="#F0F3F8"
                    highlightColor="#FAFBFD"
                  />

                  <Skeleton
                    width="60%"
                    height={11}
                    className="mt-2"
                    baseColor="#F0F3F8"
                    highlightColor="#FAFBFD"
                  />

                  <Skeleton
                    width="70%"
                    height={11}
                    className="mt-2"
                    baseColor="#F0F3F8"
                    highlightColor="#FAFBFD"
                  />
                </div>
              </div>
            </div>
          ))
        ) : recentData.length > 0 ? (
          recentData.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colors = getActivityColor(activity.type);

            return (
              <Link
                href={`/sales-dashboard/proposal/pdf-download/${activity.refId}`}
                key={activity.refId || index}
                className="group/item block min-w-0"
              >
                <div className="rounded-xl border border-[#E9EDF4] bg-[#FAFBFD] p-3 transition-all duration-200 hover:border-[#D5DEEF] hover:bg-white hover:shadow-[0_4px_14px_rgba(15,27,51,0.05)]">
                  <div className="flex min-w-0 items-start gap-3">
                    {/* Activity icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </div>

                    {/* Activity details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <h3 className="line-clamp-2 min-w-0 break-words text-sm font-semibold leading-5 text-[#26344D] transition-colors group-hover/item:text-[#0A2E66]">
                          {activity.title || "Activity update"}
                        </h3>

                        <ArrowUpRight
                          size={15}
                          className="mt-0.5 shrink-0 text-[#A5ADBD] transition-all group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 group-hover/item:text-[#F27B1E]"
                        />
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`max-w-full break-words rounded-full border px-2 py-1 text-[10px] font-semibold capitalize ${colors.badge}`}
                        >
                          {activity.type || "activity"}
                        </span>

                        {activity.action && (
                          <span className="max-w-full break-words rounded-full border border-orange-100 bg-orange-50 px-2 py-1 text-[10px] font-semibold capitalize text-[#C56816]">
                            {activity.action}
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 flex min-w-0 items-center gap-1.5 text-[11px] text-[#929BAD]">
                        <Clock3 size={12} className="shrink-0" />

                        <span className="truncate">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="flex min-h-[150px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[#DDE3ED] bg-[#FAFBFD] px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F3F8] text-[#8A92A6]">
              <Activity size={21} />
            </div>

            <h3 className="text-sm font-semibold text-[#26344D]">
              No recent activity
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#929BAD]">
              Your latest updates will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative mt-4 flex shrink-0 items-center justify-between gap-2 border-t border-[#EDF0F5] pt-3">
        <span className="text-[11px] font-medium text-[#929BAD]">
          Activity overview
        </span>

        <span className="shrink-0 rounded-full bg-[#F0F3F8] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#0A2E66]">
          {recentData.length} Activities
        </span>
      </div>
    </div>
  );
};

export default RecentActivitySales;
