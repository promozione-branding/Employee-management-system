"use client";

import { useEffect, useState } from "react";
import { employeeRecentActivityService } from "@/service/employee-dashboard/dashboard";
import { CheckCircle2, Clock } from "lucide-react";
import Loading from "@/components/layout/Loading";

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
    return <Loading />
  }

  if (!activity.length) {
    return <p className="text-sm text-muted-foreground">No recent activity</p>;
  }

  return (
    <div className="space-y-3 px-5 bg-white mx-2 py-3 rounded-lg">
      <h3 className="text-lg font-semibold">Recent Activity</h3>

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
    </div>
  );
}

export default RecentActivity;
