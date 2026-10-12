"use client";
import React, { useEffect, useState } from "react";
import { FileText, Eye, Trash2, Pencil, Download } from "lucide-react";
import toast from "react-hot-toast";
import PreviewNew from "./PreviewNew";
import { downloadProposalPdf } from "./PdfNew";
import {
  listProposalNewService,
  getProposalNewByIdService,
  deleteProposalNewService,
} from "@/service/proposalNew";

const fmt = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const HistoryNew = ({ customerId, onEdit, refreshKey = 0 }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const fetchList = async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      const res = await listProposalNewService(customerId);
      if (res.success) setList(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const res = await getProposalNewByIdService(id);
      if (res.success) setPreview(res.data);
    } catch (err) {
      toast.error("Failed to load");
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await getProposalNewByIdService(id);
      if (res.success && onEdit) onEdit(res.data);
    } catch (err) {
      toast.error("Failed to load");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this proposal?")) return;
    try {
      const res = await deleteProposalNewService(id);
      if (res.success) {
        toast.success("Deleted");
        fetchList();
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await getProposalNewByIdService(id);
      if (!res.success || !res.data) {
        toast.error("Failed to load proposal");
        return;
      }
      setPreview(res.data);
      // Wait for the preview DOM to render, then trigger the popup print
      setTimeout(() => {
        downloadProposalPdf(res.data);
      }, 350);
    } catch (err) {
      toast.error("Failed to download");
    }
  };

  useEffect(() => {
    fetchList();
  }, [customerId, refreshKey]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        Loading proposals…
      </div>
    );
  }

  if (!list.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        No proposals yet.
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {list.map((p) => (
          <li
            key={p._id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {p.proposalNumber || "—"}
                </p>
                <p className="text-xs text-gray-500">
                  {fmtDate(p.createdAt)} · {p.items?.length || 0} items ·{" "}
                  {p.status || "draft"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-800">
                {fmt(p.grandTotal)}
              </span>
              <button
                type="button"
                onClick={() => handleView(p._id)}
                className="text-blue-600 hover:text-blue-800"
                title="View"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleEdit(p._id)}
                className="text-amber-600 hover:text-amber-800"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDownload(p._id)}
                className="text-emerald-600 hover:text-emerald-800"
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(p._id)}
                className="text-red-500 hover:text-red-700"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {preview && (
        <PreviewNew proposal={preview} onClose={() => setPreview(null)} />
      )}
    </>
  );
};

export default HistoryNew;
