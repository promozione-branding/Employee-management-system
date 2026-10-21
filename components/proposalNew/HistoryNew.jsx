"use client";
import React, { useEffect, useState } from "react";
import { FileText, Eye, Trash2, Pencil, Download, Mail, X } from "lucide-react";
import toast from "react-hot-toast";
import PreviewNew from "./PreviewNew";
import { downloadProposalPdf } from "./PdfNew";
import {
  listProposalNewService,
  getProposalNewByIdService,
  deleteProposalNewService,
  sendProposalMailService,
} from "@/service/proposalNew";

const fmt = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const HistoryNew = ({ customerId, onEdit, refreshKey = 0 }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [mailTargetId, setMailTargetId] = useState(null);
  const [defaultEmail, setDefaultEmail] = useState("");
  const [selectedEmailType, setSelectedEmailType] = useState("default");
  const [customEmail, setCustomEmail] = useState("");
  const [mailing, setMailing] = useState(false);

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
    } catch (err) { toast.error("Failed to load"); }
  };

  const handleEdit = async (id) => {
    try {
      const res = await getProposalNewByIdService(id);
      if (res.success && onEdit) onEdit(res.data);
    } catch (err) { toast.error("Failed to load"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this proposal?")) return;
    try {
      const res = await deleteProposalNewService(id);
      if (res.success) { toast.success("Deleted"); fetchList(); }
    } catch (err) { toast.error("Failed to delete"); }
  };

  const handleDownload = async (id) => {
    try {
      const res = await getProposalNewByIdService(id);
      if (!res.success || !res.data) return toast.error("Failed to load proposal");
      setPreview(res.data);
      setTimeout(() => { downloadProposalPdf(res.data); }, 350);
    } catch (err) { toast.error("Failed to download"); }
  };

  const openMailModal = async (id) => {
    try {
      toast.loading("Loading email...", { id: "load-email" });
      const res = await getProposalNewByIdService(id);
      toast.dismiss("load-email");
      
      if (res.success && res.data) {
        setDefaultEmail(res.data.clientId?.email || "");
        setMailTargetId(id);
        setSelectedEmailType("default");
        setCustomEmail("");
        setMailModalOpen(true);
      }
    } catch (err) {
      toast.dismiss("load-email");
      toast.error("Failed to load email");
    }
  };

  const handleSendMail = async () => {
    const finalEmail = selectedEmailType === "custom" ? customEmail.trim() : defaultEmail.trim();
    if (!finalEmail) return toast.error("Please provide a valid email address");

    try {
      setMailing(true);
      const res = await sendProposalMailService(mailTargetId, { email: finalEmail });
      if (res.success) {
        toast.success("Proposal sent to " + finalEmail);
        setMailModalOpen(false);
        fetchList();
      } else {
        toast.error(res.message || "Failed to send");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send mail");
    } finally {
      setMailing(false);
    }
  };

  useEffect(() => { fetchList(); }, [customerId, refreshKey]);

  if (loading) return <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">Loading proposals…</div>;
  if (!list.length) return <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">No proposals yet.</div>;

  return (
    <>
      <ul className="flex flex-col gap-3">
        {list.map((p) => (
          <li key={p._id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{p.proposalNumber || "—"}</p>
                <p className="text-xs text-gray-500">{fmtDate(p.createdAt)} · {p.items?.length || 0} items · {p.status || "draft"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-800">{fmt(p.grandTotal)}</span>
              
              <button onClick={() => handleView(p._id)} className="text-blue-600 hover:text-blue-800" title="View"><Eye className="h-4 w-4" /></button>
              <button onClick={() => handleEdit(p._id)} className="text-amber-600 hover:text-amber-800" title="Edit"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => handleDownload(p._id)} className="text-emerald-600 hover:text-emerald-800" title="Download PDF"><Download className="h-4 w-4" /></button>
              <button onClick={() => openMailModal(p._id)} className="text-indigo-600 hover:text-indigo-800" title="Send mail"><Mail className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700" title="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </li>
        ))}
      </ul>

      {preview && <PreviewNew proposal={preview} onClose={() => setPreview(null)} />}

      {mailModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">Send Proposal Mail</h3>
              <button onClick={() => setMailModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" checked={selectedEmailType === "default"} onChange={() => setSelectedEmailType("default")} className="h-4 w-4 accent-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Send to Client's Email</p>
                    <p className="text-xs text-gray-500">{defaultEmail || "No email on record"}</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" checked={selectedEmailType === "custom"} onChange={() => setSelectedEmailType("custom")} className="h-4 w-4 accent-indigo-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Send to Custom Email</p>
                    {selectedEmailType === "custom" && (
                      <input type="email" value={customEmail} onChange={(e) => setCustomEmail(e.target.value)} placeholder="accounts@client.com" className="w-full mt-2 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    )}
                  </div>
                </label>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setMailModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleSendMail} disabled={mailing} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">{mailing ? "Sending..." : "Send Mail"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HistoryNew;
