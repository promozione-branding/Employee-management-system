"use client";

import { getTodayMeetingService } from "@/service/admin-dashboard/dashboard-api";
import { Calendar, Phone, Users, Video } from "lucide-react";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const TodayMeeting = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchTodayMeeting() {
    try {
      const res = await getTodayMeetingService();
      if (res.success) {
        setMeetings(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTodayMeeting();
  }, []);

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "call":
        return <Phone size={16} className="text-green-600" />;
      case "meeting":
        return <Video size={16} className="text-blue-600" />;
      default:
        return <Users size={16} className="text-purple-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border h-full lg:w-1/2">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-purple-50 p-2 rounded-lg">
          <Calendar className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Today's Meetings</h2>
      </div>

      <div className="space-y-4 max-h-80 h-[50vh] overflow-y-auto">
        {loading ? (
          [...Array(3)].map((_, index) => (
            <div key={index} className="flex gap-4 border-b pb-4 last:border-0">
              <Skeleton width={60} height={60} className="rounded-lg" />
              <div className="flex-1">
                <Skeleton width="60%" height={16} />
                <Skeleton width="40%" height={12} className="mt-2" />
              </div>
            </div>
          ))
        ) : meetings.length > 0 ? (
          meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="flex items-start gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center bg-slate-100 min-w-[60px] h-[60px] rounded-lg p-2 text-center">
                <span className="text-xs font-bold text-slate-600">
                  {new Date(meeting.meetingAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {meeting.clientName}
                  </h3>
                  <span className="bg-slate-100 p-1.5 rounded-full">
                    {getIcon(meeting.updateType)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 truncate">
                  {meeting.company}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      meeting.updateType === "call"
                        ? "bg-green-100 text-green-700"
                        : meeting.updateType === "meeting"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {meeting.updateType}
                  </span>
                  {meeting.status && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize bg-gray-100 text-gray-600 border border-gray-200">
                      {meeting.status.replace(/-/g, " ")}
                    </span>
                  )}
                </div>
                {meeting.note && (
                  <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                    {meeting.note}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            No meetings scheduled for today.
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayMeeting;
