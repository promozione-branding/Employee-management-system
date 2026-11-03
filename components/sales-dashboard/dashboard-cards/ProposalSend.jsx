"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { proposalByEmployeeService } from "@/service/sales-dashboard/dashboard-api";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { FileText, ArrowUpRight, CalendarDays } from "lucide-react";

const ProposalSend = () => {
  const { employee } = useSalesEmployeeStore();

  const [loading, setLoading] = useState(true);
  const [proposalData, setProposalData] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchProposals() {
      if (!employee?.user?._id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await proposalByEmployeeService(employee._id);

        if (!cancelled && res.success) {
          setProposalData(res?.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching proposals:", error);

          toast.error(
            error?.response?.data?.message || "Error fetching proposals",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProposals();

    return () => {
      cancelled = true;
    };
  }, [employee]);

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

  return (
    <div className="flex h-[420px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white p-4 shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(15,27,51,0.07)] sm:p-5">
      {/* Header */}
      <div className="mb-5 flex shrink-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66] text-white shadow-sm">
          <FileText size={21} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold tracking-tight text-[#0F1B33]">
            Proposals Sent
          </h2>

          <p className="mt-0.5 text-xs text-[#8A92A6]">
            Your submitted proposals
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#F0F3F8] px-2.5 py-1 text-xs font-semibold tabular-nums text-[#0A2E66]">
          {proposalData.length}
        </span>
      </div>

      {/* Proposals list */}
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-[#E3E7F0] p-3.5"
              >
                <div className="flex gap-3">
                  <Skeleton
                    width={40}
                    height={40}
                    borderRadius={12}
                    baseColor="#F0F3F8"
                    highlightColor="#FAFBFD"
                  />

                  <div className="min-w-0 flex-1">
                    <Skeleton
                      width="75%"
                      height={14}
                      baseColor="#F0F3F8"
                      highlightColor="#FAFBFD"
                    />

                    <Skeleton
                      width="55%"
                      height={11}
                      className="mt-2"
                      baseColor="#F0F3F8"
                      highlightColor="#FAFBFD"
                    />

                    <Skeleton
                      width="65%"
                      height={11}
                      className="mt-2"
                      baseColor="#F0F3F8"
                      highlightColor="#FAFBFD"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : proposalData.length > 0 ? (
          <div className="flex flex-col gap-3">
            {proposalData.map((proposal) => (
              <Link
                key={proposal._id}
                href={`/sales-dashboard/proposal/pdf-download/${proposal._id}`}
                className="group block min-w-0"
              >
                <div className="rounded-xl border border-[#E9EDF4] bg-[#FAFBFD] p-3.5 transition-all duration-200 hover:border-[#D5DEEF] hover:bg-white hover:shadow-[0_4px_14px_rgba(15,27,51,0.05)]">
                  <div className="flex min-w-0 items-start gap-3">
                    {/* Proposal icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F27B1E]">
                      <FileText size={18} strokeWidth={2} />
                    </div>

                    {/* Proposal details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <h3 className="min-w-0 break-words text-sm font-semibold leading-5 text-[#26344D] transition-colors group-hover:text-[#0A2E66]">
                          {proposal.clientName || "Unnamed client"}
                        </h3>

                        <ArrowUpRight
                          size={15}
                          className="mt-0.5 shrink-0 text-[#A5ADBD] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#F27B1E]"
                        />
                      </div>

                      <p className="mt-1 break-words text-xs leading-5 text-[#8A92A6]">
                        {proposal.clientCompany || "No company specified"}
                      </p>

                      <div className="mt-2.5 flex min-w-0 flex-wrap items-center gap-2">
                        <span className="max-w-full break-all rounded-full border border-orange-100 bg-orange-50 px-2 py-1 text-[10px] font-semibold text-[#C56816]">
                          {proposal.proposalNo || "Proposal"}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] text-[#929BAD]">
                          <CalendarDays size={12} className="shrink-0" />
                          {formatDate(proposal.dateOfProposal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-[#DDE3ED] bg-[#FAFBFD] px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F3F8] text-[#8A92A6]">
              <FileText size={21} />
            </div>

            <h3 className="text-sm font-semibold text-[#26344D]">
              No proposals yet
            </h3>

            <p className="mt-1 max-w-[220px] text-xs leading-5 text-[#929BAD]">
              Proposals you send will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex shrink-0 items-center justify-between gap-2 border-t border-[#EDF0F5] pt-3">
        <span className="text-[11px] font-medium text-[#929BAD]">
          Proposal overview
        </span>

        <span className="shrink-0 rounded-full bg-[#F0F3F8] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#0A2E66]">
          {proposalData.length} Proposals
        </span>
      </div>
    </div>
  );
};

export default ProposalSend;
