// app/dashboard/customer/history/seo-report-history/[id]/SeoReport.jsx

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
import axios from "axios"; 
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

  // ---- drag-to-scroll refs ----
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeftStart = useRef(0);
  const scrollTopStart = useRef(0);

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
      toast.error(error?.response?.data?.message || "error while");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) return <p>Loading...</p>;

  const groupedData = data.keywords.reduce((acc, kw) => {
    const projectId = kw.projectId;

    if (!acc[projectId]) {
      acc[projectId] = {
        projectName: kw?.project?.projectName || "Unknown Project",
        keywords: [],
      };
    }

    acc[projectId].keywords.push(kw);

    return acc;
  }, {});

  const handleUpdate = async () => {
    try {
      const payload = {
        keywordId: selected.keywordId,
        rankingId: selected.rankingId,
        page: Number(form.page),
        position: Number(form.position),
      };

      const res = await editRankingService(payload);
      toast.success(res.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // ---- drag-to-scroll handlers ----
  const handleMouseDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    // Don't hijack clicks on interactive elements (dialog trigger / buttons)
    if (
      e.target.closest("button") ||
      e.target.closest("[role='dialog']") ||
      e.target.closest("[data-no-drag]")
    ) {
      return;
    }
    isDragging.current = true;
    startX.current = e.pageX;
    startY.current = e.pageY;
    scrollLeftStart.current = el.scrollLeft;
    scrollTopStart.current = el.scrollTop;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();

    const dx = e.pageX - startX.current;
    const dy = e.pageY - startY.current;

    el.scrollLeft = scrollLeftStart.current - dx;
    el.scrollTop = scrollTopStart.current - dy;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    const el = scrollRef.current;
    if (el) {
      el.style.cursor = "grab";
      el.style.userSelect = "";
    }
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        overflow: "auto",
        maxHeight: "calc(100vh - 120px)",
        cursor: "grab",
      }}
      className="rounded-lg border border-gray-200"
    >
      <table
        className="border p-3"
        cellPadding="10"
        style={{ borderCollapse: "collapse", minWidth: "100%" }}
      >
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="border-r px-5 bg-gray-100 sticky left-0 z-20">
              S.No
            </th>
            <th className="border-r px-5 bg-gray-100 sticky left-[60px] z-20 min-w-[180px] text-left">
              Keyword
            </th>

            {dates.map((date, i) => (
              <th className="border-r px-5 bg-gray-100 whitespace-nowrap" key={i}>
                {date}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Object.entries(groupedData).map(([projectId, projectData]) => (
            <React.Fragment key={projectId}>
              <tr className="bg-gray-100">
                <td
                  colSpan={dates.length + 2}
                  className="px-4 py-3 font-bold text-gray-800 sticky left-0"
                >
                  {projectData.projectName}
                </td>
              </tr>

              {/* PROJECT KEYWORDS */}
              {projectData.keywords.map((kw, index) => {
                return (
                  <tr key={kw._id} className="border px-5">
                    <td className="border-r px-2 bg-white sticky left-0 z-10">
                      {index + 1}
                    </td>

                    <td
                      className={`border-r px-5 py-2 capitalize cursor-pointer bg-white sticky left-[60px] z-10 min-w-[180px] ${
                        kw.type === "primary"
                          ? "font-bold text-blue-600"
                          : ""
                      }`}
                    >
                      {kw.keyword}
                    </td>

                    {dates.map((date, i) => {
                      const found = kw.rankings.find(
                        (r) => new Date(r.date).toDateString() === date
                      );

                      return (
                        <td
                          key={i}
                          className={`px-3 py-3 text-center border-r transition-colors ${
                            found ? "bg-red-50" : ""
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
                              <DialogTrigger>
                                <div className="flex flex-col items-center gap-2">
                                  {/* Page + Position */}
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-semibold">
                                      Page {found.page}
                                    </span>

                                    <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-semibold">
                                      Pos {found.position}
                                    </span>
                                  </div>

                                  {/* Employee */}
                                  {found.employeeID?.basicDetails?.name && (
                                    <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                      <span>👤</span>
                                      <span className="font-medium">
                                        {found.employeeID.basicDetails.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Postion</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col gap-5 pt-5 border-t">
                                  <div className="gap-3 flex flex-col">
                                    <Label className="">Page</Label>
                                    <Input
                                      type="number"
                                      value={form.page}
                                      onChange={(e) =>
                                        setForm((prev) => ({
                                          ...prev,
                                          page: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="gap-3 flex flex-col">
                                    <Label className="">Postion</Label>
                                    <Input
                                      type="number"
                                      value={form.position}
                                      onChange={(e) =>
                                        setForm((prev) => ({
                                          ...prev,
                                          position: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>

                                  <div className="flex gap-2 items-center justify-end">
                                    <button
                                      onClick={handleUpdate}
                                      className="bg-black text-white rounded px-3 py-2"
                                    >
                                      Update
                                    </button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SeoSheetAdmin;