"use client";

import { useEffect, useState } from "react";
import { employeeRecentActivityService } from "@/service/employee-dashboard/dashboard";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
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
      <div className="space-y-3 px-5 bg-white mx-2 py-3 rounded-lg lg:w-1/2">
        <Skeleton height={28} width={150} className="mb-4" />
        <ul className="space-y-2 lg:h-[50vh] overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg border p-3"
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
    <div className="space-y-3 px-5 bg-[#f3eaea]  py-3 rounded-lg lg:w-1/2">
      <h3 className="text-lg font-semibold">Recent Activity</h3>

      {activity.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 lg:h-[35vh]">
          <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
          <h4 className="text-lg font-semibold text-gray-600">
            No Activity Yet
          </h4>
          <p className="text-sm text-gray-400">
            Recent activities will be shown here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2 lg:h-[50vh] overflow-y-auto">
          {activity.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <CheckCircle2 className="mt-1 h-5 w-5 text-green-500" />

              <div className="flex-1">
                <p className="font-medium">{item.label}</p>

                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(item.completedAt).toLocaleString()}</span>
                </div>

                {item.remarks && (
                  <p className="mt-1 text-sm text-gray-600">{item.remarks}</p>
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
