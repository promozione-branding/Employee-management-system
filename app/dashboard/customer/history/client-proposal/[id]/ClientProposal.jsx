"use client";

import Loading from "@/components/layout/Loading";
import { getClientProposalHistoryService } from "@/service/customer/history";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";

const ClientProposal = ({ clientId }) => {
  const [loading, setLoading] = useState(true);
  const [proposalHistory, setProposalHistory] = useState([]);

  const fetchClientProposalHistory = async () => {
    try {
      const res = await getClientProposalHistoryService(clientId);
      if (res.success) {
        setProposalHistory(res.data || []);
      } else {
        setProposalHistory([]);
      }
    } catch (error) {
      console.log(error);
      setProposalHistory([]);
      toast.error(
        error.response?.data?.message || "error while getting proposal history",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    fetchClientProposalHistory();
  }, [clientId]);

  if (loading) return <Loading />;

  return (
    <div className="w-full">
      {proposalHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {proposalHistory.map((item) => {
            const proposalId = item.entityId || item._id;

            return (
              <Link
                key={item._id}
                href={`/dashboard/proposal/pdf-download/${proposalId}`}
                className="block"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-full bg-emerald-100 text-emerald-700">
                        <FileText size={18} />
                      </span>
                      <p className="font-semibold text-gray-800">Proposal</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        item.action === "CREATE"
                          ? "bg-green-100 text-green-700"
                          : item.action === "UPDATE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.action}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-800">Changed By:</span>{" "}
                      {item.changedBy?.username || "Unknown"}
                    </p>
                    <p className="break-all">
                      <span className="font-medium text-gray-800">Email:</span>{" "}
                      {item.changedBy?.email || "N/A"}
                    </p>
                    <p className="break-all">
                      <span className="font-medium text-gray-800">
                        Proposal ID:
                      </span>{" "}
                      {proposalId}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">Date:</span>{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No proposal history found.
        </div>
      )}
    </div>
  );
};

export default ClientProposal;
