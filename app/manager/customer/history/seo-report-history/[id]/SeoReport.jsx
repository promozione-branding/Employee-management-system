"use client";

import { seoReportHistoryService } from "@/service/customer/history";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const SeoSheetAdmin = ({ clientId }) => {
  const [data, setData] = useState(null);
  const [dates, setDates] = useState([]);

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

  console.log(groupedData)

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        className="border p-3"
        cellPadding="10"
        style={{ borderCollapse: "collapse" }}
      >
        <thead className="border-b bg-gray-100">
          <tr>
            <th className="border-r px-5">S.No</th>
            <th className="border-r px-5">Keyword</th>

            {dates.map((date, i) => (
              <th className="border-r px-5" key={i}>
                {date}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* {data.keywords.map((kw, index) => (
            <tr key={kw._id} className="border px-5">
              <td className="border-r px-2">{index + 1}</td>

              <td
                className={`border-r px-5 py-2 capitalize ${kw.type === "primary" ? "font-bold text-blue-600" : ""
                  }`}
              >
                {kw.keyword}
              </td>

              {dates.map((date, i) => {
                const found = kw.rankings.find(
                  (r) => new Date(r.date).toDateString() === date,
                );

                return (
                  <td
                    key={i}
                    className={`px-2 text-center ${found ? "bg-red-100" : ""}`}
                  >
                    {found ? (
                      <>
                        <div>{found.page} Page</div>
                        <div>{found.position} Position</div>

          <div className="text-xs text-gray-500 mt-1">
            by {found.employeeID?.basicDetails?.name}
          </div>
        </>
        ) : (
        "-"
                    )}
      </td>
      );
              })}
    </tr>
  ))
} */}

          {Object.entries(groupedData).map(
            ([projectId, projectData]) => (
              <React.Fragment key={projectId}>
                <tr className="bg-gray-100">
                  <td colSpan={dates.length + 3}
                    className="px-4 py-3 font-bold text-gray-800"
                  >
                    {projectData.projectName}
                  </td>
                </tr>

                {/* PROJECT KEYWORDS */}
                {projectData.keywords.map((kw, index) => {
                  return (
                    <tr key={kw._id} className="border px-5">
                      <td className="border-r px-2">
                        {index + 1}
                      </td>

                      <td
                        className={`border-r px-5 py-2 capitalize cursor-pointer ${kw.type === "primary"
                          ? "font-bold text-blue-600"
                          : ""
                          }`}
                      >
                        {kw.keyword}
                      </td>

                      {dates.map((date, i) => {
                        const found = kw.rankings.find(
                          (r) =>
                            new Date(r.date).toDateString() ===
                            date
                        );

                        return (
                          <td
                            key={i}
                            className={`px-3 py-3 text-center border-r transition-colors ${found ? "bg-red-50" : ""
                              }`}
                          >
                            {found ? (
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
        </tbody >
      </table >
    </div >
  );
};

export default SeoSheetAdmin;
