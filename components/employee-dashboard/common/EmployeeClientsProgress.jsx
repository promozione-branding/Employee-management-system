"use client";

import Loading from "@/components/layout/Loading";
import { employeeClientService } from "@/service/employee-dashboard/dashboard";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Mail, Briefcase } from "lucide-react";

const EmployeeClientsProgress = ({ employeeId }) => {
  const [employeeClientData, setEmployeeClientData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchEmployeeClient() {
    try {
      if (employeeId) {
        const res = await employeeClientService(employeeId);
        if (res.success) {
          setEmployeeClientData(res.data?.workDetails || []);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response.data.message || "Error while get client progress",
      );
    }
  }

  useEffect(() => {
    fetchEmployeeClient();
  }, [employeeId]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 lg:w-1/2">
      <h2 className="text-xl font-bold mb-4 text-slate-800">Client Progress</h2>
      {employeeClientData.length === 0 ? (
        <p className="text-slate-500">No active clients found.</p>
      ) : (
        <div className="space-y-4 overflow-y-auto h-[50vh]">
          {employeeClientData.map((item) => {
            const { clientId, progressPercentage, status, _id } = item;
            const total = progressPercentage?.totalField || 0;
            const complete = progressPercentage?.completeField || 0;
            const percentage =
              total > 0 ? Math.round((complete / total) * 100) : 0;

            return (
              <div
                key={_id}
                className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
              >

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">
                      {clientId?.name || "Unknown Client"}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                      <Building2 size={14} />
                      <span>{clientId?.company}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {status?.replace("_", " ")}
                  </span>
                </div>

                <div className="flex flex-col gap-2 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} /> {clientId?.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} />{" "}
                    {progressPercentage?.departmentType?.replace("_", " ")}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 text-slate-600">
                    <span>Progress</span>
                    <span className="font-medium">
                      {percentage}% ({complete}/{total})
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeClientsProgress;
