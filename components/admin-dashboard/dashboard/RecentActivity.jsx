"use client";

import { recentActivityService } from "@/service/admin-dashboard/dashboard-api";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FileText, UserPlus, Briefcase, Clock } from "lucide-react";

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
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const activityIcons = {
    customer: <UserPlus className="w-5 h-5 text-blue-500" />,
    proposal: <FileText className="w-5 h-5 text-green-500" />,
    employee: <Briefcase className="w-5 h-5 text-purple-500" />,
    saleWork: <Briefcase className="w-5 h-5 text-orange-500" />,
  };

  return (
    <div className="lg:w-full bg-[#f3eaea] rounded-lg shadow-md p-6 border">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {loading ? (
          [...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 pb-4 border-b last:border-b-0"
            >
              <Skeleton circle height={40} width={40} />
              <div className="flex-1">
                <Skeleton height={16} width="80%" />
                <Skeleton height={12} width="40%" className="mt-1" />
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          activities.slice(0, 10).map((activity) => (
            <div
              key={activity.refId}
              className="flex items-center gap-4 pb-4 border-b last:border-b-0"
            >
              <div className="p-2 bg-slate-100 rounded-full">
                {activityIcons[activity.type] || (
                  <Briefcase className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-slate-900 font-medium text-sm">
                  {activity.title}
                </p>
                {/* <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                  <Clock size={12} />
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </p> */}
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-center py-4">No recent activity.</p>
        )}
      </div>
    </div>
  );
}

export default RecentActivity;
