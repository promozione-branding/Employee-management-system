// components/employee-dashboard/common/RecentActivity.jsx

"use client";

import { useEffect, useState } from "react";
import { employeeRecentActivityService } from "@/service/employee-dashboard/dashboard";
import { Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Skeleton from "react-loading-skeleton";

function RecentActivity({ employeeId }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await employeeRecentActivityService(employeeId);

        if (res.success) {
          const data = res?.data?.workDetails;
          const filledArray = data.flatMap((item) => item?.checklist);
          setActivity(filledArray);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (employeeId) fetchActivity();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white p-4 shadow-[0_4px_20px_rgba(15,27,51,0.04)] sm:p-5">
        <Skeleton height={28} width={150} className="mb-4" />
        <ul className="space-y-2 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-[#E9EDF4] p-3"
            >
              <Skeleton circle height={20} width={20} />
              <div className="flex-1">
                <Skeleton height={20} width="70%" />
                <Skeleton height={14} width="40%" className="mt-2" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(15,27,51,0.07)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#EDF0F5] px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66] text-white shadow-sm">
            <Activity size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold tracking-tight text-[#0F1B33]">Recent Activity</h3>
            <p className="mt-0.5 text-xs text-[#8A92A6]">Your latest completed work</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#F0F3F8] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#0A2E66]">
          {activity.length}
        </span>
      </div>

      {activity.length === 0 ? (
        <div className="flex min-h-48 flex-1 flex-col items-center justify-center px-4 py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F3F8] text-[#0A2E66]">
            <AlertCircle size={22} />
          </div>
          <h4 className="text-sm font-semibold text-[#26344D]">No Activity Yet</h4>
          <p className="mt-1 text-xs leading-5 text-[#929BAD]">
            Recent activities will be shown here.
          </p>
        </div>
      ) : (
        <ul className="max-h-[318px] min-h-0 flex-1 space-y-2.5 overflow-y-auto p-4 sm:px-5">
          {activity.map((item, index) => (
            <li
              key={index}
              className="flex min-w-0 items-start gap-3 rounded-xl border border-[#E9EDF4] bg-white p-3 transition-all duration-200 hover:border-[#D5DEEF] hover:bg-[#FAFBFD]"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold leading-5 text-[#26344D]">{item.label}</p>

                <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-[#929BAD]">
                  <Clock size={12} className="shrink-0" />
                  <span className="truncate">{new Date(item.completedAt).toLocaleString()}</span>
                </div>

                {item.remarks && (
                  <p className="mt-1 break-words text-xs leading-5 text-[#526078]">{item.remarks}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentActivity;
