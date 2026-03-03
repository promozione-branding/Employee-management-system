"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import AssetUploadForm from "./AssetUploadForm";
import AssetAttachmentList from "./AssetAttachmentList";

const initialForm = {
  type: "image",
  title: "",
  description: "",
  link: "",
  file: null,
};

const Attachment = () => {
  const [formData, setFormData] = useState(initialForm);
  const [attachments, setAttachments] = useState([]);

  const stats = useMemo(() => {
    const counts = {
      total: attachments.length,
      image: 0,
      video: 0,
      pdf: 0,
      docs: 0,
      other: 0,
    };

    attachments.forEach((item) => {
      if (counts[item.type] !== undefined) counts[item.type] += 1;
      else counts.other += 1;
    });

    return counts;
  }, [attachments]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim(),
      link: formData.link.trim(),
      fileName: formData.file?.name || "",
    };

    setAttachments((prev) => [payload, ...prev]);
    setFormData(initialForm);
    toast.success("Attachment added");
  };

  const handleDelete = (id) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-xl font-semibold">{stats.total}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Images</p>
          <p className="text-xl font-semibold">{stats.image}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Videos</p>
          <p className="text-xl font-semibold">{stats.video}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">PDFs</p>
          <p className="text-xl font-semibold">{stats.pdf}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Docs</p>
          <p className="text-xl font-semibold">{stats.docs}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Others</p>
          <p className="text-xl font-semibold">{stats.other}</p>
        </div>
      </div>

      <AssetUploadForm
        formData={formData}
        onChange={handleChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
      />

      <AssetAttachmentList attachments={attachments} onDelete={handleDelete} />
    </div>
  );
};

export default Attachment;
