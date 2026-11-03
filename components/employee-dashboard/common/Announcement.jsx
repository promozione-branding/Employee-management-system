// components/employee-dashboard/common/Announcement.jsx

"use client";

import { useEffect, useState } from "react";
import { announcementService } from "@/service/employee-dashboard/dashboard";
import {
  CalendarDays,
  UserRound,
  X,
  Bell,
  AlertCircle,
  ArrowUpRight,
  Megaphone,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const EmployeeAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAnnouncements = async () => {
      try {
        const res = await announcementService();

        if (!cancelled && res?.success) {
          setAnnouncements(res.data || []);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAnnouncements();

    return () => {
      cancelled = true;
    };
  }, []);

  // Close the modal with Escape.
  useEffect(() => {
    if (!selectedAnnouncement) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedAnnouncement(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedAnnouncement]);

  return (
    <>
      <div className="flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(15,27,51,0.07)] lg:h-[68vh]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#EDF0F5] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66] text-white shadow-sm">
              <Megaphone size={20} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold tracking-tight text-[#0F1B33]">
                Announcements
              </h2>
              <p className="mt-0.5 text-xs text-[#8A92A6]">
                News and updates from your team
              </p>
            </div>
          </div>

          {!loading && (
            <span className="shrink-0 rounded-full bg-[#FFF4E9] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#C66513]">
              {announcements.length}
            </span>
          )}
        </div>

        {/* Announcement List */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:px-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-[#E9EDF4] p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <Skeleton height={16} width="65%" />
                    <Skeleton height={22} width={72} borderRadius={20} />
                  </div>
                  <Skeleton count={2} />
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-[#DDE3ED] bg-[#FAFBFD] px-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F3F8] text-[#0A2E66]">
                <AlertCircle size={22} />
              </div>

              <h3 className="text-sm font-semibold text-[#26344D]">
                No announcements yet
              </h3>

              <p className="mt-1 max-w-52 text-xs leading-5 text-[#929BAD]">
                Company news and important updates will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <button
                  key={announcement._id}
                  type="button"
                  onClick={() => setSelectedAnnouncement(announcement)}
                  className="group w-full rounded-xl border border-[#E9EDF4] border-l-4 border-l-transparent bg-white p-3.5 text-left transition-all duration-200 hover:border-[#D5DEEF] hover:border-l-[#F27B1E] hover:bg-[#FAFBFD] hover:shadow-[0_4px_14px_rgba(15,27,51,0.04)] sm:p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F27B1E] transition-colors group-hover:bg-[#F27B1E] group-hover:text-white">
                      <Bell size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#26344D] transition-colors group-hover:text-[#0A2E66]">
                          {announcement.title || "Announcement"}
                        </h3>

                        <ArrowUpRight
                          size={15}
                          className="mt-0.5 shrink-0 text-[#A5ADBD] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#F27B1E]"
                        />
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#929BAD]">
                        <CalendarDays size={12} className="shrink-0" />
                        <span>{formatDate(announcement.startDate)}</span>
                      </div>

                      <p className="mt-2 line-clamp-3 break-words text-xs leading-5 text-[#647089]">
                        {announcement.content || "No additional details."}
                      </p>

                      <p className="mt-3 text-[11px] font-semibold text-[#0A2E66]">
                        Read announcement
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-[#EDF0F5] px-4 py-3 text-[11px] text-[#929BAD] sm:px-5">
          <Bell size={13} />
          <span>Company updates</span>
          <span className="ml-auto font-medium text-[#0A2E66]">
            {loading ? "Loading..." : "Latest news"}
          </span>
        </div>
      </div>

      {/* Announcement Details Modal */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1B33]/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAnnouncement(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-dialog-title"
            className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#EDF0F5] bg-[#FAFBFD] p-5 sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66] text-white">
                  <Megaphone size={20} />
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#F27B1E]">
                    Company announcement
                  </p>

                  <h3
                    id="announcement-dialog-title"
                    className="break-words text-lg font-bold leading-6 text-[#0F1B33]"
                  >
                    {selectedAnnouncement.title || "Announcement"}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8A92A6]">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      {formatDate(selectedAnnouncement.startDate)}
                    </span>

                    {selectedAnnouncement.endDate && (
                      <span>
                        Until {formatDate(selectedAnnouncement.endDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                aria-label="Close announcement"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E3E7F0] bg-white text-[#647089] transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-[#F27B1E]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#526078]">
                {selectedAnnouncement.content || "No additional details."}
              </p>

              {selectedAnnouncement.author && (
                <div className="mt-6 flex items-center gap-3 border-t border-[#EDF0F5] pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F3F8] text-[#0A2E66]">
                    <UserRound size={17} />
                  </div>

                  <div>
                    <p className="text-[11px] text-[#929BAD]">Published by</p>

                    <p className="text-sm font-semibold text-[#26344D]">
                      {selectedAnnouncement.author.username || "Admin"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-[#EDF0F5] bg-[#FAFBFD] p-4">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="rounded-xl bg-[#0A2E66] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#082653]"
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
