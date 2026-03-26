"use client";

import { seoReportHistoryService } from "@/service/customer/history";
import { useEffect, useState } from "react";
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
          {data.keywords.map((kw, index) => (
            <tr key={kw._id} className="border px-5">
              <td className="border-r px-2">{index + 1}</td>

              <td
                className={`border-r px-5 py-2 capitalize ${
                  kw.type === "primary" ? "font-bold text-blue-600" : ""
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

                        {/* 👇 Employee Name */}
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SeoSheetAdmin;
