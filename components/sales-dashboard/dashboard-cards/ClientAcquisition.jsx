"use client";

import { useEffect, useState } from "react";
import { UsersRound, CalendarDays, TrendingUp } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { clientAcquisitionStatsService } from "@/service/sales-dashboard/dashboard-api";

const NAVY = "#0A2E66";
const ORANGE = "#F27B1E";

const INITIAL_STATS = {
  monthlyAdded: 0,
  weeklyAdded: 0,
};

export default function ClientAcquisition() {
  const { employee } = useSalesEmployeeStore();

  const employeeId = employee?._id;

  const [loading, setLoading] = useState(true);
  const [monthlyAdded, setMonthlyAdded] = useState(0);
  const [weeklyAdded, setWeeklyAdded] = useState(0);

  useEffect(() => {
    let active = true;

    if (!employeeId) {
      setMonthlyAdded(0);
      setWeeklyAdded(0);
      setLoading(false);

      return () => {
        active = false;
      };
    }

    async function fetchAcquisition() {
      setLoading(true);

      try {
        const res = await clientAcquisitionStatsService(employeeId);

        if (!active) return;

        if (res?.success) {
          // The API returns { success, data: { monthlyAdded, weeklyAdded } }.
          setMonthlyAdded(Math.max(0, Number(res.data?.monthlyAdded) || 0));

          setWeeklyAdded(Math.max(0, Number(res.data?.weeklyAdded) || 0));
        } else {
          setMonthlyAdded(0);
          setWeeklyAdded(0);

          toast.error(res?.message || "Unable to load client acquisition");
        }
      } catch (error) {
        if (!active) return;

        setMonthlyAdded(0);
        setWeeklyAdded(0);

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load client acquisition",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAcquisition();

    return () => {
      active = false;
    };
  }, [employeeId]);

  const largestValue = Math.max(monthlyAdded, weeklyAdded, 1);

  const metrics = [
    {
      label: "Added this month",
      value: monthlyAdded,
      icon: CalendarDays,
      color: ORANGE,
      track: "#FFF0E2",
    },
    {
      label: "Added this week",
      value: weeklyAdded,
      icon: UsersRound,
      color: NAVY,
      track: "#EAF0FA",
    },
  ];

  return (
    <article
      aria-label="Client acquisition statistics"
      className="relative flex h-full min-h-[240px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4DDEC] hover:shadow-lg sm:p-6"
    >
      {/* Brand accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0A2E66] to-[#F27B1E]" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#77839A]">
            Client acquisition
          </p>

          {loading ? (
            <div className="mt-3">
              <Skeleton height={34} width={115} />
              <Skeleton className="mt-1" height={13} width={130} />
            </div>
          ) : (
            <>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#172B4D]">
                {monthlyAdded.toLocaleString("en-IN")}
              </h2>

              <p className="mt-1 text-xs font-medium text-[#8792A5]">
                New clients this month
              </p>
            </>
          )}
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1E5] text-[#F27B1E]">
          <UsersRound size={23} strokeWidth={1.8} />
        </div>
      </div>

      {/* Acquisition comparison */}
      <div className="mt-6 space-y-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const width = Math.min(100, (metric.value / largestValue) * 100);

          return (
            <div key={metric.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-[#64748B]">
                  <Icon
                    size={15}
                    className="shrink-0"
                    style={{ color: metric.color }}
                  />

                  <span>{metric.label}</span>
                </div>

                {loading ? (
                  <Skeleton height={15} width={28} />
                ) : (
                  <span className="text-sm font-bold tabular-nums text-[#172B4D]">
                    {metric.value.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              <div
                className="h-2 overflow-hidden rounded-full"
                style={{ backgroundColor: metric.track }}
                role="progressbar"
                aria-label={metric.label}
                aria-valuemin={0}
                aria-valuemax={largestValue}
                aria-valuenow={loading ? 0 : metric.value}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: loading ? "0%" : `${width}%`,
                    backgroundColor: metric.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center gap-2 border-t border-[#EDF0F5] pt-4 mt-6">
        <TrendingUp size={16} className="shrink-0" style={{ color: NAVY }} />

        <span className="text-xs font-medium text-[#64748B]">
          New clients assigned to you
        </span>
      </div>
    </article>
  );
}
