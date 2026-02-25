"use client";

import { getAnnouncementService } from "@/service/admin-dashboard/dashboard-api";
import { Megaphone, Calendar, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  async function fetchAnnouncement() {
    try {
      const res = await getAnnouncementService();
      if (res.success) {
        setAnnouncements(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  return (
    <>
      <div className="bg-[#f3eaea] rounded-lg shadow-md p-6 border h-full lg:w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Announcements</h2>
          </div>
        </div>

        <div className="space-y-4 max-h-80 h-[50vh] overflow-y-auto overflow-x-hidden">
          {loading ? (
            [...Array(3)].map((_, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <Skeleton height={20} width="70%" />
                <Skeleton count={2} height={14} className="mt-2" />
                <div className="flex gap-3 mt-2">
                  <Skeleton width={80} height={12} />
                  <Skeleton width={80} height={12} />
                </div>
              </div>
            ))
          ) : announcements.length > 0 ? (
            announcements.map((item) => (
              <div
                key={item._id}
                className="group border-b pb-4 last:border-0 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-all"
                onClick={() => setSelectedAnnouncement(item)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.targetDepartment && (
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {item.targetDepartment}
                    </span>
                  )}
                </div>
                {/* <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                  {item.content}
                </p> */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={12} />
                    <span>{item.author?.username || "Admin"}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              No announcements found.
            </div>
          )}
        </div>
      </div>

      {/* Dialog Overlay */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Dialog Content */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-start bg-slate-50/50">
              <div className="pr-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {selectedAnnouncement.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-500" />
                    <span>
                      {new Date(
                        selectedAnnouncement.createdAt,
                      ).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-purple-500" />
                    <span>{selectedAnnouncement.author?.username}</span>
                  </div>
                  {selectedAnnouncement.targetDepartment && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      {selectedAnnouncement.targetDepartment}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
                {selectedAnnouncement.content}
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
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

export default Announcement;
