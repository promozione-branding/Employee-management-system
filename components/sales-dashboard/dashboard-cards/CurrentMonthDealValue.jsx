"use client";

import { useEffect, useState } from "react";
import { HandCoins, TrendingUp, Target, CheckCircle2 } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { currentMonthDealValue } from "@/service/sales-dashboard/dashboard-api";

const NAVY = "#0A2E66";
const ORANGE = "#F27B1E";

// TODO: Replace with the actual target from your employee/API data.
const MONTHLY_DEAL_TARGET = 500000;

const formatCurrency = (value) =>
  `₹${(Number(value) || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

export default function CurrentMonthDealValue() {
  const { employee } = useSalesEmployeeStore();

  const [loading, setLoading] = useState(true);
  const [dealValue, setDealValue] = useState(0);

  const target = Math.max(0, Number(MONTHLY_DEAL_TARGET) || 0);

  const achievedPercentage = target > 0 ? (dealValue / target) * 100 : 0;

  const progressPercentage = Math.min(100, achievedPercentage);
  const targetReached = target > 0 && dealValue >= target;

  useEffect(() => {
    let active = true;

    if (!employee?._id) {
      setDealValue(0);
      setLoading(false);

      return () => {
        active = false;
      };
    }

    const fetchDealValue = async () => {
      setLoading(true);

      try {
        const res = await currentMonthDealValue(employee._id);

        if (active && res?.success) {
          setDealValue(Math.max(0, Number(res.data) || 0));
        } else if (active && !res?.success) {
          toast.error(res?.message || "Unable to load monthly deal value");
        }
      } catch (error) {
        if (active) {
          toast.error(
            error?.response?.data?.message ||
              "Unable to load monthly deal value",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDealValue();

    return () => {
      active = false;
    };
  }, [employee?._id]);

  return (
    <article className="group relative flex h-full min-h-[250px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4DDEC] hover:shadow-lg sm:p-6">
      {/* Brand accent */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(to right, ${NAVY}, ${ORANGE})`,
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#77839A]">
            Monthly deal value
          </p>

          {loading ? (
            <Skeleton height={34} width={145} className="mt-3" />
          ) : (
            <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-[#172B4D] sm:text-3xl">
              {formatCurrency(dealValue)}
            </h2>
          )}

          <p className="mt-2 text-xs text-[#8792A5]">
            Deals recorded this month
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1E5] text-[#F27B1E]">
          <HandCoins size={23} strokeWidth={1.8} />
        </div>
      </div>

      {/* Target progress */}
      <div className="mt-5 rounded-xl border border-[#EDF0F5] bg-[#F8FAFD] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
            <Target size={15} style={{ color: NAVY }} />
            Monthly target
          </div>

          {loading ? (
            <Skeleton height={16} width={48} />
          ) : (
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: targetReached ? "#15803D" : NAVY }}
            >
              {target > 0 ? `${achievedPercentage.toFixed(1)}%` : "Not set"}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          {loading ? (
            <Skeleton height={20} width={100} />
          ) : (
            <p className="text-sm font-bold text-[#172B4D]">
              {formatCurrency(target)}
            </p>
          )}

          <span className="text-[11px] font-medium text-[#8792A5]">
            Target amount
          </span>
        </div>

        <div
          className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#E7ECF4]"
          role="progressbar"
          aria-label="Monthly deal target progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={loading ? 0 : progressPercentage}
        >
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: loading ? "0%" : `${progressPercentage}%`,
              backgroundColor: targetReached ? "#16A34A" : ORANGE,
            }}
          />
        </div>

        {!loading && (
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[11px] text-[#64748B]">
              {target > 0
                ? targetReached
                  ? "Target achieved"
                  : `${formatCurrency(target - dealValue)} remaining`
                : "Set a monthly target to track progress"}
            </span>

            {targetReached && (
              <CheckCircle2 size={15} className="shrink-0 text-green-600" />
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center gap-2 border-t border-[#EDF0F5] pt-4 mt-5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EAF0FA] text-[#0A2E66]">
          <TrendingUp size={15} />
        </span>

        <span className="text-xs font-medium text-[#64748B]">
          Current month performance
        </span>
      </div>
    </article>
  );
}
