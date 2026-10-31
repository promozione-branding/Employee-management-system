
"use client";

// components/admin-dashboard/dashboard/RecentActivity.jsx

import { recentActivityService } from "@/service/admin-dashboard/dashboard-api";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Activity,
  FileText,
  UserPlus,
  Briefcase,
  Clock,
  ArrowUpRight,
} from "lucide-react";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchRecentActivity() {
    try {
      const res = await recentActivityService();

      if (res.success) {
        setActivities(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const activityStyles = {
    customer: {
      icon: <UserPlus className="h-4 w-4" />,
      color: "bg-blue-50 text-blue-600 ring-blue-100",
    },
    proposal: {
      icon: <FileText className="h-4 w-4" />,
      color: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
    employee: {
      icon: <Briefcase className="h-4 w-4" />,
      color: "bg-violet-50 text-violet-600 ring-violet-100",
    },
    saleWork: {
      icon: <Briefcase className="h-4 w-4" />,
      color: "bg-orange-50 text-[#F27B1E] ring-orange-100",
    },
  };

  const formatActivityDate = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66]/[0.07] text-[#0A2E66]">
            <Activity className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-[#0A2E66] sm:text-lg">
              Recent Activity
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Latest updates across your workspace
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-[#F27B1E]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F27B1E]" />
          Recent
        </span>
      </div>

      {/* Activity list */}
      <div className="max-h-[360px] space-y-0 overflow-y-auto px-5 sm:px-6">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-b-0"
            >
              <Skeleton circle height={40} width={40} />

              <div className="min-w-0 flex-1">
                <Skeleton height={14} width="78%" />
                <div className="mt-2">
                  <Skeleton height={11} width="42%" />
                </div>
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          activities.slice(0, 10).map((activity, index) => {
            const style = activityStyles[activity.type] || {
              icon: <Briefcase className="h-4 w-4" />,
              color: "bg-slate-100 text-slate-500 ring-slate-200",
            };

            return (
              <div
                key={activity.refId ?? `${activity.type}-${activity.createdAt}-${index}`}
                className="group flex items-start gap-3 border-b border-slate-100 py-4 last:border-b-0"
              >
                {/* Activity icon */}
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105 ${style.color}`}
                >
                  {style.icon}
                </div>

                {/* Activity details */}
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-medium leading-5 text-slate-800 transition-colors group-hover:text-[#0A2E66]">
                    {activity.title}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {formatActivityDate(activity.createdAt)}
                    </span>
                  </div>
                </div>

                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[#F27B1E]" />
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <Activity className="h-6 w-6" />
            </div>

            <p className="text-sm font-semibold text-slate-700">
              No recent activity
            </p>
            <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-500">
              New workspace updates will appear here when available.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && activities.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
          <p className="text-xs text-slate-500">
            Showing {Math.min(activities.length, 10)} of {activities.length}{" "}
            activities
          </p>

          <span className="text-xs font-medium text-[#0A2E66]">
            Latest updates
          </span>
        </div>
      )}
    </section>
  );
}

export default RecentActivity;
