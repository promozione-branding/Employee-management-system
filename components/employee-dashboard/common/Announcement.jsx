"use client";

import { announcementService } from "@/service/employee-dashboard/dashboard";
import { useEffect, useState } from "react";
import { Calendar, User, X, Bell, AlertCircle } from "lucide-react";
import Skeleton from "react-loading-skeleton";

const EmployeeAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await announcementService();
        if (res.success) {
          setAnnouncements(res.data || []);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 lg:h-[68vh]">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton circle height={24} width={24} />
          <Skeleton height={24} width={180} />
        </div>
        <div className="space-y-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between mb-2">
                <Skeleton width="60%" height={20} />
                <Skeleton width={80} height={20} />
              </div>
              <Skeleton count={2} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#f3eaea] rounded-lg shadow-md p-6 mb-6 lg:h-[68vh]">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-slate-800">Announcements</h2>
        </div>

        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <AlertCircle size={32} className="mb-2 opacity-50" />
            <p>No announcements available.</p>
          </div>
        ) : (
          <div className="space-y-3 h-[50vh] overflow-auto">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                onClick={() => setSelectedAnnouncement(announcement)}
                className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-all duration-200 group border-l-4 border-l-transparent hover:border-l-blue-500"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {announcement.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded whitespace-nowrap ml-2">
                    {new Date(announcement.startDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {announcement.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for displaying full content */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 border-b flex justify-between items-start bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedAnnouncement.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                  <Calendar size={14} />
                  <span>
                    {new Date(
                      selectedAnnouncement.startDate,
                    ).toLocaleDateString()}
                    {selectedAnnouncement.endDate &&
                      ` - ${new Date(selectedAnnouncement.endDate).toLocaleDateString()}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedAnnouncement.content}
              </p>

              {selectedAnnouncement.author && (
                <div className="mt-6 pt-4 border-t flex items-center gap-2 text-sm text-slate-500">
                  <User size={14} />
                  <span>
                    Posted by:{" "}
                    <span className="font-medium text-slate-700">
                      {selectedAnnouncement.author.username || "Admin"}
                    </span>
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeAnnouncements;
