"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { proposalByEmployeeService } from "@/service/sales-dashboard/dashboard-api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProposalSend = () => {
  const { employee } = useSalesEmployeeStore();
  const [loading, setLoading] = useState(true);
  const [proposalData, setProposalData] = useState([]);

  async function fetchProposals() {
    try {
      const res = await proposalByEmployeeService(employee?._id);
      if (res.success) {
        setProposalData(res.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching proposals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (employee?.user?._id) {
      fetchProposals();
    }
  }, [employee]);

  if (loading) {
    return (
      <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-5">
        <Skeleton height={28} width={180} className="mb-4" />
        <div className="space-y-3">
          <Skeleton height={64} count={2} borderRadius={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-5 hover:shadow-md transition-shadow lg:w-1/2">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Proposals Sent</h2>
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] custom-scrollbar">
        {proposalData?.length > 0 ? (
          proposalData.map((proposal) => (
            <div
              key={proposal._id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-700 text-sm">
                    {proposal.clientName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {proposal.clientCompany}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {proposal.proposalNo}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(proposal.dateOfProposal).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <p className="text-sm">No proposals sent</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalSend;
