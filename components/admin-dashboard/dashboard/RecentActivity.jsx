
"use client";

// components/admin-dashboard/dashboard/RecentActivity.jsx

import { recentActivityService } from "@/service/admin-dashboard/dashboard-api";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import {
  TrendingUp,
  UserPlus,
  FileText,
  Briefcase,
  Clock,
  Activity,
} from "lucide-react";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========================================
  // FETCH RECENT ACTIVITY
  // ========================================

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

  // ========================================
  // ACTIVITY ICON STYLES
  // ========================================

  const activityStyles = {
    customer: {
      icon: <UserPlus size={19} strokeWidth={1.8} />,
      color: "bg-[#E5F5EC] text-[#16865D]",
    },
    proposal: {
      icon: <FileText size={19} strokeWidth={1.8} />,
      color: "bg-[#E5F5EC] text-[#16865D]",
    },
    employee: {
      icon: <Briefcase size={19} strokeWidth={1.8} />,
      color: "bg-[#E5F5EC] text-[#16865D]",
    },
    saleWork: {
      icon: <Briefcase size={19} strokeWidth={1.8} />,
      color: "bg-[#E5F5EC] text-[#16865D]",
    },
  };

  // ========================================
  // DATE FORMAT
  // ========================================

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

  // ========================================
  // RENDER
  // ========================================

  return (
    <section
      className="
        relative
        flex
        h-[410px]
        min-h-0
        w-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-[22px]
        border border-[#E1E7F0]
        bg-white
        p-5
        shadow-[0_3px_12px_rgba(10,46,102,0.05)]
        transition-shadow duration-300
        hover:shadow-[0_8px_24px_rgba(10,46,102,0.07)]
        sm:h-[410px]
        sm:p-[22px]
      "
    >

      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <div className="mb-4 flex shrink-0 items-center gap-3">

        <div
          className="
            flex h-10 w-10
            shrink-0
            items-center justify-center
            rounded-xl
            bg-[#E5F5EC]
            text-[#16865D]
          "
        >
          <TrendingUp size={21} strokeWidth={2} />
        </div>

        <div className="min-w-0">

          <h2
            className="
              font-serif
              text-[20px]
              font-bold
              leading-tight
              tracking-tight
              text-[#0A2E66]
              sm:text-[21px]
            "
          >
            Recent activity
          </h2>

          <p
            className="
              mt-1
              text-[13px]
              leading-5
              text-[#56647D]
              sm:text-[14px]
            "
          >
            What&apos;s happening across the team
          </p>

        </div>

      </div>

      {/* ================================== */}
      {/* SCROLLABLE ACTIVITY LIST */}
      {/* ================================== */}

      <div
        className="
          relative
          min-h-0
          flex-1
          overflow-x-hidden
          overflow-y-auto
          pr-2

          [&::-webkit-scrollbar]:w-[5px]
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-[#DDE4EF]
          hover:[&::-webkit-scrollbar-thumb]:bg-[#AEBBD0]

          [scrollbar-width:thin]
          [scrollbar-color:#DDE4EF_transparent]
        "
      >

        {/* LOADING STATE */}

        {loading ? (

          <div className="space-y-3 pt-1">

            {Array.from({ length: 5 }).map((_, index) => (

              <div
                key={index}
                className="flex items-start gap-3 py-2"
              >

                <Skeleton
                  circle
                  height={40}
                  width={40}
                />

                <div className="min-w-0 flex-1 pt-1">

                  <Skeleton
                    height={14}
                    width="85%"
                  />

                  <div className="mt-2">
                    <Skeleton
                      height={12}
                      width="45%"
                    />
                  </div>

                </div>

              </div>

            ))}

          </div>

        ) : activities.length > 0 ? (

          <div className="flex flex-col">

            {activities.slice(0, 10).map((activity, index) => {

              const style = activityStyles[activity.type] || {
                icon: <Activity size={19} strokeWidth={1.8} />,
                color: "bg-[#E5F5EC] text-[#16865D]",
              };

              const isLast =
                index === Math.min(activities.length, 10) - 1;

              return (

                <div
                  key={
                    activity.refId ??
                    `${activity.type}-${activity.createdAt}-${index}`
                  }
                  className="
                    relative
                    flex
                    min-w-0
                    items-start
                    gap-3
                    py-[9px]
                  "
                >

                  {/* TIMELINE ICON */}

                  <div
                    className="
                      relative
                      z-10
                      flex
                      shrink-0
                      flex-col
                      items-center
                    "
                  >

                    <div
                      className={`
                        flex
                        h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        transition-transform
                        duration-200
                        hover:scale-105
                        ${style.color}
                      `}
                    >
                      {style.icon}
                    </div>

                    {/* Connecting line */}

                    {!isLast && (
                      <div
                        className="
                          absolute
                          left-1/2
                          top-[41px]
                          h-[20px]
                          w-[2px]
                          -translate-x-1/2
                          bg-[#DDE4EF]
                        "
                      />
                    )}

                  </div>

                  {/* ACTIVITY DETAILS */}

                  <div className="min-w-0 flex-1 pt-[2px]">

                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-x-2
                        gap-y-1
                      "
                    >

                      <p
                        className="
                          break-words
                          text-[13px]
                          font-medium
                          leading-[19px]
                          text-[#0F1B33]
                          sm:text-[14px]
                        "
                      >
                        {activity.title}
                      </p>

                      {/* New badge */}

                      {index === 0 && (
                        <span
                          className="
                            inline-flex
                            shrink-0
                            items-center
                            rounded-full
                            bg-[#F27B1E]
                            px-[9px]
                            py-[2px]
                            text-[10px]
                            font-bold
                            leading-[14px]
                            text-white
                          "
                        >
                          New
                        </span>
                      )}

                    </div>

                    {/* TIMESTAMP */}

                    <div className="mt-[3px] flex items-center gap-1.5">

                      <Clock
                        size={12}
                        strokeWidth={1.8}
                        className="shrink-0 text-[#64748B]"
                      />

                      <span
                        className="
                          text-[12px]
                          font-normal
                          leading-4
                          text-[#64748B]
                        "
                      >
                        {formatActivityDate(activity.createdAt)}
                      </span>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        ) : (

          /* EMPTY STATE */

          <div
            className="
              flex
              min-h-[230px]
              flex-col
              items-center
              justify-center
              px-4
              text-center
            "
          >

            <div
              className="
                mb-3
                flex h-12 w-12
                items-center justify-center
                rounded-full
                bg-[#E5F5EC]
                text-[#16865D]
              "
            >
              <TrendingUp size={23} />
            </div>

            <h3 className="text-[14px] font-semibold text-[#0A2E66]">
              No recent activity
            </h3>

            <p className="
              mt-1
              max-w-[220px]
              text-[12px]
              leading-5
              text-[#64748B]
            ">
              New workspace updates will appear here when available.
            </p>

          </div>

        )}

      </div>

    </section>
  );
}

export default RecentActivity;
