"use client";

import { proposalService } from "@/service/sales-dashboard/activity";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, FileText, User } from "lucide-react";
import Skeleton from "@/components/layout/Skeleton";
import Link from "next/link";

const ProposalTab = ({ employeeId }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchProposal() {
    try {
      setLoading(true);
      const res = await proposalService(employeeId);
      if (res.success) {
        setProposals(res.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch proposals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (employeeId) {
      fetchProposal();
    }
  }, [employeeId]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 border rounded-lg bg-white shadow-sm h-32"
          >
            <Skeleton count={3} />
          </div>
        ))}
      </div>
    );
  }

  if (!proposals.length) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        No proposals found
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 h-[calc(100vh-220px)] overflow-y-auto pb-4 pr-2">
      {proposals.map((item) => (
        <Link
          href={`/sales-dashboard/proposal/pdf-download/${item._id}`}
          key={item._id}
          className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 text-purple-600 p-2.5 rounded-full">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {item.proposalNo}
                  </h3>
                  <span className="text-[10px] text-gray-400">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-600 mt-3">
              <div className="flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                <span className="font-medium text-gray-700">
                  {item.clientName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-gray-400" />
                <span>{item.clientCompany}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProposalTab;
