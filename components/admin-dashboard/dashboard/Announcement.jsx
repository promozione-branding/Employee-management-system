
"use client";

import { getAnnouncementService } from "@/service/admin-dashboard/dashboard-api";

import {
  Megaphone,
  CalendarDays,
  UserRound,
  X,
  Building2,
  BellRing,
  ArrowUpRight,
  Clock3,
} from "lucide-react";

import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// ========================================
// DATE FORMATTER
// ========================================

const formatDate = (date, options) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", options);
};

// ========================================
// ANNOUNCEMENT COMPONENT
// ========================================

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // ========================================
  // FETCH ANNOUNCEMENTS
  // ========================================

  async function fetchAnnouncement() {
    try {
      const res = await getAnnouncementService();

      if (res.success) {
        setAnnouncements(res.data || []);
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

  // ========================================
  // ESCAPE KEY MODAL CLOSE
  // ========================================

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

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <>
      <section
        className="
          flex
          h-[410px]
          min-h-0
          w-full
          min-w-0
          flex-col
          overflow-hidden
          rounded-[22px]
          border
          border-[#E1E7F0]
          bg-white
          p-5
          shadow-[0_3px_12px_rgba(10,46,102,0.05)]
          transition-shadow
          duration-300
          hover:shadow-[0_8px_24px_rgba(10,46,102,0.07)]
          sm:p-[22px]
        "
      >

        {/* ================================== */}
        {/* HEADER */}
        {/* ================================== */}

        <div className="mb-4 flex shrink-0 items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            {/* Icon */}

            <div
              className="
                flex
                h-10 w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#E9EFF9]
                text-[#376BB5]
              "
            >
              <Megaphone size={20} strokeWidth={1.9} />
            </div>

            {/* Heading */}

            <div className="min-w-0">

              <h2
                className="
                  font-serif
                  text-[21px]
                  font-bold
                  leading-tight
                  tracking-tight
                  text-[#0A2E66]
                "
              >
                Announcements
              </h2>

              <p className="mt-1 text-[13px] leading-5 text-[#56647D]">
                Updates and important messages
              </p>

            </div>

          </div>

          {/* Announcement count */}

          <span
            className="
              inline-flex
              h-[29px]
              shrink-0
              items-center
              gap-1.5
              rounded-full
              bg-[#FFF3D9]
              px-3
              text-[11px]
              font-bold
              text-[#B86A00]
            "
          >
            <BellRing size={13} />

            {announcements.length} Updates
          </span>

        </div>

        {/* ================================== */}
        {/* ANNOUNCEMENT LIST */}
        {/* ================================== */}

        <div
          className="
            min-h-0
            flex-1
            space-y-2.5
            overflow-x-hidden
            overflow-y-auto
            pr-1

            [&::-webkit-scrollbar]:w-[5px]
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[#DDE4EF]
            hover:[&::-webkit-scrollbar-thumb]:bg-[#AEBBD0]

            [scrollbar-width:thin]
            [scrollbar-color:#DDE4EF_transparent]
          "
        >

          {/* ================================== */}
          {/* LOADING */}
          {/* ================================== */}

          {loading ? (

            <div className="space-y-2.5" aria-label="Loading announcements">

              {[1, 2, 3].map((item) => (

                <div
                  key={item}
                  className="
                    rounded-[16px]
                    border
                    border-[#E1E7F0]
                    p-3.5
                  "
                >

                  <div className="flex items-center gap-3">

                    <Skeleton
                      width={40}
                      height={40}
                      borderRadius={12}
                    />

                    <div className="flex-1 space-y-2">

                      <Skeleton height={14} width="65%" />

                      <Skeleton height={11} width="42%" />

                    </div>

                  </div>

                  <div className="mt-3">
                    <Skeleton height={11} width="85%" />
                  </div>

                </div>

              ))}

            </div>

          ) : announcements.length > 0 ? (

            /* ================================== */
            /* ANNOUNCEMENT CARDS */
            /* ================================== */

            announcements.map((item) => (

              <button
                type="button"
                key={item._id}
                onClick={() => setSelectedAnnouncement(item)}
                className="
                  group
                  flex
                  w-full
                  min-w-0
                  items-center
                  gap-3
                  rounded-[16px]
                  border
                  border-[#E1E7F0]
                  bg-white
                  p-3.5
                  text-left
                  transition-all
                  duration-200
                  hover:border-[#C8D6EA]
                  hover:bg-[#F9FAFD]
                  hover:shadow-[0_4px_12px_rgba(10,46,102,0.05)]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#F27B1E]
                "
              >

                {/* Announcement icon */}

                <div
                  className="
                    flex
                    h-10 w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#E9EFF9]
                    text-[#376BB5]
                    transition-colors
                    duration-200
                    group-hover:bg-[#DCE7F7]
                  "
                >
                  <Megaphone size={19} strokeWidth={1.8} />
                </div>

                {/* Announcement details */}

                <div className="min-w-0 flex-1">

                  {/* Title */}

                  <div className="flex min-w-0 items-center gap-2">

                    <h3
                      className="
                        min-w-0
                        flex-1
                        truncate
                        text-[14px]
                        font-semibold
                        leading-5
                        text-[#0F1B33]
                        transition-colors
                        group-hover:text-[#0A2E66]
                      "
                    >
                      {item.title || "Announcement"}
                    </h3>

                    {item.targetDepartment && (
                      <span
                        className="
                          max-w-[100px]
                          shrink-0
                          truncate
                          rounded-full
                          bg-[#FFF3D9]
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          text-[#B86A00]
                        "
                      >
                        {item.targetDepartment}
                      </span>
                    )}

                  </div>

                  {/* Description */}

                  <p
                    className="
                      mt-1
                      line-clamp-1
                      break-words
                      text-[12px]
                      leading-4
                      text-[#56647D]
                    "
                  >
                    {item.content}
                  </p>

                  {/* Date */}

                  <div
                    className="
                      mt-2
                      flex
                      flex-wrap
                      items-center
                      gap-x-3
                      gap-y-1
                      text-[11px]
                      text-[#8793AA]
                    "
                  >

                    <span className="inline-flex items-center gap-1.5">

                      <CalendarDays size={12} />

                      {formatDate(item.createdAt, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}

                    </span>

                    <span className="inline-flex min-w-0 items-center gap-1.5">

                      <UserRound size={12} />

                      <span className="max-w-[120px] truncate">
                        {item.author?.username || "Admin"}
                      </span>

                    </span>

                  </div>

                </div>

                {/* Open icon */}

                <div
                  className="
                    flex
                    h-8 w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-[#8793AA]
                    transition-all
                    duration-200
                    group-hover:bg-[#E9EFF9]
                    group-hover:text-[#0A2E66]
                  "
                >
                  <ArrowUpRight
                    size={17}
                    className="
                      transition-transform
                      duration-200
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                    "
                  />
                </div>

              </button>

            ))

          ) : (

            /* ================================== */
            /* EMPTY STATE */
            /* ================================== */

            <div
              className="
                flex
                min-h-[180px]
                flex-col
                items-center
                justify-center
                rounded-[16px]
                border
                border-dashed
                border-[#E1E7F0]
                bg-[#F7F8FC]
                px-4
                py-8
                text-center
              "
            >

              <div
                className="
                  mb-3
                  flex
                  h-11 w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#E9EFF9]
                  text-[#376BB5]
                "
              >
                <Megaphone size={22} />
              </div>

              <h3 className="text-[14px] font-semibold text-[#0A2E66]">
                No announcements yet
              </h3>

              <p
                className="
                  mt-1
                  max-w-[220px]
                  text-[12px]
                  leading-5
                  text-[#8491A8]
                "
              >
                Important updates will appear here when they are available.
              </p>

            </div>

          )}

        </div>

        {/* ================================== */}
        {/* FOOTER */}
        {/* ================================== */}

        {!loading && announcements.length > 0 && (

          <div
            className="
              mt-3
              flex
              shrink-0
              items-center
              justify-between
              gap-2
              border-t
              border-[#E1E7F0]
              pt-3
            "
          >

            <p className="text-[11px] text-[#8793AA]">
              {announcements.length}{" "}
              {announcements.length === 1
                ? "announcement"
                : "announcements"}
            </p>

            <span
              className="
                inline-flex
                items-center
                gap-1
                text-[11px]
                font-semibold
                text-[#0A2E66]
              "
            >
              Select to read
              <ArrowUpRight size={13} />
            </span>

          </div>

        )}

      </section>

      {/* ================================== */}
      {/* ANNOUNCEMENT DETAIL MODAL */}
      {/* ================================== */}

      {selectedAnnouncement && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            overflow-y-auto
            bg-[#0A1933]/50
            p-3
            backdrop-blur-sm
            sm:p-6
          "
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
            className="
              my-auto
              flex
              max-h-[90dvh]
              w-full
              max-w-2xl
              flex-col
              overflow-hidden
              rounded-[22px]
              border
              border-[#E1E7F0]
              bg-white
              shadow-[0_20px_70px_rgba(10,46,102,0.20)]
            "
          >

            {/* Modal header */}

            <div
              className="
                relative
                overflow-hidden
                border-b
                border-[#E1E7F0]
                bg-[#F7F8FC]
                px-5
                py-5
                sm:px-7
                sm:py-6
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-10
                  -top-12
                  h-40
                  w-40
                  rounded-full
                  bg-[#E9EFF9]
                "
              />

              <div className="relative flex items-start justify-between gap-4">

                <div className="min-w-0 flex-1">

                  {/* Modal icon */}

                  <div
                    className="
                      mb-3
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-[#E9EFF9]
                      px-3
                      py-1.5
                      text-[11px]
                      font-bold
                      text-[#376BB5]
                    "
                  >
                    <Megaphone size={14} />
                    Announcement
                  </div>

                  {/* Modal title */}

                  <h2
                    id="announcement-modal-title"
                    className="
                      break-words
                      font-serif
                      text-xl
                      font-bold
                      leading-tight
                      tracking-tight
                      text-[#0A2E66]
                      sm:text-2xl
                    "
                  >
                    {selectedAnnouncement.title}
                  </h2>

                  {/* Modal information */}

                  <div
                    className="
                      mt-4
                      flex
                      flex-wrap
                      items-center
                      gap-x-4
                      gap-y-2
                      text-[12px]
                      text-[#56647D]
                    "
                  >

                    <span className="inline-flex items-center gap-1.5">

                      <CalendarDays
                        size={14}
                        className="shrink-0 text-[#376BB5]"
                      />

                      {formatDate(selectedAnnouncement.createdAt, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}

                    </span>

                    <span className="inline-flex items-center gap-1.5">

                      <UserRound
                        size={14}
                        className="shrink-0 text-[#376BB5]"
                      />

                      {selectedAnnouncement.author?.username || "Admin"}

                    </span>

                    {selectedAnnouncement.targetDepartment && (

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-[#E9EFF9]
                          px-2.5
                          py-1
                          text-[11px]
                          font-semibold
                          text-[#0A2E66]
                        "
                      >
                        <Building2 size={13} />

                        {selectedAnnouncement.targetDepartment}

                      </span>

                    )}

                  </div>

                </div>

                {/* Close button */}

                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  aria-label="Close announcement"
                  className="
                    flex
                    h-9 w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[#E1E7F0]
                    bg-white
                    text-[#56647D]
                    transition-colors
                    hover:bg-[#FFF3D9]
                    hover:text-[#B86A00]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#F27B1E]
                  "
                >
                  <X size={18} />
                </button>

              </div>

            </div>

            {/* Modal content */}

            <div
              className="
                min-h-[150px]
                overflow-y-auto
                px-5
                py-6
                sm:px-7
                sm:py-7
              "
            >

              <div
                className="
                  whitespace-pre-wrap
                  break-words
                  text-[14px]
                  leading-7
                  text-[#34445F]
                  sm:text-[15px]
                "
              >
                {selectedAnnouncement.content || "No content available."}
              </div>

            </div>

            {/* Modal footer */}

            <div
              className="
                flex
                justify-end
                border-t
                border-[#E1E7F0]
                bg-[#F7F8FC]
                px-5
                py-4
                sm:px-7
              "
            >

              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border-b-[3px]
                  border-[#F27B1E]
                  bg-[#0A2E66]
                  px-5
                  py-2.5
                  text-[13px]
                  font-bold
                  text-white
                  transition-colors
                  hover:bg-[#12397A]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#F27B1E]
                  focus-visible:ring-offset-2
                "
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
