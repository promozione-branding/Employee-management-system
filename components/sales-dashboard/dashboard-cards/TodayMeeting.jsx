"use client";

import Loading from "@/components/layout/Loading";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { todayMeetingService } from "@/service/sales-dashboard/dashboard-api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const TodayMeeting = () => {
  const { employee } = useSalesEmployeeStore();
  const [loading, setLoading] = useState(true);
  const [todayMeetingData, setTodayMeetingData] = useState([]);

  async function fetchTodayMeeting() {
    try {
      const res = await todayMeetingService(employee?.user?._id);
      if (res.success) {
        setLoading(false);
        setTodayMeetingData(res?.data);
      }
      console.log(res);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(
        error?.response?.data?.message ||
          "Error while fetching the today meeting",
      );
    }
  }

  useEffect(() => {
    if (employee?.user?._id) {
      fetchTodayMeeting();
    }
  }, [employee]);

  if (loading) {
    return (
      <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <Skeleton height={28} width={180} className="mb-4" />
        <div className="space-y-3">
          <Skeleton height={64} count={3} borderRadius={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 max-h-[400px] lg:w-1/2">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Today's Meetings</h2>
      <div className="flex flex-col gap-3 overflow-y-auto  custom-scrollbar">
        {todayMeetingData?.length > 0 ? (
          todayMeetingData.map((meeting) => (
            <div
              key={meeting._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-gray-700 text-sm">
                  {meeting.clientName}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full capitalize inline-block mt-1 ${
                    meeting.updateType === "call"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {meeting.updateType}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">
                  {new Date(meeting.meetingAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(meeting.meetingAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <p className="text-sm">No meetings scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayMeeting;
