// components/sales-dashboard/dashboard-cards/CurrentMonthRevenue.jsx

"use client";

import { useEffect, useState } from "react";
import { BanknoteArrowUp, Wallet } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { currentMonthRevenueService } from "@/service/sales-dashboard/dashboard-api";

const ORANGE = "#F27B1E";

const formatCurrency = (value) =>
  `₹${(Number(value) || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

export default function CurrentMonthRevenue() {
  const { employee } = useSalesEmployeeStore();
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    if (!employee?._id) {
      setLoading(false);
      return;
    }

    let active = true;

    const fetchRevenue = async () => {
      setLoading(true);

      try {
        const res = await currentMonthRevenueService(employee._id);

        if (active && res?.success) {
          setRevenue(Number(res.revenue) || 0);
        }
      } catch (error) {
        if (active) {
          toast.error(
            error?.response?.data?.message || "Unable to load monthly revenue",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRevenue();

    return () => {
      active = false;
    };
  }, [employee?._id]);

  return (
    <article className="group relative flex h-full min-h-[190px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4DDEC] hover:shadow-lg sm:p-6">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: "#0A2E66" }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#77839A]">
            Monthly revenue
          </p>

          {loading ? (
            <Skeleton height={34} width={145} className="mt-3" />
          ) : (
            <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-[#172B4D] sm:text-3xl">
              {formatCurrency(revenue)}
            </h2>
          )}

          <p className="mt-2 text-xs text-[#8792A5]">
            Revenue recorded this month
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF0FA] text-[#0A2E66]">
          <BanknoteArrowUp size={23} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-[#EDF0F5] pt-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF1E5] text-[#F27B1E]">
          <Wallet size={15} />
        </span>
        <span className="text-xs font-medium text-[#64748B]">
          Current month collection
        </span>
      </div>
    </article>
  );
}
