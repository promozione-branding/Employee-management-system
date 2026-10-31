
"use client";

// components/admin-dashboard/dashboard/Announcement.jsx

import { getAnnouncementService } from "@/service/admin-dashboard/dashboard-api";
import {
  Megaphone,
  Calendar,
  User,
  X,
  ArrowUpRight,
  Building2,
  BellRing,
} from "lucide-react";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const formatDate = (date, options) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", options);
};

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
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  // Allow closing the announcement modal with Escape.
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
      <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66]/[0.07] text-[#0A2E66]">
              <Megaphone className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold tracking-tight text-[#0A2E66] sm:text-lg">
                Announcements
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Updates and important messages
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-[#F27B1E]">
            <BellRing className="h-3.5 w-3.5" />
            Updates
          </span>
        </div>

        {/* Announcement list */}
        <div className="max-h-[360px] min-h-[220px] flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="border-b border-slate-100 py-4 last:border-b-0"
              >
                <Skeleton height={16} width="68%" />

                <div className="mt-2">
                  <Skeleton height={12} width="92%" />
                </div>

                <div className="mt-3 flex gap-3">
                  <Skeleton height={12} width={85} />
                  <Skeleton height={12} width={75} />
                </div>
              </div>
            ))
          ) : announcements.length > 0 ? (
            announcements.map((item) => (
              <button
                type="button"
                key={item._id}
                onClick={() => setSelectedAnnouncement(item)}
                className="group -mx-1 flex w-[calc(100%+0.5rem)] items-start gap-3 rounded-xl border-b border-slate-100 px-2 py-4 text-left transition-colors last:border-b-0 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0A2E66]"
              >
                {/* Announcement icon */}
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F27B1E] transition-colors group-hover:bg-orange-100">
                  <Megaphone className="h-4 w-4" />
                </div>

                {/* Announcement details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 break-words text-sm font-semibold leading-5 text-slate-800 transition-colors group-hover:text-[#0A2E66]">
                      {item.title}
                    </h3>

                    {item.targetDepartment && (
                      <span className="max-w-full shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                        {item.targetDepartment}
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 line-clamp-2 break-words text-xs leading-5 text-slate-500">
                    {item.content}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      {formatDate(item.createdAt, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="max-w-[130px] truncate">
                        {item.author?.username || "Admin"}
                      </span>
                    </span>
                  </div>
                </div>

                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[#F27B1E]" />
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Megaphone className="h-6 w-6" />
              </div>

              <p className="text-sm font-semibold text-slate-700">
                No announcements yet
              </p>
              <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-500">
                Important updates will appear here when they are available.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && announcements.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
            <p className="text-xs text-slate-500">
              {announcements.length}{" "}
              {announcements.length === 1
                ? "announcement"
                : "announcements"}
            </p>

            <span className="text-xs font-medium text-[#0A2E66]">
              Select to read
            </span>
          </div>
        )}
      </section>

      {/* Announcement modal */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAnnouncement(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-modal-title"
            className="my-auto flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl"
          >
            {/* Modal header */}
            <div className="relative overflow-hidden border-b border-slate-100 bg-slate-50/80 px-5 py-5 sm:px-7 sm:py-6">
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#F27B1E]/[0.07]" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-[#F27B1E]">
                    <Megaphone className="h-3.5 w-3.5" />
                    Announcement
                  </div>

                  <h2
                    id="announcement-modal-title"
                    className="break-words text-xl font-bold leading-tight tracking-tight text-[#0A2E66] sm:text-2xl"
                  >
                    {selectedAnnouncement.title}
                  </h2>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 sm:text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 shrink-0 text-[#F27B1E]" />
                      {formatDate(selectedAnnouncement.createdAt, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-4 w-4 shrink-0 text-[#0A2E66]" />
                      {selectedAnnouncement.author?.username || "Admin"}
                    </span>

                    {selectedAnnouncement.targetDepartment && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2E66]/[0.07] px-2.5 py-1 text-xs font-medium text-[#0A2E66]">
                        <Building2 className="h-3.5 w-3.5" />
                        {selectedAnnouncement.targetDepartment}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  aria-label="Close announcement"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2E66]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal content */}
            <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
              <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 sm:text-[15px]">
                {selectedAnnouncement.content || "No content available."}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="inline-flex items-center justify-center rounded-xl bg-[#0A2E66] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#082653] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2E66] focus-visible:ring-offset-2"
              >
                Close announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Announcement;
