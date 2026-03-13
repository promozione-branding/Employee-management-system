"use client";

import Loading from "@/components/layout/Loading";
import { GetClientWorkDetailHistory } from "@/service/customer/history";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const WorkProgressTab = ({ customerId }) => {
  const [loading, setLoading] = useState(true);
  const [clientWorkData, setClientWorkData] = useState([]);

  async function fetchClientWorkDetail() {
    try {
      const res = await GetClientWorkDetailHistory(customerId);
      if (res.success) {
        setLoading(false);
        setClientWorkData(res?.data?.workDetails);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response.data.message ||
          "Error while fetching the client work details",
      );
    }
  }

  useEffect(() => {
    fetchClientWorkDetail();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 h-[90vh] overflow-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Work History Details
      </h2>
      {clientWorkData.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No work history available for this client.
        </div>
      ) : (
        clientWorkData.map((work) => (
          <div
            key={work._id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            {/* Header Section */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {work.department} Department
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Started: {new Date(work.startedAt).toLocaleString()}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                      work.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : work.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {work.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {work.progressPercentage && (
                <div className="w-full md:w-64">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      Progress
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {work.progressPercentage.totalField > 0
                        ? Math.round(
                            (work.progressPercentage.completeField /
                              work.progressPercentage.totalField) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          work.progressPercentage.totalField > 0
                            ? (work.progressPercentage.completeField /
                                work.progressPercentage.totalField) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {work.progressPercentage.completeField} /{" "}
                    {work.progressPercentage.totalField} Completed
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Employees Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Team Members
                </h4>
                <div className="flex flex-wrap gap-3">
                  {work.employeeId.map((emp) => (
                    <div
                      key={emp._id}
                      className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {emp.basicDetails.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {emp.basicDetails.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {emp.basicDetails.designation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Task Checklist
                </h4>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Task
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completed At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CompletedBy
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Proof
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {work.checklist.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {item.label}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.completed ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.completedAt
                              ? new Date(item.completedAt).toLocaleString()
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                            {item.remarks || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium max-w-xs truncate capitalize text-black">
                            {item?.completedBy?.basicDetails?.name || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-blue-600">
                            {item.proofUrl ? (
                              <a
                                href={
                                  item.proofUrl.startsWith("http")
                                    ? item.proofUrl
                                    : `https://${item.proofUrl}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                View Proof
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default WorkProgressTab;
