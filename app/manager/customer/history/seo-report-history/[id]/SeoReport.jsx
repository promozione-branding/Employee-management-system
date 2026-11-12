
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { seoReportHistoryService } from "@/service/customer/history";
import { editRankingService } from "@/service/customer/work";

import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const SeoSheetAdmin = ({ clientId }) => {
  const [data, setData] = useState(null);
  const [dates, setDates] = useState([]);

  const [form, setForm] = useState({
    page: "",
    position: "",
  });

  const [selected, setSelected] = useState({
    keywordId: "",
    rankingId: "",
  });

  const [updating, setUpdating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const tableRef = useRef(null);

  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  // ==========================================
  // FETCH SEO HISTORY
  // ==========================================

  const fetchData = async () => {
    try {
      const res = await seoReportHistoryService(clientId);
      const sheet = res.data;

      let allDates = [];

      sheet.keywords.forEach((kw) => {
        kw.rankings.forEach((r) => {
          const d = new Date(r.date).toDateString();

          if (!allDates.includes(d)) {
            allDates.push(d);
          }
        });
      });

      allDates.sort((a, b) => new Date(a) - new Date(b));

      setDates(allDates);
      setData(sheet);
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message ||
          "Error while fetching SEO report"
      );
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  // ==========================================
  // MOUSE DRAG HORIZONTAL SCROLL
  // ==========================================

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;

    if (!tableRef.current) return;

    // Avoid starting drag from interactive elements
    if (
      e.target.closest("button") ||
      e.target.closest("input")
    ) {
      return;
    }

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      scrollLeft: tableRef.current.scrollLeft,
      moved: false,
    };

    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!dragRef.current.isDragging || !tableRef.current) return;

      const distance = e.clientX - dragRef.current.startX;

      if (Math.abs(distance) > 4) {
        dragRef.current.moved = true;
      }

      if (dragRef.current.moved) {
        tableRef.current.scrollLeft =
          dragRef.current.scrollLeft - distance;
      }
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  // Prevent dialog opening after dragging
  const handleClickCapture = (e) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();

      dragRef.current.moved = false;
    }
  };

  // ==========================================
  // UPDATE RANKING
  // ==========================================

  const handleUpdate = async () => {
    if (!form.page || !form.position) {
      toast.error("Please enter both page and position");
      return;
    }

    try {
      setUpdating(true);

      const payload = {
        keywordId: selected.keywordId,
        rankingId: selected.rankingId,
        page: Number(form.page),
        position: Number(form.position),
      };

      const res = await editRankingService(payload);

      toast.success(res.message);

      await fetchData();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (!data) {
    return (
      <div className="flex min-h-[250px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          Loading SEO report...
        </div>
      </div>
    );
  }

  // ==========================================
  // KEYWORD SEARCH
  // ==========================================

  const filteredKeywords = data.keywords.filter((kw) =>
    (kw.keyword || "")
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  );

  // ==========================================
  // GROUP KEYWORDS BY PROJECT
  // ==========================================

  const groupedData = filteredKeywords.reduce((acc, kw) => {
    const projectId = kw.projectId || "unknown";

    if (!acc[projectId]) {
      acc[projectId] = {
        projectName:
          kw?.project?.projectName || "Unknown Project",
        keywords: [],
      };
    }

    acc[projectId].keywords.push(kw);

    return acc;
  }, {});

  // ==========================================
  // PROJECT WEBSITE NAME
  // ==========================================

  const getProjectHeading = (projectName) => {
    const name = String(projectName || "Unknown Project").trim();

    if (/^seo\s*-/i.test(name)) {
      return name;
    }

    return `SEO - ${name}`;
  };

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    const parsed = new Date(date);

    return {
      day: parsed.getDate(),
      month: parsed.toLocaleString("en-US", {
        month: "short",
      }),
      weekday: parsed.toLocaleString("en-US", {
        weekday: "short",
      }),
      year: parsed.getFullYear(),
    };
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="w-full space-y-4">

      {/* ======================================
          REPORT HEADER
      ====================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">

        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            SEO Ranking History
          </h2>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Track keyword rankings across reporting dates.
          </p>
        </div>

        {/* KEYWORD SEARCH */}

        <div className="relative w-full sm:w-[260px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>

          <Input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords..."
            className="h-9 pl-9 pr-8 text-sm"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* LEGEND */}

        <div className="flex flex-wrap items-center gap-3 text-xs">

          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
            <span className="h-2 w-2 rounded-full bg-blue-500" />

            <span className="text-gray-600 dark:text-gray-300">
              Primary Keyword
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
            <span className="h-2 w-2 rounded-full bg-red-400" />

            <span className="text-gray-600 dark:text-gray-300">
              Ranking Available
            </span>
          </div>

        </div>
      </div>

      {/* SEARCH RESULT COUNT */}

      {searchTerm && (
        <div className="px-1 text-xs text-gray-500 dark:text-gray-400">
          Found {filteredKeywords.length} matching keyword
          {filteredKeywords.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* ======================================
          SCROLL INSTRUCTIONS
      ====================================== */}

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-gray-500 dark:text-gray-400">

        <span>
          🖱️ Hold left click and drag to scroll horizontally
        </span>

        <span>
          Use mouse wheel to scroll vertically
        </span>

      </div>

      {/* ======================================
          SEO TABLE
      ====================================== */}

      <div
        ref={tableRef}
        onMouseDown={handleMouseDown}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className={`seo-table-scroll w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          maxHeight: "75vh",
          overscrollBehavior: "contain",
          scrollbarWidth: "thin",
          WebkitOverflowScrolling: "touch",
        }}
      >

        <table className="w-max min-w-full border-separate border-spacing-0 text-sm">

          {/* ==================================
              TABLE HEADER
          ================================== */}

          <thead>
            <tr>

              {/* S.NO HEADER */}

              <th
                className="sticky left-0 top-0 z-40 w-[65px] min-w-[65px] border-b border-r border-gray-200 bg-gray-100 px-3 py-4 text-center font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                S.No
              </th>

              {/* KEYWORD HEADER */}

              <th
                className="sticky left-[65px] top-0 z-40 w-[230px] min-w-[230px] border-b border-r border-gray-200 bg-gray-100 px-5 py-4 text-left font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                Keyword
              </th>

              {/* DATE HEADERS */}

              {dates.map((date, i) => {
                const formatted = formatDate(date);

                return (
                  <th
                    key={i}
                    className="sticky top-0 z-30 min-w-[180px] border-b border-r border-gray-200 bg-gray-100 px-4 py-3 text-center dark:border-gray-700 dark:bg-gray-800"
                  >

                    <div className="flex flex-col items-center gap-1">

                      <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        {formatted.weekday}
                      </span>

                      <span className="text-sm font-bold text-gray-800 dark:text-white">
                        {formatted.day} {formatted.month}
                      </span>

                      <span className="text-[10px] font-medium text-gray-400">
                        {formatted.year}
                      </span>

                    </div>

                  </th>
                );
              })}

            </tr>
          </thead>

          {/* ==================================
              TABLE BODY
          ================================== */}

          <tbody>

            {Object.entries(groupedData).map(
              ([projectId, projectData]) => (

                <React.Fragment key={projectId}>

                  {/* ==================================
                      PROJECT / WEBSITE HEADING

                      Sticky horizontally only.
                      Normal vertical scrolling.
                  ================================== */}

                  <tr>

                    {/* FIXED WEBSITE NAME */}

                    <td
                      colSpan={2}
                      className="sticky left-0 z-30 border-b border-r border-gray-200 bg-gray-100 px-5 py-4 font-bold text-gray-800 shadow-[4px_0_6px_-4px_rgba(0,0,0,0.15)] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 25,
                        width: "295px",
                        minWidth: "295px",
                        maxWidth: "295px",
                      }}
                    >

                      <div className="flex items-center gap-3">

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          SEO
                        </span>

                        <span className="text-base">
                          {getProjectHeading(projectData.projectName)}
                        </span>

                        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                          {projectData.keywords.length}
                        </span>

                      </div>

                    </td>

                    {/* EMPTY DATE AREA */}

                    {dates.length > 0 && (
                      <td
                        colSpan={dates.length}
                        className="border-b border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                      />
                    )}

                  </tr>

                  {/* ==================================
                      KEYWORD ROWS
                  ================================== */}

                  {projectData.keywords.map((kw, index) => (

                    <tr
                      key={kw._id}
                      className="group"
                    >

                      {/* STICKY S.NO */}

                      <td
                        className="sticky left-0 z-20 w-[65px] min-w-[65px] border-b border-r border-gray-200 bg-white px-3 py-4 text-center font-medium text-gray-600 group-hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:group-hover:bg-gray-800"
                      >
                        {index + 1}
                      </td>

                      {/* STICKY KEYWORD */}

                      <td
                        className={`sticky left-[65px] z-20 w-[230px] min-w-[230px] border-b border-r border-gray-200 bg-white px-5 py-4 capitalize group-hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:group-hover:bg-gray-800 ${
                          kw.type === "primary"
                            ? "font-bold text-blue-600 dark:text-blue-400"
                            : "font-medium text-gray-700 dark:text-gray-200"
                        }`}
                      >

                        <div className="flex items-center gap-2">

                          <span
                            className="max-w-[210px] truncate"
                            title={kw.keyword}
                          >
                            {kw.keyword}
                          </span>

                          {kw.type === "primary" && (
                            <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              Primary
                            </span>
                          )}

                        </div>

                      </td>

                      {/* RANKING DATE CELLS */}

                      {dates.map((date, i) => {

                        const found = kw.rankings.find(
                          (r) =>
                            new Date(r.date).toDateString() === date
                        );

                        return (

                          <td
                            key={i}
                            className={`min-w-[180px] border-b border-r border-gray-200 px-3 py-4 text-center transition-colors dark:border-gray-700 ${
                              found
                                ? "bg-red-50/70 dark:bg-red-950/20"
                                : "bg-white group-hover:bg-gray-50 dark:bg-gray-900 dark:group-hover:bg-gray-800"
                            }`}
                          >

                            {found ? (

                              <Dialog
                                onOpenChange={(open) => {

                                  if (open) {

                                    setSelected({
                                      keywordId: kw._id,
                                      rankingId: found._id,
                                    });

                                    setForm({
                                      page: found.page,
                                      position: found.position,
                                    });

                                  }

                                }}
                              >

                                <DialogTrigger asChild>

                                  <button
                                    type="button"
                                    className="mx-auto flex min-w-[145px] flex-col items-center gap-2 rounded-lg p-2 transition-all hover:bg-white hover:shadow-sm dark:hover:bg-gray-800"
                                  >

                                    {/* PAGE AND POSITION */}

                                    <div className="flex items-center justify-center gap-2">

                                      <span className="rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-700 dark:bg-red-900/50 dark:text-red-300">
                                        Page {found.page}
                                      </span>

                                      <span className="rounded-xl bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                        Pos {found.position}
                                      </span>

                                    </div>

                                    {/* EMPLOYEE */}

                                    {found.employeeID?.basicDetails?.name && (

                                      <div className="flex max-w-[160px] items-center justify-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">

                                        <span>👤</span>

                                        <span className="truncate font-medium">
                                          {found.employeeID.basicDetails.name}
                                        </span>

                                      </div>

                                    )}

                                  </button>

                                </DialogTrigger>

                                {/* EDIT RANKING DIALOG */}

                                <DialogContent className="sm:max-w-[425px]">

                                  <DialogHeader>
                                    <DialogTitle>
                                      Update Ranking Position
                                    </DialogTitle>
                                  </DialogHeader>

                                  <div className="space-y-5 border-t pt-5">

                                    {/* PAGE */}

                                    <div className="flex flex-col gap-2">

                                      <Label>Page</Label>

                                      <Input
                                        type="number"
                                        min="1"
                                        value={form.page}
                                        onChange={(e) =>
                                          setForm((prev) => ({
                                            ...prev,
                                            page: e.target.value,
                                          }))
                                        }
                                      />

                                    </div>

                                    {/* POSITION */}

                                    <div className="flex flex-col gap-2">

                                      <Label>Position</Label>

                                      <Input
                                        type="number"
                                        min="1"
                                        value={form.position}
                                        onChange={(e) =>
                                          setForm((prev) => ({
                                            ...prev,
                                            position: e.target.value,
                                          }))
                                        }
                                      />

                                    </div>

                                    {/* UPDATE BUTTON */}

                                    <div className="flex justify-end">

                                      <button
                                        type="button"
                                        disabled={updating}
                                        onClick={handleUpdate}
                                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {updating
                                          ? "Updating..."
                                          : "Update Ranking"}
                                      </button>

                                    </div>

                                  </div>

                                </DialogContent>

                              </Dialog>

                            ) : (

                              <span className="text-lg text-gray-300 dark:text-gray-600">
                                —
                              </span>

                            )}

                          </td>

                        );

                      })}

                    </tr>

                  ))}

                </React.Fragment>

              )

            )}

            {/* NO MATCHING KEYWORDS */}

            {filteredKeywords.length === 0 && (

              <tr>
                <td
                  colSpan={dates.length + 2}
                  className="px-5 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  {searchTerm
                    ? `No keywords found matching "${searchTerm}".`
                    : "No SEO ranking history available."}
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* ======================================
          SCROLLBAR STYLING
      ====================================== */}

      <style jsx>{`

        .seo-table-scroll {
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #a1a1aa transparent;
        }

        .seo-table-scroll::-webkit-scrollbar {
          width: 9px;
          height: 9px;
        }

        .seo-table-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .seo-table-scroll::-webkit-scrollbar-thumb {
          background: #a1a1aa;
          border-radius: 20px;
        }

        .seo-table-scroll::-webkit-scrollbar-thumb:hover {
          background: #71717a;
        }

        .seo-table-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }

      `}</style>

    </div>
  );
};

export default SeoSheetAdmin;
