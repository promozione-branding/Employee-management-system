// components/employee-dashboard/common/EmployeeClientsProgress.jsx

"use client";

import Skeleton from "react-loading-skeleton";
import { employeeClientService } from "@/service/employee-dashboard/dashboard";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Mail, Briefcase, TrendingUp } from "lucide-react";

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

  const employeeFilter = employeeClientData?.filter(
    (client) => client?.clientId !== null,
  );

  if (loading) {
    return (
      <div className="flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white p-4 shadow-[0_4px_20px_rgba(15,27,51,0.04)] sm:p-5">
        <Skeleton height={28} width={180} className="mb-4" />
        <div className="space-y-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E9EDF4] p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Skeleton height={20} width={140} />
                  <Skeleton height={14} width={100} className="mt-1" />
                </div>
                <Skeleton height={24} width={80} borderRadius={20} />
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <Skeleton height={14} width={200} />
                <Skeleton height={14} width={160} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton height={12} width={60} />
                  <Skeleton height={12} width={90} />
                </div>
                <Skeleton height={8} borderRadius={999} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(15,27,51,0.07)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#EDF0F5] px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66] text-white shadow-sm">
            <TrendingUp size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-[#0F1B33]">Client Progress</h2>
            <p className="mt-0.5 text-xs text-[#8A92A6]">Progress across your clients</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#F0F3F8] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#0A2E66]">
          {employeeFilter.length}
        </span>
      </div>
      {employeeFilter.length === 0 ? (
        <div className="flex min-h-48 flex-1 flex-col items-center justify-center px-4 text-center">
          <p className="text-sm font-semibold text-[#26344D]">No active clients found.</p>
        </div>
      ) : (
        <div className="max-h-[740px] min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:px-5">
          {employeeFilter.map((item) => {
            const { clientId, progressPercentage, status, _id } = item;
            const total = progressPercentage?.totalField || 0;
            const complete = progressPercentage?.completeField || 0;
            const percentage =
              total > 0 ? Math.round((complete / total) * 100) : 0;

            return (
              <div
                key={_id}
                className="min-w-0 rounded-xl border border-[#E9EDF4] bg-white p-3.5 transition-all duration-200 hover:border-[#D5DEEF] hover:bg-[#FAFBFD] sm:p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-bold text-[#26344D]">
                      {clientId?.name || "Unknown Client"}
                    </h3>
                    <div className="mt-1 flex min-w-0 items-center gap-1 text-xs text-[#929BAD]">
                      <Building2 size={14} className="shrink-0" />
                      <span className="truncate">{clientId?.company}</span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                      status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700"
                        : status === "IN_PROGRESS"
                          ? "bg-[#FFF4E9] text-[#C66513]"
                          : "bg-[#F0F3F8] text-[#0A2E66]"
                    }`}
                  >
                    {status?.replace("_", " ")}
                  </span>
                </div>

                <div className="mb-4 flex min-w-0 flex-col gap-2 text-xs text-[#526078]">
                  <div className="flex min-w-0 items-center gap-2">
                    <Mail size={14} className="shrink-0 text-[#F27B1E]" /> <span className="truncate">{clientId?.email}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <Briefcase size={14} className="shrink-0 text-[#0A2E66]" />{" "}
                    <span className="truncate">{progressPercentage?.departmentType?.replace("_", " ")}</span>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs text-[#526078]">
                    <span>Progress</span>
                    <span className="font-semibold tabular-nums text-[#0A2E66]">
                      {percentage}% ({complete}/{total})
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#E9EDF4]">
                    <div
                      className="h-2 rounded-full bg-[#0A2E66] transition-all duration-500"
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
